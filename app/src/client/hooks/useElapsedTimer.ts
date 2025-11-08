import { useEffect, useMemo, useState } from 'react'

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (value: number) => value.toString().padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

export const useElapsedTimer = (isoTimestamp: string | null | undefined): string => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!isoTimestamp) {
      return
    }

    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [isoTimestamp])

  return useMemo(() => {
    if (!isoTimestamp) return '--:--'
    const start = Date.parse(isoTimestamp)
    if (Number.isNaN(start)) return '--:--'
    return formatDuration(now - start)
  }, [isoTimestamp, now])
}
