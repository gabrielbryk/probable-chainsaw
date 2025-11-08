import type { GuideAdapter } from './index'
import { getGuideModelConfig } from './models'
import type {
  GuideConversationEntry,
  GuideMessage,
  GuideRequest,
  GuideResponse,
  GuideSendOptions,
  GuideStreamChunk,
  GuideUsage,
  SelfTestResult,
} from '../types'
import { env } from '../../config/env'
import { openAIResponsesClient } from '../openai/index.js'

const HUGGINGFACE_URL = 'https://api-inference.huggingface.co/models'
const CACHE_LIMIT = 20
const UNSAFE_PATTERNS = [/kill yourself/i, /suicide/i, /murder/i]

const cache = new Map<string, GuideResponse>()

export class OpenAIGuideAdapter implements GuideAdapter {
  async send(request: GuideRequest, options: GuideSendOptions = {}): Promise<GuideResponse> {
    const config = getGuideModelConfig(options.modelKey ?? env.guideModelKey)
    const normalized = this.withPersona(request, options)
    const key = JSON.stringify({ normalized, config })

    const cached = cache.get(key)
    if (cached) {
      return { ...cached, metadata: { ...cached.metadata, cached: true } }
    }

    const response = await this.callModel(normalized, config)
    const safe = this.applySafety(response, options.safetyFallback)
    this.addToCache(key, safe)
    return safe
  }

  async *stream(request: GuideRequest, options?: GuideSendOptions): AsyncIterable<GuideStreamChunk> {
    const config = getGuideModelConfig(options?.modelKey ?? env.guideModelKey)
    const normalized = this.withPersona(request, options ?? {})

    if (config.provider !== 'openai') {
      const fallback = await this.send(normalized, options)
      yield* chunkTextFallback(fallback.text)
      return
    }

    try {
      const stream = await openAIResponsesClient.stream({
        model: config.model,
        input: normalized.messages,
        metadata: {
          conversationId: normalized.conversationId,
          ...normalized.metadata,
        },
        temperature: config.temperature,
        topP: config.topP,
        maxOutputTokens: config.maxOutputTokens,
      })

      for await (const chunk of stream) {
        if (!chunk.content) {
          continue
        }
        yield { content: chunk.content, done: chunk.done }
      }
    } catch (error) {
      console.warn('[guide-stream] Falling back to non-streaming mode', error)
      const fallback = await this.send(normalized, options)
      yield* chunkTextFallback(fallback.text)
    }
  }

  async runSelfTest(): Promise<SelfTestResult> {
    try {
      const result = await this.send(
        {
          conversationId: 'self-test',
          messages: [
            createSystemMessage('You are a friendly assistant.'),
            createUserMessage('Reply with the word "Joy" only.'),
          ],
        },
        { safetyFallback: 'Joy', modelKey: 'test' }
      )

      return {
        name: 'Guide (OpenAI)',
        success: true,
        details: `Received: ${result.text.slice(0, 60)}`,
      }
    } catch (error) {
      return { name: 'Guide (OpenAI)', success: false, error }
    }
  }

  private withPersona(request: GuideRequest, options: GuideSendOptions): GuideRequest {
    if (!options.persona && !options.promptTemplate) {
      return request
    }

    const personaMessages = options.persona ? [createSystemMessage(options.persona)] : []
    const templateMessages = options.promptTemplate ? [createSystemMessage(options.promptTemplate)] : []

    return {
      ...request,
      messages: [...personaMessages, ...templateMessages, ...request.messages],
    }
  }

  private async callModel(request: GuideRequest, config: ReturnType<typeof getGuideModelConfig>): Promise<GuideResponse> {
    switch (config.provider) {
      case 'openai':
        return this.callOpenAI(request, config)
      case 'huggingface':
        return this.callHuggingFace(request, config)
      default:
        throw new Error(`Unsupported guide provider: ${config.provider}`)
    }
  }

