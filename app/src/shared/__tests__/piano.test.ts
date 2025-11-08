import { describe, expect, it } from 'vitest'
import {
  evaluatePianoPerformance,
  type PianoNoteEvent,
  type PianoPuzzleDefinition,
} from '../piano.js'

const mkEvent = (note: string, timeMs: number): PianoNoteEvent => ({
  note,
  timeMs,
})

describe('evaluatePianoPerformance', () => {
  it('matches a chord regardless of order', () => {
    const definition: PianoPuzzleDefinition = {
      type: 'chord',
      id: 'test-chord',
      label: 'Test',
      notes: ['C4', 'E4', 'G4'],
      toleranceMs: 500,
      allowOctaveShifts: true,
      allowExtraNotes: false,
    }

    const events = [mkEvent('E4', 10), mkEvent('G4', 90), mkEvent('C5', 120)]
    const result = evaluatePianoPerformance(events, definition)
    expect(result.success).toBe(true)
  })

  it('requires all notes when extras disabled', () => {
    const definition: PianoPuzzleDefinition = {
      type: 'chord',
      id: 'test-chord',
      label: 'Test',
      notes: ['C4', 'E4', 'G4'],
      toleranceMs: 400,
      allowOctaveShifts: true,
      allowExtraNotes: false,
    }

    const events = [mkEvent('C4', 10), mkEvent('E4', 200)]
    const result = evaluatePianoPerformance(events, definition)
    expect(result.success).toBe(false)
  })

  it('tracks sequence steps in order', () => {
    const definition: PianoPuzzleDefinition = {
      type: 'sequence',
      id: 'test-seq',
      label: 'Test Sequence',
      allowOctaveShifts: true,
      windowMs: 8000,
      steps: [
        { notes: ['C4'], maxStepDurationMs: 1000 },
        { notes: ['E4', 'G4'], maxStepDurationMs: 1000 },
      ],
    }

    const events = [mkEvent('C4', 0), mkEvent('E5', 500), mkEvent('G5', 800)]
    const result = evaluatePianoPerformance(events, definition)
    expect(result.success).toBe(true)
    expect(result.completedSteps).toBe(2)
  })
})
