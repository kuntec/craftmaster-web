'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ImageIcon, Video, Globe, Code2,
  Check, ArrowRight, Loader2, AlertCircle,
  X, ChevronDown, TrendingDown,
  Sparkles, Menu, Zap, Play,
  Cpu, Brain, Layers,
} from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import Logo from '@/components/ui/Logo'

// ── Types ─────────────────────────────────────────────────
type Tool = 'image' | 'website' | 'video' | 'builder'

interface Plan {
  plan:             string
  title:            string
  description:      string
  features:         { id: string; title: string; description: string }[]
  steps:            { stepNumber: number; title: string; description: string }[]
  totalSteps:       number
  estimatedCredits: number
}

// ── Marquee prompts ───────────────────────────────────────
const ROW1 = [
  { prompt: 'Futuristic city at night neon lights cyberpunk', label: 'Futuristic City' },
  { prompt: 'Majestic lion golden hour cinematic lighting', label: 'Majestic Lion' },
  { prompt: 'Abstract fluid art deep blue gold colors', label: 'Abstract Art' },
  { prompt: 'Mountain landscape sunrise misty valleys', label: 'Mountain Sunrise' },
  { prompt: 'Fantasy warrior in armor magical forest', label: 'Fantasy Warrior' },
  { prompt: 'Underwater coral reef colorful fish', label: 'Ocean World' },
  { prompt: 'Space station orbiting Earth photorealistic', label: 'Space Station' },
  { prompt: 'Ancient temple jungle overgrown vines', label: 'Ancient Temple' },
]

const ROW2 = [
  { prompt: 'Cozy coffee shop rainy day warm lighting bokeh', label: 'Cozy Cafe' },
  { prompt: 'Dragon flying medieval castle dramatic sky', label: 'Dragon Castle' },
  { prompt: 'Northern lights snowy forest night sky', label: 'Aurora Borealis' },
  { prompt: 'Cyberpunk girl neon hair portrait city', label: 'Cyberpunk Portrait' },
  { prompt: 'Desert dunes sunset golden hour aerial', label: 'Desert Sunset' },
  { prompt: 'Steampunk clockwork machine brass gears', label: 'Steampunk Machine' },
  { prompt: 'Cherry blossom garden Japan spring pink', label: 'Cherry Blossoms' },
  { prompt: 'Volcano erupting dramatic lightning dark sky', label: 'Volcano Lightning' },
]

// ── Video samples (poster only) ───────────────────────────
const VIDEO_SAMPLES = [
  { prompt: 'Slow cinematic pan misty mountains golden hour', label: 'Mountain Vista',    duration: '5s' },
  { prompt: 'Ocean waves crashing rocks slow motion dramatic', label: 'Ocean Waves',       duration: '5s' },
  { prompt: 'City timelapse night lights cars streaks', label: 'City Timelapse',     duration: '5s' },
  { prompt: 'Forest rain drops falling leaves close up', label: 'Forest Rain',        duration: '5s' },
  { prompt: 'Fire burning embers sparks dark background', label: 'Fire & Embers',     duration: '5s' },
  { prompt: 'Aurora borealis dancing green purple sky', label: 'Aurora Night',        duration: '5s' },
]

// ── Website samples ───────────────────────────────────────
const WEBSITE_SAMPLES = [
  { prompt: 'Modern SaaS landing page for project management tool dark theme', label: 'SaaS Landing Page'   },
  { prompt: 'Restaurant website fine dining elegant minimalist', label: 'Restaurant Site'      },
  { prompt: 'Portfolio website creative designer bold colorful', label: 'Designer Portfolio'   },
  { prompt: 'Fitness app landing page energetic dark modern', label: 'Fitness App'            },
]

// ── Tool config ───────────────────────────────────────────
const TOOLS: {
  id:          Tool
  label:       string
  icon:        any
  placeholder: string
  cost:        string
  free:        boolean
}[] = [
  { id: 'image',   label: 'Image',      icon: ImageIcon, placeholder: 'A majestic lion at golden hour, cinematic lighting...',                         cost: '4 credits',    free: true  },
  { id: 'website', label: 'Website',    icon: Globe,     placeholder: 'A landing page for a fitness app called FitTrack for busy professionals...',    cost: '20 credits',   free: true  },
  { id: 'video',   label: 'Video',      icon: Video,     placeholder: 'A slow cinematic pan over misty mountains at golden hour...',                   cost: '40 credits',   free: false },
  { id: 'builder', label: 'AI Builder', icon: Code2,     placeholder: 'I want to build a food delivery app with restaurants, cart and payments...',    cost: 'Free preview', free: true  },
]

