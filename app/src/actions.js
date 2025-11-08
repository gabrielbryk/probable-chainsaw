import { HttpError } from 'wasp/server'

export const submitAnswer = async ({ riddleId, answer }, context) => {
  if (!context.user) { throw new HttpError(401) };

  const progress = await context.entities.Progress.findUnique({
    where: { userId: context.user.id }
  });
  if (!progress || progress.currentRiddleId !== riddleId) { throw new HttpError(403) };

  const riddle = await context.entities.Riddle.findUnique({
    where: { id: riddleId }
  });
  if (!riddle) { throw new HttpError(404) };

  const normalizedAnswer = answer.trim().toLowerCase();
  const correctAnswer = riddle.answer.trim().toLowerCase();

  if (normalizedAnswer === correctAnswer) {
    await context.entities.Progress.update({
      where: { id: progress.id },
      data: { currentRiddleId: progress.currentRiddleId + 1, attempts: 0 }
    });

    await context.entities.EffectEvent.create({
      data: {
        type: 'riddle_solved',
        timestamp: new Date(),
        details: `Riddle ${riddleId} solved by user ${context.user.id}`
      }
    });

    return { success: true, message: 'Correct answer!' };
  } else {
    await context.entities.Progress.update({
      where: { id: progress.id },
      data: { attempts: progress.attempts + 1 }
    });

    return { success: false, message: 'Incorrect answer, try again!' };
  }
}

export const requestHint = async (args, context) => {
  if (!context.user) { throw new HttpError(401) };

  const progress = await context.entities.Progress.findUnique({
    where: { userId: context.user.id }
  });

  if (!progress) { throw new HttpError(404, 'Progress not found') };

  const riddle = await context.entities.Riddle.findUnique({
    where: { id: progress.currentRiddleId }
  });

  if (!riddle) { throw new HttpError(404, 'Riddle not found') };

  await context.entities.HintLog.create({
    data: {
      riddleId: riddle.id,
      hint: riddle.hint,
      timestamp: new Date(),
      userId: context.user.id
    }
  });

  return { hint: riddle.hint };
}

export const advanceRiddle = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }

  const progress = await context.entities.Progress.findUnique({
    where: { userId: context.user.id }
  });

  if (!progress) { throw new HttpError(404, 'Progress not found') }

  const currentRiddle = await context.entities.Riddle.findUnique({
    where: { id: progress.currentRiddleId }
  });

  if (!currentRiddle) { throw new HttpError(404, 'Current riddle not found') }

  const isSolved = args.answer.trim().toLowerCase() === currentRiddle.answer.trim().toLowerCase();

  if (!isSolved) { throw new HttpError(400, 'Riddle not solved yet') }

  const nextRiddle = await context.entities.Riddle.findUnique({
    where: { id: progress.currentRiddleId + 1 }
  });

  if (!nextRiddle) { throw new HttpError(404, 'Next riddle not found') }

  await context.entities.Progress.update({
    where: { id: progress.id },
    data: { currentRiddleId: nextRiddle.id, attempts: 0 }
  });

  await context.entities.EffectEvent.create({
    data: {
      type: 'riddle_solved',
      timestamp: new Date(),
      details: `Advanced to riddle ${nextRiddle.id}`
    }
  });
}
