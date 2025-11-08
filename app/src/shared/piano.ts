import { z } from 'zod'

const NOTE_REGEX = /^([A-Ga-g])([#b]?)(-?\d+)$/

const PITCH_CLASS: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

export const PianoNoteEventSchema = z.object({
  note: z.string().regex(NOTE_REGEX, 'Invalid note syntax (use e.g., C4, F#3)'),
  velocity: z.number().min(0).max(1).optional(),
  timeMs: z.number().int().nonnegative(),
})

export type PianoNoteEvent = z.infer<typeof PianoNoteEventSchema>

const PianoChordDefinitionSchema = z.object({
  type: z.literal('chord'),
  id: z.string(),
  label: z.string().min(1),
  notes: z.array(z.string().regex(NOTE_REGEX)).min(1),
  toleranceMs: z.number().int().positive().default(450),
  allowOctaveShifts: z.boolean().default(true),
  allowExtraNotes: z.boolean().default(false),
})

const PianoSequenceStepSchema = z.object({
  notes: z.array(z.string().regex(NOTE_REGEX)).min(1),
  maxStepDurationMs: z.number().int().positive().default(1200),
})

const PianoSequenceDefinitionSchema = z.object({
  type: z.literal('sequence'),
  id: z.string(),
  label: z.string().min(1),
  steps: z.array(PianoSequenceStepSchema).min(1),
  windowMs: z.number().int().positive().default(8000),
  allowOctaveShifts: z.boolean().default(true),
})

export const PianoPuzzleDefinitionSchema = z.discriminatedUnion('type', [
  PianoChordDefinitionSchema,
  PianoSequenceDefinitionSchema,
])

export type PianoPuzzleDefinition = z.infer<typeof PianoPuzzleDefinitionSchema>

export type PianoEvaluationResult = {
  success: boolean
  completedSteps: number
  totalSteps: number
  summary: string
}

export const midiToNoteName = (midi: number): string => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midi / 12) - 1
  const pitchClass = ((midi % 12) + 12) % 12
  return `${noteNames[pitchClass]}${octave}`
}

export const normalizeNoteName = (raw: string): string => {
  const match = NOTE_REGEX.exec(raw.trim())
  if (!match) {
    throw new Error(`Invalid note syntax: ${raw}`)
  }
  const [, letter, accidental, octave] = match
  return `${letter.toUpperCase()}${accidental ? accidental.replace('b', 'b').replace('B', 'b').replace('#', '#') : ''}${octave}`
}

export const noteNameToMidi = (note: string): number => {
  const normalized = normalizeNoteName(note)
  const match = NOTE_REGEX.exec(normalized)
  if (!match) {
    throw new Error(`Invalid note syntax: ${note}`)
  }
  const [, letter, accidentalRaw, octaveRaw] = match
  const accidental = accidentalRaw ?? ''
  const pitchKey = `${letter}${accidental}`
  const pitch = PITCH_CLASS[pitchKey]
  if (pitch === undefined) {
    throw new Error(`Unsupported note: ${note}`)
  }
  const octave = Number(octaveRaw)
  return pitch + (octave + 1) * 12
}

const noteToKey = (note: string, allowOctaveShifts: boolean): number => {
  const midi = noteNameToMidi(note)
  return allowOctaveShifts ? ((midi % 12) + 12) % 12 : midi
}

const eventToKey = (event: PianoNoteEvent, allowOctaveShifts: boolean): number =>
  noteToKey(event.note, allowOctaveShifts)

const evaluateChord = (events: PianoNoteEvent[], definition: PianoPuzzleDefinition & { type: 'chord' }): PianoEvaluationResult => {
  if (!events.length) {
    return { success: false, completedSteps: 0, totalSteps: 1, summary: 'Play the chord when ready.' }
  }

  const sorted = [...events].sort((a, b) => a.timeMs - b.timeMs)
  const tolerance = definition.toleranceMs ?? 450
  const targetKeys = definition.notes.map((note) => noteToKey(note, definition.allowOctaveShifts ?? true))

  for (let i = 0; i < sorted.length; i++) {
    const windowStart = sorted[i].timeMs
    const cluster: PianoNoteEvent[] = []
    for (let j = i; j < sorted.length; j++) {
      if (sorted[j].timeMs - windowStart > tolerance) break
      cluster.push(sorted[j])
    }
    if (!cluster.length) continue

    const playedKeys = new Set(cluster.map((evt) => eventToKey(evt, definition.allowOctaveShifts ?? true)))
    const hasAllNotes = targetKeys.every((key) => playedKeys.has(key))
    if (hasAllNotes) {
      if (definition.allowExtraNotes || cluster.length === targetKeys.length) {
        return {
          success: true,
          completedSteps: 1,
          totalSteps: 1,
          summary: `Matched ${definition.label}`,
        }
      }
    }
  }

  return {
    success: false,
    completedSteps: 0,
    totalSteps: 1,
    summary: `Need the full chord (${definition.label}).`,
  }
}

const evaluateSequence = (
  events: PianoNoteEvent[],
  definition: PianoPuzzleDefinition & { type: 'sequence' }
): PianoEvaluationResult => {
  if (!events.length) {
    return {
      success: false,
      completedSteps: 0,
      totalSteps: definition.steps.length,
      summary: 'Play the opening note to begin the sequence.',
    }
  }

  const sorted = [...events].sort((a, b) => a.timeMs - b.timeMs)
  const allowOctaveShifts = definition.allowOctaveShifts ?? true
  const steps = definition.steps.map((step) => ({
    required: new Set(step.notes.map((note) => noteToKey(note, allowOctaveShifts))),
    collected: new Set<number>(),
    startedAt: null as number | null,
    maxDuration: step.maxStepDurationMs ?? 1200,
  }))

  let currentStep = 0

  for (const event of sorted) {
    if (currentStep >= steps.length) break
    const step = steps[currentStep]
    const key = eventToKey(event, allowOctaveShifts)
    if (step.required.has(key)) {
      if (step.startedAt === null) {
        step.startedAt = event.timeMs
      }
      if (event.timeMs - step.startedAt <= step.maxDuration) {
        step.collected.add(key)
        if (step.collected.size === step.required.size) {
          currentStep += 1
        }
      } else {
        // took too long, reset this step
        step.collected.clear()
        step.startedAt = event.timeMs
        step.collected.add(key)
      }
    }
  }

  const success = currentStep >= steps.length
  return {
    success,
    completedSteps: Math.min(currentStep, steps.length),
    totalSteps: steps.length,
    summary: success
      ? `Sequence "${definition.label}" complete.`
      : `Progress: ${Math.min(currentStep, steps.length)} / ${steps.length} phrases.`,
  }
}

export const evaluatePianoPerformance = (
  events: PianoNoteEvent[],
  definition: PianoPuzzleDefinition
): PianoEvaluationResult => {
  if (definition.type === 'chord') {
    return evaluateChord(events, definition)
  }
  return evaluateSequence(events, definition)
}
