import type { FC } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAction, startHunt } from 'wasp/client/operations'
import { GAME_STATUS } from '../../shared/constants'
import { usePlayerGameState } from '../hooks/usePlayerGameState'

const guideCards = [
  {
    title: 'What Awaits',
    body: 'Seven riddles drawn from the things you love—Junji Ito spirals, Ocean Vuong verses, gleaming crystals, and the music that feels like home.',
  },
  {
    title: 'How It Flows',
    body: 'Type your answer, feel the Guide respond, and open the hint drawer when you want a gentle nudge. Confetti and lights celebrate every breakthrough.',
  },
  {
    title: 'Need Backup?',
    body: 'The Need Help beacon in the header pings Gabe instantly. He can pause, rewind, or celebrate beside you whenever you want.',
  },
]

const ctaLabelForStatus = (status?: string | null): string => {
  switch (status) {
    case GAME_STATUS.ACTIVE:
      return 'Resume the journey'
    case GAME_STATUS.CELEBRATION:
      return 'Step into the celebration'
    case GAME_STATUS.FINALE:
      return 'Return to the finale'
    default:
      return 'Begin the Hunt'
  }
}

const targetRouteForStatus = (status?: string | null): '/riddle' | '/finale' => {
  if (status === GAME_STATUS.CELEBRATION || status === GAME_STATUS.FINALE) {
    return '/finale'
  }
  return '/riddle'
}

const LandingPage: FC = () => {
  const navigate = useNavigate()
  const startHuntAction = useAction(startHunt)
  const { gameState, isLoading } = usePlayerGameState()
  const [ctaStatus, setCtaStatus] = useState<'idle' | 'starting' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const primaryLabel = ctaLabelForStatus(gameState?.status)
  const targetRoute = targetRouteForStatus(gameState?.status)

  const handleBegin = async () => {
    setErrorMessage(null)
    if (ctaStatus === 'starting') return

    try {
      if (!gameState || gameState.status === GAME_STATUS.NOT_STARTED) {
        setCtaStatus('starting')
        await startHuntAction({})
      }
      navigate(targetRoute)
    } catch (error) {
      console.error('Failed to start hunt', error)
      setErrorMessage('The Guide could not wake up. Check the server and try again.')
      setCtaStatus('error')
      return
    } finally {
      setCtaStatus('idle')
    }
  }

  const subtitle =
    'Your apartment becomes a cabinet of curiosities tonight. Every clue is a love letter hidden among the things you treasure.'

  return (
    <div className="space-y-10 text-slate-100">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="animate-pulse absolute -right-10 top-0 h-64 w-64 rounded-full bg-rose-500/40 blur-3xl" />
          <div className="animate-pulse absolute -left-10 bottom-0 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
        </div>
        <div className="relative z-10 space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-rose-200">Happy birthday, Joy</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            The Guide is awake and ready to lead you through seven radiant riddles.
          </h1>
          <p className="text-lg text-slate-200">{subtitle}</p>
          <ul className="space-y-2 text-sm text-slate-200">
            <li>• Each solve triggers lights, music, and a whispered direction to your next discovery.</li>
            <li>• The AI Guide stays warm, encouraging, and tuned to your voice.</li>
            <li>• Take your time—this journey is built for wonder, not speed.</li>
          </ul>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBegin}
              className="w-full rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-amber-200 px-6 py-3 text-center text-base font-semibold text-black shadow-lg shadow-rose-900/50 transition hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 sm:w-auto"
              disabled={ctaStatus === 'starting'}
            >
              {ctaStatus === 'starting' ? 'Preparing the first clue…' : primaryLabel}
            </button>
            <p className="text-sm text-slate-300">
              {isLoading
                ? 'Syncing progress...'
                : gameState?.status === GAME_STATUS.ACTIVE
                ? 'You are mid-hunt—jump back in whenever you’re ready.'
                : 'Press begin when you feel ready. The Guide will keep pace with you.'}
            </p>
          </div>
          {errorMessage && <p className="text-sm text-rose-200">{errorMessage}</p>}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {guideCards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-inner shadow-black/20"
          >
            <h2 className="mb-2 text-base font-semibold text-white">{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-dashed border-white/20 p-6 text-sm text-slate-300">
        <p>
          Want an ally at any point? Tap the <strong>Need Help</strong> button in the header and Gabe will step in with
          a grin, coffee, or a clue. Otherwise, whisper “Let’s go” and follow the Guide’s lead.
        </p>
      </section>
    </div>
  )
}

export default LandingPage
