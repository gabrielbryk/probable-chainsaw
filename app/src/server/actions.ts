import { createGameEngine, type GameEngineContext } from './services/gameEngine.js'
import { createGuideConversation } from './services/guideConversation.js'
import { generateEffectPlanForRiddle } from './services/effectPlanner.js'
import { requireAdminKey } from './auth/adminKey.js'
import { coerceJsonObject } from './utils/json.js'

type SubmitAnswerArgs = { riddleId: number; answer: string }
type AdvanceArgs = { targetOrder?: number }

export const startHunt = async (_args: unknown, context: GameEngineContext) => {
  const engine = createGameEngine(context)
  return engine.beginHunt()
}

export const submitAnswer = async (args: SubmitAnswerArgs, context: GameEngineContext) => {
  const engine = createGameEngine(context)
  return engine.submitAnswer(args)
}

export const requestHint = async (_args: unknown, context: GameEngineContext) => {
  const engine = createGameEngine(context)
  return engine.requestHint()
}

export const advanceRiddle = async (args: AdvanceArgs, context: GameEngineContext) => {
  const engine = createGameEngine(context)
  return engine.advanceRiddle(args)
}

export const rewindRiddle = async (_args: unknown, context: GameEngineContext) => {
  const engine = createGameEngine(context)
  return engine.rewindRiddle()
}

export const replayEffect = async (
  args: { type: string; payload: Record<string, unknown> },
  context: GameEngineContext
) => {
  const engine = createGameEngine(context)
  return engine.replayEffect({ type: args.type, payload: coerceJsonObject(args.payload) })
}

export const requestAssistance = async (_args: unknown, context: GameEngineContext) => {
  const engine = createGameEngine(context)
  await engine.recordHelpRequest('player_ui')
  return { ok: true }
}

export const adminAcknowledgeHelp = async (_args: unknown, context: GameEngineContext) => {
  const engine = createGameEngine(context)
  return engine.acknowledgeHelp('admin_cli')
}

export const planCelebrationEffects = async (args: { riddleId: number }, context: GameEngineContext) => {
  requireAdminKey(context)
  const riddleRepo = context.entities.Riddle
  if (!riddleRepo) {
    throw new Error('Riddle repository unavailable in this context.')
  }
  const riddle = await riddleRepo.findUnique({ where: { id: args.riddleId } })
  if (!riddle) {
    throw new Error('Riddle not found.')
  }
  return generateEffectPlanForRiddle(riddle)
}

export const completeHunt = async (_args: unknown, context: GameEngineContext) => {
  const engine = createGameEngine(context)
  return engine.completeHunt()
}

export const submitPianoPerformance = async (args: unknown, context: GameEngineContext) => {
  const engine = createGameEngine(context)
  return engine.submitPianoPerformance(args)
}

type GuideConversationContext = Parameters<typeof createGuideConversation>[0]

export const sendGuideMessage = async (args: { message: string }, context: GuideConversationContext) => {
  const guideChat = createGuideConversation(context)
  return guideChat.sendPlayerMessage(args.message)
}
