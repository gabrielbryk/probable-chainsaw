import { useMemo } from 'react'
import { useQuery, getPlayerGameState } from 'wasp/client/operations'
import { playerGameStateSchema, type PlayerGameState } from '../pages/schemas'

export const usePlayerGameState = () => {
  const queryResult = useQuery(getPlayerGameState)

  const gameState = useMemo<PlayerGameState | null>(() => {
    if (!queryResult.data) return null
    const parsed = playerGameStateSchema.safeParse(queryResult.data)
    return parsed.success ? parsed.data : null
  }, [queryResult.data])

  return { ...queryResult, gameState }
}
