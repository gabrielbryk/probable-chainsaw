import { describe, it, expect } from 'vitest'
import { resolveRiddleVisualConfig } from '../riddleVisuals.js'
import { getVisualPreset } from '../riddleVisualCatalog.js'

describe('resolveRiddleVisualConfig', () => {
  it('falls back to catalog theme when metadata is missing', () => {
    const fallback = getVisualPreset('Wavelength Game')
    const profile = resolveRiddleVisualConfig(null, { fallback: fallback ?? undefined })
    expect(profile.theme).toBe('spectrum')
    expect(profile.palette.length).toBeGreaterThan(0)
    expect(profile.glyphs).toContain('psychic dial')
  })

  it('allows metadata to override fallback palette and hint', () => {
    const fallback = getVisualPreset('Crystal Collection')
    const metadata = {
      visual: {
        palette: ['#111111', '#222222'],
        hint: 'Custom hint override',
      },
    }
    const profile = resolveRiddleVisualConfig(metadata, { fallback: fallback ?? undefined })
    expect(profile.palette).toEqual(['#111111', '#222222'])
    expect(profile.hint).toBe('Custom hint override')
    expect(profile.theme).toBe('crystal')
  })
})
