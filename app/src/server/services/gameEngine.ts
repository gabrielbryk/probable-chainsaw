import { z } from 'zod'
import { GAME_STATUS, EFFECT_TYPES, HINT_TIERS } from '../../shared/constants.js'
import { parseJsonField, stringifyJsonField, type JsonObject } from '../utils/json.js'
import { createEffectDispatcher } from './effectDispatcher.js'
import { requireAdminKey, type AdminContext } from '../auth/adminKey.js'
import { normalizeAnswer, answersMatch } from './answerValidation.js'
import { selectHintByTier, selectPrimaryHint } from './hintSelection.js'
import { GameStateMachine, type AttemptsMap } from './stateMachine.js'
import { decideHintTier } from './hintEscalation.js'
import { requestGuideHint } from './guideService.js'
import { evaluateAnswerWithLlm, extractValidationConfig } from './answerEvaluation.js'
import {
  PianoNoteEventSchema,
  PianoPuzzleDefinitionSchema,
  evaluatePianoPerformance,
  type PianoPuzzleDefinition,
} from '../../shared/piano.js'

import type { Prisma, HintLog, EffectEvent } from '@prisma/client'

type HintLogEntity = {
  create: (args: Prisma.HintLogCreateArgs) => Promise<HintLog>
}

type EffectEventEntity = {
  create: (args: Prisma.EffectEventCreateArgs) => Promise<EffectEvent>
}

type Entities = {
  Progress: GameStateMachine['repos']['Progress']
  Riddle: GameStateMachine['repos']['Riddle']
  HintLog: HintLogEntity
  EffectEvent: EffectEventEntity
}

export type GameEngineContext = AdminContext & { entities: Partial<Entities> }

type RiddleMetadata = JsonObject & {
  puzzleType?: string
  pianoPuzzle?: unknown
}

const PianoPerformanceArgsSchema = z.object({
  riddleId: z.number().int().min(1),
  events: z.array(PianoNoteEventSchema).min(1).max(256),
})

