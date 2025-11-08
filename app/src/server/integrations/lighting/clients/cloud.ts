import type { GoveeDeviceConfig } from '../../../config/env'
import type { GoveeCommand } from '../commands'
import type { SelfTestResult } from '../../types'
import type { GoveeClient } from './types'

const CONTROL_ENDPOINT = '/v1/devices/control'
const DEVICES_ENDPOINT = '/v1/devices'

export class GoveeCloudClient implements GoveeClient {
  public readonly name = 'cloud'

  constructor(private readonly apiKey: string, private readonly apiBase: string) {}

  canHandle(): boolean {
    return Boolean(this.apiKey)
  }

  async send(device: GoveeDeviceConfig, cmd: GoveeCommand): Promise<void> {
    const response = await fetch(`${this.apiBase}${CONTROL_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Govee-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        device: device.device,
        model: device.model,
        cmd,
      }),
    })
    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Cloud command failed (${response.status}): ${body}`)
    }
  }

  async runSelfTest(): Promise<SelfTestResult> {
    try {
      const response = await fetch(`${this.apiBase}${DEVICES_ENDPOINT}`, {
        headers: {
          'Content-Type': 'application/json',
          'Govee-API-Key': this.apiKey,
        },
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(`Device list returned ${response.status}: ${body}`)
      }
      const data = await response.json()
      return {
        name: 'Lighting (Govee Cloud)',
        success: true,
        details: `Discovered ${(data?.data ?? []).length ?? 0} devices`,
      }
    } catch (error) {
      return { name: 'Lighting (Govee Cloud)', success: false, error }
    }
  }
}
