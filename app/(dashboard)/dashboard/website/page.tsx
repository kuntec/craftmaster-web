'use client'
import { useState } from 'react'
import {
  Wand2,
  Download,
  AlertCircle,
  Loader2,
  Globe,
  Code,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react'
import { websiteApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

const STYLES = [
  { id: 'modern',    label: 'Modern',    desc: 'Clean & contemporary' },
  { id: 'minimal',   label: 'Minimal',   desc: 'Typography focused'   },
  { id: 'bold',      label: 'Bold',      desc: 'Strong & impactful'   },
  { id: 'corporate', label: 'Corporate', desc: 'Professional'         },
  { id: 'creative',  label: 'Creative',  desc: 'Artistic & unique'    },
  { id: 'dark',      label: 'Dark',      desc: 'Premium dark theme'   },
]

const EXAMPLES = [
  'A landing page for a mobile fitness app called FitTrack for busy professionals',
  'Portfolio website for a freelance UI/UX designer based in Dubai',
  'Restaurant website for "Saffron Kitchen" — modern Indian fine dining',
  'SaaS landing page for a project management tool for remote teams',
  'Personal blog for a software developer who writes about AI and startups',
]

type Tab = 'preview' | 'code'

export default function WebsitePage() {
  const updateUser = useAuthStore((s) => s.updateUser)
  const user       = useAuthStore((s) => s.user)

  const [prompt,    setPrompt]    = useState('')
  const [style,     setStyle]     = useState('modern')
  const [html,      setHtml]      = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [apiError,  setApiError]  = useState<string | null>(null)
  const [tab,       setTab]       = useState<Tab>('preview')
  const [copied,    setCopied]    = useState(false)

  const COST = 20

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setApiError(null)
    setHtml(null)

    try {
      const res = await websiteApi.generate({
        prompt: prompt.trim(),
        style,
      })
      setHtml(res.data.html)
      setTab('preview')
      if (user) {
        updateUser({ creditsBalance: user.creditsBalance - COST })
      }
    } catch (err: any) {
      setApiError(
        err.response?.data?.error || 'Generation failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!html) return
    const blob = new Blob([html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `studio42-ai-${Date.now()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    if (!html) return
    await navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl">
      <div className="page-header">
        <p className="page-subtitle">
          Describe a website and get production-ready HTML —{' '}
          <span className="text-indigo-600 font-medium">{COST} credits</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Controls ── */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">

            {/* Prompt */}
            <div>
              <label className="label">Describe your website</label>
              <textarea
                className="input resize-none h-28"
                placeholder="A landing page for a SaaS product that helps teams manage projects..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
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
                    disabled={loading}
                    className="w-full text-left text-xs text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all line-clamp-2"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="label">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    disabled={loading}
                    className={cn(
                      'px-3 py-2.5 rounded-xl text-left border transition-all',
                      style === s.id
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300'
                    )}
                  >
                    <div className="text-xs font-medium">{s.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{s.desc}</div>
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
              disabled={!prompt.trim() || loading}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Building website…</>
                : <><Wand2   className="w-4 h-4" /> Generate ({COST} credits)</>
              }
            </button>

            {/* Action buttons — show after generation */}
            {html && (
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="btn-secondary flex-1 text-xs py-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  onClick={handleCopy}
                  className="btn-secondary flex-1 text-xs py-2"
                >
                  {copied
                    ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                    : <><Copy  className="w-3.5 h-3.5" /> Copy HTML</>
                  }
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-ghost text-xs py-2 px-3"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Preview ── */}
        <div className="lg:col-span-2 flex flex-col gap-3">

          {/* Tab switcher */}
          {html && (
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
              <button
                onClick={() => setTab('preview')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  tab === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Globe className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => setTab('code')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  tab === 'code'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Code className="w-3.5 h-3.5" />
                Code
              </button>
            </div>
          )}

          {/* Output area */}
          <div
            className="card overflow-hidden"
            style={{ height: '560px' }}
          >
            {/* Idle */}
            {!html && !loading && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Globe className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm text-center">
                  Your website preview will appear here
                </p>
                <p className="text-gray-300 text-xs text-center">
                  Describe what you want and click Generate
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-100" />
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-gray-700 font-medium text-sm">
                    Building your website…
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Usually takes 15–30 seconds
                  </p>
                </div>
              </div>
            )}

            {/* Preview tab */}
            {html && tab === 'preview' && (
              <iframe
                srcDoc={html}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
                title="Website preview"
              />
            )}

            {/* Code tab */}
            {html && tab === 'code' && (
              <div className="relative h-full">
                <pre className="p-4 text-xs font-mono text-gray-600 overflow-auto h-full leading-relaxed bg-gray-50">
                  {html}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 btn-secondary text-xs py-1.5 px-3"
                >
                  {copied
                    ? <><Check className="w-3 h-3 text-emerald-500" /> Copied!</>
                    : <><Copy  className="w-3 h-3" /> Copy</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}