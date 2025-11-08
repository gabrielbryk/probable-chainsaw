import { z } from 'zod'
import { LightingEffectPayloadSchema } from './schema'

export const GoveeCommandSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.record(z.string(), z.any())]),
})

export type GoveeCommand = z.infer<typeof GoveeCommandSchema>

export const buildGoveeCommands = (
  payload: z.infer<typeof LightingEffectPayloadSchema>
): GoveeCommand[] => {
  const commands: GoveeCommand[] = []

  if (payload.power) {
    commands.push({ name: 'turn', value: payload.power })
  }

  if (payload.sceneId) {
    commands.push({ name: 'scene', value: payload.sceneId })
  }

  if (payload.rgb) {
    commands.push({
      name: 'colorwc',
      value: {
        r: payload.rgb.r,
        g: payload.rgb.g,
        b: payload.rgb.b,
      },
    })
  }

  if (typeof payload.brightness === 'number') {
    commands.push({ name: 'brightness', value: payload.brightness })
  }

  if (!commands.length) {
    throw new Error('Lighting payload must include at least one actionable field')
  }

  return z.array(GoveeCommandSchema).parse(commands)
}
