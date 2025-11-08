import { z } from 'zod'

export const LightingEffectPayloadSchema = z.object({
  sceneId: z.string().optional(),
  rgb: z
    .object({
      r: z.number().min(0).max(255),
      g: z.number().min(0).max(255),
      b: z.number().min(0).max(255),
    })
    .optional(),
  brightness: z.number().min(0).max(100).optional(),
  power: z.enum(['on', 'off']).optional(),
})

export type LightingEffectPayload = z.infer<typeof LightingEffectPayloadSchema>
