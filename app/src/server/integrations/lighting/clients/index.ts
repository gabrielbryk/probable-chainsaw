import { env } from '../../../config/env'
import type { GoveeDeviceConfig } from '../../../config/env'
import type { GoveeCommand } from '../commands'
import type { SelfTestResult } from '../../types'
import type { GoveeClient } from './types'
import { GoveeCloudClient } from './cloud'
import { GoveeLanClient } from './lan'

export type { GoveeClient }

export const createGoveeClients = (): GoveeClient[] => {
  const clients: GoveeClient[] = []
  if (env.goveeApiKey) {
    clients.push(new GoveeCloudClient(env.goveeApiKey, env.goveeApiBase))
  }
  clients.push(new GoveeLanClient(env.goveeLanPort, env.goveeDevices))
  return clients
}

export const runClientSelfTests = async (clients: GoveeClient[]): Promise<SelfTestResult> => {
  for (const client of clients) {
    const result = await client.runSelfTest()
    if (!result.success) {
      return result
    }
  }
  return { name: 'Lighting (Govee)', success: true, details: 'All clients healthy' }
}

export const sendWithClients = async (
  clients: GoveeClient[],
  device: GoveeDeviceConfig,
  cmd: GoveeCommand
): Promise<void> => {
  const supported = clients.filter((client) => client.canHandle(device))
  if (!supported.length) {
    throw new Error(
      `No lighting client can handle device ${device.device} (${device.model}). Ensure IP or API key is configured.`
    )
  }

  const errors: Error[] = []
  for (const client of supported) {
    try {
      await client.send(device, cmd)
      return
    } catch (error) {
      errors.push(error as Error)
    }
  }

  const message = errors.map((err, idx) => `Client ${supported[idx].name}: ${err.message}`).join('; ')
  throw new Error(`All lighting clients failed for ${device.device}: ${message}`)
}
