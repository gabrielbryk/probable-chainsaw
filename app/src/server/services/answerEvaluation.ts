import { z } from 'zod'
import type { Riddle as PrismaRiddle } from '@prisma/client'
import { integrations } from '../integrations/index.js'
import { parseJsonField } from '../utils/json.js'
import { env } from '../config/env.js'

const validationConfigSchema = z
  .object({
    enabled: z.boolean().optional(),
    acceptedVariants: z.array(z.string()).optional(),
    rejectedExamples: z.array(z.string()).optional(),
    extraContext: z.string().optional(),
    minConfidence: z.number().min(0).max(1).optional(),
    autoAcceptReview: z.boolean().optional(),
  })
  .default({})

export type RiddleValidationConfig = z.infer<typeof validationConfigSchema>

export type AnswerEvaluationOutcome = {
  accepted: boolean
  verdict: 'correct' | 'incorrect' | 'review'
  confidence: number
  reasoning: string
  ranEvaluation: boolean
}

export const extractValidationConfig = (metadata: string | null | undefined): RiddleValidationConfig => {
  const parsed = parseJsonField(metadata)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {}
  }
  return validationConfigSchema.parse(parsed?.validation ?? parsed?.llmValidation ?? {})
}

export const shouldUseLlmValidation = (config: RiddleValidationConfig): boolean => {
  if (typeof config.enabled === 'boolean') {
    return config.enabled
  }
  return env.llmValidationEnabled
}

export const evaluateAnswerWithLlm = async (params: {
  riddle: PrismaRiddle
  playerAnswer: string
  attempts: number
  config: RiddleValidationConfig
}): Promise<AnswerEvaluationOutcome> => {
  const { riddle, playerAnswer, attempts, config } = params
  if (!shouldUseLlmValidation(config)) {
    return {
      accepted: false,
      verdict: 'incorrect',
      confidence: 0,
      reasoning: 'LLM validation disabled.',
      ranEvaluation: false,
    }
  }

  const systemPrompt = buildSystemPrompt(config)
  const userPrompt = buildUserPrompt({ riddle, playerAnswer, attempts, config })

  const result = await integrations.answerEvaluator.evaluate({
    systemPrompt,
    userPrompt,
    metadata: {
      riddleId: riddle.id,
      riddleTitle: riddle.title,
    },
  })

  const minConfidence = config.minConfidence ?? 0.65
  const accepted = result.verdict === 'correct' && result.confidence >= minConfidence

  return {
    accepted,
    verdict: result.verdict,
    confidence: result.confidence,
    reasoning: result.reasoning,
    ranEvaluation: true,
  }
}

const buildSystemPrompt = (config: RiddleValidationConfig): string => {
  const base =
    'You are an impartial adjudicator for a scavenger hunt. Respond ONLY with a JSON object containing {"verdict":"correct|incorrect|review","confidence":number,"reasoning":"string"}. '
  const extra = config.extraContext ? `Context: ${config.extraContext}` : ''
  return `${base}Use 0-1 confidence scores. ${extra}`
}

const buildUserPrompt = (params: {
  riddle: PrismaRiddle
  playerAnswer: string
  attempts: number
  config: RiddleValidationConfig
}) => {
  const { riddle, playerAnswer, attempts, config } = params
  const payload = {
    riddleId: riddle.id,
    title: riddle.title,
    body: riddle.body,
    canonicalAnswer: riddle.answer,
    acceptedVariants: config.acceptedVariants ?? [],
    rejectedExamples: config.rejectedExamples ?? [],
    metadata: attemptMetadata(riddle),
    attempts,
    playerAnswer,
  }
  return JSON.stringify(payload)
}

const attemptMetadata = (riddle: PrismaRiddle) => {
  const metadata = parseJsonField(riddle.metadata)
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {}
}
