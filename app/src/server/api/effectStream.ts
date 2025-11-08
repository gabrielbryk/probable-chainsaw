import type { Request, Response } from 'express'
import { subscribeToEffectStream, type EffectStreamEvent } from '../services/effectDispatcher.js'

const HEARTBEAT_INTERVAL_MS = 25000

const writeEvent = (res: Response, event: EffectStreamEvent) => {
  res.write(`id: ${event.id}\n`)
  res.write('event: effect\n')
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}

export const effectStream = (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  res.write(': connected\n\n')

  const unsubscribe = subscribeToEffectStream((event) => writeEvent(res, event))
  const heartbeat = setInterval(() => {
    res.write('event: ping\n')
    res.write('data: {}\n\n')
  }, HEARTBEAT_INTERVAL_MS)

  const close = () => {
    clearInterval(heartbeat)
    unsubscribe()
    res.end()
  }

  res.on('close', close)
}
