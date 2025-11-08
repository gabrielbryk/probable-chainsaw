import { z } from 'zod'

const VISUAL_THEMES = ['spiral', 'waves', 'keys', 'orbs', 'crystal', 'spectrum', 'arcade', 'finale'] as const
const VISUAL_INTENSITIES = ['calm', 'lively', 'intense'] as const

export type VisualTheme = (typeof VISUAL_THEMES)[number]
export type VisualIntensity = (typeof VISUAL_INTENSITIES)[number]

const VisualConfigSchema = z
  .object({
    theme: z.enum(VISUAL_THEMES).optional(),
    palette: z.array(z.string().min(3)).min(1).max(6).optional(),
    accent: z.string().min(3).optional(),
    hint: z.string().min(3).optional(),
    glyphs: z.array(z.string().min(1)).max(6).optional(),
    intensity: z.enum(VISUAL_INTENSITIES).optional(),
  })
  .partial()

export type VisualMetadataConfig = z.infer<typeof VisualConfigSchema>

type RawVisualConfig = VisualMetadataConfig

export type RiddleVisualProfile = {
  theme: VisualTheme
  palette: string[]
  accent: string
  hint?: string
  glyphs: string[]
  intensity: VisualIntensity
}

const THEME_DEFAULTS: Record<
  Extract<VisualTheme, 'spiral' | 'waves' | 'keys' | 'orbs' | 'crystal' | 'spectrum' | 'arcade' | 'finale'>,
  {
    palette: string[]
    accent: string
  }
> = {
  spiral: {
    palette: ['#fbbf24', '#f472b6', '#c084fc'],
    accent: '#fef3c7',
  },
  waves: {
    palette: ['#0ea5e9', '#67e8f9', '#22d3ee'],
    accent: '#cffafe',
  },
  keys: {
    palette: ['#fde68a', '#f472b6', '#60a5fa'],
    accent: '#f3f4f6',
  },
  orbs: {
    palette: ['#e879f9', '#f472b6', '#fcd34d'],
    accent: '#fdf2f8',
  },
  crystal: {
    palette: ['#8be9fd', '#b4f8c8', '#fde68a'],
    accent: '#fdfcdc',
  },
  spectrum: {
    palette: ['#fb7185', '#fbbf24', '#84cc16', '#22d3ee', '#a855f7'],
    accent: '#e0f2fe',
  },
  arcade: {
    palette: ['#f43f5e', '#22d3ee', '#a3e635', '#facc15'],
    accent: '#f8fafc',
  },
  finale: {
    palette: ['#facc15', '#f472b6', '#60a5fa'],
    accent: '#fefce8',
  },
}

const cleanPalette = (input: string[] | undefined, fallback: string[]): string[] => {
  if (!input || !input.length) return fallback
  const sanitized = input
    .map((color) => color?.trim())
    .filter((color): color is string => Boolean(color && color.length > 0))
    .slice(0, 6)
  return sanitized.length ? sanitized : fallback
}

const cleanGlyphs = (glyphs?: string[]): string[] => {
  if (!glyphs) return []
  return glyphs
    .map((glyph) => glyph.trim())
    .filter((glyph) => glyph.length > 0)
    .slice(0, 4)
}

const coerceVisual = (raw: unknown): RawVisualConfig => {
  const parsed = VisualConfigSchema.safeParse(raw ?? {})
  return parsed.success ? parsed.data : {}
}

const mergeVisualInputs = (base: RawVisualConfig, overrides: RawVisualConfig): RawVisualConfig => ({
  ...base,
  ...overrides,
  palette: overrides.palette ?? base.palette,
  glyphs: overrides.glyphs ?? base.glyphs,
})

const INTENSITY_SCALE: Record<VisualIntensity, number> = {
  calm: 0.35,
  lively: 0.65,
  intense: 0.9,
}

export const visualIntensityScalar = (value: VisualIntensity): number => INTENSITY_SCALE[value] ?? INTENSITY_SCALE.calm

export const resolveRiddleVisualConfig = (
  metadata: Record<string, unknown> | null | undefined,
  options?: { fallback?: VisualMetadataConfig }
): RiddleVisualProfile => {
  const candidate =
    metadata && typeof metadata === 'object'
      ? (metadata.visual ?? metadata.visuals ?? metadata.visualization ?? {})
      : {}

  const fallbackRaw = options?.fallback ? coerceVisual(options.fallback) : {}
  const metadataRaw = coerceVisual(candidate)
  const mergedRaw = mergeVisualInputs(fallbackRaw, metadataRaw)
  const theme = mergedRaw.theme ?? options?.fallback?.theme ?? 'orbs'
  const defaults = THEME_DEFAULTS[theme] ?? THEME_DEFAULTS.orbs
  const palette = cleanPalette(mergedRaw.palette, defaults.palette)
  const accent = (mergedRaw.accent ?? defaults.accent).trim() || defaults.accent
  const intensity = mergedRaw.intensity ?? options?.fallback?.intensity ?? 'calm'
  const hint = mergedRaw.hint?.trim()
  const glyphs = cleanGlyphs(mergedRaw.glyphs)
  return {
    theme,
    palette,
    accent,
    intensity,
    glyphs,
    hint: hint && hint.length ? hint : undefined,
  }
}
