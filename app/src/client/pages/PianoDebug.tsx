import type { FC, ChangeEvent } from 'react'
import { useMemo, useState } from 'react'
import { PianoPuzzleDefinitionSchema, type PianoPuzzleDefinition } from '../../shared/piano.js'
import PianoPuzzlePanel from '../components/PianoPuzzlePanel'

const SAMPLE_CHORD: PianoPuzzleDefinition = {
  type: 'chord',
  id: 'debug-chord',
  label: 'Debug Chord (Cmaj7)',
  notes: ['C4', 'E4', 'G4', 'B4'],
  toleranceMs: 600,
  allowOctaveShifts: true,
  allowExtraNotes: false,
}

const SAMPLE_SEQUENCE: PianoPuzzleDefinition = {
  type: 'sequence',
  id: 'debug-sequence',
  label: 'Debug Sequence (C → FG)',
  allowOctaveShifts: true,
  windowMs: 8000,
  steps: [
    { notes: ['C4'], maxStepDurationMs: 1200 },
    { notes: ['F4', 'G4'], maxStepDurationMs: 1500 },
  ],
}

const PianoDebugPage: FC = () => {
  const [riddleIdInput, setRiddleIdInput] = useState('3')
  const [definitionInput, setDefinitionInput] = useState(JSON.stringify(SAMPLE_CHORD, null, 2))
  const [parseError, setParseError] = useState<string | null>(null)

  const parsedDefinition = useMemo(() => {
    try {
      const parsed = PianoPuzzleDefinitionSchema.parse(JSON.parse(definitionInput))
      setParseError(null)
      return parsed
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Invalid JSON')
      return null
    }
  }, [definitionInput])

  const riddleId = Number.parseInt(riddleIdInput, 10)
  const isRiddleIdValid = Number.isInteger(riddleId) && riddleId > 0

  const handleDefinitionPreset = (preset: 'chord' | 'sequence') => {
    setDefinitionInput(JSON.stringify(preset === 'chord' ? SAMPLE_CHORD : SAMPLE_SEQUENCE, null, 2))
  }

  const handleDefinitionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDefinitionInput(event.target.value)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 rounded-3xl border border-white/10 bg-white/5 px-6 py-8 sm:px-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-rose-200">Developer Utility</p>
        <h1 className="text-3xl font-semibold text-white">Piano Integration Debugger</h1>
        <p className="text-sm text-slate-300">
          Use this page to experiment with MIDI capture, Tone.js monitoring, and backend validation. Ensure the piano riddle you want to test is currently
          active, then provide its ID below.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-slate-200">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-slate-400">Active Riddle ID</span>
            <input
              type="number"
              min={1}
              value={riddleIdInput}
              onChange={(event) => setRiddleIdInput(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white focus:border-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-200"
            />
          </label>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-slate-400">Presets</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleDefinitionPreset('chord')}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-white/10"
              >
                Load Chord
              </button>
              <button
                type="button"
                onClick={() => handleDefinitionPreset('sequence')}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-white/10"
              >
                Load Sequence
              </button>
            </div>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-widest text-slate-400">Puzzle Definition (JSON)</span>
          <textarea
            value={definitionInput}
            onChange={handleDefinitionChange}
            rows={10}
            className="w-full rounded-2xl border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-white focus:border-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-200"
          />
        </label>
        {parseError && <p className="text-xs text-rose-300">Invalid definition: {parseError}</p>}
        {!isRiddleIdValid && <p className="text-xs text-rose-300">Enter a positive integer riddle ID.</p>}
      </section>

      {parsedDefinition && isRiddleIdValid ? (
        <PianoPuzzlePanel riddleId={riddleId} definition={parsedDefinition} />
      ) : (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-900/10 p-4 text-sm text-amber-100">
          Provide a valid riddle ID and puzzle definition to enable the live panel.
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-slate-300">
        <p className="text-xs uppercase tracking-widest text-slate-400">Tips</p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
          <li>Chrome/Edge support Web MIDI on HTTPS or localhost. Safari requires the “MIDI” experimental flag.</li>
          <li>Keep the browser tab focused and the MIDI device connected before tapping “Enable MIDI Access”.</li>
          <li>The backend only accepts puzzles for the currently active riddle. Use the admin tools to jump to the piano riddle first.</li>
        </ul>
      </section>
    </div>
  )
}

export default PianoDebugPage
