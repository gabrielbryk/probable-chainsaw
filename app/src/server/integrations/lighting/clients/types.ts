import type { GoveeDeviceConfig } from '../../../config/env'
import type { GoveeCommand } from '../commands'
import type { SelfTestResult } from '../../types'

export interface GoveeClient {
  name: string
  canHandle(device: GoveeDeviceConfig): boolean
  send(device: GoveeDeviceConfig, cmd: GoveeCommand): Promise<void>
  runSelfTest(): Promise<SelfTestResult>
}
