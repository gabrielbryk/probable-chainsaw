import { describe, expect, it } from 'vitest'
import { buildLanDatagram } from '../clients/lanMessage'

const decodePayload = (payload: Buffer) => JSON.parse(payload.toString('utf-8'))

describe('buildLanDatagram', () => {
  it('encodes power commands into numeric LAN payloads', () => {
    const { payload, expectsResponse } = buildLanDatagram({ name: 'turn', value: 'on' })
    expect(expectsResponse).toBe(false)
    expect(decodePayload(payload)).toEqual({
      msg: { cmd: 'turn', data: { value: 1 } },
    })
  })

  it('encodes rgb values into colorwc payload', () => {
    const { payload } = buildLanDatagram({
      name: 'colorwc',
      value: { r: 1, g: 2, b: 3, brightness: 75 },
    })
    expect(decodePayload(payload)).toEqual({
      msg: {
        cmd: 'colorwc',
        data: {
          color: { r: 1, g: 2, b: 3 },
          colorTemInKelvin: 0,
          brightness: 75,
        },
      },
    })
  })

  it('throws for invalid brightness values', () => {
    expect(() => buildLanDatagram({ name: 'brightness', value: 150 })).toThrow()
  })

  it('marks devStatus as response-expected command', () => {
    const { payload, expectsResponse } = buildLanDatagram({ name: 'devStatus', value: {} })
    expect(expectsResponse).toBe(true)
    expect(decodePayload(payload)).toEqual({ msg: { cmd: 'devStatus', data: {} } })
  })
})