// ── AI Models ─────────────────────────────────────────────
const AI_MODELS = [
  {
    tool:    'Image Generation',
    model:   'FLUX 1.1 Pro',
    maker:   'Black Forest Labs',
    desc:    'State of the art text-to-image model. Photorealistic quality with exceptional prompt adherence.',
    icon:    ImageIcon,
    color:   '#7B2FBE',
    badge:   'Best quality',
  },
  {
    tool:    'Video Generation',
    model:   'Wan 2.1',
    maker:   'WaveSpeed AI',
    desc:    'High quality text-to-video generation. Cinematic motion with realistic physics.',
    icon:    Video,
    color:   '#4F8EF7',
    badge:   'Cinematic',
  },
  {
    tool:    'Website Builder',
    model:   'Claude Sonnet 4',
    maker:   'Anthropic',
    desc:    'Advanced language model that generates complete, production-ready HTML websites from descriptions.',
    icon:    Globe,
    color:   '#00C2FF',
    badge:   'Production ready',
  },
  {
    tool:    'AI Code Builder',
    model:   'Claude Sonnet 4',
    maker:   'Anthropic',
    desc:    'Generates complete codebases with MongoDB, Node.js and Next.js. Step by step with explanations.',
    icon:    Code2,
    color:   '#7B2FBE',
    badge:   'Full stack',
  },
]

// ── Comparison data ───────────────────────────────────────
const COMPETITORS = [
  { name: 'Midjourney', logo: '🎨', price: '$10/mo',        tools: 1, expires: true  },
  { name: 'Runway',     logo: '🎬', price: '$15/mo',        tools: 1, expires: true  },
  { name: 'Lovable',    logo: '💜', price: '$25/mo',        tools: 1, expires: true  },
  { name: 'All three',  logo: '😰', price: '$50/mo',        tools: 3, expires: true  },
  { name: 'Studio42',   logo: '⚡', price: 'Pay as you go', tools: 4, expires: false, highlight: true },
]

const SAVINGS = [
  { scenario: 'Freelancer needing 10 images for a client',  others: '$10/mo forced',  ours: '$0.50',  saving: '95% cheaper' },
  { scenario: 'Building a landing page for a startup',      others: '$25/mo Lovable', ours: '$1.00',  saving: '97% cheaper' },
  { scenario: 'Creating 5 videos for a campaign',           others: '$15/mo Runway',  ours: '$10.00', saving: '33% cheaper' },
  { scenario: 'Building a full ecommerce app',              others: '$50/mo bundle',  ours: '$12.25', saving: '75% cheaper' },
]

