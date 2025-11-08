import type { FC } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAction, submitPianoPerformance } from 'wasp/client/operations'
import { evaluatePianoPerformance, type PianoPuzzleDefinition } from '../../shared/piano.js'
import type { PianoNoteEvent } from '../../shared/piano.js'
import { useMidiInput } from '../hooks/useMidiInput'
import { dispatchLocalCelebration } from '../hooks/useCelebrationEffects'

type PianoPuzzlePanelProps = {
  riddleId: number
  definition: PianoPuzzleDefinition
}

export const PianoPuzzlePanel: FC<PianoPuzzlePanelProps> = ({ riddleId, definition }) => {
  const captureWindow =
    definition.type === 'sequence'
      ? definition.windowMs ?? 8000
      : Math.max(2000, (definition.toleranceMs ?? 450) * 4)

  const midi = useMidiInput(captureWindow)
  const submitPuzzle = useAction(submitPianoPerformance)
  const [submissionState, setSubmissionState] = useState<'idle' | 'streaming' | 'success' | 'error'>('idle')
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null)
  const hasSubmittedRef = useRef(false)
  const lastSubmitRef = useRef(0)

  const SUBMIT_INTERVAL_MS = 400

  const trimmedEvents = useMemo<PianoNoteEvent[]>(() => {
    const limit = 128
    return midi.events.length > limit ? midi.events.slice(midi.events.length - limit) : midi.events
  }, [midi.events])

  const evaluation = useMemo(() => evaluatePianoPerformance(trimmedEvents, definition), [trimmedEvents, definition])

  useEffect(() => {
    if (!trimmedEvents.length || midi.status !== 'ready' || hasSubmittedRef.current) {
      return
    }

    const elapsed = performance.now() - lastSubmitRef.current
    const delay = elapsed >= SUBMIT_INTERVAL_MS ? 0 : SUBMIT_INTERVAL_MS - elapsed

    const timer = window.setTimeout(async () => {
      try {
        lastSubmitRef.current = performance.now()
        setSubmissionState((prev) => (prev === 'success' ? prev : 'streaming'))
        const result = (await submitPuzzle({ riddleId, events: trimmedEvents })) as { success: boolean; message: string }
        if (result.success) {
          hasSubmittedRef.current = true
          setSubmissionState('success')
          setSubmissionMessage(result.message)
          dispatchLocalCelebration('The piano unlocks the next clue.')
        } else if (!hasSubmittedRef.current) {
          setSubmissionState('streaming')
          setSubmissionMessage(result.message)
        }
      } catch (error) {
        console.error('submitPianoPerformance failed', error)
        if (!hasSubmittedRef.current) {
          setSubmissionState('error')
          setSubmissionMessage('Could not verify the chord. Keep playing and we will retry.')
        }
      }
    }, delay)

    return () => window.clearTimeout(timer)
  }, [trimmedEvents, midi.status, submitPuzzle, riddleId])

  return (
    <section className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-black/30 px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-rose-200">Piano Challenge</p>
        <h2 className="text-2xl font-semibold text-white">{definition.label}</h2>
        <p className="text-sm text-slate-300">
          Play the correct {definition.type === 'chord' ? 'chord' : 'phrase'} on your digital piano. Leave the browser near the keyboard so it can capture MIDI
          input in real time.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
            midi.status === 'ready' ? 'bg-emerald-400/20 text-emerald-100' : midi.status === 'requesting' ? 'bg-amber-500/20 text-amber-100' : 'bg-rose-500/20 text-rose-100'
          }`}
        >
          {midi.status === 'ready'
            ? 'MIDI Connected'
            : midi.status === 'requesting'
            ? 'Requesting Permission'
            : midi.status === 'unsupported'
            ? 'MIDI Not Supported'
            : midi.status === 'denied'
            ? 'Permission Denied'
            : 'Awaiting Connection'}
        </span>
        {midi.deviceName && <span className="text-xs text-slate-400">Device · {midi.deviceName}</span>}
        {midi.lastNote && <span className="text-xs text-slate-400">Last note · {midi.lastNote}</span>}
      </div>

      {midi.status !== 'ready' ? (
        <button
          type="button"
          onClick={midi.requestAccess}
          className="rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-300 px-5 py-2 text-sm font-semibold text-black shadow-md shadow-violet-900/40 transition hover:scale-[1.02]"
        >
          Enable MIDI Access
        </button>
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-widest text-slate-400">Progress</p>
            <p className="mt-1 text-base text-white">{evaluation.summary}</p>
            {definition.type === 'sequence' && (
              <p className="mt-1 text-xs text-slate-400">
                Steps matched: {evaluation.completedSteps} / {evaluation.totalSteps}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={midi.resetEvents}
              className="rounded-full border border-dashed border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              Clear Recent Notes
            </button>
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400">
              <input
                type="checkbox"
                checked={midi.audioEnabled}
                onChange={(event) => midi.setAudioEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/20 text-rose-400 focus:ring-rose-400"
              />
              Monitor with Soft Synth
            </label>
          </div>
        </>
      )}

      {submissionState === 'streaming' && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-900/10 px-4 py-3 text-sm text-amber-100">
          {submissionMessage ?? 'Listening to every note…'}
        </div>
      )}
      {submissionState === 'success' && submissionMessage && (
        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-900/10 px-4 py-3 text-sm text-emerald-100">{submissionMessage}</div>
      )}
      {submissionState === 'error' && submissionMessage && (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-900/10 px-4 py-3 text-sm text-rose-100">{submissionMessage}</div>
      )}
    </section>
  )
}

export default PianoPuzzlePanel
