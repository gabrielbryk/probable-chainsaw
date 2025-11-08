import dgram from 'dgram'
import type { GoveeDeviceConfig } from '../../../config/env'
import type { GoveeCommand } from '../commands'
import type { SelfTestResult } from '../../types'
import type { GoveeClient } from './types'
import { buildLanDatagram } from './lanMessage'

const RESPONSE_TIMEOUT_MS = 2000
const DEV_STATUS_COMMAND: GoveeCommand = { name: 'devStatus', value: {} }

export class GoveeLanClient implements GoveeClient {
  public readonly name = 'lan'

  constructor(
    private readonly port: number,
    private readonly devices: GoveeDeviceConfig[],
    private readonly responseTimeoutMs: number = RESPONSE_TIMEOUT_MS
  ) {}

  canHandle(device: GoveeDeviceConfig): boolean {
    return Boolean(device.ip)
  }

  async send(device: GoveeDeviceConfig, cmd: GoveeCommand): Promise<void> {
    if (!device.ip) {
      throw new Error('LAN control requires device IP (set via config or GOVEE_DEVICES)')
    }

    const { payload, expectsResponse } = buildLanDatagram(cmd)
    const socket = dgram.createSocket('udp4')

    if (expectsResponse) {
      await bindSocket(socket)
    }

    await new Promise<void>((resolve, reject) => {
      let timeout: NodeJS.Timeout | undefined

      const cleanup = () => {
        if (timeout) clearTimeout(timeout)
        socket.removeAllListeners()
        socket.close()
      }

      const handleError = (error: Error) => {
        cleanup()
        reject(error)
      }

      socket.once('error', handleError)

      if (expectsResponse) {
        timeout = setTimeout(() => {
          cleanup()
          reject(new Error(`LAN command "${cmd.name}" timed out waiting for response`))
        }, this.responseTimeoutMs)

        socket.on('message', (message) => {
          if (isMatchingStatusResponse(message, device)) {
            cleanup()
            resolve()
          }
        })
      }

      socket.send(payload, this.port, device.ip as string, (err) => {
        if (err) {
          cleanup()
          reject(err)
          return
        }
        if (!expectsResponse) {
          cleanup()
          resolve()
        }
      })
    })
  }

  async runSelfTest(): Promise<SelfTestResult> {
    const lanDevices = this.devices.filter((device) => Boolean(device.ip))
    if (!lanDevices.length) {
      return {
        name: 'Lighting (Govee LAN)',
        success: true,
        details: 'No LAN-capable devices configured; skipping test.',
      }
    }

    try {
      await this.send(lanDevices[0], DEV_STATUS_COMMAND)
      return {
        name: 'Lighting (Govee LAN)',
        success: true,
        details: `Validated LAN control for ${lanDevices[0].name ?? lanDevices[0].model}`,
      }
    } catch (error) {
      return { name: 'Lighting (Govee LAN)', success: false, error }
    }
  }
}

const bindSocket = (socket: dgram.Socket) =>
  new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      socket.removeListener('listening', onListening)
      reject(error)
    }

    const onListening = () => {
      socket.removeListener('error', onError)
      resolve()
    }

    socket.once('error', onError)
    socket.once('listening', onListening)
    socket.bind()
  })

const isMatchingStatusResponse = (message: Buffer, device: GoveeDeviceConfig) => {
  try {
    const parsed = JSON.parse(message.toString())
    if (parsed?.msg?.cmd !== 'devStatus') {
      return false
    }
    const responseDevice: unknown = parsed?.msg?.data?.device
    if (typeof responseDevice === 'string') {
      return responseDevice.toLowerCase() === device.device.toLowerCase()
    }
    return true
  } catch {
    return false
  }
}
