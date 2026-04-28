'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ImageIcon, Video, Globe, Code2,
  Check, ArrowRight, Loader2, AlertCircle,
  X, ChevronDown, TrendingDown,
  Sparkles, Menu, Zap, Play,
} from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import Logo from '@/components/ui/Logo'

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

// ── Local image paths ─────────────────────────────────────
const ROW1 = [
  { src: '/samples/r1-city.jpg',       label: 'Futuristic City'    },
  { src: '/samples/r1-lion.jpg',       label: 'Majestic Lion'      },
  { src: '/samples/r1-abstract.jpg',   label: 'Abstract Art'       },
  { src: '/samples/r1-mountain.jpg',   label: 'Mountain Sunrise'   },
  { src: '/samples/r1-warrior.jpg',    label: 'Fantasy Warrior'    },
  { src: '/samples/r1-underwater.jpg', label: 'Ocean World'        },
  { src: '/samples/r1-space.jpg',      label: 'Space Station'      },
  { src: '/samples/r1-temple.jpg',     label: 'Ancient Temple'     },
]

const ROW2 = [
  { src: '/samples/r2-cafe.jpg',       label: 'Cozy Cafe'          },
  { src: '/samples/r2-dragon.jpg',     label: 'Dragon Castle'      },
  { src: '/samples/r2-aurora.jpg',     label: 'Aurora Borealis'    },
  { src: '/samples/r2-cyberpunk.jpg',  label: 'Cyberpunk Portrait' },
  { src: '/samples/r2-desert.jpg',     label: 'Desert Sunset'      },
  { src: '/samples/r2-steampunk.jpg',  label: 'Steampunk Machine'  },
  { src: '/samples/r2-cherry.jpg',     label: 'Cherry Blossoms'    },
  { src: '/samples/r2-volcano.jpg',    label: 'Volcano Lightning'  },
]

const VIDEO_SAMPLES = [
  { src: '/samples/v-mountains.jpg', label: 'Mountain Vista',   duration: '5s' },
  { src: '/samples/v-ocean.jpg',     label: 'Ocean Waves',      duration: '5s' },
  { src: '/samples/v-city.jpg',      label: 'City Timelapse',   duration: '5s' },
  { src: '/samples/v-forest.jpg',    label: 'Forest Rain',      duration: '5s' },
  { src: '/samples/v-fire.jpg',      label: 'Fire & Embers',    duration: '5s' },
  { src: '/samples/v-aurora.jpg',    label: 'Aurora Night',     duration: '5s' },
]

const SHOWCASE_IMAGES = [
  { src: '/samples/s1.jpg', label: 'Futuristic City'    },
  { src: '/samples/s2.jpg', label: 'Majestic Lion'      },
  { src: '/samples/s3.jpg', label: 'Abstract Art'       },
  { src: '/samples/s4.jpg', label: 'Mountain Sunrise'   },
  { src: '/samples/s5.jpg', label: 'Cozy Cafe'          },
  { src: '/samples/s6.jpg', label: 'Dragon Castle'      },
  { src: '/samples/s7.jpg', label: 'Aurora Borealis'    },
  { src: '/samples/s8.jpg', label: 'Cyberpunk Portrait' },
]

// ── Tool config ───────────────────────────────────────────
const TOOLS = [
  { id: 'image'   as Tool, label: 'Image',      icon: ImageIcon, placeholder: 'A majestic lion at golden hour, cinematic lighting...',                      cost: '4 credits',    free: true  },
  { id: 'website' as Tool, label: 'Website',    icon: Globe,     placeholder: 'A landing page for a fitness app called FitTrack for busy professionals...', cost: '20 credits',   free: true  },
  { id: 'video'   as Tool, label: 'Video',      icon: Video,     placeholder: 'A slow cinematic pan over misty mountains at golden hour...',                cost: '40 credits',   free: false },
  { id: 'builder' as Tool, label: 'AI Builder', icon: Code2,     placeholder: 'I want to build a food delivery app with restaurants, cart and payments...',  cost: 'Free preview', free: true  },
]

