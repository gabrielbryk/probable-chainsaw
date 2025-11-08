import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'

export interface GoveeDeviceConfig {
  device: string
  model: string
  ip?: string
  name?: string
}

const envSchema = z.object({
  MOCK_MODE: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GUIDE_MODEL_KEY: z.enum(['default', 'hint', 'chat', 'test']).optional(),
  ANSWER_EVALUATOR_MODEL_KEY: z.enum(['default', 'hint', 'chat', 'test']).optional(),
  LLM_API_KEY: z.string().optional(),
  LLM_API_BASE: z.string().url().optional(),
  LLM_PROVIDER: z.enum(['openai', 'openrouter']).optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_REFERER: z.string().optional(),
  OPENROUTER_TITLE: z.string().optional(),
  GOVEE_API_KEY: z.string().optional(),
  GOVEE_DEVICES_FILE: z.string().optional(),
  GOVEE_DEVICES: z.string().optional(),
  GOVEE_DEVICE_IDS: z.string().optional(),
  GOVEE_API_BASE: z.string().url().optional(),
  GOVEE_LAN_PORT: z.string().optional(),
  HUGGINGFACE_API_KEY: z.string().optional(),
  GOOGLE_HOME_WEBHOOK_URL: z.string().url().optional(),
  LLM_VALIDATION_ENABLED: z.string().optional(),
})

const parsed = envSchema.parse(process.env)

const llmProvider = parsed.LLM_PROVIDER ?? 'openai'
const llmApiKey =
  parsed.LLM_API_KEY ??
  (llmProvider === 'openrouter' ? parsed.OPENROUTER_API_KEY ?? parsed.OPENAI_API_KEY : parsed.OPENAI_API_KEY)

const defaultBase = llmProvider === 'openrouter' ? 'https://openrouter.ai/api/v1/responses' : 'https://api.openai.com/v1/responses'
const llmApiBase = parsed.LLM_API_BASE ?? defaultBase

const parseGoveeDevices = (raw?: string): GoveeDeviceConfig[] => {
  if (!raw) return []
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [device, model, ip, name] = entry.split(':').map((part) => part.trim())
      if (!device || !model) {
        throw new Error('GOVEE_DEVICES entries must be in "device:model[:ip][:name]" format')
      }
      return { device, model, ip, name }
    })
}

const loadGoveeDevicesFile = (filePath?: string): GoveeDeviceConfig[] => {
  if (!filePath) return []
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath)
  if (!fs.existsSync(resolved)) {
    return []
  }
  try {
    const contents = fs.readFileSync(resolved, 'utf-8')
    const data = JSON.parse(contents)
    if (!Array.isArray(data)) return []
    return data.map((entry) => ({
      device: entry.device,
      model: entry.model,
      ip: entry.ip,
      name: entry.name,
    }))
  } catch (error) {
    console.warn(`[env] Failed to load Govee devices file ${resolved}:`, error)
    return []
  }
}

export const env = {
  mockMode: parsed.MOCK_MODE !== 'false',
  llmProvider,
  llmApiKey,
  llmApiBase,
  openAiApiKey: llmApiKey,
  guideModelKey: parsed.GUIDE_MODEL_KEY ?? 'default',
  answerEvaluatorModelKey: parsed.ANSWER_EVALUATOR_MODEL_KEY ?? parsed.GUIDE_MODEL_KEY ?? 'default',
  goveeApiKey: parsed.GOVEE_API_KEY,
  goveeDevices: [
    ...loadGoveeDevicesFile(parsed.GOVEE_DEVICES_FILE ?? 'config/govee_devices.json'),
    ...parseGoveeDevices(parsed.GOVEE_DEVICES ?? parsed.GOVEE_DEVICE_IDS),
  ],
  goveeApiBase: parsed.GOVEE_API_BASE ?? 'https://developer-api.govee.com',
  goveeLanPort: Number(parsed.GOVEE_LAN_PORT ?? 4003),
  googleWebhookUrl: parsed.GOOGLE_HOME_WEBHOOK_URL,
  huggingFaceApiKey: parsed.HUGGINGFACE_API_KEY,
  llmValidationEnabled: parsed.LLM_VALIDATION_ENABLED !== 'false',
  openRouterReferer: parsed.OPENROUTER_REFERER,
  openRouterTitle: parsed.OPENROUTER_TITLE,
}

export { parseGoveeDevices }
