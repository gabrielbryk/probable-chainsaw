import { z } from 'zod'
import { HINT_TIERS } from '../../shared/constants.js'

const hintItemSchema = z.object({
  text: z.string(),
  tier: z.string().optional(),
})

const hintSchema = z.union([
  z.object({ default: z.string().optional() }),
  z.array(hintItemSchema),
])

export const selectHintByTier = (raw: unknown, tier: string) => {
  const parsed = hintSchema.safeParse(raw)
  if (!parsed.success) return null

  if (Array.isArray(parsed.data)) {
    return parsed.data.find((hint) => (hint.tier ?? HINT_TIERS.GENTLE) === tier) ?? parsed.data[0] ?? null
  }

  if (typeof parsed.data.default === 'string') {
    return { text: parsed.data.default, tier: HINT_TIERS.GENTLE }
  }

  return null
}

export const selectPrimaryHint = (raw: unknown) => selectHintByTier(raw, HINT_TIERS.GENTLE)
