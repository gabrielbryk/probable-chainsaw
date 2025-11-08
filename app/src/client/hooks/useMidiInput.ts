import { useCallback, useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { midiToNoteName, type PianoNoteEvent } from '../../shared/piano.js'

type MidiStatus = 'idle' | 'requesting' | 'ready' | 'unsupported' | 'denied'

export type MidiMonitorState = {
  status: MidiStatus
  events: PianoNoteEvent[]
  lastNote: string | null
  deviceName: string | null
  requestAccess: () => Promise<void>
  audioEnabled: boolean
  setAudioEnabled: (value: boolean) => void
  resetEvents: () => void
}

export const useMidiInput = (captureWindowMs: number): MidiMonitorState => {
  const [status, setStatus] = useState<MidiStatus>('idle')
  const [events, setEvents] = useState<PianoNoteEvent[]>([])
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const [lastNote, setLastNote] = useState<string | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(true)

  const midiAccessRef = useRef<MIDIAccess | null>(null)
  const synthRef = useRef<Tone.PolySynth | null>(null)

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination()
    return () => {
      synthRef.current?.dispose()
      synthRef.current = null
    }
  }, [])

  const handleMidiMessage = useCallback(
    (message: MIDIMessageEvent) => {
      const data = Array.from(message.data ?? [])
      if (data.length < 3) return
      const [statusByte, noteNumber, velocity] = data
      const command = statusByte & 0xf0
      if (command !== 0x90 || velocity === 0) {
        return
      }
      const timestamp = performance.now()
      const noteName = midiToNoteName(noteNumber)
      setLastNote(noteName)

      setEvents((prev) => {
        const trimmed = prev.filter((evt) => timestamp - evt.timeMs <= captureWindowMs)
        return [...trimmed, { note: noteName, velocity: velocity / 127, timeMs: Math.round(timestamp) }]
      })

      if (audioEnabled && synthRef.current) {
        void Tone.start()
        synthRef.current.triggerAttackRelease(noteName, '8n', undefined, velocity / 127)
      }
    },
    [audioEnabled, captureWindowMs]
  )

  const attachInputs = useCallback(
    (access: MIDIAccess) => {
      access.inputs.forEach((input) => {
        input.onmidimessage = handleMidiMessage
        setDeviceName(input.name ?? 'MIDI Input')
      })
    },
    [handleMidiMessage]
  )

  const detachInputs = useCallback(() => {
    midiAccessRef.current?.inputs.forEach((input) => {
      input.onmidimessage = null
    })
  }, [])

  const requestAccess = useCallback(async () => {
    if (!navigator.requestMIDIAccess) {
      setStatus('unsupported')
      return
    }
    try {
      setStatus('requesting')
      const access = await navigator.requestMIDIAccess()
      midiAccessRef.current = access
      attachInputs(access)
      access.onstatechange = () => attachInputs(access)
      setStatus('ready')
    } catch (error) {
      console.error('Failed to access MIDI devices', error)
      setStatus('denied')
    }
  }, [attachInputs])

  useEffect(() => {
    return () => {
      detachInputs()
      if (midiAccessRef.current) {
        midiAccessRef.current.onstatechange = null
      }
    }
  }, [detachInputs])

  const resetEvents = useCallback(() => setEvents([]), [])

  return {
    status,
    events,
    lastNote,
    deviceName,
    requestAccess,
    audioEnabled,
    setAudioEnabled,
    resetEvents,
  }
}
