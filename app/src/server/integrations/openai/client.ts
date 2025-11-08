import { env } from '../../config/env.js'
import type { ZodSchema } from 'zod'

const TEXT_DECODER = new TextDecoder()

export type JsonSchemaResponseFormat = {
  type: 'json_schema'
  json_schema: {
    name: string
    schema: Record<string, unknown>
    description?: string
    strict?: boolean
  }
}

export type TextResponseFormat = {
  type: 'text'
}

export type OpenAIResponseFormat = JsonSchemaResponseFormat | TextResponseFormat

export type OpenAITool = {
  type: 'function'
  function: {
    name: string
    description?: string
    parameters: Record<string, unknown>
  }
}

export type OpenAIToolChoice =
  | 'none'
  | 'auto'
  | {
      type: 'function'
      function: { name: string }
    }

export type OpenAIResponsesRequest = {
  model: string
  input: unknown
  metadata?: Record<string, unknown>
  temperature?: number
  topP?: number
  maxOutputTokens?: number
  responseFormat?: OpenAIResponseFormat
  tools?: OpenAITool[]
  toolChoice?: OpenAIToolChoice
  parallelToolCalls?: boolean
}

export type OpenAIStreamChunk = {
  content: string
  done: boolean
}

export class OpenAIResponsesClient {
  async send(request: OpenAIResponsesRequest) {
    const bodyPayload = buildPayload(request)

    const response = await fetch(env.llmApiBase, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(bodyPayload),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`OpenAI error ${response.status}: ${text}`)
    }

    return response.json()
  }

  async sendStructured<T>(
    request: OpenAIResponsesRequest,
    options: StructuredOutputOptions<T>
  ): Promise<{ raw: unknown; parsed: T }> {
    if (!options.parser && !options.schema) {
      throw new Error('sendStructured requires a parser or schema to be provided')
    }

    const requestWithFormat = enrichRequestForStructuredOutput(request, options)

    const attempts = Math.max(1, options.maxAttempts ?? 2)
    const delayMs = options.retryDelayMs ?? 250
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= attempts; attempt++) {
      const raw = await this.send(requestWithFormat)
      try {
        const parsed = parseStructuredOutput(raw, options)
        return { raw, parsed }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        options.onAttemptFailure?.(lastError, attempt)
        if (attempt < attempts && delayMs > 0) {
          await wait(delayMs)
        }
      }
    }

    throw new Error(
      `Failed to produce structured output after ${attempts} attempts: ${lastError?.message ?? 'unknown error'}`
    )
  }

  async stream(request: OpenAIResponsesRequest): Promise<AsyncIterable<OpenAIStreamChunk>> {
    const payload = buildPayload(request)
    payload.stream = true

    const response = await fetch(env.llmApiBase, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`OpenAI stream error ${response.status}: ${text}`)
    }

    const body = response.body
    if (!body) {
      throw new Error('Streaming not supported by response body')
    }

    const reader = body.getReader()

    return (async function* streamGenerator() {
      let buffer = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }
        buffer += TEXT_DECODER.decode(value, { stream: true })

        let boundary = buffer.indexOf('\n\n')
        while (boundary !== -1) {
          const rawEvent = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)
          const dataLine = rawEvent
            .split('\n')
            .map((line) => line.trim())
            .find((line) => line.startsWith('data:'))
          if (dataLine) {
            const payloadStr = dataLine.slice(5).trim()
            if (payloadStr === '[DONE]') {
              yield { content: '', done: true }
              return
            }
            try {
              const data = JSON.parse(payloadStr)
              const content = extractFirstTextPayload(data)
              if (content) {
                yield { content, done: false }
              }
            } catch (error) {
              console.warn('[openai-stream] Failed to parse chunk', error)
            }
          }
          boundary = buffer.indexOf('\n\n')
        }
      }
      yield { content: '', done: true }
    })()
  }
}

export type StructuredOutputOptions<T> = {
  parser?: (raw: unknown) => T | null
  schema?: ZodSchema<T>
  validate?: (value: T) => boolean
  maxAttempts?: number
  retryDelayMs?: number
  onAttemptFailure?: (error: Error, attempt: number) => void
  jsonSchema?: {
    name: string
    schema: Record<string, unknown>
    description?: string
    strict?: boolean
  }
  toolDefinition?: {
    name: string
    description?: string
    parameters: Record<string, unknown>
  }
}

const parseStructuredOutput = <T>(raw: unknown, options: StructuredOutputOptions<T>): T => {
  const parsedViaParser = options.parser ? options.parser(raw) : (raw as T | null)
  if (parsedViaParser == null) {
    throw new Error('Structured output parser returned null/undefined')
  }

  const schemaValidated = options.schema ? options.schema.parse(parsedViaParser) : parsedViaParser
  if (options.validate && !options.validate(schemaValidated)) {
    throw new Error('Structured output validation failed')
  }
  return schemaValidated
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const enrichRequestForStructuredOutput = <T>(
  request: OpenAIResponsesRequest,
  options: StructuredOutputOptions<T>
): OpenAIResponsesRequest => {
  const next = { ...request }

  if (!next.responseFormat && options.jsonSchema) {
    next.responseFormat = {
      type: 'json_schema',
      json_schema: {
        name: options.jsonSchema.name,
        schema: options.jsonSchema.schema,
        description: options.jsonSchema.description,
        strict: options.jsonSchema.strict ?? true,
      },
    }
  }

  if (!next.tools && options.toolDefinition) {
    next.tools = [
      {
        type: 'function',
        function: {
          name: options.toolDefinition.name,
          description: options.toolDefinition.description,
          parameters: options.toolDefinition.parameters,
        },
      },
    ]
    next.toolChoice = {
      type: 'function',
      function: { name: options.toolDefinition.name },
    }
    next.parallelToolCalls = false
  }

  return next
}

const buildPayload = (request: OpenAIResponsesRequest) => {
  const payload: Record<string, unknown> = {
    model: request.model,
    input: request.input,
  }

  if (request.metadata) {
    payload.metadata = request.metadata
  }
  if (typeof request.temperature === 'number') {
    payload.temperature = request.temperature
  }
  if (typeof request.topP === 'number') {
    payload.top_p = request.topP
  }
  if (typeof request.maxOutputTokens === 'number') {
    payload.max_output_tokens = request.maxOutputTokens
  }

  if (request.responseFormat) {
    payload.response_format = request.responseFormat
  }

  if (request.tools?.length) {
    payload.tools = request.tools
  }

  if (request.toolChoice) {
    payload.tool_choice = request.toolChoice
  }

  if (typeof request.parallelToolCalls === 'boolean') {
    payload.parallel_tool_calls = request.parallelToolCalls
  }

  return payload
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

export const openAIResponsesClient = new OpenAIResponsesClient()
const buildHeaders = () => {
  if (!env.llmApiKey) {
    throw new Error('LLM API key missing (set OPENAI_API_KEY or LLM_API_KEY)')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${env.llmApiKey}`,
  }

  if (env.llmProvider === 'openrouter') {
    if (env.openRouterReferer) {
      headers['HTTP-Referer'] = env.openRouterReferer
    }
    if (env.openRouterTitle) {
      headers['X-Title'] = env.openRouterTitle
    }
  }

  return headers
}
