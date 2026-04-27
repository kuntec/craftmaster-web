'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ImageIcon, Video, Globe, Zap, Check,
  ArrowRight, Wand2, Loader2, AlertCircle,
  Download, Code2, ChevronRight, Star,
} from 'lucide-react'
import { api } from '@/lib/api'
import { jobsApi } from '@/lib/api'
import { cn } from '@/lib/utils'

// ── Free image generator hook ─────────────────────────────
function useFreeImageGen() {
  const [prompt,     setPrompt]     = useState('')
  const [replicateId,setReplicateId]= useState<string|null>(null)
  const [outputUrl,  setOutputUrl]  = useState<string|null>(null)
  const [loading,    setLoading]    = useState(false)
  const [polling,    setPolling]    = useState(false)
  const [error,      setError]      = useState('')
  const [remaining,  setRemaining]  = useState<number|null>(null)

  const generate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setOutputUrl(null)
    setReplicateId(null)

    try {
      const res = await api.post('/free/image/generate', { prompt: prompt.trim() })
      setReplicateId(res.data.replicateId)
      setRemaining(res.data.remaining)
      setPolling(true)
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  // Poll for result
  useEffect(() => {
    if (!replicateId || !polling) return
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/jobs/replicate/${replicateId}`)
        if (res.data.status === 'succeeded') {
          setOutputUrl(res.data.output)
          setPolling(false)
          clearInterval(interval)
        } else if (res.data.status === 'failed') {
          setError('Generation failed. Please try again.')
          setPolling(false)
          clearInterval(interval)
        }
      } catch {
        // keep polling
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [replicateId, polling])

  return { prompt, setPrompt, outputUrl, loading, polling, error, remaining, generate }
}

// ── Plan card component ───────────────────────────────────
const PLAN_COLORS: Record<string, { border: string; badge: string }> = {
  BASIC:    { border: 'border-gray-200',   badge: 'bg-gray-100 text-gray-600'     },
  MEDIUM:   { border: 'border-indigo-400', badge: 'bg-indigo-500 text-white'      },
  ADVANCED: { border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700' },
}

// ── Main landing page ─────────────────────────────────────
export default function LandingPage() {
  // Free website state
  const [webPrompt,  setWebPrompt]  = useState('')
  const [webHtml,    setWebHtml]    = useState<string|null>(null)
  const [webLoading, setWebLoading] = useState(false)
  const [webError,   setWebError]   = useState('')

  // Free builder state
  const [builderDesc,    setBuilderDesc]    = useState('')
  const [builderPlans,   setBuilderPlans]   = useState<any[]>([])
  const [builderLoading, setBuilderLoading] = useState(false)
  const [builderError,   setBuilderError]   = useState('')
  const [selectedPlan,   setSelectedPlan]   = useState<any>(null)

  // Image gen
  const img = useFreeImageGen()

  // Polling for free image using replicate directly
  const [freeJobId, setFreeJobId] = useState<string|null>(null)
  const [freeImgUrl, setFreeImgUrl] = useState<string|null>(null)
  const [freePolling, setFreePolling] = useState(false)
  const [freeLoading, setFreeLoading] = useState(false)
  const [freeError, setFreeError] = useState('')
  const [freePrompt, setFreePrompt] = useState('')
  const [freeRemaining, setFreeRemaining] = useState<number|null>(null)

  const generateFreeImage = async () => {
    if (!freePrompt.trim()) return
    setFreeLoading(true)
    setFreeError('')
    setFreeImgUrl(null)
    setFreeJobId(null)

    try {
      const res = await api.post('/free/image/generate', {
        prompt: freePrompt.trim()
      })
      setFreeJobId(res.data.replicateId)
      setFreeRemaining(res.data.remaining)
      setFreePolling(true)
    } catch (err: any) {
      setFreeError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Generation failed'
      )
    } finally {
      setFreeLoading(false)
    }
  }

  // Poll free image job
  useEffect(() => {
    if (!freeJobId || !freePolling) return
    const interval = setInterval(async () => {
      try {
//        const res = await api.get(`/jobs/poll/${freeJobId}`)
        const res = await api.get(`/free/jobs/poll/${freeJobId}`)
        if (res.data.status === 'succeeded') {
          const out = res.data.output
          setFreeImgUrl(Array.isArray(out) ? out[0] : out)
          setFreePolling(false)
          clearInterval(interval)
        } else if (res.data.status === 'failed') {
          setFreeError('Generation failed. Please try again.')
          setFreePolling(false)
          clearInterval(interval)
        }
      } catch {
        // keep polling
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [freeJobId, freePolling])

  // Free website generation
  const generateFreeWebsite = async () => {
    if (!webPrompt.trim()) return
    setWebLoading(true)
    setWebError('')
    setWebHtml(null)
    try {
      const res = await api.post('/free/website/generate', {
        prompt: webPrompt.trim()
      })
      setWebHtml(res.data.html)
    } catch (err: any) {
      setWebError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Generation failed'
      )
    } finally {
      setWebLoading(false)
    }
  }

  // Free builder plan generation
  const generateBuilderPlans = async () => {
    if (!builderDesc.trim()) return
    setBuilderLoading(true)
    setBuilderError('')
    setBuilderPlans([])
    setSelectedPlan(null)
    try {
      const res = await api.post('/free/builder/plan', {
        description: builderDesc.trim()
      })
      setBuilderPlans(res.data.plans)
      setSelectedPlan(res.data.plans[1] || res.data.plans[0])
    } catch (err: any) {
      setBuilderError(
        err.response?.data?.error ||
        'Failed to generate plans'
      )
    } finally {
      setBuilderLoading(false)
    }
  }

  const isGeneratingImage = freeLoading || freePolling

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">42</span>
            </div>
            <span className="font-bold text-gray-900">Studio42</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"    className="text-sm text-gray-600 hover:text-gray-900 font-medium hidden sm:block">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium mb-6">
          <Zap className="w-4 h-4" fill="currentColor" />
          No subscription · Pay as you go · Credits never expire
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-5">
          The answer to all your{' '}
          <span className="text-indigo-500">AI tool needs.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
          Generate images, videos and websites. Build complete projects with AI.
          Pay only when you use it. The answer was always 42.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <Link href="/register" className="btn-primary text-base px-8 py-3 shadow-lg">
            Get 30 free credits <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#try-free" className="btn-secondary text-base px-8 py-3">
            Try without signup ↓
          </a>
        </div>
        <p className="text-sm text-gray-400">No credit card required</p>
      </section>

      {/* ── Free Image Generator ── */}
      <section id="try-free" className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="badge bg-emerald-100 text-emerald-700 mb-3">
              ✨ Free — no signup needed
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Try the image generator
            </h2>
            <p className="text-gray-500 mt-2">
              3 free images per day · No account required
            </p>
          </div>

          <div className="card p-6 max-w-2xl mx-auto">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                className="input flex-1"
                placeholder="A majestic lion at golden hour, cinematic..."
                value={freePrompt}
                onChange={(e) => setFreePrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateFreeImage()}
                disabled={isGeneratingImage}
              />
              <button
                className="btn-primary shrink-0"
                onClick={generateFreeImage}
                disabled={!freePrompt.trim() || isGeneratingImage}
              >
                {isGeneratingImage
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Wand2   className="w-4 h-4" />
                }
                {!isGeneratingImage && <span className="hidden sm:inline ml-1">Generate</span>}
              </button>
            </div>

            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                'Futuristic city at night',
                'Cute cat in a garden',
                'Abstract art, blue tones',
                'Mountain landscape at sunrise',
              ].map((p) => (
                <button
                  key={p}
                  onClick={() => setFreePrompt(p)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Output */}
            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square max-w-sm mx-auto">
              {!freeImgUrl && !isGeneratingImage && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                  <p className="text-gray-400 text-sm">Your image appears here</p>
                </div>
              )}

              {isGeneratingImage && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <p className="text-gray-500 text-sm">Creating your image…</p>
                </div>
              )}

              {freeImgUrl && !isGeneratingImage && (
                <>
                  <img
                    src={freeImgUrl}
                    alt={freePrompt}
                    className="w-full h-full object-cover"
                  />
                  {/* Watermark */}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
                    Studio42.ai
                  </div>
                </>
              )}
            </div>

            {freeError && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {freeError}
              </div>
            )}

            {freeImgUrl && (
              <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                <p className="text-sm font-medium text-indigo-900 mb-2">
                  Want to download full resolution?
                </p>
                <Link href="/register" className="btn-primary text-sm py-2 inline-flex">
                  Sign up free — get 30 credits <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {freeRemaining !== null && freeRemaining > 0 && (
              <p className="text-center text-xs text-gray-400 mt-3">
                {freeRemaining} free image{freeRemaining !== 1 ? 's' : ''} remaining today
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Free Website Builder ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="badge bg-emerald-100 text-emerald-700 mb-3">
              ✨ Free — no signup needed
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Try the website builder
            </h2>
            <p className="text-gray-500 mt-2">
              1 free website per day · Live preview · No account required
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Input */}
            <div className="card p-5 space-y-4">
              <div>
                <label className="label">Describe your website</label>
                <textarea
                  className="input resize-none h-28"
                  placeholder="A landing page for a mobile fitness app called FitTrack for busy professionals..."
                  value={webPrompt}
                  onChange={(e) => setWebPrompt(e.target.value)}
                  disabled={webLoading}
                />
              </div>

              {/* Examples */}
              <div className="flex flex-col gap-1.5">
                {[
                  'Portfolio for a freelance graphic designer',
                  'Restaurant website for modern Italian dining',
                  'SaaS landing page for a project management tool',
                ].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setWebPrompt(ex)}
                    className="text-left text-xs text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {webError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {webError}
                </div>
              )}

              <button
                className="btn-primary w-full py-2.5"
                onClick={generateFreeWebsite}
                disabled={!webPrompt.trim() || webLoading}
              >
                {webLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Building…</>
                  : <><Wand2   className="w-4 h-4" /> Generate website</>
                }
              </button>

              {webHtml && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                  <p className="text-xs font-medium text-indigo-900 mb-2">
                    Sign up to download without watermark
                  </p>
                  <Link href="/register" className="btn-primary text-xs py-2 inline-flex">
                    Get 30 free credits <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="card overflow-hidden" style={{ minHeight: '400px' }}>
              {!webHtml && !webLoading && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8 min-h-[400px]">
                  <Globe className="w-12 h-12 text-gray-200" />
                  <p className="text-gray-400 text-sm text-center">
                    Your website preview appears here
                  </p>
                </div>
              )}

              {webLoading && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 min-h-[400px]">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <p className="text-gray-500 text-sm">Building your website…</p>
                  <p className="text-gray-400 text-xs">Usually 15-30 seconds</p>
                </div>
              )}

              {webHtml && (
                <iframe
                  srcDoc={webHtml}
                  className="w-full border-0"
                  style={{ height: '400px' }}
                  sandbox="allow-scripts"
                  title="Free website preview"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Free AI Builder Plans ── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="badge bg-emerald-100 text-emerald-700 mb-3">
              ✨ Always free — no signup needed
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Try the AI Project Builder
            </h2>
            <p className="text-gray-500 mt-2">
              Describe any app — get a full step-by-step build plan instantly
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="card p-5 space-y-4">
              <div>
                <label className="label">What do you want to build?</label>
                <textarea
                  className="input resize-none h-24"
                  placeholder="I want to build a food delivery app with restaurants, orders and payments..."
                  value={builderDesc}
                  onChange={(e) => setBuilderDesc(e.target.value)}
                  disabled={builderLoading}
                />
              </div>

              {/* Quick examples */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Ecommerce store with cart and payments',
                  'Social media app for developers',
                  'Booking system for appointments',
                  'Blog platform with comments',
                ].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setBuilderDesc(ex)}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {builderError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {builderError}
                </div>
              )}

              <button
                className="btn-primary w-full py-2.5"
                onClick={generateBuilderPlans}
                disabled={!builderDesc.trim() || builderLoading}
              >
                {builderLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing your project…</>
                  : <><Code2   className="w-4 h-4" /> Generate build plan (free)</>
                }
              </button>
            </div>
          </div>

          {/* Plans display */}
          {builderPlans.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {builderPlans.map((plan: any) => {
                  const style     = PLAN_COLORS[plan.plan] || PLAN_COLORS.BASIC
                  const isSelected = selectedPlan?.plan === plan.plan

                  return (
                    <div
                      key={plan.plan}
                      onClick={() => setSelectedPlan(plan)}
                      className={cn(
                        'card p-5 cursor-pointer transition-all space-y-3',
                        style.border,
                        isSelected && 'ring-2 ring-indigo-500 ring-offset-2'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn('badge', style.badge)}>
                          {plan.plan}
                        </span>
                        <span className="text-sm font-bold text-indigo-600">
                          ~{plan.estimatedCredits} credits
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 text-sm">
                        {plan.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {plan.description}
                      </p>

                      <div className="text-xs text-gray-400">
                        {plan.totalSteps} steps
                      </div>

                      {/* Features */}
                      <div className="space-y-1">
                        {plan.features.slice(0, 4).map((f: any) => (
                          <div key={f.id} className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="text-xs text-gray-600">{f.title}</span>
                          </div>
                        ))}
                        {plan.features.length > 4 && (
                          <p className="text-xs text-gray-400 pl-4">
                            +{plan.features.length - 4} more features
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* CTA to sign up */}
              {selectedPlan && (
                <div className="card p-6 bg-indigo-50 border-indigo-200 text-center max-w-lg mx-auto">
                  <h3 className="font-semibold text-indigo-900 mb-1">
                    Ready to build {selectedPlan.title}?
                  </h3>
                  <p className="text-sm text-indigo-600 mb-4">
                    You need ~{selectedPlan.estimatedCredits} credits.
                    Sign up free and get 30 credits to start.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href={`/register?plan=${selectedPlan.plan}&desc=${encodeURIComponent(builderDesc)}`}
                      className="btn-primary justify-center"
                    >
                      Sign up free — start building
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link href="/login" className="btn-secondary justify-center text-sm">
                      Already have an account
                    </Link>
                  </div>
                  <p className="text-xs text-indigo-400 mt-3">
                    Your plan is saved — start building immediately after signup
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Tools section ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Everything you need to create
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Four powerful AI tools. One credit wallet. Pay only when you use them.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ImageIcon, label: 'Image Generator', desc: 'FLUX 1.1 Pro — best in class quality',  cost: '4 credits',  color: 'bg-violet-500'  },
              { icon: Video,     label: 'Video Generator', desc: 'Cinematic AI video clips up to 10s',     cost: '40 credits', color: 'bg-rose-500'    },
              { icon: Globe,     label: 'Website Builder', desc: 'Full production website in 30 seconds',  cost: '20 credits', color: 'bg-emerald-500' },
              { icon: Code2,     label: 'AI Builder',      desc: 'Complete codebase step by step',         cost: '8+ credits', color: 'bg-amber-500'   },
            ].map((t) => {
              const Icon = t.icon
              return (
                <div key={t.label} className="card p-5 space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{t.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">⚡ {t.cost}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Simple, honest pricing
          </h2>
          <p className="text-gray-500 mb-10">
            Buy once. Use whenever. Credits never expire.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { credits: 100,  price: 5,  popular: false },
              { credits: 250,  price: 10, popular: true  },
              { credits: 600,  price: 20, popular: false },
              { credits: 1500, price: 40, popular: false },
            ].map((pkg) => (
              <div key={pkg.credits} className={cn(
                'card p-5 text-center relative',
                pkg.popular && 'border-indigo-400 bg-indigo-50'
              )}>
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <div className="text-2xl font-bold text-gray-900">{pkg.credits}</div>
                <div className="text-gray-400 text-xs mb-2">credits</div>
                <div className="text-indigo-600 font-bold text-lg">${pkg.price}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-8">
            {[
              'Credits never expire',
              'No subscription',
              'Stripe secured',
              'Instant delivery',
            ].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" />{f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-indigo-500 py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">
          Stop paying for tools you barely use.
        </h2>
        <p className="text-indigo-200 text-lg mb-8">
          Start with 30 free credits. No card needed. The answer is 42.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-all text-base"
        >
          Get started free <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Studio42.ai · AI tools without the subscription trap.
        <div className="flex items-center justify-center gap-4 mt-3">
          <Link href="/login"    className="hover:text-gray-600">Sign in</Link>
          <Link href="/register" className="hover:text-gray-600">Register</Link>
        </div>
      </footer>

    </div>
  )
}