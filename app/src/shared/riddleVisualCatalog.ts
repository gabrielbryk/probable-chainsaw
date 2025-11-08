import type { VisualMetadataConfig } from './riddleVisuals.js'

const slugify = (value: string | null | undefined): string | null => {
  if (!value) return null
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type CatalogEntry = VisualMetadataConfig & { theme: NonNullable<VisualMetadataConfig['theme']> }

const CATALOG: Record<string, CatalogEntry> = {
  'junji-ito-spiral': {
    theme: 'spiral',
    intensity: 'lively',
    palette: ['#f97316', '#fb7185', '#a855f7'],
    glyphs: ['kurouzu-cho', 'fibonacci', 'golden ratio'],
    hint: 'The coil sharpens whenever obsession is near.',
  },
  'ocean-vuong-poetry': {
    theme: 'waves',
    intensity: 'calm',
    palette: ['#22d3ee', '#38bdf8', '#0ea5e9'],
    glyphs: ['butterflies', 'little dog', 'epistolary'],
    hint: 'These currents quote letters that breathe in two tongues.',
  },
  'crystal-collection': {
    theme: 'crystal',
    intensity: 'intense',
    palette: ['#8be9fd', '#b4f8c8', '#fde68a'],
    glyphs: ['larimar', 'opal', 'smoky quartz'],
    hint: 'Shards glow brighter near the stone that remembers Bahoruco.',
  },
  'flute-music': {
    theme: 'keys',
    intensity: 'lively',
    palette: ['#fde68a', '#fef9c3', '#fbcfe8'],
    glyphs: ['boehm', 'trill key', 'syrinx'],
    hint: 'Each illuminated key hums the interval Joy can play in her sleep.',
  },
  'pop-culture': {
    theme: 'orbs',
    intensity: 'lively',
    palette: ['#f87171', '#fbbf24', '#34d399', '#60a5fa'],
    glyphs: ['verse-jump', 'bagel', 'portal'],
    hint: 'Verse-jumps paint new colors when Joy thinks of parallel selves.',
  },
  'wavelength-game': {
    theme: 'spectrum',
    intensity: 'lively',
    palette: ['#f43f5e', '#f97316', '#facc15', '#22d3ee', '#a855f7'],
    glyphs: ['psychic dial', 'phi mark', 'team signal'],
    hint: 'The dial aligns whenever alignment with Gabe feels effortless.',
  },
  'gaming-area': {
    theme: 'arcade',
    intensity: 'intense',
    palette: ['#f43f5e', '#22d3ee', '#a3e635', '#facc15'],
    glyphs: ['konami', 'hyrule', 'frame data'],
    hint: 'Retro pixels flare when the Konami cadence is whispered.',
  },
  finale: {
    theme: 'finale',
    intensity: 'intense',
    palette: ['#facc15', '#f472b6', '#60a5fa'],
    glyphs: ['celebration', 'final reveal', 'love letter'],
    hint: 'When every riddle rests, these sparks gather around the final letter.',
  },
}

export const getVisualPreset = (key: string | null | undefined): CatalogEntry | null => {
  const slug = slugify(key)
  if (!slug) return null
  const entry = CATALOG[slug]
  return entry ? { ...entry } : null
}

export const listVisualPresets = (): { key: string; config: CatalogEntry }[] =>
  Object.entries(CATALOG).map(([key, config]) => ({ key, config: { ...config } }))
