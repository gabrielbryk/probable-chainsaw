import { describe, it, expect, beforeEach } from 'vitest'
import type { Prisma, Progress as PrismaProgress, Riddle as PrismaRiddle } from '@prisma/client'
import { GameStateMachine, type ProgressRepo, type RiddleRepo } from '../stateMachine.js'
process.env.WASP_ENV = process.env.WASP_ENV ?? 'development'
process.env.NODE_ENV = process.env.NODE_ENV ?? 'development'
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:./dev.db'
process.env.WASP_SERVER_URL = process.env.WASP_SERVER_URL ?? 'http://localhost:3001'
process.env.WASP_WEB_CLIENT_URL = process.env.WASP_WEB_CLIENT_URL ?? 'http://localhost:3000/'
import { GAME_STATUS } from '../../../shared/constants.js'

const createRepos = () => {
  let progress: PrismaProgress = {
    id: 1,
    status: GAME_STATUS.ACTIVE,
    activeRiddleId: 1,
    attemptsPerRiddle: null,
    startedAt: new Date(),
    updatedAt: new Date(),
  }

  const createRiddle = (id: number, order: number, title: string, answer: string): PrismaRiddle => ({
    id,
    order,
    title,
    body: `${title} body`,
    answer,
    difficulty: null,
    hints: null,
    mediaUrl: null,
    metadata: null,
    successMessage: null,
    missMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const riddles: PrismaRiddle[] = [
    createRiddle(1, 1, 'Spiral', 'spiral'),
    createRiddle(2, 2, 'Ocean', 'larimar'),
  ]

  return {
    progress,
    repos: {
      Progress: {
        findFirst: async () => progress,
        update: async ({ data }: Prisma.ProgressUpdateArgs) => {
          const updates = (data ?? {}) as Partial<PrismaProgress>
          progress = { ...progress, ...updates, updatedAt: new Date() }
          return progress
        },
      } as ProgressRepo,
      Riddle: {
        findUnique: async (args: Prisma.RiddleFindUniqueArgs) =>
          args.where?.id ? riddles.find((r) => r.id === args.where?.id) ?? null : null,
        findFirst: async (args: Prisma.RiddleFindFirstArgs) => {
          const orderFilter = args.where?.order
          if (orderFilter && typeof orderFilter === 'object' && 'gt' in orderFilter) {
            return riddles.filter((r) => r.order > Number(orderFilter.gt)).sort((a, b) => a.order - b.order)[0] ?? null
          }
          if (orderFilter && typeof orderFilter === 'object' && 'lt' in orderFilter) {
            return riddles.filter((r) => r.order < Number(orderFilter.lt)).sort((a, b) => b.order - a.order)[0] ?? null
          }
          const orderBy = Array.isArray(args.orderBy) ? args.orderBy[0] : args.orderBy
          const direction = orderBy && 'order' in orderBy ? orderBy.order : 'asc'
          return [...riddles].sort((a, b) => (direction === 'desc' ? b.order - a.order : a.order - b.order))[0] ?? null
        },
      } as RiddleRepo,
    },
  }
}

describe('GameStateMachine', () => {
  let state: GameStateMachine
  let fixtures: ReturnType<typeof createRepos>

  beforeEach(() => {
    fixtures = createRepos()
    state = new GameStateMachine(fixtures.repos as { Progress: ProgressRepo; Riddle: RiddleRepo })
  })

  it('loads active riddle state', async () => {
    const { riddle } = await state.requireActiveState()
    expect(riddle.title).toBe('Spiral')
  })

  it('tracks attempts as JSON', () => {
    const map = state.incrementAttempts(state.parseAttempts(null), 1)
    expect(map['1']).toBe(1)
    const reset = state.resetAttempts(map, 1)
    expect(reset['1']).toBeUndefined()
  })

  it('updates progress when transitioning', async () => {
    await state.updateProgressState(1, { activeRiddleId: 2, status: GAME_STATUS.ACTIVE })
    const { riddle } = await state.requireActiveState()
    expect(riddle.id).toBe(2)
  })
})
