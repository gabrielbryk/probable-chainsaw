#!/usr/bin/env tsx
import { buildGoveeCommands } from '../src/server/integrations/lighting/commands'
import { LightingEffectPayloadSchema } from '../src/server/integrations/lighting/schema'
import { createGoveeClients, sendWithClients } from '../src/server/integrations/lighting/clients'
import { findDeviceById, findDeviceByName, getAllDevices } from '../src/server/integrations/lighting/deviceRegistry'

interface Args {
  deviceId?: string
  deviceName?: string
  sceneId?: string
  power?: 'on' | 'off'
  brightness?: number
  color?: string
}

const parseArgs = (): Args => {
  const args: Args = {}
  for (const arg of process.argv.slice(2)) {
    const [key, value] = arg.split('=')
    if (!value) continue
    switch (key) {
      case '--deviceId':
        args.deviceId = value
        break
      case '--deviceName':
        args.deviceName = value
        break
      case '--scene':
        args.sceneId = value
        break
      case '--power':
        if (value === 'on' || value === 'off') args.power = value
        break
      case '--brightness':
        args.brightness = Number(value)
        break
      case '--color':
        args.color = value
        break
      default:
        break
    }
  }
  return args
}

const hexToRgb = (hex: string) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!match) return undefined
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  }
}

async function main() {
  const args = parseArgs()
  const payload: Record<string, unknown> = {}
  if (args.sceneId) payload.sceneId = args.sceneId
  if (args.power) payload.power = args.power
  if (typeof args.brightness === 'number' && !Number.isNaN(args.brightness)) {
    payload.brightness = args.brightness
  }
  if (args.color) {
    const rgb = hexToRgb(args.color)
    if (!rgb) throw new Error('Invalid color hex value (use RRGGBB).')
    payload.rgb = rgb
  }
  if (Object.keys(payload).length === 0) {
    throw new Error('Specify at least one of --scene, --power, --brightness, --color.')
  }

  const effectPayload = LightingEffectPayloadSchema.parse(payload)
  const commands = buildGoveeCommands(effectPayload)

  const clients = createGoveeClients()
  const targets = resolveTargets(args)

  if (!targets.length) {
    throw new Error('No devices matched the provided filters.')
  }

  console.log(`Dispatching ${commands.length} command(s) to ${targets.length} device(s).`)
  for (const device of targets) {
    console.log(` Device: ${device.name ?? device.model} (${device.device})`)
    for (const cmd of commands) {
      console.log(`  -> ${cmd.name}`)
      await sendWithClients(clients, device, cmd)
    }
  }
  console.log('Done.')
}

function resolveTargets(args: Args) {
  if (args.deviceId) {
    const device = findDeviceById(args.deviceId)
    if (!device) {
      throw new Error(`Device ID ${args.deviceId} not found in config.`)
    }
    return [device]
  }
  if (args.deviceName) {
    const device = findDeviceByName(args.deviceName)
    if (!device) {
      throw new Error(`Device name "${args.deviceName}" not found in config.`)
    }
    return [device]
  }
  return getAllDevices()
}

void main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
