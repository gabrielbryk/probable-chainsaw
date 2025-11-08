import { describe, it, expect } from 'vitest'
import { decideHintTier } from '../hintEscalation.js'
import { HINT_TIERS } from '../../../shared/constants.js'

describe('hint escalation', () => {
  it('returns gentle for first attempts', () => {
    const decision = decideHintTier({}, 1)
    expect(decision.tier).toBe(HINT_TIERS.GENTLE)
    expect(decision.escalateToGuide).toBe(false)
  })

  it('escalates tiers based on attempts', () => {
    const decision = decideHintTier({ '2': 3 }, 2)
    expect(decision.tier).toBe(HINT_TIERS.NUDGE)
  })

  it('escalates to guide after many attempts', () => {
    const decision = decideHintTier({ '3': 6 }, 3)
    expect(decision.tier).toBe(HINT_TIERS.STRONG)
    expect(decision.escalateToGuide).toBe(true)
  })
})