// ── Pollinations image URL ────────────────────────────────
const pollinationsUrl = (prompt: string, w = 400, h = 300) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${Math.abs(prompt.split('').reduce((a, c) => a + c.charCodeAt(0), 0))}`

// ── Marquee component ─────────────────────────────────────
function MarqueeRow({
  items,
  direction = 'left',
  speed = 40,
}: {
  items: { prompt: string; label: string }[]
  direction?: 'left' | 'right'
  speed?: number
}) {
  const doubled = [...items, ...items]

  return (
    <div className="overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #0D0F1A, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #0D0F1A, transparent)' }} />

      <div
        className="flex gap-3"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
          width: 'max-content',
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="relative rounded-xl overflow-hidden shrink-0 group cursor-pointer"
            style={{ width: '200px', height: '150px' }}
          >
            <img
              src={pollinationsUrl(item.prompt, 200, 150)}
              alt={item.label}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end p-2 opacity-0 group-hover:opacity-100">
              <span className="text-white text-xs font-medium">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

// ── Video poster card ─────────────────────────────────────
function VideoPosterCard({ item }: { item: { prompt: string; label: string; duration: string } }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div
      className="relative rounded-2xl overflow-hidden group cursor-pointer"
      style={{ aspectRatio: '16/9', border: '1px solid rgba(255,255,255,0.08)' }}
      onClick={() => setPlaying(true)}
    >
      {/* Poster image from Pollinations */}
      <img
        src={pollinationsUrl(item.prompt + ' cinematic still', 400, 225)}
        alt={item.label}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all" />

      {/* Play button */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all group-hover:scale-110"
            style={{ background: 'rgba(123,47,190,0.8)', border: '2px solid rgba(255,255,255,0.3)' }}
          >
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </div>
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-3"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
      >
        <p className="text-white text-xs font-medium">{item.label}</p>
        <p className="text-white/50 text-[10px]">{item.duration} · Sign up to generate</p>
      </div>
    </div>
  )
}

// ── Website preview card ──────────────────────────────────
function WebsitePreviewCard({ item }: { item: { prompt: string; label: string } }) {
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = async () => {
    if (loaded || loading) return
    setLoading(true)
    try {
      const res = await api.post('/free/website/generate', { prompt: item.prompt })
      setHtml(res.data.html)
      setLoaded(true)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden group cursor-pointer"
      style={{
        aspectRatio: '4/3',
        border:      '1px solid rgba(255,255,255,0.08)',
        background:  'rgba(255,255,255,0.02)',
      }}
      onMouseEnter={load}
    >
      {!loaded && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Globe className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.2)' }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Hover to preview
          </p>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7B2FBE' }} />
        </div>
      )}

      {html && (
        <iframe
          srcDoc={html}
          className="w-full h-full border-0 pointer-events-none"
          style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
          sandbox="allow-scripts"
          title={item.label}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />

      {/* Label */}
      <div
        className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
      >
        <p className="text-white text-xs font-medium">{item.label}</p>
      </div>
    </div>
  )
}

// ── Main landing page ─────────────────────────────────────
export default function LandingPage() {
  const [activeTool,   setActiveTool]   = useState<Tool>('image')
  const [activeTab,    setActiveTab]    = useState<Tool>('image')
  const [prompt,       setPrompt]       = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [mobileMenu,   setMobileMenu]   = useState(false)

  // Results
  const [imageJobId,   setImageJobId]   = useState<string | null>(null)
  const [imageUrl,     setImageUrl]     = useState<string | null>(null)
  const [imagePolling, setImagePolling] = useState(false)
  const [websiteHtml,  setWebsiteHtml]  = useState<string | null>(null)
  const [builderPlans, setBuilderPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const currentTool = TOOLS.find((t) => t.id === activeTool)!

  useEffect(() => {
    setImageUrl(null)
    setImageJobId(null)
    setImagePolling(false)
    setWebsiteHtml(null)
    setBuilderPlans([])
    setSelectedPlan(null)
    setError('')
    setPrompt('')
  }, [activeTool])

  useEffect(() => {
    if (!imageJobId || !imagePolling) return
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/free/jobs/poll/${imageJobId}`)
        if (res.data.status === 'succeeded') {
          const out = res.data.output
          setImageUrl(Array.isArray(out) ? out[0] : out)
          setImagePolling(false)
          setLoading(false)
          clearInterval(interval)
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        } else if (res.data.status === 'failed') {
          setError('Generation failed. Please try again.')
          setImagePolling(false)
          setLoading(false)
          clearInterval(interval)
        }
      } catch { }
    }, 3000)
    return () => clearInterval(interval)
  }, [imageJobId, imagePolling])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setImageUrl(null)
    setWebsiteHtml(null)
    setBuilderPlans([])
    setSelectedPlan(null)

    try {
      if (activeTool === 'image') {
        const res = await api.post('/free/image/generate', { prompt: prompt.trim() })
        setImageJobId(res.data.replicateId)
        setImagePolling(true)
      } else if (activeTool === 'website') {
        const res = await api.post('/free/website/generate', { prompt: prompt.trim() })
        setWebsiteHtml(res.data.html)
        setLoading(false)
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      } else if (activeTool === 'video') {
        window.location.href = `/register?redirect=video&prompt=${encodeURIComponent(prompt)}`
      } else if (activeTool === 'builder') {
        const res = await api.post('/free/builder/plan', { description: prompt.trim() })
        setBuilderPlans(res.data.plans)
        setSelectedPlan(res.data.plans[1] || res.data.plans[0])
        setLoading(false)
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Generation failed.')
      setLoading(false)
    }
  }

  const hasResult    = imageUrl || websiteHtml || builderPlans.length > 0
  const isGenerating = loading || imagePolling

  return (
    <div className="min-h-screen text-white" style={{ background: '#0D0F1A' }}>

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ background: 'rgba(13,15,26,0.9)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-6">
            <a href="#models"  className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >AI Models</a>
            <a href="#compare" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >Pricing</a>
            <Link href="/login" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>Sign in</Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-white text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', boxShadow: '0 4px 16px rgba(123,47,190,0.3)' }}
            >
              Start free
            </Link>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0D0F1A' }}>
            <a href="#models"  className="text-sm py-2" style={{ color: 'rgba(255,255,255,0.6)' }}>AI Models</a>
            <a href="#compare" className="text-sm py-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Pricing</a>
            <Link href="/login"    className="text-sm py-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Sign in</Link>
            <Link href="/register" className="py-2.5 px-4 rounded-xl text-sm text-center font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' }}>Start free</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-8">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(ellipse, rgba(123,47,190,0.18) 0%, rgba(79,142,247,0.10) 50%, transparent 70%)',
              animation: 'pulse-glow 4s ease-in-out infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
            50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
          }
        `}</style>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8"
            style={{ borderColor: 'rgba(123,47,190,0.4)', background: 'rgba(123,47,190,0.12)', color: '#C4A8FF' }}
          >
            <Zap className="w-4 h-4" fill="currentColor" />
            No subscription · Pay as you go · Credits never expire
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight mb-5">
            Everything you imagine.
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 50%, #00C2FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Built by AI.
            </span>
          </h1>

          <p className="text-xl mb-5 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Images, videos, websites and complete codebases.
            One platform. One credit wallet. Pay only when you create.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 text-sm">
            {[
              { icon: Check, text: 'Pay as you go',        color: '#10B981' },
              { icon: Check, text: 'Credits never expire', color: '#10B981' },
              { icon: Check, text: 'Multiple AI models',   color: '#10B981' },
              { icon: Check, text: 'Full project download', color: '#10B981' },
            ].map((f) => (
              <span key={f.text} className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <Check className="w-4 h-4" style={{ color: f.color }} />
                {f.text}
              </span>
            ))}
          </div>

          {/* ── Chat box ── */}
          <div className="max-w-2xl mx-auto mb-4">
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                border:         '1px solid rgba(123,47,190,0.25)',
                background:     'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                boxShadow:      '0 0 60px rgba(123,47,190,0.12)',
              }}
            >
              {/* Tool tabs */}
              <div className="flex items-center gap-1 p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {TOOLS.map((tool) => {
                  const Icon     = tool.icon
                  const isActive = activeTool === tool.id
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center"
                      style={isActive ? {
                        background: 'linear-gradient(135deg, rgba(123,47,190,0.3), rgba(79,142,247,0.2))',
                        color: 'white',
                      } : { color: 'rgba(255,255,255,0.35)' }}
                    >
                      <Icon className="w-4 h-4" style={isActive ? { color: '#C4A8FF' } : {}} />
                      <span className="hidden sm:inline">{tool.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Prompt */}
              <div className="p-4">
                <textarea
                  className="w-full bg-transparent text-sm resize-none focus:outline-none leading-relaxed"
                  style={{ color: 'white' }}
                  placeholder={currentTool.placeholder}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  disabled={isGenerating}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate() } }}
                />
                <style>{`textarea::placeholder { color: rgba(255,255,255,0.25); }`}</style>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 pb-4 gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                    style={{ borderColor: 'rgba(123,47,190,0.3)', background: 'rgba(123,47,190,0.12)', color: '#C4A8FF' }}
                  >
                    ⚡ {currentTool.cost}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {currentTool.free ? 'Free · No signup' : 'Requires account'}
                  </span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 60%, #00C2FF 100%)', boxShadow: '0 4px 20px rgba(123,47,190,0.3)' }}
                >
                  {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate</>}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            {!hasResult && !isGenerating && (
              <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.18)' }}>
                Press Enter · Image, Website & Builder are free · No account needed
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Result section ── */}
      {(isGenerating || hasResult) && (
        <section ref={resultRef} className="max-w-4xl mx-auto px-4 pb-12">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(255,255,255,0.02)' }}>
            {isGenerating && (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' }}>
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">
                    {activeTool === 'image' && 'Creating your image…'}
                    {activeTool === 'website' && 'Building your website…'}
                    {activeTool === 'builder' && 'Analyzing your project…'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {activeTool === 'image' && 'Usually 10–30 seconds'}
                    {activeTool === 'website' && 'Usually 15–30 seconds'}
                    {activeTool === 'builder' && 'Usually 10–20 seconds'}
                  </p>
                </div>
              </div>
            )}

            {imageUrl && !isGenerating && (
              <div className="relative group">
                <img src={imageUrl} alt={prompt} className="w-full max-h-[500px] object-contain bg-black" />
                <div className="absolute bottom-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.6)' }}>
                  Studio42.ai
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <Link href="/register" className="bg-white text-gray-900 font-bold px-6 py-3 rounded-xl text-sm shadow-xl">
                    Sign up to download full resolution →
                  </Link>
                </div>
              </div>
            )}

            {websiteHtml && (
              <div>
                <iframe srcDoc={websiteHtml} className="w-full border-0" style={{ height: '500px' }} sandbox="allow-scripts" title="Preview" />
                <div className="p-4 flex items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign up to download without watermark</p>
                  <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' }}>
                    Get 30 free credits →
                  </Link>
                </div>
              </div>
            )}

            {builderPlans.length > 0 && !isGenerating && (
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {builderPlans.map((plan) => {
                    const isSelected = selectedPlan?.plan === plan.plan
                    return (
                      <div
                        key={plan.plan}
                        onClick={() => setSelectedPlan(plan)}
                        className="rounded-xl p-4 cursor-pointer transition-all space-y-3"
                        style={{
                          background: isSelected ? 'rgba(123,47,190,0.12)' : 'rgba(255,255,255,0.03)',
                          border:     isSelected ? '1px solid rgba(123,47,190,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          boxShadow:  isSelected ? '0 0 0 2px rgba(123,47,190,0.4)' : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(123,47,190,0.2)', color: '#C4A8FF' }}>
                            {plan.plan}
                          </span>
                          <span className="text-sm font-bold" style={{ color: '#93C5FD' }}>~{plan.estimatedCredits} cr</span>
                        </div>
                        <h3 className="font-bold text-white text-sm">{plan.title}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.description}</p>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{plan.totalSteps} steps</div>
                        <div className="space-y-1.5">
                          {plan.features.slice(0, 3).map((f) => (
                            <div key={f.id} className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{f.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {selectedPlan && (
                  <div className="rounded-xl p-5 text-center"
                    style={{ background: 'rgba(123,47,190,0.1)', border: '1px solid rgba(123,47,190,0.2)' }}>
                    <p className="font-bold text-white mb-1">Ready to build {selectedPlan.title}?</p>
                    <p className="text-sm mb-4" style={{ color: 'rgba(196,168,255,0.7)' }}>
                      Needs ~{selectedPlan.estimatedCredits} credits · Sign up free and get 30 to start
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href={`/register?plan=${selectedPlan.plan}&desc=${encodeURIComponent(prompt)}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7, #00C2FF)' }}>
                        Sign up free — start building <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link href="/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                        Already have an account
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Marquee gallery ── */}
      <section className="py-12 space-y-3 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-center mb-6">
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Generated with Studio42 · FLUX 1.1 Pro
          </p>
        </div>
        <MarqueeRow items={ROW1} direction="left"  speed={50} />
        <MarqueeRow items={ROW2} direction="right" speed={40} />
      </section>

      {/* ── Sample showcase tabs ── */}
      <section className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3">See what Studio42 creates</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>
              Real outputs from our AI models
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[
              { id: 'image'   as Tool, label: 'Images',   icon: ImageIcon },
              { id: 'video'   as Tool, label: 'Videos',   icon: Video     },
              { id: 'website' as Tool, label: 'Websites', icon: Globe     },
            ].map((tab) => {
              const Icon     = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(123,47,190,0.3), rgba(79,142,247,0.2))',
                    border:     '1px solid rgba(123,47,190,0.4)',
                    color:      'white',
                  } : {
                    border: '1px solid rgba(255,255,255,0.08)',
                    color:  'rgba(255,255,255,0.4)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Image grid */}
          {activeTab === 'image' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ROW1.slice(0, 4).map((item, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden group" style={{ aspectRatio: '1', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img
                    src={pollinationsUrl(item.prompt, 300, 300)}
                    alt={item.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <p className="text-white text-xs font-medium">{item.label}</p>
                    <p className="text-white/50 text-[10px]">{item.prompt}</p>
                  </div>
                </div>
              ))}
              {ROW2.slice(0, 4).map((item, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden group" style={{ aspectRatio: '1', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img
                    src={pollinationsUrl(item.prompt, 300, 300)}
                    alt={item.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <p className="text-white text-xs font-medium">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Video grid */}
          {activeTab === 'video' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VIDEO_SAMPLES.map((item, i) => (
                <VideoPosterCard key={i} item={item} />
              ))}
            </div>
          )}

          {/* Website grid */}
          {activeTab === 'website' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WEBSITE_SAMPLES.map((item, i) => (
                <WebsitePreviewCard key={i} item={item} />
              ))}
            </div>
          )}

          {/* CTA below samples */}
          <div className="text-center mt-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', boxShadow: '0 4px 16px rgba(123,47,190,0.3)' }}
            >
              Create something like this — free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI Models section ── */}
      <section id="models" className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-6"
              style={{ borderColor: 'rgba(79,142,247,0.3)', background: 'rgba(79,142,247,0.08)', color: '#93C5FD' }}>
              <Cpu className="w-4 h-4" />
              Powered by the best AI models
            </div>
            <h2 className="text-3xl font-black text-white mb-3">
              Only the best models
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>
              We integrate the highest quality AI models available —
              so you always get professional results.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {AI_MODELS.map((m) => {
              const Icon = m.icon
              return (
                <div
                  key={m.tool}
                  className="rounded-2xl p-6 space-y-4"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${m.color}25`, border: `1px solid ${m.color}40` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: m.color }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {m.tool}
                        </p>
                        <h3 className="font-black text-white text-lg leading-tight">
                          {m.model}
                        </h3>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          by {m.maker}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                      style={{ background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}30` }}
                    >
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {m.desc}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Model logos row */}
          <div
            className="mt-8 rounded-2xl p-5 flex flex-wrap items-center justify-center gap-6"
            style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
          >
            <p className="text-xs w-full text-center mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Powered by
            </p>
            {[
              { name: 'Black Forest Labs', color: '#7B2FBE' },
              { name: 'WaveSpeed AI',      color: '#4F8EF7' },
              { name: 'Anthropic',         color: '#00C2FF' },
              { name: 'Replicate',         color: '#7B2FBE' },
            ].map((brand) => (
              <span
                key={brand.name}
                className="text-sm font-bold px-4 py-2 rounded-xl"
                style={{
                  background: `${brand.color}12`,
                  border:     `1px solid ${brand.color}25`,
                  color:      brand.color,
                }}
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools overview ── */}
      <section id="tools" className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Everything you need to create</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Four powerful AI tools. One credit wallet.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <div
                  key={tool.id}
                  className="rounded-2xl p-5 space-y-4 cursor-pointer transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(123,47,190,0.08)'; e.currentTarget.style.borderColor = 'rgba(123,47,190,0.3)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
                  onClick={() => { setActiveTool(tool.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{tool.label}</h3>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {tool.id === 'image'   && 'FLUX 1.1 Pro — photorealistic images'}
                      {tool.id === 'website' && 'Complete websites in 30 seconds'}
                      {tool.id === 'video'   && 'Cinematic clips up to 10 seconds'}
                      {tool.id === 'builder' && 'Full codebases step by step'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#93C5FD' }}>⚡ {tool.cost}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section id="compare" className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-6"
              style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#FCA5A5' }}>
              <TrendingDown className="w-4 h-4" /> Why pay more for less?
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Stop the subscription madness</h2>
            <p className="max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              The average developer pays $50–100/month for AI tools they use occasionally.
            </p>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden mb-12" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="grid grid-cols-4 p-4 text-xs font-bold uppercase tracking-wider"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
              <div>Platform</div>
              <div className="text-center">Price</div>
              <div className="text-center">Tools</div>
              <div className="text-center">Expires?</div>
            </div>
            {COMPETITORS.map((c, i) => (
              <div key={c.name} className="grid grid-cols-4 p-4 items-center"
                style={{
                  borderBottom: i !== COMPETITORS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background:   (c as any).highlight ? 'rgba(123,47,190,0.08)' : 'transparent',
                  borderLeft:   (c as any).highlight ? '3px solid #7B2FBE' : '3px solid transparent',
                }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.logo}</span>
                  <span className={cn('font-semibold text-sm', (c as any).highlight ? 'text-white' : 'text-white/50')}>{c.name}</span>
                  {(c as any).highlight && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', color: 'white' }}>YOU</span>
                  )}
                </div>
                <div className="text-center">
                  <span className={cn('text-sm font-bold', (c as any).highlight ? 'text-emerald-400' : 'text-rose-400')}>{c.price}</span>
                </div>
                <div className="text-center">
                  <span className={cn('text-sm font-bold', (c as any).highlight ? 'text-white' : 'text-white/40')}>{c.tools}</span>
                </div>
                <div className="text-center">
                  {c.expires
                    ? <span className="text-xs text-rose-400 font-semibold">✗ Yes</span>
                    : <span className="text-xs text-emerald-400 font-semibold">✓ Never</span>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Savings */}
          <h3 className="text-xl font-black text-white text-center mb-6">Real world savings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAVINGS.map((s, i) => (
              <div key={i} className="rounded-2xl p-5 space-y-3"
                style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.scenario}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Others</span>
                    <span className="text-sm font-bold text-rose-400">{s.others}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Studio42</span>
                    <span className="text-sm font-bold text-emerald-400">{s.ours}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>You save</span>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399' }}>{s.saving}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAYG vs subscription */}
          <div className="mt-12 rounded-2xl p-8" style={{ border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(123,47,190,0.05)' }}>
            <h3 className="text-xl font-black text-white text-center mb-8">The pay-as-you-go difference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-rose-400 font-bold text-sm flex items-center gap-2">
                  <X className="w-4 h-4" /> Subscription model
                </h4>
                {[
                  'Pay $50/month whether you use it or not',
                  'Credits expire at end of month',
                  'Locked into one tool per subscription',
                  'Cancel and lose everything immediately',
                  'Price increases as platform grows',
                  'Vendor lock-in — hard to switch',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" /> Pay as you go (Studio42)
                </h4>
                {[
                  'Pay only when you actually create something',
                  'Credits never expire — use them in 2 years',
                  'All 4 tools with one credit wallet',
                  'Stop anytime — your credits stay forever',
                  'Price locked — credits always worth the same',
                  'Download everything — zero vendor lock-in',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-3">Simple, honest pricing</h2>
          <p className="mb-12" style={{ color: 'rgba(255,255,255,0.4)' }}>Buy once. Use whenever. 20 credits = $1. Never expires.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { credits: 100,  price: 5,  desc: '~25 images',  popular: false },
              { credits: 250,  price: 10, desc: '~62 images',  popular: true  },
              { credits: 600,  price: 20, desc: '~150 images', popular: false },
              { credits: 1500, price: 40, desc: '~375 images', popular: false },
            ].map((pkg) => (
              <div key={pkg.credits} className="relative rounded-2xl p-5 text-center"
                style={{
                  border:     pkg.popular ? '1px solid rgba(123,47,190,0.5)' : '1px solid rgba(255,255,255,0.07)',
                  background: pkg.popular ? 'rgba(123,47,190,0.1)' : 'rgba(255,255,255,0.02)',
                }}>
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', color: 'white' }}>Popular</span>
                )}
                <div className="text-2xl font-black text-white">{pkg.credits}</div>
                <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>credits</div>
                <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{pkg.desc}</div>
                <div className="text-xl font-black"
                  style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ${pkg.price}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {['Credits never expire', 'No subscription', 'Stripe secured', 'Instant delivery'].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />{f}
              </span>
            ))}
          </div>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base"
            style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 60%, #00C2FF 100%)', boxShadow: '0 8px 32px rgba(123,47,190,0.3)' }}>
            Start with 30 free credits <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>No credit card required</p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 text-center relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px]"
            style={{ background: 'rgba(123,47,190,0.1)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <Logo size={64} showText={false} />
          <div className="mt-4 mb-2 text-6xl font-black text-white">Studio42</div>
          <p className="text-lg mb-4 font-medium"
            style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7, #00C2FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Everything you imagine. Built by AI.
          </p>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
            In The Hitchhiker's Guide, 42 is the answer to life, the universe and everything.
            Studio42 is the answer to all your AI creation needs.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-white text-gray-900 hover:bg-gray-100 transition-all shadow-2xl">
            Get started free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={28} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} Studio42.ai · Everything you imagine. Built by AI.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login"    className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Sign in</Link>
            <Link href="/register" className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Register</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}