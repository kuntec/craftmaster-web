'use client'
import { useState } from 'react'
import {
  Wand2,
  Download,
  AlertCircle,
  Loader2,
  ImageIcon,
  RefreshCw,
} from 'lucide-react'
import { imageApi } from '@/lib/api'
import { useJobPoller } from '@/hooks/useJobPoller'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

const SIZES = [
  { label: 'Square',    width: 1024, height: 1024, ratio: 'aspect-square' },
  { label: 'Portrait',  width: 768,  height: 1152, ratio: 'aspect-[2/3]'  },
  { label: 'Landscape', width: 1152, height: 768,  ratio: 'aspect-[3/2]'  },
  { label: 'Wide',      width: 1280, height: 720,  ratio: 'aspect-video'  },
]

const STYLES = [
  'Photorealistic',
  'Digital Art',
  'Illustration',
  'Anime',
  'Oil Painting',
  'Watercolor',
  'Sketch',
  'Cinematic',
]

const EXAMPLES = [
  'A majestic lion on a cliff at golden hour, cinematic',
  'Futuristic city skyline at night with neon lights',
  'A cozy coffee shop in the rain, warm lighting',
  'Abstract fluid art with deep blue and gold colors',
]

export default function ImagePage() {
  const updateUser = useAuthStore((s) => s.updateUser)
  const user       = useAuthStore((s) => s.user)

  const [prompt,      setPrompt]      = useState('')
  const [style,       setStyle]       = useState('')
  const [size,        setSize]        = useState(SIZES[0])
  const [jobId,       setJobId]       = useState<string | null>(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [apiError,    setApiError]    = useState<string | null>(null)

  const { job, loading: polling } = useJobPoller(jobId)

  const isGenerating = submitting || (
    polling &&
    job?.status !== 'COMPLETED' &&
    job?.status !== 'FAILED'
  )

  const COST = 4

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setSubmitting(true)
    setApiError(null)
    setJobId(null)

    try {
      const finalPrompt = style
        ? `${prompt}, ${style} style`
        : prompt

      const res = await imageApi.generate({
        prompt: finalPrompt,
        width:  size.width,
        height: size.height,
      })

      setJobId(res.data.jobId)
      if (user) updateUser({ creditsBalance: user.creditsBalance - COST })
    } catch (err: any) {
      setApiError(
        err.response?.data?.error || 'Generation failed. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = async (url: string, type: string) => {
    try {
      const response = await fetch(url)
      const blob     = await response.blob()
      const a        = document.createElement('a')
      a.href         = URL.createObjectURL(blob)
      a.download     = `studio42-${Date.now()}.${type === 'VIDEO' ? 'mp4' : 'webp'}`
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
          Generate stunning images from text —{' '}
          <span className="text-indigo-600 font-medium">{COST} credits per image</span>
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
                placeholder="Describe the image you want to generate..."
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

            {/* Style */}
            <div>
              <label className="label">
                Style{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(style === s ? '' : s)}
                    disabled={isGenerating}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                      style === s
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="label">Size</label>
              <div className="grid grid-cols-2 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSize(s)}
                    disabled={isGenerating}
                    className={cn(
                      'px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all',
                      size.label === s.label
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300'
                    )}
                  >
                    <div className="font-medium">{s.label}</div>
                    <div className="opacity-60 text-[10px]">{s.width}×{s.height}</div>
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
                : <><Wand2   className="w-4 h-4" /> Generate ({COST} credits)</>
              }
            </button>
          </div>
        </div>

        {/* ── Output ── */}
        <div className="lg:col-span-3">
          <div className={cn(
            'card overflow-hidden w-full',
            size.ratio
          )}>

            {/* Idle */}
            {!jobId && !submitting && (
              <div className="w-full h-full min-h-64 flex flex-col items-center justify-center gap-3 bg-gray-50 p-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm text-center">
                  Your generated image will appear here
                </p>
              </div>
            )}

            {/* Generating */}
            {isGenerating && (
              <div className="w-full h-full min-h-64 flex flex-col items-center justify-center gap-4 bg-gray-50">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-100" />
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-gray-700 font-medium text-sm">
                    Creating your image…
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Usually takes 10-30 seconds
                  </p>
                </div>
              </div>
            )}

            {/* Completed */}
            {job?.status === 'COMPLETED' && job.outputUrl && (
              <div className="relative w-full h-full group">
                <img
                  src={job.outputUrl}
                  alt={job.prompt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  
                   <a href={job.outputUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs py-1.5 px-3 shadow-lg"
>
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>

                  <button
                    onClick={() => handleDownload(job.outputUrl!, job.type)}
                    className="btn-secondary text-xs py-1.5 px-3 shadow-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>

                  <button
                    onClick={() => { setJobId(null); setPrompt(prompt) }}
                    className="btn-secondary text-xs py-1.5 px-3 shadow-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                  </button>
                </div>
              </div>
            )}

            {/* Failed */}
            {job?.status === 'FAILED' && (
              <div className="w-full h-full min-h-64 flex flex-col items-center justify-center gap-3 p-8">
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