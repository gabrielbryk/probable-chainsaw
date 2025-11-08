export type OpenAIModelKey = 'default' | 'hint' | 'chat' | 'test'

export type OpenAIModelProvider = 'openai' | 'huggingface'

export interface OpenAIModelConfig {
  key: OpenAIModelKey
  provider: OpenAIModelProvider
  model: string
  temperature?: number
  topP?: number
  maxOutputTokens?: number
}

const MODEL_MAP: Record<OpenAIModelKey, OpenAIModelConfig> = {
  default: {
    key: 'default',
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.5,
  },
  hint: {
    key: 'hint',
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.3,
  },
  chat: {
    key: 'chat',
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
  },
  test: {
    key: 'test',
    provider: 'huggingface',
    model: 'minimax/minimax-m2:free',
    temperature: 0.2,
  },
}

export const getOpenAIModelConfig = (key?: string): OpenAIModelConfig => {
  if (key && key in MODEL_MAP) {
    return MODEL_MAP[key as OpenAIModelKey]
  }
  return MODEL_MAP.default
}

export { MODEL_MAP as OPENAI_MODEL_MAP }
