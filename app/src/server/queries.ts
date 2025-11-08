import { HttpError } from 'wasp/server'
import type {
  Prisma,
  Riddle as PrismaRiddle,
  HintLog as PrismaHintLog,
  EffectEvent as PrismaEffectEvent,
  GuideTranscript as PrismaGuideTranscript,
} from '@prisma/client'
import { ensureProgress, getActiveRiddleId, type ProgressContext } from './services/progress.js'
import { parseJsonField, type JsonObject, type JsonValue } from './utils/json.js'
import { createGuideConversation } from './services/guideConversation.js'
import { GAME_STATUS, EFFECT_TYPES } from '../shared/constants.js'

type RiddleSummary = {
  id: number
  title: string
  difficulty?: string | null
  body?: string | null
}

type HintLogRecord = {
  hint: string
  timestamp: string
}

type EffectEventRecord = {
  id: number
  type: string
  source: string
  payload: JsonObject
  createdAt: string
}

type ProgressEntity = ProgressContext['entities']['Progress']

type RiddleLookup = {
  findUnique: (args: Prisma.RiddleFindUniqueArgs) => Promise<PrismaRiddle | null>
  findMany: (args: Prisma.RiddleFindManyArgs) => Promise<PrismaRiddle[]>
}

type HintLogLookup = {
  findMany: (args: Prisma.HintLogFindManyArgs) => Promise<PrismaHintLog[]>
}

type EffectEventLookup = {
  findMany: (args: Prisma.EffectEventFindManyArgs) => Promise<PrismaEffectEvent[]>
}

type CurrentRiddleContext = {
  entities: {
    Progress: ProgressEntity
    Riddle: RiddleLookup
  }
}

type RiddleHintsContext = {
  entities: {
    Progress: ProgressEntity
    Riddle: RiddleLookup
    HintLog: HintLogLookup
  }
}

type EffectEventsContext = {
  entities: {
    EffectEvent: EffectEventLookup
  }
}

type PlayerGameStateContext = {
  entities: {
    Progress: ProgressEntity
    Riddle: RiddleLookup
  }
}

type GuideTranscriptContext = {
  entities: {
    GuideTranscript: {
      findMany: (args: Prisma.GuideTranscriptFindManyArgs) => Promise<PrismaGuideTranscript[]>
      create: (args: Prisma.GuideTranscriptCreateArgs) => Promise<PrismaGuideTranscript>
    }
    Progress: ProgressEntity
    Riddle: RiddleLookup
  }
}

type HelpStatusContext = {
  entities: {
    EffectEvent: EffectEventLookup
  }
}

const asIsoString = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : value

const extractHint = (payload: string): string | null => {
  const parsed = parseJsonField(payload)
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && typeof parsed.hint === 'string') {
    return parsed.hint
  }
  return null
}

const parsePayload = (payload: string | null): JsonObject => {
  const parsed = payload ? parseJsonField(payload) : null
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
}

const parseMetadata = (payload: string | null): JsonObject => parsePayload(payload)

const parseAttemptsMap = (raw: string | null | undefined): Record<string, number> => {
  const parsed = parseJsonField(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {}
  }
  return Object.entries(parsed).reduce<Record<string, number>>((acc, [key, value]) => {
    if (typeof value === 'number') {
      acc[key] = value
    }
    return acc
  }, {})
}

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value))

export const getCurrentRiddle = async (_args: unknown, context: CurrentRiddleContext): Promise<RiddleSummary> => {
  const progress = await ensureProgress(context)
  const activeRiddleId = getActiveRiddleId(progress)

  if (!activeRiddleId) {
    throw new HttpError(404, 'No active riddle found.')
  }

  const riddle = await context.entities.Riddle.findUnique({
    where: { id: activeRiddleId },
    select: {
      id: true,
      title: true,
      difficulty: true,
      body: true
    }
  })

  if (!riddle) {
    throw new HttpError(404, 'Riddle not found.')
  }

  return riddle
}

