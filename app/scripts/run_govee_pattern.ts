#!/usr/bin/env tsx
import type { GoveeDeviceConfig } from '../src/server/config/env'
import {
  createGoveeClients,
  sendWithClients,
} from '../src/server/integrations/lighting/clients'
import { buildGoveeCommands } from '../src/server/integrations/lighting/commands'
import { LightingEffectPayloadSchema } from '../src/server/integrations/lighting/schema'
import {
  findDeviceById,
  findDeviceByName,
  getAllDevices,
} from '../src/server/integrations/lighting/deviceRegistry'

const NAMED_PATTERNS: Record<string, string[]> = {
  sunrise: ['8B1A1A', 'FF4500', 'FFA500', 'FFD280'],
  aurora: ['00F3FF', '00C0A3', '0077FF', '8233FF'],
  celebration: ['FF0000', '00FF00', '0000FF', 'FFD700'],
  calmPulse: ['335CFF', '33FFDD', '335CFF'],
}

interface Args {
  deviceId?: string
  deviceName?: string
  colors?: string[]
  pattern?: string
  brightness?: number
  holdMs?: number
  cycles?: number
  startPower?: 'on' | 'off'
  endPower?: 'on' | 'off'
  listPatterns?: boolean
}

const parseArgs = (): Args => {
  const args: Args = {}
  for (const raw of process.argv.slice(2)) {
    if (raw === '--listPatterns') {
      args.listPatterns = true
      continue
    }

    const [flag, value] = raw.split('=')
    if (!value) continue
    switch (flag) {
      case '--deviceId':
        args.deviceId = value
        break
      case '--deviceName':
        args.deviceName = value
        break
      case '--colors':
        args.colors = value.split(',').map((hex) => normalizeHex(hex))
        break
      case '--pattern':
        args.pattern = value
        break
      case '--brightness':
        args.brightness = Number(value)
        break
      case '--hold':
        args.holdMs = Number(value)
        break
      case '--cycles':
        args.cycles = Number(value)
        break
      case '--startPower':
        if (value === 'on' || value === 'off') {
          args.startPower = value
        }
        break
      case '--endPower':
        if (value === 'on' || value === 'off') {
          args.endPower = value
        }
        break
      default:
        break
    }
  }
  return args
}

const normalizeHex = (hex: string) => hex.replace(/^#/, '').trim().toUpperCase()

const hexToRgb = (hex: string) => {
  if (!/^[0-9A-F]{6}$/.test(hex)) {
    throw new Error(`Invalid hex color "${hex}". Use RRGGBB.`)
  }
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

const listPatternsAndExit = () => {
  console.log('Available patterns:')
  Object.entries(NAMED_PATTERNS).forEach(([name, colors]) => {
    console.log(` - ${name}: ${colors.join(', ')}`)
  })
  process.exit(0)
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function sendPayloadToDevices(
  payload: unknown,
  targets: GoveeDeviceConfig[],
  clients: ReturnType<typeof createGoveeClients>
) {
  const effectPayload = LightingEffectPayloadSchema.parse(payload)
  const commands = buildGoveeCommands(effectPayload)

  for (const device of targets) {
    for (const cmd of commands) {
      await sendWithClients(clients, device, cmd)
    }
  }
}

const resolveTargets = (args: Args): GoveeDeviceConfig[] => {
  if (args.deviceId) {
    const match = findDeviceById(args.deviceId)
    if (!match) {
      throw new Error(`Device ID "${args.deviceId}" not found.`)
    }
    return [match]
  }
  if (args.deviceName) {
    const match = findDeviceByName(args.deviceName)
    if (!match) {
      throw new Error(`Device name "${args.deviceName}" not found.`)
    }
    return [match]
  }
  return getAllDevices()
}

const resolvePattern = (args: Args): string[] => {
  if (args.colors?.length) {
    return args.colors
  }
  if (args.pattern) {
    const match = NAMED_PATTERNS[args.pattern]
    if (!match) {
      throw new Error(`Pattern "${args.pattern}" not found. Use --listPatterns to inspect options.`)
    }
    return match
  }
  return NAMED_PATTERNS.celebration
}

async function main() {
  const args = parseArgs()
  if (args.listPatterns) {
    listPatternsAndExit()
  }

  const colors = resolvePattern(args)
  if (!colors.length) {
    throw new Error('No colors specified. Provide --colors or --pattern.')
  }

  const targets = resolveTargets(args)
  if (!targets.length) {
    throw new Error('No configured devices found.')
  }

  const brightness = typeof args.brightness === 'number' ? args.brightness : 80
  const holdMs = args.holdMs ?? 1500
  const cycles = Math.max(1, args.cycles ?? 1)
  const startPower = args.startPower ?? 'on'
  const endPower = args.endPower ?? 'off'

  console.log(`Running pattern (${colors.join(' -> ')}) on ${targets.length} device(s) for ${cycles} cycle(s).`)

  const clients = createGoveeClients()

  if (startPower === 'on') {
    await sendPayloadToDevices({ power: 'on', brightness }, targets, clients)
  }

  for (let cycle = 0; cycle < cycles; cycle++) {
    console.log(`Cycle ${cycle + 1}/${cycles}`)
    for (const hex of colors) {
      const rgb = hexToRgb(hex)
      console.log(` -> ${hex} (${rgb.r},${rgb.g},${rgb.b})`)
      await sendPayloadToDevices({ rgb, brightness }, targets, clients)
      await wait(holdMs)
    }
  }

  if (endPower === 'off') {
    await sendPayloadToDevices({ power: 'off' }, targets, clients)
  }

  console.log('Pattern run complete.')
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
