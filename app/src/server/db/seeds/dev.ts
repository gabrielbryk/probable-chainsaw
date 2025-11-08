import type { DbSeedFn } from 'wasp/server'
import type { Riddle as PrismaRiddle } from '@prisma/client'
import { GAME_STATUS, HINT_TIERS } from '../../../shared/constants.js'

const riddles = [
  {
    order: 1,
    title: 'Spiral Signal',
    body: 'In Kurouzu-cho the horizon dances in coils. Name the shape that haunts Junji Ito’s seaside town.',
    answer: 'spiral',
    difficulty: 'Medium',
    hints: [
      { text: 'Think Uzumaki.', tier: HINT_TIERS.GENTLE },
      { text: 'It loops forever without edges.', tier: HINT_TIERS.NUDGE },
    ],
    metadata: {
      location: 'Living room bookshelf',
      visual: {
        theme: 'spiral',
        palette: ['#f59e0b', '#f472b6', '#a855f7'],
        intensity: 'lively',
        hint: 'The coil glows brighter as Joy says the right word.',
        glyphs: ['coil', 'galaxy mist'],
      },
    },
  },
  {
    order: 2,
    title: 'Ocean Voice',
    body: 'Ocean Vuong wrote about a boy on fire. Which gemstone, cool and blue, calms the second clue?',
    answer: 'larimar',
    difficulty: 'Easy',
    hints: [
      { text: 'Think of Caribbean waters.', tier: HINT_TIERS.GENTLE },
      { text: 'It’s the only blue pectolite.', tier: HINT_TIERS.NUDGE },
    ],
    metadata: {
      location: 'Bedroom dresser',
      visual: {
        theme: 'waves',
        palette: ['#0ea5e9', '#38bdf8', '#67e8f9'],
        intensity: 'calm',
        hint: 'Listen for the gemstone that soothes the surf.',
        glyphs: ['wave crest', 'gem shimmer'],
      },
    },
  },
  {
    order: 3,
    title: 'Aurora Key',
    body: 'When the room is quiet, play the chord Joy hums at dawn. The piano itself will reveal the next clue.',
    answer: 'joychord',
    difficulty: 'Medium',
    hints: [
      { text: 'It is a jazz chord made of four notes.', tier: HINT_TIERS.GENTLE },
      { text: 'Think C major with a leading B.', tier: HINT_TIERS.NUDGE },
    ],
    metadata: {
      location: 'Living room piano',
      puzzleType: 'piano',
      pianoPuzzle: {
        type: 'chord',
        id: 'joy-chord-aurora',
        label: 'Joy Chord',
        notes: ['C4', 'E4', 'G4', 'B4'],
        toleranceMs: 600,
        allowOctaveShifts: true,
        allowExtraNotes: false,
      },
      visual: {
        theme: 'keys',
        palette: ['#fde68a', '#f472b6', '#60a5fa'],
        intensity: 'intense',
        hint: 'Each glowing key marks a note from Joy’s dawn chord.',
        glyphs: ['piano', 'aurora trail'],
      },
    },
  },
]

const toJson = (value: unknown): string => JSON.stringify(value ?? null)

export const seedDev: DbSeedFn = async (prisma) => {
  await prisma.effectEvent.deleteMany()
  await prisma.hintLog.deleteMany()
  await prisma.guideTranscript.deleteMany()
  await prisma.progress.deleteMany()
  await prisma.riddle.deleteMany()

  const createdRiddles: PrismaRiddle[] = []
  for (const riddle of riddles) {
    const created = await prisma.riddle.create({
      data: {
        order: riddle.order,
        title: riddle.title,
        body: riddle.body,
        answer: riddle.answer,
        difficulty: riddle.difficulty,
        hints: toJson(riddle.hints),
        metadata: toJson(riddle.metadata),
        successMessage: 'Wonderful! Follow the next clue.',
        missMessage: 'Not quite—look again at the story.',
      },
    })
    createdRiddles.push(created)
  }

  const firstRiddleId = createdRiddles[0]?.id ?? null

  await prisma.progress.create({
    data: {
      status: GAME_STATUS.NOT_STARTED,
      activeRiddleId: firstRiddleId,
      attemptsPerRiddle: toJson({}),
    },
  })

  console.log(`Seeded ${createdRiddles.length} riddles and initialized progress.`)
}
