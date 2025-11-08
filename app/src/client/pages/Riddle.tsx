import type { FC, ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'wasp/client/router'
import { useAction, useQuery, submitAnswer, requestHint, getRiddleHints, getGuideTranscript, sendGuideMessage } from 'wasp/client/operations'
import { GAME_STATUS } from '../../shared/constants'
import { PianoPuzzleDefinitionSchema } from '../../shared/piano.js'
import { usePlayerGameState } from '../hooks/usePlayerGameState'
import {
  submitAnswerResultSchema,
  hintResultSchema,
  guideTranscriptSchema,
  sendGuideMessageResultSchema,
} from './schemas'
import { dispatchLocalCelebration } from '../hooks/useCelebrationEffects'
import PianoPuzzlePanel from '../components/PianoPuzzlePanel'
import RiddleVisualScene from '../components/RiddleVisualScene'
import { resolveRiddleVisualConfig, visualIntensityScalar } from '../../shared/riddleVisuals.js'
import { getVisualPreset } from '../../shared/riddleVisualCatalog.js'

type Feedback = { tone: 'success' | 'miss' | 'error'; text: string } | null

const formatTimestamp = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const RiddlePage: FC = () => {
  const { gameState, isLoading, error, refetch } = usePlayerGameState()
  const hintsQuery = useQuery(getRiddleHints, undefined, {
    enabled: Boolean(gameState?.activeRiddle),
  })
  const guideTranscriptQuery = useQuery(getGuideTranscript, undefined, {
    staleTime: 10_000,
  })

  const submitAnswerAction = useAction(submitAnswer)
  const requestHintAction = useAction(requestHint)
  const sendGuideMessageAction = useAction(sendGuideMessage)

  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isHintLoading, setIsHintLoading] = useState(false)
  const [guideDraft, setGuideDraft] = useState('')
  const [isGuideSending, setIsGuideSending] = useState(false)
  const [guideError, setGuideError] = useState<string | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement | null>(null)

  const activeRiddle = gameState?.activeRiddle
  const attempts = gameState?.attempts.activeRiddle ?? 0
  const location =
    activeRiddle && typeof activeRiddle.metadata?.location === 'string'
      ? (activeRiddle.metadata.location as string)
      : null

  const metadata = (activeRiddle?.metadata ?? {}) as Record<string, unknown>
  const metadataSignature = useMemo(() => JSON.stringify(metadata ?? {}), [metadata])
  const catalogPreset = useMemo(() => getVisualPreset(activeRiddle?.title ?? null), [activeRiddle?.title])
  const visualProfile = useMemo(
    () => resolveRiddleVisualConfig(metadata, { fallback: catalogPreset ?? undefined }),
    [metadataSignature, catalogPreset]
  )
  const rawPianoPuzzle = metadata['pianoPuzzle']
  const pianoPuzzleResult = PianoPuzzleDefinitionSchema.safeParse(rawPianoPuzzle)
  const isPianoPuzzle = metadata['puzzleType'] === 'piano' && pianoPuzzleResult.success

  const handleAnswerChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAnswer(event.target.value)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeRiddle || !answer.trim()) return
    setIsSubmitting(true)
    setFeedback(null)
    try {
      const result = await submitAnswerAction({ riddleId: activeRiddle.id, answer })
      const parsed = submitAnswerResultSchema.safeParse(result)
      if (!parsed.success) {
        throw new Error('Unexpected response from submitAnswer')
      }
      setFeedback({
        tone: parsed.data.success ? 'success' : 'miss',
        text: parsed.data.message,
      })
      if (parsed.data.success) {
        setAnswer('')
        dispatchLocalCelebration('A new clue ignites—listen for the Guide’s whisper.')
      }
      await refetch()
      await hintsQuery.refetch()
    } catch (err) {
      console.error('submitAnswer failed', err)
      setFeedback({ tone: 'error', text: 'The Guide could not check your answer. Try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestHint = async () => {
    if (isHintLoading) return
    setIsHintLoading(true)
    setFeedback(null)
    try {
      const result = await requestHintAction(undefined)
      const parsed = hintResultSchema.safeParse(result)
      if (!parsed.success) {
        throw new Error('Unexpected response from requestHint')
      }
      await hintsQuery.refetch()
    } catch (err) {
      console.error('requestHint failed', err)
      setFeedback({ tone: 'error', text: 'Hint channel is quiet. Try again in a moment.' })
    } finally {
      setIsHintLoading(false)
    }
  }

  const handleGuideDraftChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setGuideDraft(event.target.value)
  }

  const handleGuideSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!guideDraft.trim() || isGuideSending) return
    setGuideError(null)
    setIsGuideSending(true)
    try {
      const response = await sendGuideMessageAction({ message: guideDraft })
      const parsed = sendGuideMessageResultSchema.safeParse(response)
      if (!parsed.success) {
        throw new Error('Unexpected response from sendGuideMessage')
      }
      setGuideDraft('')
      await guideTranscriptQuery.refetch()
    } catch (err) {
      console.error('sendGuideMessage failed', err)
      setGuideError('The Guide could not respond right now. Try again soon or tap Need Help.')
    } finally {
      setIsGuideSending(false)
    }
  }

  if (isLoading) {
    return <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">Syncing game state…</div>
  }

  if (error || !gameState) {
    return (
      <div className="rounded-3xl border border-rose-500/40 bg-rose-950/40 p-6 text-sm text-rose-100">
        The Guide could not load the current riddle. Refresh or head back to the landing page.
      </div>
    )
  }

  if (!activeRiddle) {
    if (gameState.status === GAME_STATUS.CELEBRATION || gameState.status === GAME_STATUS.FINALE) {
      return (
        <div className="rounded-3xl border border-emerald-400/30 bg-emerald-900/20 p-8 text-center text-slate-100">
          <p className="text-xl font-semibold">All riddles solved!</p>
          <p className="mt-2 text-sm text-slate-200">Head to the finale screen to relive the celebration.</p>
          <Link
            to="/finale"
            className="mt-4 inline-flex rounded-full bg-emerald-300/90 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:scale-105"
          >
            View Finale
          </Link>
        </div>
      )
    }

    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-200">
        Tap “Begin the Hunt” on the landing page to wake the first riddle.
      </div>
    )
  }

  const hintEntries = (hintsQuery.data ?? []) as { hint: string; timestamp: string }[]
  const parsedGuideTranscript = guideTranscriptSchema.safeParse(guideTranscriptQuery.data)
  const guideMessages = parsedGuideTranscript.success ? parsedGuideTranscript.data : []

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [guideMessages.length])

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(260px,1fr)]">
      <section className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-slate-400">
          {typeof activeRiddle.order === 'number' && gameState.totalRiddles ? (
            <span>
              Riddle {activeRiddle.order} / {gameState.totalRiddles}
            </span>
          ) : null}
          {activeRiddle.difficulty && <span>Difficulty · {activeRiddle.difficulty}</span>}
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{activeRiddle.title}</h1>
        <p className="mt-4 text-lg text-slate-200">{activeRiddle.body}</p>

        {location && (
          <div className="mt-6 rounded-2xl border border-amber-200/30 bg-amber-50/5 p-4 text-sm text-amber-100">
            <p className="text-xs uppercase tracking-widest text-amber-200">rumored locale</p>
            <p className="text-base capitalize text-amber-50">{location}</p>
          </div>
        )}

        <div className="mt-6">
          <RiddleVisualScene
            visual={visualProfile}
            title={activeRiddle.title}
            location={location}
            energy={
              (() => {
                const base = visualIntensityScalar(visualProfile.intensity)
                const attemptBoost = Math.min(0.25, Math.max(0, attempts) * 0.05)
                const hintBoost = Math.min(0.2, hintEntries.length * 0.07)
                const successBoost = feedback?.tone === 'success' ? 0.2 : 0
                return Math.min(1, base + attemptBoost + hintBoost + successBoost)
              })()
            }
          />
        </div>

        {isPianoPuzzle && pianoPuzzleResult.success ? (
          <PianoPuzzlePanel riddleId={activeRiddle.id} definition={pianoPuzzleResult.data} />
        ) : (
          <>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <label htmlFor="answer" className="text-sm uppercase tracking-widest text-slate-400">
                Your Answer
              </label>
              <input
                id="answer"
                name="answer"
                type="text"
                autoComplete="off"
                value={answer}
                onChange={handleAnswerChange}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-200"
                placeholder="Type what the clue is pointing to"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isSubmitting || !answer.trim()}
                  className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-amber-300 px-6 py-3 text-sm font-semibold text-black shadow-md shadow-rose-900/40 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSubmitting ? 'Checking...' : 'Submit Answer'}
                </button>
                <p className="text-sm text-slate-300">
                  Attempts on this riddle: <span className="font-semibold text-white">{attempts}</span>
                </p>
              </div>
            </form>

            {feedback && (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  feedback.tone === 'success'
                    ? 'border-emerald-400/40 bg-emerald-900/20 text-emerald-100'
                    : feedback.tone === 'miss'
                    ? 'border-amber-400/40 bg-amber-900/20 text-amber-100'
                    : 'border-rose-400/40 bg-rose-900/20 text-rose-100'
                }`}
              >
                {feedback.text}
              </div>
            )}
          </>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <button
            type="button"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left text-sm font-semibold text-white"
          >
            <span>Hint Drawer</span>
            <span className="text-xs text-slate-400">{isDrawerOpen ? 'Hide' : 'Show'}</span>
          </button>
          {isDrawerOpen && (
            <div className="mt-4 space-y-4">
              {hintsQuery.isLoading && <p className="text-xs text-slate-400">Gathering earlier clues...</p>}
              {hintsQuery.error && (
                <p className="text-xs text-rose-200">Hint log unavailable. Try requesting again shortly.</p>
              )}
              {!hintsQuery.isLoading && !hintEntries.length && (
                <p className="text-xs text-slate-400">No hints revealed yet. Request one if you’d like a nudge.</p>
              )}
              {hintEntries.map((hint, index) => (
                <div
                  key={`${hint.timestamp}-${index}`}
                  className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-slate-200"
                >
                  <p>{hint.hint}</p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">{formatTimestamp(hint.timestamp)}</p>
                </div>
              ))}
              <button
                type="button"
                onClick={handleRequestHint}
                disabled={isHintLoading}
                className="w-full rounded-full border border-dashed border-rose-200/60 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/10 disabled:opacity-60"
              >
                {isHintLoading ? 'Calling the Guide…' : 'Request Another Hint'}
              </button>
              <p className="text-[0.65rem] uppercase tracking-widest text-slate-500">
                Hints escalate from gentle → nudge → guide.
              </p>
            </div>
          )}
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Guide Chat</h2>
            <button
              type="button"
              onClick={() => guideTranscriptQuery.refetch()}
              className="text-xs font-semibold uppercase tracking-widest text-rose-200 transition hover:text-white"
            >
              Refresh
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Talk directly with the magical narrator whenever you want more color or encouragement.
          </p>
          <div className="mt-4 h-64 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-3 text-sm">
            {guideTranscriptQuery.isLoading && <p className="text-xs text-slate-400">Connecting to the Guide…</p>}
            {guideTranscriptQuery.error && (
              <p className="text-xs text-rose-200">Guide log unavailable. Try again in a few seconds.</p>
            )}
            {!guideTranscriptQuery.isLoading && !guideMessages.length && (
              <p className="text-xs text-slate-400">No messages yet. Say hi and the Guide will respond.</p>
            )}
            {guideMessages.map((entry) => (
              <div
                key={entry.id}
                className={`mb-3 flex ${
                  entry.role === 'player' ? 'justify-end text-right' : 'justify-start text-left'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    entry.role === 'player'
                      ? 'bg-rose-400/80 text-black'
                      : 'bg-white/10 text-slate-100 border border-white/10'
                  }`}
                >
                  <p>{entry.message}</p>
                  <p className="mt-1 text-[0.6rem] uppercase tracking-widest text-white/70">
                    {formatTimestamp(entry.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
          <form className="mt-4 space-y-3" onSubmit={handleGuideSubmit}>
            <label htmlFor="guide-message" className="text-xs uppercase tracking-widest text-slate-400">
              Message the Guide
            </label>
            <textarea
              id="guide-message"
              value={guideDraft}
              onChange={handleGuideDraftChange}
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-200"
              placeholder="Ask for lore, encouragement, or a story..."
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!guideDraft.trim() || isGuideSending}
                className="rounded-full bg-gradient-to-r from-rose-400 to-amber-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-black shadow-rose-900/30 transition hover:scale-[1.01] disabled:opacity-60"
              >
                {isGuideSending ? 'Sending…' : 'Send'}
              </button>
              {guideError && <p className="text-xs text-rose-200">{guideError}</p>}
            </div>
          </form>
          <p className="mt-3 text-[0.65rem] uppercase tracking-widest text-slate-500">
            Voice: warm intelligence, playful mystery, personal references.
          </p>
        </article>
      </aside>
    </div>
  )
}

export default RiddlePage
