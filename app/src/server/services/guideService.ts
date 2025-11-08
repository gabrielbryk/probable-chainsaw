import { buildHintRequest } from '../integrations/guide/index.js'
import { integrations } from '../integrations/index.js'

type GuideHintRequest = {
  conversationId: string
  riddle: { id: number; title: string; body: string }
  attempts: number
  context?: Record<string, unknown>
}

export const requestGuideHint = async ({ conversationId, riddle, attempts, context = {} }: GuideHintRequest) => {
  const guide = integrations.guide
  const request = buildHintRequest({
    conversationId,
    riddle,
    attempts,
    context,
  })

  const response = await guide.send(request, { safetyFallback: 'Let me offer a smaller nudge.' })
  return response.text
}
