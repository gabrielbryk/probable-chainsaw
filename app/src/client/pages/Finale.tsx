import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { useAction, useQuery, getGuideTranscript, completeHunt } from 'wasp/client/operations'
import { dispatchLocalCelebration } from '../hooks/useCelebrationEffects'
import { usePlayerGameState } from '../hooks/usePlayerGameState'
import { guideTranscriptSchema } from './schemas'

const formatElapsed = (startedAt: string | null) => {
  if (!startedAt) return '—'
  const start = Date.parse(startedAt)
  if (Number.isNaN(start)) return '—'
  const totalSeconds = Math.floor((Date.now() - start) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

type FinaleMediaItem =
  | {
      id: string
      type: 'image'
      title: string
      description: string
      src: string
    }
  | {
      id: string
      type: 'video'
      title: string
      description: string
      src: string
      poster?: string
    }

const FINALE_MEDIA: FinaleMediaItem[] = [
  {
    id: 'joy-photo',
    type: 'image',
    title: 'Threads of Joy',
    description: 'The tapestry of spirals waiting in the living room—shot earlier as part of the reveal deck.',
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'joy-video',
    type: 'video',
    title: 'Aurora Loop',
    description: 'A looping glimmer that plays on the iPad while Gabe cues lights and piano.',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1482192597420-4817fdd7e8b0?auto=format&fit=crop&w=1200&q=80',
  },
]

const FinaleMediaViewer: FC = () => {
  const [activeId, setActiveId] = useState<string>(FINALE_MEDIA[0]?.id ?? '')
  const activeMedia = FINALE_MEDIA.find((item) => item.id === activeId) ?? FINALE_MEDIA[0]

  if (!activeMedia) return null

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200">Finale media</p>
          <h3 className="text-2xl font-semibold text-white">{activeMedia.title}</h3>
          <p className="text-sm text-slate-300">{activeMedia.description}</p>
        </div>
        <div className="flex gap-2">
          {FINALE_MEDIA.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`h-10 w-10 rounded-full border text-xs font-semibold uppercase tracking-widest ${
                item.id === activeId
                  ? 'border-amber-300/80 bg-amber-200/30 text-white'
                  : 'border-white/20 text-slate-400 hover:border-white/60'
              }`}
              onClick={() => setActiveId(item.id)}
            >
              {item.type === 'video' ? 'Vid' : 'Img'}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-black/40">
        {activeMedia.type === 'image' ? (
          <img src={activeMedia.src} alt={activeMedia.title} className="h-72 w-full object-cover" />
        ) : (
          <video
            key={activeMedia.src}
            className="h-72 w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            controls
            poster={activeMedia.poster}
          >
            <source src={activeMedia.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  )
}

const FinalePage: FC = () => {
  const { gameState } = usePlayerGameState()
  const transcriptQuery = useQuery(getGuideTranscript)
  const completeHuntAction = useAction(completeHunt)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isEnding, setIsEnding] = useState(false)

  const transcript = useMemo(() => {
    if (!transcriptQuery.data) return []
    const parsed = guideTranscriptSchema.safeParse(transcriptQuery.data)
    return parsed.success ? parsed.data : []
  }, [transcriptQuery.data])

  const handleReplay = () => {
    dispatchLocalCelebration('Replay the finale glow!')
  }

  const handleSaveTranscript = () => {
    const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `joy-hunt-transcript-${new Date().toISOString()}.json`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    setStatusMessage('Transcript saved. Share it with Joy later!')
  }

  const handleEndHunt = async () => {
    setIsEnding(true)
    setStatusMessage(null)
    try {
      await completeHuntAction({})
      setStatusMessage('Hunt marked as complete. You can safely close the console.')
    } catch (error) {
      console.error('completeHunt failed', error)
      setStatusMessage('Unable to mark the hunt complete. Check the server logs.')
    } finally {
      setIsEnding(false)
    }
  }

  return (
    <div className="relative space-y-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-0 h-72 w-72 animate-pulse rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-96 w-96 animate-pulse rounded-full bg-emerald-500/20 blur-3xl" />
      </div>
      <section className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#1d0d2b]/90 to-[#08030f]/90 px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-200">Finale unlocked</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
          Joy, you followed every thread. This screen is your victory lap.
        </h1>
        <p className="mt-4 text-lg text-slate-200">
          Lights have danced, the Guide has sung, and the last clue’s secret is yours. Replay the celebration, export
          the memories, or close the loop when you’re ready.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Total riddles</p>
            <p className="text-3xl font-semibold text-white">{gameState?.totalRiddles ?? 7}</p>
          </article>
          <article className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Elapsed time</p>
            <p className="text-3xl font-semibold text-white">{formatElapsed(gameState?.startedAt ?? null)}</p>
          </article>
          <article className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Guide exchanges</p>
            <p className="text-3xl font-semibold text-white">{transcript.length}</p>
          </article>
        </div>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={handleReplay}
            className="w-full rounded-full bg-gradient-to-r from-rose-400 via-amber-200 to-emerald-200 px-6 py-3 text-center text-sm font-semibold text-black shadow-lg shadow-rose-900/50 transition hover:scale-[1.01]"
          >
            Replay Celebration
          </button>
          <button
            type="button"
            onClick={handleSaveTranscript}
            disabled={!transcript.length}
            className="w-full rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            Save Transcript
          </button>
          <button
            type="button"
            onClick={handleEndHunt}
            disabled={isEnding}
            className="w-full rounded-full border border-rose-300/60 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-rose-100 transition hover:bg-rose-500/10 disabled:opacity-60"
          >
            {isEnding ? 'Marking...' : 'End Hunt'}
          </button>
        </div>
        {statusMessage && <p className="mt-3 text-sm text-emerald-200">{statusMessage}</p>}
      </section>

      <FinaleMediaViewer />

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Guide Transcript Highlights</h2>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-widest text-rose-200 hover:text-white"
            onClick={() => transcriptQuery.refetch()}
          >
            Refresh
          </button>
        </div>
        {transcriptQuery.isLoading && <p className="mt-4 text-sm text-slate-300">Gathering final whispers...</p>}
        {!transcriptQuery.isLoading && !transcript.length && (
          <p className="mt-4 text-sm text-slate-300">
            No Guide messages were recorded yet. Once Joy chats with the Guide, they’ll appear here.
          </p>
        )}
        <ul className="mt-4 space-y-3">
          {transcript.slice(-6).map((entry) => (
            <li
              key={entry.id}
              className={`rounded-2xl border border-white/5 px-4 py-3 text-sm ${
                entry.role === 'guide' ? 'bg-black/40 text-slate-100' : 'bg-rose-400/20 text-rose-50'
              }`}
            >
              <p className="text-xs uppercase tracking-widest text-slate-400">
                {entry.role === 'guide' ? 'Guide' : 'Joy'} · {new Date(entry.createdAt).toLocaleTimeString()}
              </p>
              <p className="mt-1 text-base">{entry.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default FinalePage
