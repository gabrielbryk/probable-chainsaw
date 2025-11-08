import { useEffect, useRef, useState } from 'react'
import confettiImport from 'canvas-confetti'
import { useQuery, getEffectEvents } from 'wasp/client/operations'
import { EFFECT_TYPES } from '../../shared/constants'

type CelebrationState = {
  id: number
  type: string
  message: string
  payload: Record<string, unknown>
}

type EffectEventRecord = Awaited<ReturnType<typeof getEffectEvents>> extends (infer Item)[] ? Item : never

const CELEBRATORY_EVENTS = new Set<string>([
  EFFECT_TYPES.RIDDLE_SOLVED,
  EFFECT_TYPES.RIDDLE_SKIPPED,
  EFFECT_TYPES.HUNT_STARTED,
  EFFECT_TYPES.HUNT_COMPLETED,
])

const CELEBRATION_MESSAGES: Record<string, string> = {
  [EFFECT_TYPES.RIDDLE_SOLVED]: 'Clue solved! Follow the Guide to your next discovery.',
  [EFFECT_TYPES.RIDDLE_SKIPPED]: 'Gabe advanced the riddle. Take a breath and continue.',
  [EFFECT_TYPES.HUNT_STARTED]: 'The Guide has awakened. Adventure begins now!',
  [EFFECT_TYPES.HUNT_COMPLETED]: 'Finale activated. Savor the celebration.',
}

const DISPLAY_MS = 5000
const STREAM_ENDPOINT = '/api/effects/stream'

let audioContext: AudioContext | null = null

const fireConfetti = () => {
  if (typeof window === 'undefined') return
  confettiImport({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    decay: 0.92,
  })
}

const playCelebrationTone = (type: string) => {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return
  audioContext = audioContext ?? new window.AudioContext()
  const ctx = audioContext
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  const baseFrequency = type === EFFECT_TYPES.HUNT_COMPLETED ? 493.88 : 329.63 // B4 vs E4
  oscillator.type = 'triangle'
  oscillator.frequency.value = baseFrequency
  gain.gain.setValueAtTime(0.001, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4)

  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + 1.5)
}

const LOCAL_EVENT = 'joy:celebration'

export const dispatchLocalCelebration = (message?: string) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(LOCAL_EVENT, {
      detail: { message },
    })
  )
}

export const useCelebrationEffects = () => {
  const [celebration, setCelebration] = useState<CelebrationState | null>(null)
  const hideTimer = useRef<number | null>(null)
  const initialHydrated = useRef(false)
  const initialQuery = useQuery(getEffectEvents, undefined, { enabled: false })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const source = new EventSource(STREAM_ENDPOINT)

    const handleEffect = (event: MessageEvent<string>) => {
      if (!event.data) return
      try {
        const parsed = JSON.parse(event.data) as CelebrationState
        if (!CELEBRATORY_EVENTS.has(parsed.type)) return
        setCelebration({
          id: parsed.id ?? Date.now(),
          type: parsed.type,
          message: CELEBRATION_MESSAGES[parsed.type] ?? 'Magic shimmers through the room.',
          payload: parsed.payload ?? {},
        })
        fireConfetti()
        playCelebrationTone(parsed.type)
      } catch (err) {
        console.error('Failed to parse celebration event', err)
      }
    }

    source.addEventListener('effect', handleEffect as EventListener)
    source.addEventListener('ping', () => {})
    source.onerror = () => {
      // drop and let the browser reconnect automatically
    }

    return () => {
      source.removeEventListener('effect', handleEffect as EventListener)
      source.close()
    }
  }, [])

  useEffect(() => {
    if (!celebration) return
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current)
    }
    hideTimer.current = window.setTimeout(() => setCelebration(null), DISPLAY_MS)
    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current)
      }
    }
  }, [celebration])

  useEffect(() => {
    if (typeof window === 'undefined') return
    initialQuery.refetch?.()
  }, [])

  useEffect(() => {
    if (initialHydrated.current) return
    if (!initialQuery.data || !initialQuery.data.length) return
    const latest = initialQuery.data[0] as EffectEventRecord
    if (!latest || !CELEBRATORY_EVENTS.has(latest.type)) return
    initialHydrated.current = true
    setCelebration({
      id: latest.id,
      type: latest.type,
      message: CELEBRATION_MESSAGES[latest.type] ?? 'Magic shimmers through the room.',
      payload: (latest as EffectEventRecord).payload ?? {},
    })
  }, [initialQuery.data])

  const triggerLocalCelebration = (message = 'Joyful sparkles burst around you!') => {
    setCelebration({
      id: Date.now(),
      type: 'LOCAL_CELEBRATION',
      payload: {},
      message,
    })
    fireConfetti()
    playCelebrationTone(EFFECT_TYPES.HUNT_COMPLETED)
  }

  const dismissCelebration = () => setCelebration(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail
      triggerLocalCelebration(detail?.message)
    }
    window.addEventListener(LOCAL_EVENT, handler as EventListener)
    return () => window.removeEventListener(LOCAL_EVENT, handler as EventListener)
  }, [])

  return {
    celebration,
    dismissCelebration,
    triggerLocalCelebration,
  }
}
