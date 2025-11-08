import type { Prisma, GuideTranscript as PrismaGuideTranscript, Riddle as PrismaRiddle } from '@prisma/client'
import { integrations } from '../integrations/index.js'
import type { GuideMessage } from '../integrations/types.js'
import { stringifyJsonField, parseJsonField } from '../utils/json.js'
import { ensureProgress, getActiveRiddleId, type ProgressContext } from './progress.js'

const GUIDE_PERSONA_PROMPT =
  "You are Joy's birthday scavenger hunt Guide. Speak with warm intelligence, playful mystery, and personal references to her art, poetry, crystals, and music. Celebrate her creativity and gently coach her forward."

type GuideTranscriptRepo = {
  create: (args: Prisma.GuideTranscriptCreateArgs) => Promise<PrismaGuideTranscript>
  findMany: (args: Prisma.GuideTranscriptFindManyArgs) => Promise<PrismaGuideTranscript[]>
}

type ProgressEntity = ProgressContext['entities']['Progress']

type GuideConversationContext = {
  entities: {
    GuideTranscript: GuideTranscriptRepo
    Progress: ProgressEntity
    Riddle: RiddleLookup
  }
}

type ConversationMetadata = {
  conversationId?: string
  riddleId?: number | null
}

const HISTORY_LIMIT = 14

const baseConversationId = (riddle: PrismaRiddle | null): string =>
  riddle ? `riddle-${riddle.id}` : 'joy-global'

const parseMetadata = (raw: string | null | undefined): ConversationMetadata => {
  const parsed = parseJsonField(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  return {
    conversationId: typeof parsed.conversationId === 'string' ? parsed.conversationId : undefined,
    riddleId: typeof parsed.riddleId === 'number' ? parsed.riddleId : undefined,
  }
}

const convertHistoryToMessages = (rows: PrismaGuideTranscript[]): GuideMessage[] =>
  rows.map((row) => ({
    role: row.role === 'player' ? 'user' : 'assistant',
    content: row.message,
  }))

const summarizeRiddle = (riddle: PrismaRiddle | null): GuideMessage => {
  if (!riddle) {
    return {
      role: 'system',
      content:
        'There is no active riddle yet. Encourage Joy to begin the hunt warmly, keeping things low pressure.',
    }
  }

  return {
    role: 'system',
    content: `Current riddle context:\nTitle: ${riddle.title}\nBody: ${riddle.body}\nDifficulty: ${
      riddle.difficulty ?? 'Not specified'
    }. Offer guidance without revealing the full answer outright.`,
  }
}

export const createGuideConversation = (context: GuideConversationContext) => {
  const { GuideTranscript, Progress, Riddle } = context.entities

  const log = async (role: 'player' | 'guide', message: string, metadata: ConversationMetadata) => {
    await GuideTranscript.create({
      data: {
        role,
        message,
        metadata: stringifyJsonField(metadata),
      },
    })
  }

  const resolveActiveRiddle = async () => {
    const progress = await ensureProgress({ entities: { Progress } })
    const activeRiddleId = getActiveRiddleId(progress)
    const riddle = activeRiddleId
      ? await Riddle.findUnique({
          where: { id: activeRiddleId },
        })
      : null
    const conversationId = baseConversationId(riddle)
    return { riddle, conversationId }
  }

  const fetchHistory = async (conversationId: string, limit = HISTORY_LIMIT) => {
    const rows = await GuideTranscript.findMany({
      orderBy: { createdAt: 'asc' },
      take: 60,
    })

    const filtered = rows.filter((row) => {
      const meta = parseMetadata(row.metadata)
      return meta.conversationId === conversationId
    })

    const target = filtered.length ? filtered : rows
    return target.slice(Math.max(0, target.length - limit))
  }

  return {
    async listTranscript(limit = HISTORY_LIMIT) {
      const { conversationId } = await resolveActiveRiddle()
      const rows = await GuideTranscript.findMany({
        orderBy: { createdAt: 'asc' },
        take: Math.max(limit, HISTORY_LIMIT),
      })
      const filtered = rows.filter((row) => parseMetadata(row.metadata).conversationId === conversationId)
      const target = filtered.length ? filtered : rows.slice(-limit)
      return target.map((row) => ({
        id: row.id,
        role: row.role === 'guide' ? 'guide' : 'player',
        message: row.message,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      }))
    },

    async sendPlayerMessage(message: string) {
      const trimmed = message.trim()
      if (!trimmed.length) {
        throw new Error('Guide messages cannot be empty.')
      }

      const { riddle, conversationId } = await resolveActiveRiddle()
      const metadata: ConversationMetadata = {
        conversationId,
        riddleId: riddle?.id ?? null,
      }

      await log('player', trimmed, metadata)
      const history = await fetchHistory(conversationId)
      const messages: GuideMessage[] = [
        { role: 'system', content: GUIDE_PERSONA_PROMPT },
        summarizeRiddle(riddle),
        ...convertHistoryToMessages(history),
      ]

      const response = await integrations.guide.send(
        {
          conversationId,
          messages,
          metadata: { riddleId: riddle?.id ?? null },
        },
        {
          safetyFallback: "Let's pause and check with Gabe—he's ready to help.",
        }
      )

      await log('guide', response.text, metadata)
      return { reply: response.text }
    },
  }
}
type RiddleLookup = {
  findUnique: (args: Prisma.RiddleFindUniqueArgs) => Promise<PrismaRiddle | null>
}
