import type { AnswerEvaluatorAdapter, AnswerEvaluationRequest, AnswerEvaluationResult } from './index.js'

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/gi, '').trim()

export class MockAnswerEvaluatorAdapter implements AnswerEvaluatorAdapter {
  async evaluate(request: AnswerEvaluationRequest): Promise<AnswerEvaluationResult> {
    const canonical = extractCanonicalAnswer(request.userPrompt)
    const player = extractPlayerAnswer(request.userPrompt)
    const accepted = canonical && player && similarity(normalize(player), normalize(canonical)) >= 0.9

    return {
      verdict: accepted ? 'correct' : 'incorrect',
      confidence: accepted ? 0.82 : 0.12,
      reasoning: accepted
        ? 'Mock evaluator accepted the answer because it is a close textual match.'
        : 'Mock evaluator rejected the answer (simulated).',
    }
  }

  async runSelfTest() {
    return {
      name: 'Answer Evaluator (mock)',
      success: true,
      details: 'Mock evaluator returns deterministic verdicts.',
    }
  }
}

const extractCanonicalAnswer = (payload: string): string | null => {
  const match = payload.match(/"canonicalAnswer"\s*:\s*"([^"]+)"/i)
  return match ? match[1] : null
}

const extractPlayerAnswer = (payload: string): string | null => {
  const match = payload.match(/"playerAnswer"\s*:\s*"([^"]+)"/i)
  return match ? match[1] : null
}

const similarity = (a: string, b: string): number => {
  if (!a.length || !b.length) return 0
  const len = Math.max(a.length, b.length)
  let matches = 0
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) {
      matches += 1
    }
  }
  return matches / len
}
