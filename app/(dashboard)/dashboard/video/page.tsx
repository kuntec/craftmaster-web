'use client'
import { useState } from 'react'
import {
  Wand2,
  Download,
  AlertCircle,
  Loader2,
  Video,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { videoApi } from '@/lib/api'
import { useJobPoller } from '@/hooks/useJobPoller'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

const DURATIONS = [
  { label: '5 seconds',  value: 5,  credits: 40 },
  { label: '10 seconds', value: 10, credits: 80 },
]

const EXAMPLES = [
  'A slow cinematic pan over a misty mountain range at golden hour',
  'A golden retriever running on a beach in slow motion',
  'Neon-lit city street at night with rain reflections',
  'Abstract fluid art with deep blue and gold colors flowing',
  'A campfire crackling in a dark forest, sparks flying up',
]

export default function VideoPage() {
  const updateUser = useAuthStore((s) => s.updateUser)
  const user       = useAuthStore((s) => s.user)

  const [prompt,     setPrompt]     = useState('')
  const [duration,   setDuration]   = useState(DURATIONS[0])
  const [jobId,      setJobId]      = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState<string | null>(null)

  const { job, loading: polling } = useJobPoller(jobId, 6000)

  const isGenerating = submitting || (
    polling &&
    job?.status !== 'COMPLETED' &&
    job?.status !== 'FAILED'
  )

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setSubmitting(true)
    setApiError(null)
    setJobId(null)

    try {
      const res = await videoApi.generate({
        prompt:   prompt.trim(),
        duration: duration.value,
      })
      setJobId(res.data.jobId)
      if (user) {
        updateUser({
          creditsBalance: user.creditsBalance - duration.credits,
        })
      }
    } catch (err: any) {
      setApiError(
        err.response?.data?.error || 'Generation failed. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url)
      const blob     = await response.blob()
      const a        = document.createElement('a')
      a.href         = URL.createObjectURL(blob)
      a.download     = `studio42-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="page-header">
        <p className="page-subtitle">
          Generate cinematic video clips from text —{' '}
          <span className="text-indigo-600 font-medium">
            40–80 credits per video
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Controls ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">

            {/* Prompt */}
            <div>
              <label className="label">Prompt</label>
              <textarea
                className="input resize-none h-28"
                placeholder="Describe the video you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            {/* Examples */}
            <div>
              <label className="label">Examples</label>
              <div className="space-y-1.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    disabled={isGenerating}
                    className="w-full text-left text-xs text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="label">Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d)}
                    disabled={isGenerating}
                    className={cn(
                      'px-3 py-3 rounded-xl text-xs font-medium border text-left transition-all',
                      duration.value === d.value
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300'
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{d.label}</span>
                    </div>
                    <div className="text-[10px] opacity-60">
                      {d.credits} credits
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {apiError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {apiError}
              </div>
            )}

            {/* Generate button */}
            <button
              className="btn-primary w-full py-2.5"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                : <><Wand2   className="w-4 h-4" /> Generate ({duration.credits} credits)</>
              }
            </button>
          </div>

          {/* Info card */}
          <div className="card p-4 bg-amber-50 border-amber-200">
            <p className="text-xs font-medium text-amber-800 mb-1">
              ⏱ Videos take 2–5 minutes
            </p>
            <p className="text-xs text-amber-700">
              You can leave this page — check your result in History when done.
            </p>
          </div>
        </div>

        {/* ── Output ── */}
        <div className="lg:col-span-3">
          <div className="card overflow-hidden aspect-video bg-gray-50">

            {/* Idle */}
            {!jobId && !submitting && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Video className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm text-center">
                  Your generated video will appear here
                </p>
              </div>
            )}

            {/* Generating */}
            {isGenerating && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-rose-100" />
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-gray-700 font-medium text-sm">
                    Creating your video…
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    This takes 2–5 minutes
                  </p>
                </div>
                {/* Animated dots */}
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {job?.status === 'COMPLETED' && job.outputUrl && (
              <div className="relative w-full h-full group">
                <video
                  src={job.outputUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(job.outputUrl!)}
                    className="btn-secondary text-xs py-1.5 px-3 shadow-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                  <button
                    onClick={() => setJobId(null)}
                    className="btn-secondary text-xs py-1.5 px-3 shadow-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    New
                  </button>
                </div>
              </div>
            )}

            {/* Failed */}
            {job?.status === 'FAILED' && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-gray-700 font-medium text-sm">
                  Generation failed
                </p>
                <p className="text-gray-400 text-xs text-center">
                  {job.errorMessage || 'Something went wrong'}
                </p>
                <button
                  onClick={() => setJobId(null)}
                  className="btn-secondary text-xs py-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}