import { z } from 'zod'
import type { AnswerEvaluatorAdapter, AnswerEvaluationRequest, AnswerEvaluationResult } from './index.js'
import { getGuideModelConfig } from '../guide/models.js'
import type { GuideMessage } from '../types.js'
import { env } from '../../config/env.js'
import { openAIResponsesClient } from '../openai/index.js'

export class OpenAIAnswerEvaluatorAdapter implements AnswerEvaluatorAdapter {
  async evaluate(request: AnswerEvaluationRequest): Promise<AnswerEvaluationResult> {
    const config = getGuideModelConfig(env.answerEvaluatorModelKey)
    const messages: GuideMessage[] = [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userPrompt },
    ]

    const { parsed, raw } = await openAIResponsesClient.sendStructured(
      {
        model: config.model,
        input: messages,
        metadata: {
          kind: 'answer-evaluator',
          ...request.metadata,
        },
        temperature: config.temperature,
        topP: config.topP,
        maxOutputTokens: config.maxOutputTokens,
      },
      {
        parser: extractVerdictPayload,
        schema: verdictSchema,
        jsonSchema: verdictJsonSchema,
        maxAttempts: 3,
        retryDelayMs: 400,
      }
    )

    return {
      verdict: parsed.verdict,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning ?? parsed.reason ?? 'No reasoning provided.',
      raw,
    }
  }

  async runSelfTest() {
    try {
      const result = await this.evaluate({
        systemPrompt: 'Return JSON {"verdict":"correct","confidence":1,"reasoning":"ok"}',
        userPrompt: '{"playerAnswer":"Joy","canonicalAnswer":"Joy"}',
      })
      return {
        name: 'Answer Evaluator (OpenAI)',
        success: true,
        details: `Verdict ${result.verdict} (${result.confidence.toFixed(2)})`,
      }
    } catch (error) {
      return { name: 'Answer Evaluator (OpenAI)', success: false, error }
    }
  }
}

const verdictSchema = z.object({
  verdict: z.enum(['correct', 'incorrect', 'review']),
  confidence: z.number(),
  reasoning: z.string().optional(),
  reason: z.string().optional(),
})

const verdictJsonSchema = {
  name: 'answer_evaluator_verdict',
  schema: {
    type: 'object',
    properties: {
      verdict: {
        type: 'string',
        enum: ['correct', 'incorrect', 'review'],
      },
      confidence: { type: 'number' },
      reasoning: { type: 'string' },
      reason: { type: 'string' },
    },
    required: ['verdict', 'confidence'],
    additionalProperties: false,
  },
  strict: true,
} as const

const extractVerdictPayload = (payload: unknown) => {
  const content = extractFirstTextPayload(payload)
  if (typeof content !== 'string') {
    return null
  }
  try {
    return JSON.parse(content)
  } catch (error) {
    console.warn('[answer-evaluator] Failed to parse verdict JSON', error)
    return null
  }
}

const extractFirstTextPayload = (payload: any): string | null => {
  if (typeof payload?.output_text?.[0] === 'string') {
    return payload.output_text[0]
  }
  const segments = payload?.output?.[0]?.content
  if (Array.isArray(segments)) {
    const textSegment = segments.find((segment: any) => typeof segment?.text === 'string')
    if (textSegment) {
      return textSegment.text as string
    }
  }
  const content = payload?.content?.[0]?.text
  return typeof content === 'string' ? content : null
}