export const createGameEngine = (context: GameEngineContext) => {
  const entities = context.entities as Entities
  const effectDispatcher = createEffectDispatcher(entities.EffectEvent)
  const riddleState = new GameStateMachine({
    Progress: entities.Progress,
    Riddle: entities.Riddle,
  })

  const parseRiddleMetadata = (raw: string | null): RiddleMetadata | null => {
    const parsed = parseJsonField(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }
    return parsed as RiddleMetadata
  }

  const resolvePianoPuzzle = (metadata: RiddleMetadata | null): PianoPuzzleDefinition | null => {
    const raw = metadata?.pianoPuzzle
    if (!raw) return null
    const parsed = PianoPuzzleDefinitionSchema.safeParse(raw)
    return parsed.success ? parsed.data : null
  }

  const markRiddleSolved = async ({
    progress,
    riddle,
    attemptsMap,
    answerSource,
    eventSource,
    eventPayload,
    successMessage,
  }: {
    progress: Awaited<ReturnType<GameStateMachine['requireActiveState']>>['progress']
    riddle: Awaited<ReturnType<GameStateMachine['requireActiveState']>>['riddle']
    attemptsMap: AttemptsMap
    answerSource: string
    eventSource: string
    eventPayload?: JsonObject
    successMessage?: string
  }) => {
    const clearedAttempts = riddleState.resetAttempts(attemptsMap, riddle.id)
    const nextRiddle = await riddleState.findNextRiddle(riddle.order)

    await riddleState.updateProgressState(progress.id, {
      activeRiddleId: nextRiddle ? nextRiddle.id : null,
      attemptsPerRiddle: riddleState.stringifyAttempts(clearedAttempts),
      status: nextRiddle ? GAME_STATUS.ACTIVE : GAME_STATUS.CELEBRATION,
    })

    await effectDispatcher.dispatch(EFFECT_TYPES.RIDDLE_SOLVED, eventSource, {
      riddleId: riddle.id,
      nextRiddleId: nextRiddle?.id ?? null,
      answerSource,
      ...(eventPayload ?? {}),
    })

    const message = successMessage ?? riddle.successMessage ?? 'Correct answer!'
    return { success: true, message }
  }

  return {
    async beginHunt() {
      const progress = await riddleState.loadProgress()
      const firstRiddle = await entities.Riddle.findFirst({
        orderBy: { order: 'asc' },
      })

      if (!firstRiddle) {
        throw new Error('No riddles configured. Seed the database before starting the hunt.')
      }

      const now = new Date()
      const targetRiddleId = progress.activeRiddleId ?? firstRiddle.id
      const shouldStampStart = progress.status === GAME_STATUS.NOT_STARTED

      await riddleState.updateProgressState(progress.id, {
        activeRiddleId: targetRiddleId,
        status: GAME_STATUS.ACTIVE,
        startedAt: shouldStampStart ? now : undefined,
      })

      if (shouldStampStart) {
        await effectDispatcher.dispatch(EFFECT_TYPES.HUNT_STARTED, 'startHunt', {
          activeRiddleId: targetRiddleId,
          startedAt: now.toISOString(),
        })
      }

      return {
        status: GAME_STATUS.ACTIVE,
        activeRiddleId: targetRiddleId,
        startedAt: (shouldStampStart ? now : progress.startedAt)?.toISOString() ?? null,
      }
    },

    async submitAnswer({ riddleId, answer }: { riddleId: number; answer: string }) {
      const { progress, riddle } = await riddleState.requireActiveState()
      if (riddle.id !== riddleId) {
        throw new Error('That riddle is not active right now.')
      }

      const attemptsMap = riddleState.parseAttempts(progress.attemptsPerRiddle)
      const attemptCount = (attemptsMap[String(riddleId)] ?? 0) + 1

      if (answersMatch(answer, riddle.answer)) {
        return markRiddleSolved({
          progress,
          riddle,
          attemptsMap,
          answerSource: 'exact',
          eventSource: 'submitAnswer',
        })
      }

      const validationConfig = extractValidationConfig(riddle.metadata)
      const llmResult = await evaluateAnswerWithLlm({
        riddle,
        playerAnswer: answer,
        attempts: attemptCount,
        config: validationConfig,
      })

      if (llmResult.ranEvaluation) {
        await effectDispatcher.dispatch(EFFECT_TYPES.ANSWER_EVALUATED, 'submitAnswer', {
          riddleId,
          verdict: llmResult.verdict,
          confidence: llmResult.confidence,
          accepted: llmResult.accepted,
        })
      }

      if (llmResult.accepted) {
        return markRiddleSolved({
          progress,
          riddle,
          attemptsMap,
          answerSource: 'llm',
          eventSource: 'submitAnswer',
          eventPayload: {
            confidence: llmResult.confidence ?? 1,
            verdict: llmResult.verdict,
          },
          successMessage:
            llmResult.reasoning && riddle.successMessage
              ? `${riddle.successMessage} ${llmResult.reasoning}`
              : llmResult.reasoning
              ? `You’re close enough: ${llmResult.reasoning}`
              : undefined,
        })
      }

      const updatedAttempts = riddleState.incrementAttempts(attemptsMap, riddleId)
      await riddleState.updateProgressState(progress.id, {
        activeRiddleId: progress.activeRiddleId ?? riddleId,
        attemptsPerRiddle: riddleState.stringifyAttempts(updatedAttempts),
      })

      return { success: false, message: riddle.missMessage || 'Incorrect answer, try again!' }
    },

    async requestHint() {
      const { progress, riddle } = await riddleState.requireActiveState()
      const attempts = riddleState.parseAttempts(progress.attemptsPerRiddle)
      const decision = decideHintTier(attempts, riddle.id)
      const parsedHints = parseJsonField(riddle.hints)
      let hintRecord = selectHintByTier(parsedHints, decision.tier) ?? selectPrimaryHint(parsedHints)
      let hintSource: 'scripted' | 'guide' = 'scripted'

      if ((!hintRecord || decision.escalateToGuide) && riddle.body) {
        try {
          const guideText = await requestGuideHint({
            conversationId: `riddle-${riddle.id}`,
            riddle: { id: riddle.id, title: riddle.title, body: riddle.body },
            attempts: decision.attemptCount,
            context: { tier: decision.tier },
          })
          hintRecord = { text: guideText, tier: HINT_TIERS.MANUAL }
          hintSource = 'guide'
        } catch (guideError) {
          console.error('Guide hint failed, falling back to scripted hint', guideError)
        }
      }

      if (!hintRecord) {
        throw new Error('No hints available yet.')
      }

      await entities.HintLog.create({
        data: {
          riddleId: riddle.id,
          tier: hintRecord.tier ?? HINT_TIERS.MANUAL,
          reason: hintSource === 'guide' ? 'guide_escalation' : 'player_request',
          payload: stringifyJsonField({ hint: hintRecord.text }),
        },
      })

      await effectDispatcher.dispatch(
        hintSource === 'guide' ? EFFECT_TYPES.GUIDE_RESPONSE : EFFECT_TYPES.HINT_REQUESTED,
        'requestHint',
        {
          riddleId: riddle.id,
          tier: hintRecord.tier ?? HINT_TIERS.MANUAL,
          hintSource,
        }
      )

      return { hint: hintRecord.text }
    },

    async advanceRiddle({ targetOrder }: { targetOrder?: number }) {
      requireAdminKey(context)
      const progress = await riddleState.loadProgress()
      const target = await entities.Riddle.findFirst({
        where: targetOrder ? { order: targetOrder } : {},
        orderBy: { order: 'asc' },
      })

      if (!target) {
        throw new Error('Target riddle not found')
      }

      await riddleState.updateProgressState(progress.id, {
        activeRiddleId: target.id,
        status: GAME_STATUS.ACTIVE,
      })

      await effectDispatcher.dispatch(EFFECT_TYPES.RIDDLE_SKIPPED, 'advanceRiddle', {
        targetRiddleId: target.id,
      })
    },

    async rewindRiddle() {
      requireAdminKey(context)
      const { progress, riddle } = await riddleState.requireActiveState()
      const previous = await riddleState.findPreviousRiddle(riddle.order)
      if (!previous) {
        throw new Error('Already at first riddle; cannot rewind.')
      }

      await riddleState.updateProgressState(progress.id, {
        activeRiddleId: previous.id,
        status: GAME_STATUS.ACTIVE,
      })

      await effectDispatcher.dispatch(EFFECT_TYPES.MANUAL_OVERRIDE, 'rewindRiddle', {
        targetRiddleId: previous.id,
      })

      return { ok: true }
    },

    async replayEffect({ type, payload }: { type: string; payload: JsonObject }) {
      requireAdminKey(context)
      await effectDispatcher.dispatch(type as typeof EFFECT_TYPES[keyof typeof EFFECT_TYPES], 'replayEffect', payload)
      return { ok: true }
    },

    async completeHunt() {
      const progress = await riddleState.loadProgress()
      await riddleState.updateProgressState(progress.id, {
        activeRiddleId: null,
        status: GAME_STATUS.FINALE,
      })

      await effectDispatcher.dispatch(EFFECT_TYPES.HUNT_COMPLETED, 'completeHunt', {
        completedAt: new Date().toISOString(),
      })

      return { ok: true }
    },

    async recordHelpRequest(source: string) {
      await effectDispatcher.dispatch(EFFECT_TYPES.HELP_REQUESTED, source, {
        requestedAt: new Date().toISOString(),
      })
    },

    async acknowledgeHelp(source: string) {
      requireAdminKey(context)
      await effectDispatcher.dispatch(EFFECT_TYPES.HELP_ACKNOWLEDGED, source, {
        acknowledgedAt: new Date().toISOString(),
      })
      return { ok: true }
    },

    async submitPianoPerformance(rawArgs: unknown) {
      const args = PianoPerformanceArgsSchema.parse(rawArgs)
      const { progress, riddle } = await riddleState.requireActiveState()
      if (riddle.id !== args.riddleId) {
        throw new Error('That riddle is not active right now.')
      }

      const metadata = parseRiddleMetadata(riddle.metadata)
      const puzzleDefinition = resolvePianoPuzzle(metadata)
      if (!puzzleDefinition) {
        return { success: false, message: 'This riddle is not listening for piano input.' }
      }

      const evaluation = evaluatePianoPerformance(args.events, puzzleDefinition)
      if (!evaluation.success) {
        return {
          success: false,
          message: evaluation.summary,
        }
      }

      const attemptsMap = riddleState.parseAttempts(progress.attemptsPerRiddle)
      return markRiddleSolved({
        progress,
        riddle,
        attemptsMap,
        answerSource: 'piano',
        eventSource: 'submitPianoPerformance',
        eventPayload: {
          puzzle: puzzleDefinition.id,
          summary: evaluation.summary,
          completedSteps: evaluation.completedSteps,
          totalSteps: evaluation.totalSteps,
        },
        successMessage: riddle.successMessage ?? evaluation.summary,
      })
    },
  }
}