export const getRiddleHints = async (_args: unknown, context: RiddleHintsContext): Promise<HintLogRecord[]> => {
  const progress = await ensureProgress(context)
  const activeRiddleId = getActiveRiddleId(progress)

  if (!activeRiddleId) {
    throw new HttpError(404, 'No active riddle found.')
  }

  const rows = await context.entities.HintLog.findMany({
    where: { riddleId: activeRiddleId },
    select: { payload: true, createdAt: true }
  })

  return rows
    .map<HintLogRecord | null>((row) => {
      const hint = extractHint(row.payload)
      return hint ? { hint, timestamp: asIsoString(row.createdAt) } : null
    })
    .filter((entry): entry is HintLogRecord => entry !== null)
}

export const getEffectEvents = async (_args: unknown, context: EffectEventsContext): Promise<EffectEventRecord[]> => {
  const rows = await context.entities.EffectEvent.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      type: true,
      source: true,
      payload: true,
      createdAt: true
    },
    take: 10
  })

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    source: row.source,
    createdAt: asIsoString(row.createdAt),
    payload: parsePayload(row.payload)
  }))
}

export const getPlayerGameState = async (_args: unknown, context: PlayerGameStateContext) => {
  const progress = await ensureProgress(context)
  const allRiddles = await context.entities.Riddle.findMany({
    orderBy: { order: 'asc' },
  })
  const totalRiddles = allRiddles.length
  const activeRiddleId = getActiveRiddleId(progress)
  const attemptsMap = parseAttemptsMap(progress.attemptsPerRiddle)
  const activeRiddle = activeRiddleId ? allRiddles.find((r) => r.id === activeRiddleId) ?? null : null
  const activeOrder = activeRiddle?.order ?? null
  const inCelebration = progress.status === GAME_STATUS.CELEBRATION || progress.status === GAME_STATUS.FINALE

  const riddles = allRiddles.map((riddle) => {
    let status: 'locked' | 'active' | 'completed' = 'locked'
    if (inCelebration || (activeOrder !== null && riddle.order < activeOrder)) {
      status = 'completed'
    } else if (activeOrder !== null && riddle.order === activeOrder) {
      status = 'active'
    }
    return {
      id: riddle.id,
      title: riddle.title,
      order: riddle.order,
      status,
      attempts: attemptsMap[String(riddle.id)] ?? 0,
    }
  })

  return {
    status: progress.status,
    startedAt: progress.startedAt ? asIsoString(progress.startedAt) : null,
    totalRiddles,
    stage: {
      current: activeRiddle?.order ?? null,
    },
    attempts: {
      activeRiddle: activeRiddle ? attemptsMap[String(activeRiddle.id)] ?? 0 : 0,
    },
    riddles,
    activeRiddle: activeRiddle
      ? {
          id: activeRiddle.id,
          title: activeRiddle.title,
          body: activeRiddle.body,
          difficulty: activeRiddle.difficulty,
          order: activeRiddle.order,
          metadata: parseMetadata(activeRiddle.metadata),
          successMessage: activeRiddle.successMessage,
          missMessage: activeRiddle.missMessage,
        }
      : null,
  }
}

export const getGuideTranscript = async (_args: unknown, context: GuideTranscriptContext) => {
  const guideChat = createGuideConversation(context)
  return guideChat.listTranscript()
}

export const getHelpStatus = async (_args: unknown, context: HelpStatusContext) => {
  const rows = await context.entities.EffectEvent.findMany({
    where: {
      type: { in: [EFFECT_TYPES.HELP_REQUESTED, EFFECT_TYPES.HELP_ACKNOWLEDGED] },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const lastRequest = rows.find((row) => row.type === EFFECT_TYPES.HELP_REQUESTED)
  const lastAck = rows.find((row) => row.type === EFFECT_TYPES.HELP_ACKNOWLEDGED)

  const requestTime = lastRequest ? asIsoString(lastRequest.createdAt) : null
  const ackTime = lastAck ? asIsoString(lastAck.createdAt) : null

  const lastRequestDate = lastRequest ? toDate(lastRequest.createdAt) : null
  const lastAckDate = lastAck ? toDate(lastAck.createdAt) : null

  const isPending = Boolean(
    lastRequestDate && (!lastAckDate || lastAckDate < lastRequestDate)
  )

  return {
    pending: isPending,
    lastRequestAt: requestTime,
    lastAcknowledgedAt: ackTime,
  }
}
