import { LightingEffectPayloadSchema } from './schema'
import type { LightingAdapter } from './index'
import type { EffectEvent, SelfTestResult } from '../types'
import { env } from '../../config/env'
import { buildGoveeCommands } from './commands'
import { createGoveeClients, runClientSelfTests, sendWithClients } from './clients'

export class GoveeLightingAdapter implements LightingAdapter {
  private readonly clients = createGoveeClients()

  async trigger(event: EffectEvent): Promise<void> {
    const payload = LightingEffectPayloadSchema.parse(event.payload)
    if (!env.goveeDevices.length) {
      throw new Error('No Govee devices configured. Edit config/govee_devices.json or GOVEE_DEVICES env.')
    }

    const commands = buildGoveeCommands(payload)

    await Promise.all(
      env.goveeDevices.map((device) =>
        Promise.all(commands.map((cmd) => sendWithClients(this.clients, device, cmd)))
      )
    )
  }

  async runSelfTest(): Promise<SelfTestResult> {
    return runClientSelfTests(this.clients)
  }
}
