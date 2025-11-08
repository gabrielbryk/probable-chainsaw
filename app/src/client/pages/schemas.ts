import { z } from 'zod'

export const playerRiddleSchema = z.object({
  id: z.number(),
  title: z.string(),
  difficulty: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
})

export const submitAnswerResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

export const hintResultSchema = z.object({
  hint: z.string(),
})

const jsonRecordSchema = z.record(z.string(), z.unknown())

export const playerGameStateSchema = z.object({
  status: z.string(),
  startedAt: z.string().nullable(),
  totalRiddles: z.number(),
  stage: z.object({
    current: z.number().nullable(),
  }),
  attempts: z.object({
    activeRiddle: z.number(),
  }),
  riddles: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      order: z.number(),
      status: z.enum(['locked', 'active', 'completed']),
      attempts: z.number(),
    })
  ),
  activeRiddle: z
    .object({
      id: z.number(),
      order: z.number(),
      title: z.string(),
      body: z.string(),
      difficulty: z.string().nullable().optional(),
      metadata: jsonRecordSchema,
      successMessage: z.string().nullable().optional(),
      missMessage: z.string().nullable().optional(),
    })
    .nullable(),
})

export type PlayerGameState = z.infer<typeof playerGameStateSchema>

export const guideTranscriptMessageSchema = z.object({
  id: z.number(),
  role: z.enum(['player', 'guide']),
  message: z.string(),
  createdAt: z.string(),
})

export const guideTranscriptSchema = z.array(guideTranscriptMessageSchema)

export const sendGuideMessageResultSchema = z.object({
  reply: z.string(),
})

export const helpStatusSchema = z.object({
  pending: z.boolean(),
  lastRequestAt: z.string().nullable(),
  lastAcknowledgedAt: z.string().nullable(),
})

export type HelpStatus = z.infer<typeof helpStatusSchema>
