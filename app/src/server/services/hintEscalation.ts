import { HINT_TIERS } from '../../shared/constants.js'
import type { AttemptsMap } from './stateMachine.js'

const thresholds = [
  { min: 0, tier: HINT_TIERS.GENTLE },
  { min: 2, tier: HINT_TIERS.NUDGE },
  { min: 4, tier: HINT_TIERS.STRONG },
] as const

export type HintDecision = {
  tier: string
  escalateToGuide: boolean
  attemptCount: number
}

export const decideHintTier = (attempts: AttemptsMap, riddleId: number): HintDecision => {
  const attemptCount = attempts[String(riddleId)] ?? 0
  const tierEntry = [...thresholds].reverse().find((entry) => attemptCount >= entry.min) ?? thresholds[0]
  return {
    tier: tierEntry.tier,
    escalateToGuide: attemptCount >= 6,
    attemptCount,
  }
}