  private async callOpenAI(
    request: GuideRequest,
    config: ReturnType<typeof getGuideModelConfig>
  ): Promise<GuideResponse> {
    const data = await openAIResponsesClient.send({
      model: config.model,
      input: request.messages,
      metadata: {
        conversationId: request.conversationId,
        ...request.metadata,
      },
      temperature: config.temperature,
      topP: config.topP,
      maxOutputTokens: config.maxOutputTokens,
    })
    const text = extractText(data)
    if (!text) {
      throw new Error('OpenAI response missing text payload.')
    }

    const usage = extractUsage(data)
    const conversationEntry: GuideConversationEntry = {
      conversationId: request.conversationId,
      role: 'assistant',
      content: text,
      timestamp: new Date().toISOString(),
    }

    return {
      text,
      metadata: {
        raw: data,
        usage,
        conversationEntry,
        cached: false,
      },
    }
  }

  private async callHuggingFace(
    request: GuideRequest,
    config: ReturnType<typeof getGuideModelConfig>
  ): Promise<GuideResponse> {
    if (!env.huggingFaceApiKey) {
      throw new Error('HUGGINGFACE_API_KEY missing for Hugging Face model')
    }

    const prompt = request.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
    const response = await fetch(`${HUGGINGFACE_URL}/${config.model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.huggingFaceApiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: config.temperature ?? 0.2,
        },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Hugging Face error ${response.status}: ${body}`)
    }

    const data = await response.json()
    const generated = Array.isArray(data)
      ? data[0]?.generated_text ?? data[0]?.generated_text?.[0]
      : data?.generated_text

    if (typeof generated !== 'string') {
      throw new Error('Hugging Face response missing generated_text')
    }

    const conversationEntry: GuideConversationEntry = {
      conversationId: request.conversationId,
      role: 'assistant',
      content: generated,
      timestamp: new Date().toISOString(),
    }

    return {
      text: generated,
      metadata: {
        raw: data,
        conversationEntry,
        usage: undefined,
        cached: false,
      },
    }
  }

  private applySafety(response: GuideResponse, fallback?: string): GuideResponse {
    const isUnsafe = UNSAFE_PATTERNS.some((regex) => regex.test(response.text))
    if (!isUnsafe) {
      return response
    }
    return {
      text: fallback ?? 'Let me think about a kinder way to say that…',
      metadata: {
        ...response.metadata,
        raw: response.metadata.raw,
      },
    }
  }

  private addToCache(key: string, value: GuideResponse) {
    cache.set(key, value)
    if (cache.size > CACHE_LIMIT) {
      const firstKey = cache.keys().next().value
      if (typeof firstKey === 'string') {
        cache.delete(firstKey)
      }
    }
  }
}

async function* chunkTextFallback(text: string): AsyncIterable<GuideStreamChunk> {
  const words = text.split(' ')
  for (let i = 0; i < words.length; i += 5) {
    const slice = words.slice(i, i + 5).join(' ')
    yield { content: slice, done: i + 5 >= words.length }
  }
}

export const createSystemMessage = (content: string): GuideMessage => ({
  role: 'system',
  content,
})

export const createUserMessage = (content: string): GuideMessage => ({
  role: 'user',
  content,
})

export function extractText(data: any): string | null {
  if (typeof data?.output_text?.[0] === 'string') {
    return data.output_text[0]
  }

  const segments = data?.output?.[0]?.content
  if (Array.isArray(segments)) {
    const textSegment = segments.find((segment: any) => typeof segment?.text === 'string')
    if (textSegment) {
      return textSegment.text as string
    }
  }

  const content = data?.output?.[0]?.content?.[0]
  if (typeof content?.text === 'string') {
    return content.text as string
  }

  const message = data?.content?.[0]?.text
  if (typeof message === 'string') {
    return message
  }

  return null
}

export function extractUsage(data: any): GuideUsage | undefined {
  const usage = data?.usage
  if (!usage) return undefined
  return {
    promptTokens: usage.prompt_tokens ?? usage.promptTokens,
    completionTokens: usage.completion_tokens ?? usage.completionTokens,
    totalTokens: usage.total_tokens ?? usage.totalTokens,
  }
}
