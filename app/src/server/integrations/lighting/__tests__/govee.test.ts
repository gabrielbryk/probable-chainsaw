import { describe, expect, it } from 'vitest'
import { LightingEffectPayloadSchema } from '../schema'
import { buildGoveeCommands } from '../commands'

describe('buildGoveeCommands', () => {
  it('creates commands for power, rgb, and brightness', () => {
    const payload = LightingEffectPayloadSchema.parse({
      power: 'on',
      rgb: { r: 255, g: 200, b: 150 },
      brightness: 80,
    })

    const commands = buildGoveeCommands(payload)
    expect(commands).toHaveLength(3)
    expect(commands[0]).toEqual({ name: 'turn', value: 'on' })
    expect(commands[1]).toEqual({ name: 'colorwc', value: { r: 255, g: 200, b: 150 } })
    expect(commands[2]).toEqual({ name: 'brightness', value: 80 })
  })

  it('throws when payload empty', () => {
    expect(() => buildGoveeCommands({} as any)).toThrow()
  })
})
