import { describe, expect, it, vi } from 'vitest'
import { generateEffectPlanForRiddle } from '../effectPlanner.js'
import { openAIResponsesClient } from '../../integrations/openai/index.js'

const buildRiddle = () => ({
  id: 1,
  order: 1,
  title: 'Test Riddle',
  body: 'Find the hidden piano under the stairs.',
  answer: 'piano',
  difficulty: 'Medium',
  hints: null,
  mediaUrl: null,
  metadata: JSON.stringify({ location: 'living room' }),
  successMessage: null,
  missMessage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('generateEffectPlanForRiddle', () => {
  it('returns the plan provided by the LLM client', async () => {
    const spy = vi.spyOn(openAIResponsesClient, 'sendStructured').mockResolvedValue({
      parsed: {
        lightingScene: 'Aurora shimmer',
        audioCue: 'Harp glissando',
        intensity: 'soft',
        guidance: 'Dim the lights and trigger soft sparkles.',
      },
      raw: {},
    })

    const plan = await generateEffectPlanForRiddle(buildRiddle())
    expect(plan.lightingScene).toBe('Aurora shimmer')
    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })
})
