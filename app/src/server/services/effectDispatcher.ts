import { EventEmitter } from 'node:events'
import type { Prisma, EffectEvent } from '@prisma/client'
import type { EffectType } from '../../shared/constants.js'
import { parseJsonField, stringifyJsonField, type JsonObject } from '../utils/json.js'

type EffectEventEntity = {
  create: (args: Prisma.EffectEventCreateArgs) => Promise<EffectEvent>
}

export type EffectStreamEvent = {
  id: number
  type: EffectType
  source: string
  payload: JsonObject
  createdAt: string
}

const effectEmitter = new EventEmitter()
effectEmitter.setMaxListeners(50)

export const subscribeToEffectStream = (listener: (event: EffectStreamEvent) => void) => {
  effectEmitter.on('effect', listener)
  return () => effectEmitter.off('effect', listener)
}

const emitEffect = (event: EffectStreamEvent) => {
  effectEmitter.emit('effect', event)
}

export const createEffectDispatcher = (repo: EffectEventEntity) => ({
  async dispatch(type: EffectType, source: string, payload: JsonObject) {
    const created = await repo.create({
      data: {
        type,
        source,
        payload: stringifyJsonField(payload),
      },
    })

    emitEffect({
      id: created.id,
      type,
      source,
      payload: parseJsonField(created.payload) as JsonObject,
      createdAt: created.createdAt instanceof Date ? created.createdAt.toISOString() : new Date().toISOString(),
    })
  },
})
