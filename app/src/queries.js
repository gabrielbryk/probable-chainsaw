import { HttpError } from 'wasp/server'

export const getCurrentRiddle = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }

  const progress = await context.entities.Progress.findUnique({
    where: { userId: context.user.id },
    select: { currentRiddleId: true }
  });

  if (!progress) throw new HttpError(404, 'Progress not found for user.');

  const riddle = await context.entities.Riddle.findUnique({
    where: { id: progress.currentRiddleId },
    select: {
      id: true,
      title: true,
      difficulty: true,
      narrative: true,
      hint: true
    }
  });

  if (!riddle) throw new HttpError(404, 'Riddle not found.');

  return riddle;
}

export const getRiddleHints = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }

  const progress = await context.entities.Progress.findUnique({
    where: { userId: context.user.id },
    select: { currentRiddleId: true }
  });

  if (!progress) throw new HttpError(404, 'Progress not found for user.');

  const hints = await context.entities.HintLog.findMany({
    where: { riddleId: progress.currentRiddleId, userId: context.user.id },
    select: { hint: true, timestamp: true }
  });

  return hints;
}

export const getEffectEvents = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }

  return context.entities.EffectEvent.findMany({
    orderBy: {
      timestamp: 'desc'
    },
    take: 10 // Fetches the 10 most recent events
  });
}
