'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import {
  Wand2, Download, AlertCircle, Loader2,
  Video, Clock, RefreshCw, Check, Zap,
  Volume2, VolumeX, Monitor, Smartphone,
} from 'lucide-react'
import { videoApi, jobsApi } from '@/lib/api'
import { useJobPoller }      from '@/hooks/useJobPoller'
import { useAuthStore }      from '@/store/auth'
import { cn }                from '@/lib/utils'

// ── Model definitions (mirrors backend) ──────────────────
interface VideoModel {
  id:          string
  name:        string
  description: string
  credits:     number
  badge:       string
  badgeColor:  string
  duration:    string
  resolution:  string
  audio:       boolean
  features:    string[]
}

const VIDEO_MODELS: VideoModel[] = [
  {
    id:          'wan-2.1',
    name:        'Wan 2.1',
    description: 'Fast and reliable. Great for quick generations on a budget.',
    credits:     35,
    badge:       'Budget',
    badgeColor:  '#10B981',
    duration:    '5s or 10s',
    resolution:  '480p',
    audio:       false,
    features:    ['Fast generation', 'Reliable output', 'Lowest cost'],
  },
  {
    id:          'seedance-2.0',
    name:        'Seedance 2.0',
    description: 'ByteDance\'s latest. Native audio, better motion and physics.',
    credits:     50,
    badge:       'Best value',
    badgeColor:  '#4F8EF7',
    duration:    '4–15s',
    resolution:  '480p / 720p',
    audio:       true,
    features:    ['Native audio', 'Better motion', 'Lip sync', 'Image-to-video'],
  },
  {
    id:          'kling-v3',
    name:        'Kling v3',
    description: 'Cinematic quality up to 15 seconds with multi-shot control.',
    credits:     60,
    badge:       'Premium',
    badgeColor:  '#7B2FBE',
    duration:    '3–15s',
    resolution:  '720p / 1080p',
    audio:       true,
    features:    ['Up to 1080p', 'Multi-shot', 'Native audio', 'Lip sync'],
  },
  {
    id:          'kling-v3-omni',
    name:        'Kling v3 Omni',
    description: 'Most powerful. Reference images, video editing, character consistency.',
    credits:     80,
    badge:       'Pro',
    badgeColor:  '#F59E0B',
    duration:    '3–15s',
    resolution:  '720p / 1080p',
    audio:       true,
    features:    ['Reference images', 'Video editing', 'Character consistency', '1080p'],
  },
]

const EXAMPLES = [
  'A slow cinematic pan over a misty mountain range at golden hour',
  'A golden retriever running on a beach in slow motion',
  'Neon-lit city street at night with rain reflections',
  'A campfire crackling in a dark forest, sparks flying up',
  'Abstract fluid art with deep blue and gold colors flowing',
]

// Duration options per model
const getDurations = (modelId: string) => {
  if (modelId === 'wan-2.1') {
    return [
      { label: '5 seconds',  value: 5  },
      { label: '10 seconds', value: 10 },
    ]
  }
  return [
    { label: '5 seconds',  value: 5  },
    { label: '10 seconds', value: 10 },
    { label: '15 seconds', value: 15 },
  ]
}

// Resolution options per model
const getResolutions = (modelId: string) => {
  if (modelId === 'wan-2.1') return [{ label: '480p', value: '480p' }]
  if (modelId === 'seedance-2.0') return [
    { label: '480p', value: '480p' },
    { label: '720p', value: '720p' },
  ]
  return [
    { label: '720p',  value: '720p'  },
    { label: '1080p', value: '1080p' },
  ]
}

// Module-level set to prevent duplicate R2 saves
const r2SavedVideos = new Set<string>()

