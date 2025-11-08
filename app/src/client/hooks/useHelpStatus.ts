import { useMemo } from 'react'
import { useQuery, getHelpStatus } from 'wasp/client/operations'
import { helpStatusSchema, type HelpStatus } from '../pages/schemas'

export const useHelpStatus = () => {
  const query = useQuery(getHelpStatus, undefined, {
    refetchInterval: 4000,
  })

  const status: HelpStatus | null = useMemo(() => {
    if (!query.data) return null
    const parsed = helpStatusSchema.safeParse(query.data)
    return parsed.success ? parsed.data : null
  }, [query.data])

  return { ...query, status }
}
