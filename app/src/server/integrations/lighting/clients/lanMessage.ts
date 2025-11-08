import { z } from 'zod'
import type { GoveeCommand } from '../commands'

const BrightnessSchema = z.number().int().min(0).max(100)

const PowerValueSchema = z.union([
  z.literal('on'),
  z.literal('off'),
  z.number().int().min(0).max(1),
])

const ColorValueSchema = z
  .object({
    r: z.number().int().min(0).max(255),
    g: z.number().int().min(0).max(255),
    b: z.number().int().min(0).max(255),
    brightness: BrightnessSchema.optional(),
    colorTemInKelvin: z.number().int().min(2000).max(9000).optional(),
  })
  .strict()

const SceneIdSchema = z.string().min(1)

const LanCommandSchema = z.object({
  cmd: z.enum(['turn', 'scene', 'colorwc', 'brightness', 'devStatus']),
  data: z.record(z.string(), z.any()),
})

export type LanCommand = z.infer<typeof LanCommandSchema>

export interface LanDatagram {
  payload: Buffer
  expectsResponse: boolean
}

export const buildLanDatagram = (cmd: GoveeCommand): LanDatagram => {
  const lanCommand = toLanCommand(cmd)
  return {
    payload: Buffer.from(JSON.stringify({ msg: lanCommand })),
    expectsResponse: lanCommand.cmd === 'devStatus',
  }
}

const toLanCommand = (cmd: GoveeCommand): LanCommand => {
  switch (cmd.name) {
    case 'turn':
      return LanCommandSchema.parse({
        cmd: 'turn',
        data: { value: toLanPowerValue(cmd.value) },
      })
    case 'scene':
      return LanCommandSchema.parse({
        cmd: 'scene',
        data: { sceneId: SceneIdSchema.parse(cmd.value) },
      })
    case 'colorwc':
      return LanCommandSchema.parse({
        cmd: 'colorwc',
        data: buildColorData(cmd.value),
      })
    case 'brightness':
      return LanCommandSchema.parse({
        cmd: 'brightness',
        data: { value: BrightnessSchema.parse(cmd.value) },
      })
    case 'devStatus':
      return { cmd: 'devStatus', data: {} }
    default:
      throw new Error(`Unsupported LAN command: ${cmd.name}`)
  }
}

const toLanPowerValue = (value: unknown): 0 | 1 => {
  const parsed = PowerValueSchema.parse(value)
  if (typeof parsed === 'number') {
    return parsed === 0 ? 0 : 1
  }
  return parsed === 'on' ? 1 : 0
}

const buildColorData = (value: unknown) => {
  const parsed = ColorValueSchema.parse(value)
  const data: Record<string, unknown> = {
    color: {
      r: parsed.r,
      g: parsed.g,
      b: parsed.b,
    },
    colorTemInKelvin: parsed.colorTemInKelvin ?? 0,
  }
  if (typeof parsed.brightness === 'number') {
    data.brightness = parsed.brightness
  }
  return data
}

export { buildColorData }
