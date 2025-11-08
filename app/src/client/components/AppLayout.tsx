import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'wasp/client/router'
import { Outlet } from 'react-router-dom'
import { useAction, requestAssistance } from 'wasp/client/operations'
import { GAME_STATUS } from '../../shared/constants'
import { usePlayerGameState } from '../hooks/usePlayerGameState'
import { useElapsedTimer } from '../hooks/useElapsedTimer'
import { useCelebrationEffects } from '../hooks/useCelebrationEffects'
import { useHelpStatus } from '../hooks/useHelpStatus'
import '../../Main.css'

const statusLabelMap: Record<string, string> = {
  [GAME_STATUS.NOT_STARTED]: 'Ready to begin',
  [GAME_STATUS.ACTIVE]: 'In progress',
  [GAME_STATUS.CELEBRATION]: 'Celebration time',
  [GAME_STATUS.FINALE]: 'Finale',
}

const stageLabel = (opts: {
  status?: string
  currentStage?: number | null
  total?: number
}): string => {
  if (typeof opts.currentStage === 'number' && opts.total) {
    return `Riddle ${opts.currentStage} of ${opts.total}`
  }
  if (opts.status === GAME_STATUS.CELEBRATION) return 'Celebration'
  if (opts.status === GAME_STATUS.FINALE) return 'Finale'
  return 'Awaiting start'
}

const formatTimestamp = (iso?: string | null) => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const AppLayout: FC = () => {
  const sendHelpRequest = useAction(requestAssistance)
  const [needHelpStatus, setNeedHelpStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [isProgressOpen, setIsProgressOpen] = useState(false)
  const { gameState, isLoading, error } = usePlayerGameState()
  const elapsed = useElapsedTimer(gameState?.startedAt)
  const { celebration, dismissCelebration } = useCelebrationEffects()
  const { status: helpStatus } = useHelpStatus()

  const handleNeedHelp = async () => {
    setNeedHelpStatus('sending')
    try {
      await sendHelpRequest({})
      setNeedHelpStatus('sent')
      setTimeout(() => setNeedHelpStatus('idle'), 4000)
    } catch (err) {
      console.error('Need Help request failed', err)
      setNeedHelpStatus('error')
    }
  }

  const buttonLabel =
    needHelpStatus === 'sending'
      ? 'Sending...'
      : needHelpStatus === 'sent'
      ? 'Signal Sent!'
      : needHelpStatus === 'error'
      ? 'Try Again'
      : 'Need Help'

  const headerStageLabel = stageLabel({
    status: gameState?.status,
    currentStage: gameState?.stage.current,
    total: gameState?.totalRiddles,
  })

  const statusLabel = statusLabelMap[gameState?.status ?? GAME_STATUS.NOT_STARTED] ?? 'Ready'
  const helpStatusText =
    needHelpStatus === 'error'
      ? 'Signal failed. Check with Gabe.'
      : needHelpStatus === 'sent'
      ? 'Beacon delivered.'
      : helpStatus?.pending
      ? `Awaiting Gabe${helpStatus.lastRequestAt ? ` (sent ${formatTimestamp(helpStatus.lastRequestAt)})` : ''}`
      : helpStatus?.lastAcknowledgedAt
      ? `Gabe acknowledged at ${formatTimestamp(helpStatus.lastAcknowledgedAt)}`
      : 'Need a lifeline?'

  const progressList = useMemo(() => {
    if (!gameState?.riddles) return []
    return [...gameState.riddles].sort((a, b) => a.order - b.order)
  }, [gameState?.riddles])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#120626] via-[#0b0316] to-[#03010a] text-slate-100">
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="text-lg font-semibold tracking-wide uppercase text-rose-100">
              Joy&apos;s Guide
            </Link>
            <div className="flex flex-1 flex-wrap items-center justify-end gap-6 text-sm">
              <div>
                <p className="text-[0.65rem] uppercase tracking-widest text-slate-400">Stage</p>
                <p className="font-semibold text-white">{headerStageLabel}</p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-widest text-slate-400">Elapsed</p>
                <p className="font-semibold text-white">{gameState?.startedAt ? elapsed : '--:--'}</p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-widest text-slate-400">Status</p>
                <p className="font-semibold text-white">{isLoading ? 'Syncing…' : statusLabel}</p>
              </div>
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-white/10"
                  onClick={() => setIsProgressOpen(true)}
                  disabled={!progressList.length}
                >
                  Progress Map
                </button>
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-r from-rose-400 to-amber-300 px-5 py-2 text-sm font-semibold text-black transition hover:scale-105 disabled:opacity-65"
                  onClick={handleNeedHelp}
                  disabled={needHelpStatus === 'sending'}
                >
                  {buttonLabel}
                </button>
              </div>
            </div>
            <div className="text-right text-xs text-slate-300">
              {needHelpStatus === 'error' && <span className="text-rose-200">Signal failed. Check with Gabe.</span>}
              {needHelpStatus === 'sent' && <span className="text-emerald-200">Beacon delivered.</span>}
              {needHelpStatus === 'idle' && <span>{helpStatusText}</span>}
            </div>
          </div>
          {error && (
            <div className="bg-rose-900/30 text-center text-xs text-rose-200">
              Unable to sync game status. Refresh or check the backend.
            </div>
          )}
        </header>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-white/5 bg-black/30 text-center text-xs text-slate-400">
          <div className="mx-auto max-w-5xl px-4 py-6">
            Crafted with love for Joy&apos;s hunt · Game Master Console
          </div>
        </footer>
      </div>
      {isProgressOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#120626] p-6 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold uppercase tracking-[0.4em] text-rose-100">Progress Map</h2>
              <button
                type="button"
                onClick={() => setIsProgressOpen(false)}
                className="text-sm font-semibold uppercase tracking-widest text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-300">Every riddle Joy has touched so far.</p>
            <div className="mt-3 rounded-2xl border border-white/5 bg-black/30 p-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-widest text-slate-400">Need Help status</p>
              <p className="mt-1">
                {helpStatus?.pending
                  ? `Awaiting Gabe since ${formatTimestamp(helpStatus.lastRequestAt) ?? 'just now'}`
                  : helpStatus?.lastAcknowledgedAt
                  ? `Acknowledged at ${formatTimestamp(helpStatus.lastAcknowledgedAt)}`
                  : 'No help requests sent yet.'}
              </p>
            </div>
            <ol className="mt-4 space-y-3">
              {progressList.map((riddle) => (
                <li
                  key={riddle.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Stage {riddle.order}</p>
                    <p className="text-base font-semibold text-white">{riddle.title}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                        riddle.status === 'completed'
                          ? 'bg-emerald-300/20 text-emerald-200'
                          : riddle.status === 'active'
                          ? 'bg-rose-300/20 text-rose-100'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {riddle.status}
                    </span>
                    <p className="mt-1 text-[0.65rem] uppercase tracking-widest text-slate-400">
                      Attempts {riddle.attempts}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
      {celebration && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-transparent via-black/30 to-black/70 px-4 text-center">
          <div className="pointer-events-auto w-full max-w-2xl rounded-3xl border border-rose-200/40 bg-black/60 px-6 py-8 shadow-rose-900/40">
            <p className="text-xs uppercase tracking-[0.5em] text-rose-200">Moment of wonder</p>
            <p className="mt-3 text-2xl font-semibold text-white">{celebration.message}</p>
            <button
              type="button"
              className="mt-6 rounded-full border border-white/40 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white"
              onClick={dismissCelebration}
            >
              Keep going
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
