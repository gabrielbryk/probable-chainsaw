import type { SelfTestResult } from '../types.js'

export type AnswerEvaluationVerdict = 'correct' | 'incorrect' | 'review'

export type AnswerEvaluationRequest = {
  systemPrompt: string
  userPrompt: string
  metadata?: Record<string, unknown>
}

export type AnswerEvaluationResult = {
  verdict: AnswerEvaluationVerdict
  confidence: number
  reasoning: string
  raw?: unknown
}

export interface AnswerEvaluatorAdapter {
  evaluate(request: AnswerEvaluationRequest): Promise<AnswerEvaluationResult>
  runSelfTest(): Promise<SelfTestResult>
}

export { MockAnswerEvaluatorAdapter } from './mock.js'
export { OpenAIAnswerEvaluatorAdapter } from './openai.js'
