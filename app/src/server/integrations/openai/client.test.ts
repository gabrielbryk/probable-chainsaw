import { describe, expect, it, vi } from 'vitest'
import { OpenAIResponsesClient } from './client.js'

describe('OpenAIResponsesClient', () => {
  it('retries when parser returns null', async () => {
    const client = new OpenAIResponsesClient()
    const sendSpy = vi.spyOn(client, 'send').mockResolvedValueOnce('bad').mockResolvedValueOnce('good')

    const result = await client.sendStructured({ model: 'test', input: [] }, {
      parser: (payload) => (payload === 'good' ? { ok: true } : null),
      maxAttempts: 2,
      retryDelayMs: 0,
    })

    expect(result.parsed.ok).toBe(true)
    expect(sendSpy).toHaveBeenCalledTimes(2)

    sendSpy.mockRestore()
  })

  it('throws after exhausting attempts', async () => {
    const client = new OpenAIResponsesClient()
    vi.spyOn(client, 'send').mockResolvedValue('bad')

    await expect(
      client.sendStructured({ model: 'test', input: [] }, {
        parser: () => null,
        maxAttempts: 2,
        retryDelayMs: 0,
      })
    ).rejects.toThrow(/Failed to produce structured output/)
  })

  it('injects response_format when jsonSchema provided', async () => {
    const client = new OpenAIResponsesClient()
    const sendSpy = vi.spyOn(client, 'send').mockResolvedValue({ output: [] })

    await client.sendStructured(
      { model: 'test', input: [] },
      {
        parser: () => ({ ok: true }),
        schema: undefined,
        jsonSchema: {
          name: 'test_schema',
          schema: {
            type: 'object',
            properties: { ok: { type: 'boolean' } },
            required: ['ok'],
          },
        },
      }
    ).catch(() => {})

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        responseFormat: expect.objectContaining({
          type: 'json_schema',
          json_schema: expect.objectContaining({ name: 'test_schema' }),
        }),
      })
    )

    sendSpy.mockRestore()
  })
})
