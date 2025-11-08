import { z } from 'zod'
import type { Prisma, Progress as PrismaProgress, Riddle as PrismaRiddle } from '@prisma/client'
import { GAME_STATUS } from '../../shared/constants.js'
import { ensureProgress, getActiveRiddleId } from './progress.js'
import { parseJsonField, stringifyJsonField, type JsonObject } from '../utils/json.js'

const attemptsSchema = z.record(z.string(), z.number().int().min(0)).default({})

export type AttemptsMap = z.infer<typeof attemptsSchema>

export type ProgressRepo = {
  findFirst: (args?: Prisma.ProgressFindFirstArgs) => Promise<PrismaProgress | null>
  update: (args: Prisma.ProgressUpdateArgs) => Promise<PrismaProgress>
}

export type RiddleRepo = {
  findUnique: (args: Prisma.RiddleFindUniqueArgs) => Promise<PrismaRiddle | null>
  findFirst: (args: Prisma.RiddleFindFirstArgs) => Promise<PrismaRiddle | null>
}

export class GameStateMachine {
  constructor(public repos: { Progress: ProgressRepo; Riddle: RiddleRepo }) {}

  async loadProgress() {
    return ensureProgress({ entities: { Progress: this.repos.Progress } })
  }

  async requireActiveState() {
    const progress = await this.loadProgress()
    const activeRiddleId = getActiveRiddleId(progress)
    if (!activeRiddleId) {
      throw new Error('No active riddle is set.')
    }
    const riddle = await this.repos.Riddle.findUnique({ where: { id: activeRiddleId } })
    if (!riddle) {
      throw new Error('Active riddle not found.')
    }
    return { progress, riddle }
  }

  parseAttempts(raw: string | null | undefined): AttemptsMap {
    const parsed = parseJsonField(raw)
    const result = attemptsSchema.safeParse(parsed ?? {})
    return result.success ? result.data : {}
  }

  stringifyAttempts(map: AttemptsMap): string {
    return stringifyJsonField(map as JsonObject)
  }

  incrementAttempts(map: AttemptsMap, riddleId: number): AttemptsMap {
    const key = String(riddleId)
    return { ...map, [key]: (map[key] ?? 0) + 1 }
  }

  resetAttempts(map: AttemptsMap, riddleId: number): AttemptsMap {
    const key = String(riddleId)
    if (!(key in map)) return map
    const clone = { ...map }
    delete clone[key]
    return clone
  }

  async findNextRiddle(currentOrder: number) {
    return this.repos.Riddle.findFirst({
      where: { order: { gt: currentOrder } },
      orderBy: { order: 'asc' },
    })
  }

  async findPreviousRiddle(currentOrder: number) {
    return this.repos.Riddle.findFirst({
      where: { order: { lt: currentOrder } },
      orderBy: { order: 'desc' },
    })
  }

  async updateProgressState(
    progressId: number,
    data: {
      activeRiddleId: number | null
      attemptsPerRiddle?: string
      status?: string
      startedAt?: Date
    }
  ) {
    return this.repos.Progress.update({
      where: { id: progressId },
      data,
    })
  }

  async markCelebration(progressId: number) {
    await this.updateProgressState(progressId, {
      activeRiddleId: null,
      status: GAME_STATUS.CELEBRATION,
    })
  }
}