// ── AI Models ─────────────────────────────────────────────
const AI_MODELS = [
  { tool: 'Image Generation', model: 'FLUX 1.1 Pro',    maker: 'Black Forest Labs', icon: ImageIcon, desc: 'State of the art photorealistic image generation with exceptional prompt adherence.',  badge: 'Best quality',    color: '#7B2FBE' },
  { tool: 'Video Generation', model: 'Wan 2.1',         maker: 'WaveSpeed AI',      icon: Video,     desc: 'Cinematic text-to-video generation with realistic motion and dramatic composition.',    badge: 'Cinematic',       color: '#4F8EF7' },
  { tool: 'Website Builder',  model: 'Claude Sonnet 4', maker: 'Anthropic',         icon: Globe,     desc: 'Advanced reasoning model generating complete production-ready websites instantly.',     badge: 'Production ready', color: '#00C2FF' },
  { tool: 'AI Code Builder',  model: 'Claude Sonnet 4', maker: 'Anthropic',         icon: Code2,     desc: 'Generates complete MongoDB + Node.js + Next.js codebases step by step.',                badge: 'Full stack',       color: '#7B2FBE' },
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

// ── Marquee row ───────────────────────────────────────────
function MarqueeRow({
  items,
  direction = 'left',
}: {
  items: { src: string; label: string }[]
  direction?: 'left' | 'right'
}) {
  const doubled = [...items, ...items]
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to right, #0D0F1A, transparent)' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to left, #0D0F1A, transparent)' }} />
      <div
        className={direction === 'left' ? 'marquee-left' : 'marquee-right'}
        style={{ display: 'flex', gap: '12px', width: 'max-content' }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="group"
            style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, width: '200px', height: '150px', cursor: 'pointer' }}
          >
            <img
              src={item.src}
              alt={item.label}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }}
              className="group-hover:scale-110"
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-end p-2"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <span style={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Video poster card ─────────────────────────────────────
function VideoPosterCard({ item }: { item: { src: string; label: string; duration: string } }) {
  return (
    <div
      className="group"
      style={{
        position: 'relative', borderRadius: '16px', overflow: 'hidden',
        aspectRatio: '16/9', cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <img
        src={item.src}
        alt={item.label}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }}
        className="group-hover:scale-105"
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', transition: 'background 0.2s' }} />

      {/* Play button */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: '48px', height: '48px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(123,47,190,0.85)', border: '2px solid rgba(255,255,255,0.3)',
            transition: 'transform 0.2s',
          }}
          className="group-hover:scale-110"
        >
          <Play size={20} color="white" fill="white" style={{ marginLeft: '2px' }} />
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        }}
      >
        <p style={{ color: 'white', fontSize: '12px', fontWeight: 600, margin: 0 }}>{item.label}</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: '2px 0 0' }}>{item.duration} · Sign up to generate</p>
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
  const [imageJobId,   setImageJobId]   = useState<string | null>(null)
  const [imageUrl,     setImageUrl]     = useState<string | null>(null)
  const [imagePolling, setImagePolling] = useState(false)
  const [websiteHtml,  setWebsiteHtml]  = useState<string | null>(null)
  const [builderPlans, setBuilderPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const currentTool = TOOLS.find(t => t.id === activeTool)!

  useEffect(() => {
    setImageUrl(null); setImageJobId(null); setImagePolling(false)
    setWebsiteHtml(null); setBuilderPlans([]); setSelectedPlan(null)
    setError(''); setPrompt('')
  }, [activeTool])

  useEffect(() => {
    if (!imageJobId || !imagePolling) return
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/free/jobs/poll/${imageJobId}`)
        if (res.data.status === 'succeeded') {
          const out = res.data.output
          setImageUrl(Array.isArray(out) ? out[0] : out)
          setImagePolling(false); setLoading(false)
          clearInterval(interval)
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        } else if (res.data.status === 'failed') {
          setError('Generation failed. Please try again.')
          setImagePolling(false); setLoading(false); clearInterval(interval)
        }
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [imageJobId, imagePolling])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true); setError('')
    setImageUrl(null); setWebsiteHtml(null); setBuilderPlans([]); setSelectedPlan(null)
    try {
      if (activeTool === 'image') {
        const res = await api.post('/free/image/generate', { prompt: prompt.trim() })
        setImageJobId(res.data.replicateId); setImagePolling(true)
      } else if (activeTool === 'website') {
        const res = await api.post('/free/website/generate', { prompt: prompt.trim() })
        setWebsiteHtml(res.data.html); setLoading(false)
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
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'rgba(13,15,26,0.9)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size={60} showText = {true} />
          <div className="hidden md:flex items-center gap-6">
            {[['#try-free', 'Try free'], ['#samples', 'Examples'], ['#models', 'AI Models'], ['#compare', 'Pricing']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >{label}</a>
            ))}
            <Link href="/login" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" className="px-4 py-2 rounded-xl text-white text-sm font-bold transition-all" style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', boxShadow: '0 4px 16px rgba(123,47,190,0.3)', textDecoration: 'none' }}>
              Start free
            </Link>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2" style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0D0F1A' }}>
            <a href="#try-free" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>Try free</a>
            <a href="#models"   style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>AI Models</a>
            <a href="#compare"  style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>Pricing</a>
            <Link href="/login"    style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" className="py-2.5 px-4 rounded-xl text-center font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', textDecoration: 'none' }}>Start free</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-12">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(ellipse, rgba(123,47,190,0.18) 0%, rgba(79,142,247,0.10) 50%, transparent 70%)' }} />
          <div className="absolute top-32 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: 'rgba(123,47,190,0.06)' }} />
          <div className="absolute top-32 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: 'rgba(0,194,255,0.06)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8"
            style={{ borderColor: 'rgba(123,47,190,0.4)', background: 'rgba(123,47,190,0.12)', color: '#C4A8FF' }}>
            <Zap size={14} fill="currentColor" />
            No subscription · Pay as you go · Credits never expire
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', margin: '0 0 1.25rem' }}>
            Everything you imagine.
            <br />
            <span style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 50%, #00C2FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Built by AI.
            </span>
          </h1>

          <p className="text-xl mb-5 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
            Images, videos, websites and complete codebases.
            One platform. One credit wallet. Pay only when you create.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm">
            {['Pay as you go', 'Credits never expire', 'Multiple AI models', 'Full project download'].map(f => (
              <span key={f} className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <Check size={14} color="#10B981" /> {f}
              </span>
            ))}
          </div>

          {/* ── Chat box ── */}
          <div id="try-free" className="max-w-2xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl"
              style={{ border: '1px solid rgba(123,47,190,0.25)', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(123,47,190,0.12)' }}>

              {/* Tool tabs */}
              <div className="flex items-center gap-1 p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {TOOLS.map(tool => {
                  const Icon   = tool.icon
                  const active = activeTool === tool.id
                  return (
                    <button key={tool.id} onClick={() => setActiveTool(tool.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all flex-1 justify-center"
                      style={active ? {
                        background: 'linear-gradient(135deg, rgba(123,47,190,0.3), rgba(79,142,247,0.2))',
                        border: '1px solid rgba(123,47,190,0.3)', color: 'white',
                      } : { color: 'rgba(255,255,255,0.35)', border: '1px solid transparent', background: 'transparent' }}
                    >
                      <Icon size={15} style={{ color: active ? '#C4A8FF' : undefined }} />
                      <span className="hidden sm:inline">{tool.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Prompt */}
              <div className="p-4">
                <textarea
                  rows={3}
                  disabled={isGenerating}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate() } }}
                  placeholder={currentTool.placeholder}
                  className="w-full bg-transparent text-sm resize-none focus:outline-none leading-relaxed"
                  style={{ color: 'white' }}
                />
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 pb-4 gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                    style={{ borderColor: 'rgba(123,47,190,0.3)', background: 'rgba(123,47,190,0.12)', color: '#C4A8FF' }}>
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
                  style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 60%, #00C2FF 100%)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(123,47,190,0.3)' }}
                >
                  {isGenerating ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><Sparkles size={15} /> Generate</>}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                <AlertCircle size={15} /> {error}
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

      {/* ── Result ── */}
      {(isGenerating || hasResult) && (
        <section ref={resultRef} className="max-w-4xl mx-auto px-4 pb-16">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(255,255,255,0.02)' }}>
            {isGenerating && (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' }}>
                  <Loader2 size={28} color="white" className="animate-spin" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white">{activeTool === 'image' ? 'Creating your image…' : activeTool === 'website' ? 'Building your website…' : 'Analyzing your project…'}</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{activeTool === 'image' ? 'Usually 10–30 seconds' : 'Usually 15–30 seconds'}</p>
                </div>
              </div>
            )}

            {imageUrl && !isGenerating && (
              <div className="relative group">
                <img src={imageUrl} alt={prompt} style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', background: 'black', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.6)', fontSize: '10px', padding: '4px 10px', borderRadius: '100px' }}>Studio42.ai</div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <Link href="/register" style={{ background: 'white', color: '#111', fontWeight: 700, padding: '12px 24px', borderRadius: '14px', fontSize: '14px', textDecoration: 'none' }}>
                    Sign up to download full resolution →
                  </Link>
                </div>
              </div>
            )}

            {websiteHtml && (
              <div>
                <iframe srcDoc={websiteHtml} style={{ width: '100%', height: '500px', border: 'none', display: 'block' }} sandbox="allow-scripts" title="Preview" />
                <div className="p-4 flex items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign up to download without watermark</p>
                  <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', textDecoration: 'none' }}>Get 30 free credits →</Link>
                </div>
              </div>
            )}

            {builderPlans.length > 0 && !isGenerating && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {builderPlans.map(plan => {
                    const isSelected = selectedPlan?.plan === plan.plan
                    return (
                      <div key={plan.plan} onClick={() => setSelectedPlan(plan)} className="rounded-xl p-4 cursor-pointer transition-all space-y-3"
                        style={{ background: isSelected ? 'rgba(123,47,190,0.12)' : 'rgba(255,255,255,0.03)', border: isSelected ? '1px solid rgba(123,47,190,0.5)' : '1px solid rgba(255,255,255,0.08)', outline: isSelected ? '2px solid rgba(123,47,190,0.3)' : 'none' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(123,47,190,0.2)', color: '#C4A8FF' }}>{plan.plan}</span>
                          <span className="text-sm font-bold" style={{ color: '#93C5FD' }}>~{plan.estimatedCredits} cr</span>
                        </div>
                        <h3 className="font-bold text-white text-sm">{plan.title}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.description}</p>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{plan.totalSteps} steps</div>
                        <div className="space-y-1.5">
                          {plan.features.slice(0, 3).map(f => (
                            <div key={f.id} className="flex items-center gap-1.5">
                              <Check size={11} color="#10B981" />
                              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{f.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {selectedPlan && (
                  <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(123,47,190,0.1)', border: '1px solid rgba(123,47,190,0.2)' }}>
                    <p className="font-bold text-white mb-1">Ready to build {selectedPlan.title}?</p>
                    <p className="text-sm mb-4" style={{ color: 'rgba(196,168,255,0.7)' }}>~{selectedPlan.estimatedCredits} credits · Sign up free, get 30 to start</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href={`/register?plan=${selectedPlan.plan}&desc=${encodeURIComponent(prompt)}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7, #00C2FF)', textDecoration: 'none' }}>
                        Sign up free — start building <ArrowRight size={15} />
                      </Link>
                      <Link href="/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
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

      {/* Scroll hint */}
      {!hasResult && !isGenerating && (
        <div className="flex justify-center pb-8 animate-bounce">
          <ChevronDown size={20} style={{ color: 'rgba(255,255,255,0.15)' }} />
        </div>
      )}

      {/* ── Marquee gallery ── */}
      <section className="py-12 space-y-3 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-center text-sm font-medium mb-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Generated with Studio42 · FLUX 1.1 Pro
        </p>
        <MarqueeRow items={ROW1} direction="left"  />
        <MarqueeRow items={ROW2} direction="right" />
      </section>

      {/* ── Sample showcase ── */}
      <section id="samples" className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px', color: 'white' }}>See what Studio42 creates</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>Real outputs from our AI models</p>
          </div>

          {/* Tab selector */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[
              { id: 'image'   as Tool, label: 'Images',   icon: ImageIcon },
              { id: 'video'   as Tool, label: 'Videos',   icon: Video     },
            ].map(tab => {
              const Icon   = tab.icon
              const active = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={active ? {
                    background: 'linear-gradient(135deg, rgba(123,47,190,0.3), rgba(79,142,247,0.2))',
                    border: '1px solid rgba(123,47,190,0.4)', color: 'white',
                  } : { border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', background: 'transparent' }}
                >
                  <Icon size={15} /> {tab.label}
                </button>
              )
            })}
          </div>

          {/* Image grid */}
          {activeTab === 'image' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SHOWCASE_IMAGES.map((item, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden group" style={{ aspectRatio: '1', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src={item.src} alt={item.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ display: 'block' }} />
                  <div className="absolute inset-0 transition-all" style={{ background: 'rgba(0,0,0,0)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
                  />
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

          <div className="text-center mt-8">
            <Link href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', boxShadow: '0 4px 16px rgba(123,47,190,0.3)', textDecoration: 'none' }}>
              Create something like this — free <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI Models ── */}
      <section id="models" className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-6"
              style={{ borderColor: 'rgba(79,142,247,0.3)', background: 'rgba(79,142,247,0.08)', color: '#93C5FD' }}>
              Powered by the best AI models
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px', color: 'white' }}>Only the best models.</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', maxWidth: '520px', margin: '0 auto' }}>
              We integrate the highest quality AI models — curated for reliability, quality and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {AI_MODELS.map(m => {
              const Icon = m.icon
              return (
                <div key={m.tool}
                  className="rounded-2xl p-6 space-y-4 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(123,47,190,0.06)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(123,47,190,0.25)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', borderRadius: '50%', background: `radial-gradient(circle, ${m.color}10 0%, transparent 70%)`, pointerEvents: 'none' }} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${m.color}20`, border: `1px solid ${m.color}30` }}>
                        <Icon size={20} style={{ color: m.color }} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>{m.tool}</p>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', lineHeight: 1, margin: 0 }}>{m.model}</h3>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>by {m.maker}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                      style={{ background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}25` }}>
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{m.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Powered by strip */}
          <div className="mt-6 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-4"
            style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
            <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>Powered by</span>
            {[{ name: 'Black Forest Labs', color: '#7B2FBE' }, { name: 'WaveSpeed AI', color: '#4F8EF7' }, { name: 'Anthropic', color: '#00C2FF' }, { name: 'Replicate', color: '#7B2FBE' }].map(b => (
              <span key={b.name} className="text-sm font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: `${b.color}12`, border: `1px solid ${b.color}25`, color: b.color }}>
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section id="compare" className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-6"
              style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#FCA5A5' }}>
              <TrendingDown size={14} /> Why pay more for less?
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px', color: 'white' }}>Stop the subscription madness.</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', maxWidth: '520px', margin: '0 auto' }}>
              The average developer pays $50–100/month for AI tools they barely use.
            </p>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden mb-10" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="grid grid-cols-4 p-4 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
              <div>Platform</div>
              <div className="text-center">Price</div>
              <div className="text-center">Tools</div>
              <div className="text-center">Expires?</div>
            </div>
            {COMPETITORS.map((c, i) => (
              <div key={c.name} className="grid grid-cols-4 p-4 items-center"
                style={{
                  borderBottom: i !== COMPETITORS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background:  (c as any).highlight ? 'rgba(123,47,190,0.08)' : 'transparent',
                  borderLeft:  (c as any).highlight ? '3px solid #7B2FBE'     : '3px solid transparent',
                }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '18px' }}>{c.logo}</span>
                  <span className="font-semibold text-sm" style={{ color: (c as any).highlight ? 'white' : 'rgba(255,255,255,0.5)' }}>{c.name}</span>
                  {(c as any).highlight && <span className="text-[9px] font-black px-2 py-0.5 rounded" style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', color: 'white' }}>YOU</span>}
                </div>
                <div className="text-center"><span className="text-sm font-bold" style={{ color: (c as any).highlight ? '#34D399' : '#F87171' }}>{c.price}</span></div>
                <div className="text-center"><span className="text-sm font-bold" style={{ color: (c as any).highlight ? 'white' : 'rgba(255,255,255,0.4)' }}>{c.tools}</span></div>
                <div className="text-center">
                  {c.expires
                    ? <span className="text-xs font-semibold" style={{ color: '#F87171' }}>✗ Yes</span>
                    : <span className="text-xs font-semibold" style={{ color: '#34D399' }}>✓ Never</span>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Savings grid */}
          <h3 className="text-xl font-bold text-white text-center mb-6">Real world savings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {SAVINGS.map((s, i) => (
              <div key={i} className="rounded-2xl p-5 space-y-3" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.scenario}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Others</span>
                    <span className="text-sm font-bold" style={{ color: '#F87171' }}>{s.others}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Studio42</span>
                    <span className="text-sm font-bold" style={{ color: '#34D399' }}>{s.ours}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>You save</span>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399' }}>{s.saving}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAYG vs subscription */}
          <div className="rounded-2xl p-8" style={{ border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(123,47,190,0.05)' }}>
            <h3 className="text-xl font-bold text-white text-center mb-8">The pay-as-you-go difference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: '#F87171' }}>
                  <X size={15} /> Subscription model
                </h4>
                {['Pay $50/month whether you use it or not', 'Credits expire at end of month', 'Locked into one tool per subscription', 'Cancel and lose everything immediately', 'Price increases as platform grows', 'Vendor lock-in — hard to switch'].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <X size={13} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: '#34D399' }}>
                  <Check size={15} /> Pay as you go (Studio42)
                </h4>
                {['Pay only when you actually create something', 'Credits never expire — use them in 2 years', 'All 4 tools with one credit wallet', 'Stop anytime — your credits stay forever', 'Price locked — always worth the same', 'Download everything — zero vendor lock-in'].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <Check size={13} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
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
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px', color: 'white' }}>Simple, honest pricing.</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginBottom: '3rem' }}>Buy once. Use whenever. 20 credits = $1. Never expires.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { credits: 100,  price: 5,  desc: '~25 images',  popular: false },
              { credits: 250,  price: 10, desc: '~62 images',  popular: true  },
              { credits: 600,  price: 20, desc: '~150 images', popular: false },
              { credits: 1500, price: 40, desc: '~375 images', popular: false },
            ].map(pkg => (
              <div key={pkg.credits} className="relative rounded-2xl p-5 text-center transition-all"
                style={{ border: pkg.popular ? '1px solid rgba(123,47,190,0.5)' : '1px solid rgba(255,255,255,0.07)', background: pkg.popular ? 'rgba(123,47,190,0.1)' : 'rgba(255,255,255,0.02)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', color: 'white' }}>Popular</span>
                )}
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{pkg.credits}</div>
                <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>credits</div>
                <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{pkg.desc}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>${pkg.price}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {['Credits never expire', 'No subscription', 'Stripe secured', 'Instant delivery'].map(f => (
              <span key={f} className="flex items-center gap-1.5"><Check size={14} color="#10B981" /> {f}</span>
            ))}
          </div>

          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base"
            style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 60%, #00C2FF 100%)', boxShadow: '0 8px 32px rgba(123,47,190,0.3)', textDecoration: 'none' }}>
            Start with 30 free credits <ArrowRight size={18} />
          </Link>
          <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>No credit card required</p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 text-center relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px]" style={{ background: 'rgba(123,47,190,0.1)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className='flex justify-center'>
          <Logo size={80} />
          </div>

          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '1.5rem 0 1rem', color: 'white', lineHeight: 1.05 }}>
            Everything you imagine.
            <br />
            <span style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7, #00C2FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Built by AI.</span>
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '16px', lineHeight: 1.65 }}>
            In The Hitchhiker's Guide, 42 is the answer to life, the universe and everything.
            Studio42 is the answer to all your AI creation needs.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-white hover:bg-gray-100 transition-all shadow-2xl"
            style={{ color: '#0D0F1A', textDecoration: 'none' }}>
            Get started free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={42} showText = {true} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} Studio42.ai · Everything you imagine. Built by AI.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login"    className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Register</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