export default function VideoPage() {
  const { user, updateUser } = useAuthStore()

  const [selectedModel, setSelectedModel] = useState<VideoModel>(VIDEO_MODELS[1]) // seedance default
  const [prompt,        setPrompt]        = useState('')
  const [duration,      setDuration]      = useState(5)
  const [resolution,    setResolution]    = useState('480p')
  const [aspectRatio,   setAspectRatio]   = useState('16:9')
  const [enableAudio,   setEnableAudio]   = useState(true)
  const [jobId,         setJobId]         = useState<string | null>(null)
  const [submitting,    setSubmitting]    = useState(false)
  const [apiError,      setApiError]      = useState<string | null>(null)

  const { job, loading: polling } = useJobPoller(jobId, 6000)

  const isGenerating = submitting || (
    polling &&
    job?.status !== 'COMPLETED' &&
    job?.status !== 'FAILED'
  )

  // Reset options when model changes
  useEffect(() => {
    const durations   = getDurations(selectedModel.id)
    const resolutions = getResolutions(selectedModel.id)
    setDuration(durations[0].value)
    setResolution(resolutions[0].value)
    setEnableAudio(selectedModel.audio)
  }, [selectedModel.id])

  // R2 save after video appears
  useEffect(() => {
    if (
      job?.status === 'COMPLETED' &&
      job?.outputUrl &&
      job?.outputUrl.includes('replicate.delivery') &&
      !r2SavedVideos.has(job._id)
    ) {
      r2SavedVideos.add(job._id)
      jobsApi.saveToR2(job._id)
        .then(res => console.log('Video saved to R2:', res.data.outputUrl))
        .catch(err => console.error('R2 save failed:', err.message))
    }
  }, [job?.status, job?._id])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setSubmitting(true)
    setApiError(null)
    setJobId(null)

    try {
      const res = await videoApi.generate({
        prompt:      prompt.trim(),
        duration,
        modelId:     selectedModel.id,
        resolution,
        aspectRatio,
        enableAudio: selectedModel.audio ? enableAudio : false,
      })

      setJobId(res.data.job._id)
      updateUser({
        creditsBalance: (user?.creditsBalance ?? 0) - selectedModel.credits,
      })
    } catch (err: any) {
      setApiError(err.response?.data?.error || 'Generation failed. Please try again.')
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

  const durations   = getDurations(selectedModel.id)
  const resolutions = getResolutions(selectedModel.id)

  return (
    <div className="max-w-6xl">

      {/* Header */}
      <div className="page-header">
        <p className="page-subtitle">
          Generate cinematic AI videos with the world's best models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Left — Controls ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Model selector */}
          <div className="card p-4 space-y-3">
            <label className="label">Select Model</label>
            <div className="space-y-2">
              {VIDEO_MODELS.map(model => {
                const isSelected = selectedModel.id === model.id
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    disabled={isGenerating}
                    className="w-full text-left transition-all rounded-xl p-3 border"
                    style={{
                      background:   isSelected ? `${model.badgeColor}08` : '#f9fafb',
                      borderColor:  isSelected ? model.badgeColor : '#e5e7eb',
                      borderWidth:  isSelected ? '2px' : '1px',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: model.badgeColor }}
                          >
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <span className="text-sm font-bold text-gray-900">
                          {model.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${model.badgeColor}18`, color: model.badgeColor }}
                        >
                          {model.badge}
                        </span>
                        <span
                          className="text-xs font-bold"
                          style={{ color: model.badgeColor }}
                        >
                          ⚡ {model.credits} cr
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1.5">{model.description}</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {model.resolution}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {model.duration}
                      </span>
                      {model.audio && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                          🔊 Audio
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Prompt + settings */}
          <div className="card p-5 space-y-4">

            {/* Prompt */}
            <div>
              <label className="label">Prompt</label>
              <textarea
                className="input resize-none h-24"
                placeholder="Describe the video you want to generate..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            {/* Examples */}
            <div>
              <label className="label">Examples</label>
              <div className="space-y-1">
                {EXAMPLES.map(ex => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    disabled={isGenerating}
                    className="w-full text-left text-xs text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="label">Duration</label>
              <div className="flex gap-2">
                {durations.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    disabled={isGenerating}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs font-medium border transition-all',
                      duration === d.value
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div>
              <label className="label">Resolution</label>
              <div className="flex gap-2">
                {resolutions.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setResolution(r.value)}
                    disabled={isGenerating}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs font-medium border transition-all',
                      resolution === r.value
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect ratio */}
            <div>
              <label className="label">Aspect Ratio</label>
              <div className="flex gap-2">
                {[
                  { label: '16:9',  value: '16:9',  icon: Monitor    },
                  { label: '9:16',  value: '9:16',  icon: Smartphone },
                  { label: '1:1',   value: '1:1',   icon: null       },
                ].map(ar => {
                  const Icon = ar.icon
                  return (
                    <button
                      key={ar.value}
                      onClick={() => setAspectRatio(ar.value)}
                      disabled={isGenerating}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1',
                        aspectRatio === ar.value
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300'
                      )}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      {ar.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Audio toggle — only for models that support it */}
            {selectedModel.audio && (
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2">
                  {enableAudio
                    ? <Volume2 className="w-4 h-4 text-indigo-600" />
                    : <VolumeX className="w-4 h-4 text-gray-400" />
                  }
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Native Audio
                    </p>
                    <p className="text-[10px] text-gray-500">
                      AI generates synchronized sound
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEnableAudio(!enableAudio)}
                  disabled={isGenerating}
                  className={cn(
                    'w-10 h-5 rounded-full transition-all relative',
                    enableAudio ? 'bg-indigo-500' : 'bg-gray-300'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow',
                    enableAudio ? 'left-5' : 'left-0.5'
                  )} />
                </button>
              </div>
            )}

            {/* Error */}
            {apiError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {apiError}
              </div>
            )}

            {/* Generate button */}
            <button
              className="btn-primary w-full py-3"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                : <><Wand2   className="w-4 h-4" /> Generate ({selectedModel.credits} credits)</>
              }
            </button>
          </div>

          {/* Info card */}
          <div className="rounded-xl p-4 bg-amber-50 border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-1">
              ⏱ Videos take 2–5 minutes
            </p>
            <p className="text-xs text-amber-700">
              You can leave this page — check your result in History when done.
            </p>
          </div>
        </div>

        {/* ── Right — Output ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Model features */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: `${selectedModel.badgeColor}15`,
                    color:       selectedModel.badgeColor,
                  }}
                >
                  {selectedModel.badge}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {selectedModel.name}
                </span>
              </div>
              <span
                className="text-sm font-bold flex items-center gap-1"
                style={{ color: selectedModel.badgeColor }}
              >
                <Zap className="w-3.5 h-3.5" />
                {selectedModel.credits} credits
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {selectedModel.features.map(f => (
                <div key={f} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs text-gray-600">{f}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs text-gray-600">{selectedModel.resolution}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs text-gray-600">{selectedModel.duration}</span>
              </div>
            </div>
          </div>

          {/* Video output */}
          <div
            className="card overflow-hidden"
            style={{
              aspectRatio: aspectRatio === '9:16' ? '9/16'
                         : aspectRatio === '1:1'  ? '1/1'
                         : '16/9',
            }}
          >
            {/* Idle */}
            {!jobId && !submitting && (
              <div className="w-full h-full min-h-48 flex flex-col items-center justify-center gap-3 bg-gray-50 p-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Video className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm text-center">
                  Your generated video will appear here
                </p>
                <p className="text-gray-300 text-xs text-center">
                  Select a model and enter a prompt to begin
                </p>
              </div>
            )}

            {/* Generating */}
            {isGenerating && (
              <div className="w-full h-full min-h-48 flex flex-col items-center justify-center gap-4 bg-gray-50">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
                  <div
                    className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: `${selectedModel.badgeColor} transparent transparent transparent` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-5 h-5" style={{ color: selectedModel.badgeColor }} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-gray-700 font-semibold text-sm">
                    {selectedModel.name} is creating your video…
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Usually 2–5 minutes
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        background:      selectedModel.badgeColor,
                        animationDelay:  `${i * 0.2}s`,
                      }}
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
                    onClick={() => { setJobId(null); setApiError(null) }}
                    className="btn-secondary text-xs py-1.5 px-3 shadow-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    New
                  </button>
                </div>

                {/* Model watermark */}
                <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg text-[10px] font-semibold text-white"
                  style={{ background: 'rgba(0,0,0,0.6)' }}>
                  Studio42 · {selectedModel.name}
                </div>
              </div>
            )}

            {/* Failed */}
            {job?.status === 'FAILED' && (
              <div className="w-full h-full min-h-48 flex flex-col items-center justify-center gap-3 p-8">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-gray-700 font-semibold text-sm">Generation failed</p>
                <p className="text-gray-400 text-xs text-center">
                  {job.errorMessage || 'Something went wrong. Please try again.'}
                </p>
                <button
                  onClick={() => { setJobId(null); setApiError(null) }}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Completed info */}
          {job?.status === 'COMPLETED' && (
            <div className="card p-4 bg-emerald-50 border-emerald-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800">
                    Video generated with {selectedModel.name}
                  </p>
                  <p className="text-xs text-emerald-600">
                    {selectedModel.credits} credits used ·{' '}
                    {duration}s · {resolution} · {aspectRatio}
                    {selectedModel.audio && enableAudio ? ' · Audio' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}