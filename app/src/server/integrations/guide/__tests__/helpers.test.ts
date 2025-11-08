import { describe, expect, it } from 'vitest'
import { buildHintRequest } from '../index'
import { getGuideModelConfig } from '../models'
import { extractText, extractUsage } from '../openai'

describe('buildHintRequest', () => {
  it('creates system + user messages with context', () => {
    const request = buildHintRequest({
      conversationId: 'abc',
      riddle: { id: 1, title: 'Riddle', body: 'What has keys but no locks?' },
      attempts: 3,
      context: { location: 'Living room' },
    })

    expect(request.conversationId).toBe('abc')
    expect(request.messages[0]).toEqual({
      role: 'system',
      content: expect.stringContaining('Joy Hunt guide'),
    })
    expect(request.messages[1].content.toLowerCase()).toContain('attempts: 3')
    expect(request.messages[1].content).toContain('Living room')
  })
})

describe('guide models', () => {
  it('returns default config when key missing', () => {
    expect(getGuideModelConfig(undefined).key).toBe('default')
  })

  it('returns specific config by key', () => {
    const hint = getGuideModelConfig('hint')
    expect(hint.key).toBe('hint')
    expect(hint.provider).toBe('openai')
  })
})

describe('response parsing helpers', () => {
  it('extracts text from output_text', () => {
    const data = { output_text: ['hello world'] }
    expect(extractText(data)).toBe('hello world')
  })

  it('extracts usage tokens when provided', () => {
    const data = { usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } }
    expect(extractUsage(data)).toEqual({ promptTokens: 10, completionTokens: 5, totalTokens: 15 })
  })
})
