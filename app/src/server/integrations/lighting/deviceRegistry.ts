import { env } from '../../config/env'
import type { GoveeDeviceConfig } from '../../config/env'

export const getAllDevices = (): GoveeDeviceConfig[] => env.goveeDevices

export const findDevices = (predicate: (device: GoveeDeviceConfig) => boolean): GoveeDeviceConfig[] =>
  env.goveeDevices.filter(predicate)

export const findDeviceById = (deviceId: string): GoveeDeviceConfig | undefined =>
  env.goveeDevices.find((device) => device.device.toLowerCase() === deviceId.toLowerCase())

export const findDeviceByName = (name: string): GoveeDeviceConfig | undefined =>
  env.goveeDevices.find(
    (device) => device.name?.toLowerCase().trim() === name.toLowerCase().trim()
  )
