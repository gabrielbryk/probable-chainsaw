import { HttpError } from 'wasp/server'
import type { Prisma, Progress } from '@prisma/client'

type ProgressDelegate = {
  findFirst: (args?: Prisma.ProgressFindFirstArgs) => Promise<Progress | null>
}

export type ProgressContext = {
  entities: {
    Progress: ProgressDelegate
  }
}

export type GameProgressRecord = Progress

export const ensureProgress = async (
  context: ProgressContext,
  options: Prisma.ProgressFindFirstArgs = {}
): Promise<GameProgressRecord> => {
  const progress = await context.entities.Progress.findFirst(options)
  if (!progress) {
    throw new HttpError(500, 'Game progress has not been initialized. Run the seed script.')
  }
  return progress
}

export const getActiveRiddleId = (progress: GameProgressRecord): number | null => {
  return typeof progress.activeRiddleId === 'number' ? progress.activeRiddleId : null
}
