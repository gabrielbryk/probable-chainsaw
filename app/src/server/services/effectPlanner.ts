import { z } from 'zod'
import type { Prisma, Riddle as PrismaRiddle } from '@prisma/client'
import { openAIResponsesClient } from '../integrations/openai/index.js'
import { parseJsonField } from '../utils/json.js'

const effectPlanSchema = z.object({
  lightingScene: z.string().min(1),
  audioCue: z.string().min(1),
  intensity: z.enum(['soft', 'bold', 'dramatic']).default('soft'),
  guidance: z.string().min(1),
})

const effectPlanJsonSchema = {
  name: 'celebration_plan',
  schema: {
    type: 'object',
    properties: {
      lightingScene: { type: 'string' },
      audioCue: { type: 'string' },
      intensity: { type: 'string', enum: ['soft', 'bold', 'dramatic'] },
      guidance: { type: 'string' },
    },
    required: ['lightingScene', 'audioCue', 'guidance'],
    additionalProperties: false,
  },
  strict: true,
} as const

export type EffectPlan = z.infer<typeof effectPlanSchema>

type RiddleRepo = {
  findUnique: (args: Prisma.RiddleFindUniqueArgs) => Promise<PrismaRiddle | null>
}

export const generateEffectPlanForRiddle = async (riddle: PrismaRiddle): Promise<EffectPlan> => {
  const metadata = parseJsonField(riddle.metadata)
  const location =
    metadata && typeof metadata === 'object' && !Array.isArray(metadata) && typeof metadata.location === 'string'
      ? metadata.location
      : 'somewhere nearby'

  const systemPrompt =
    'You are the Game Master orchestrating celebratory effects. Respond ONLY with JSON that matches the provided schema.'

  const userPrompt = JSON.stringify({
    riddle: {
      title: riddle.title,
      body: riddle.body,
      difficulty: riddle.difficulty,
    },
    location,
  })

  const { parsed } = await openAIResponsesClient.sendStructured(
    {
      model: 'gpt-4o-mini',
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    },
    {
      parser: (raw) => extractPlanPayload(raw),
      schema: effectPlanSchema,
      jsonSchema: effectPlanJsonSchema,
      maxAttempts: 3,
      retryDelayMs: 500,
    }
  )

  return parsed
}

const extractPlanPayload = (payload: unknown) => {
  const content = extractFirstTextPayload(payload as Record<string, unknown>)
  if (typeof content !== 'string') return null
  try {
    return JSON.parse(content)
  } catch {
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
