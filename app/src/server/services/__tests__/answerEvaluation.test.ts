import { describe, expect, it, vi } from 'vitest'
import { evaluateAnswerWithLlm, extractValidationConfig, shouldUseLlmValidation } from '../answerEvaluation.js'
import { integrations } from '../../integrations/index.js'

const buildRiddle = () => ({
  id: 1,
  order: 1,
  title: 'Test',
  body: 'What color is the sky?',
  answer: 'blue',
  difficulty: null,
  hints: null,
  mediaUrl: null,
  metadata: JSON.stringify({ validation: { enabled: true, acceptedVariants: ['azure'] } }),
  successMessage: null,
  missMessage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('answerEvaluation helpers', () => {
  it('extracts validation config from metadata', () => {
    const config = extractValidationConfig(JSON.stringify({ validation: { enabled: false, minConfidence: 0.9 } }))
    expect(config.enabled).toBe(false)
    expect(config.minConfidence).toBe(0.9)
  })

  it('uses global flag when config unspecified', () => {
    const config = extractValidationConfig(null)
    expect(shouldUseLlmValidation(config)).toBe(true)
  })
})

describe('evaluateAnswerWithLlm', () => {
  it('accepts answers when adapter verdict is correct', async () => {
    const spy = vi.spyOn(integrations.answerEvaluator, 'evaluate').mockResolvedValue({
      verdict: 'correct',
      confidence: 0.91,
      reasoning: 'Close match',
    })

    const result = await evaluateAnswerWithLlm({
      riddle: buildRiddle(),
      playerAnswer: 'blu',
      attempts: 2,
      config: { enabled: true, minConfidence: 0.8 },
    })

    expect(result.accepted).toBe(true)
    expect(result.verdict).toBe('correct')
    expect(result.ranEvaluation).toBe(true)

    spy.mockRestore()
  })
})
