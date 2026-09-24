'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ImageIcon, Video, Globe, Code2, MessageSquare,
  Check, ArrowRight, Loader2, AlertCircle,
  X, TrendingDown, Sparkles, Menu, Zap,
  Play, ChevronRight, Star, Download,
} from 'lucide-react'
import { api } from '@/lib/api'
import Logo from '@/components/ui/Logo'

import './landing.css'
import HeroAnimated from '@/components/hero/HeroAnimated'
import HeroImage from '@/components/hero/HeroImage'

type Tool = 'image' | 'website' | 'video' | 'builder'

interface Plan {
  plan: string
  title: string
  description: string
  features: { id: string; title: string; description: string }[]
  steps: { stepNumber: number; title: string; description: string }[]
  totalSteps: number
  estimatedCredits: number
}

// ── Local sample images ───────────────────────────────────
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
  { src: '/samples/v-mountains.jpg', label: 'Mountain Vista',  duration: '5s' },
  { src: '/samples/v-ocean.jpg',     label: 'Ocean Waves',     duration: '5s' },
  { src: '/samples/v-city.jpg',      label: 'City Timelapse',  duration: '5s' },
  { src: '/samples/v-forest.jpg',    label: 'Forest Rain',     duration: '5s' },
  { src: '/samples/v-fire.jpg',      label: 'Fire & Embers',   duration: '5s' },
  { src: '/samples/v-aurora.jpg',    label: 'Aurora Night',    duration: '5s' },
]
const SHOWCASE = [
  { src: '/samples/s1.jpg' }, { src: '/samples/s2.jpg' },
  { src: '/samples/s3.jpg' }, { src: '/samples/s4.jpg' },
  { src: '/samples/s5.jpg' }, { src: '/samples/s6.jpg' },
  { src: '/samples/s7.jpg' }, { src: '/samples/s8.jpg' },
]

// ── Generator tools ───────────────────────────────────────
const TOOLS = [
  { id: 'image'   as Tool, label: 'Image',      icon: ImageIcon,    placeholder: 'A lone wolf on a cliff at midnight, aurora borealis above…',          cost: '4 cr',    free: true  },
  { id: 'website' as Tool, label: 'Website',    icon: Globe,        placeholder: 'A premium landing page for a luxury watch brand called Aurum…',        cost: '20 cr',   free: true  },
  { id: 'video'   as Tool, label: 'Video',      icon: Video,        placeholder: 'A slow cinematic drone shot over a misty forest at golden hour…',       cost: '40 cr',   free: false },
  { id: 'builder' as Tool, label: 'AI Builder', icon: Code2,        placeholder: 'A real-time stock trading platform with charts and portfolio tracker…', cost: 'Free',    free: true  },
]

// ── Chat models ───────────────────────────────────────────
const CHAT_MODELS = [
  { name: 'GPT-4o',          credits: 5,  color: '#10A37F', provider: 'OpenAI'     },
  { name: 'GPT-4o mini',     credits: 1,  color: '#10A37F', provider: 'OpenAI'     },
  { name: 'Claude Sonnet',   credits: 5,  color: '#D97706', provider: 'Anthropic'  },
  { name: 'Claude Haiku',    credits: 1,  color: '#D97706', provider: 'Anthropic'  },
  { name: 'Gemini Pro',      credits: 3,  color: '#4F8EF7', provider: 'Google'     },
  { name: 'Gemini Flash',    credits: 1,  color: '#4F8EF7', provider: 'Google'     },
]

const COMPETITORS = [
  { name: 'Midjourney', price: '$10/mo',        tools: 1, expires: true  },
  { name: 'Runway',     price: '$15/mo',        tools: 1, expires: true  },
  { name: 'Lovable',    price: '$25/mo',        tools: 1, expires: true  },
  { name: 'All three',  price: '$50/mo',        tools: 3, expires: true  },
  { name: 'Studio42',   price: 'Pay as you go', tools: 5, expires: false, highlight: true },
]

// ── Marquee ───────────────────────────────────────────────
function MarqueeRow({ items, direction = 'left' }: { items: { src: string; label: string }[], direction?: 'left' | 'right' }) {
  const doubled = [...items, ...items]
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', zIndex: 10, background: 'linear-gradient(to right, #0D0F1A, transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', zIndex: 10, background: 'linear-gradient(to left, #0D0F1A, transparent)', pointerEvents: 'none' }} />
      <div className={direction === 'left' ? 'marquee-left' : 'marquee-right'} style={{ display: 'flex', gap: '12px', width: 'max-content' }}>
        {doubled.map((item, i) => (
          <div key={i} className="group" style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, width: '200px', height: '150px', cursor: 'pointer' }}>
            <img src={item.src} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', display: 'block' }} className="group-hover:scale-110" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-end p-2" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <span style={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Browser mockup ────────────────────────────────────────
function BrowserMockup() {
  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a2e', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
      <div style={{ padding: '10px 14px', background: '#111827', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#FF5F57', '#FFBD2E', '#28C840'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          studio42.ai/preview/website
        </div>
      </div>
      <div style={{ height: '280px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '12px' }}>
        <div style={{ height: '12px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px', width: '60%' }} />
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', width: '80%' }} />
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', width: '70%' }} />
        <div style={{ marginTop: '8px', padding: '8px 20px', background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', borderRadius: '8px' }}>
          <div style={{ height: '8px', width: '60px', background: 'rgba(255,255,255,0.9)', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%', marginTop: '8px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '60px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Builder plan cards ────────────────────────────────────
function BuilderCards() {
  const plans = [
    { label: 'BASIC',    steps: 5,  credits: 45,  color: '#10B981', features: ['Authentication', 'Database setup', 'Core API', 'Frontend', 'Deploy guide'] },
    { label: 'MEDIUM',   steps: 10, credits: 125, color: '#4F8EF7', features: ['Everything in Basic', 'Admin panel', 'Payments', 'Email system', 'File uploads', 'Analytics'] },
    { label: 'ADVANCED', steps: 15, credits: 245, color: '#7B2FBE', features: ['Everything in Medium', 'AI features', 'Real-time', 'Mobile API', 'CI/CD pipeline', 'Full docs'] },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {plans.map((plan, i) => (
        <div key={plan.label} style={{ borderRadius: '14px', padding: '14px 16px', border: `1px solid ${plan.color}25`, background: `${plan.color}08`, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Code2 size={16} style={{ color: plan.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: plan.color, letterSpacing: '0.08em' }}>{plan.label}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{plan.steps} steps · ~{plan.credits} cr</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {plan.features.slice(0, 3).map(f => (
                <span key={f} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{f}</span>
              ))}
              {plan.features.length > 3 && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>+{plan.features.length - 3} more</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Chat mockup ───────────────────────────────────────────
function ChatMockup() {
  const messages = [
    { role: 'user', text: 'Write me a marketing strategy for Studio42' },
    { role: 'ai', text: "Here's a comprehensive strategy: **Target developers and freelancers** who need multiple AI tools. Focus on the pay-as-you-go angle — they're tired of paying $60/month for tools they barely use..." },
    { role: 'user', text: 'Make it more focused on social media' },
    { role: 'ai', text: "For social media, start with **Twitter/X** for developer reach, **LinkedIn** for freelancers, and **TikTok** for viral demos. Show before/after content creation with time comparisons..." },
  ]
  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', height: '320px' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #10A37F, #4F8EF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white' }}>AI</div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'white', margin: 0 }}>Claude Sonnet 4</p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>5 credits/msg · Anthropic</p>
        </div>
      </div>
      {/* Messages */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '8px 12px', borderRadius: '12px', fontSize: '11px', lineHeight: 1.5,
              background: msg.role === 'user' ? 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' : 'rgba(255,255,255,0.07)',
              color: msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.75)',
              border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '6px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Message Claude Sonnet…</div>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowRight size={12} color="white" />
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────
export default function LandingPage() {
  const [activeTool,   setActiveTool]   = useState<Tool>('image')
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

  const isGenerating = loading || imagePolling
  const hasResult    = imageUrl || websiteHtml || builderPlans.length > 0

  const G = 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 50%, #00C2FF 100%)'
  const gradText = { background: G, WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const, backgroundClip: 'text' as const }

  return (
    <div className="min-h-screen text-white" style={{ background: '#0D0F1A', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
     

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,15,26,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Logo size={60} showText = {true} />
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '1.75rem' }}>
            {[['#generator', 'Try free'], ['#tools', 'Tools'], ['#models', 'Models'], ['#pricing', 'Pricing']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              >{label}</a>
            ))}
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" style={{ padding: '9px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', color: 'white', background: G, boxShadow: '0 4px 16px rgba(123,47,190,0.3)' }}>
              Start free
            </Link>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="block md:hidden" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileMenu && (
          <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0D0F1A' }}>
            {[['#generator','Try free'],['#tools','Tools'],['#models','Models'],['#pricing','Pricing']].map(([href,label]) => (
              <a key={href} href={href} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>{label}</a>
            ))}
            <Link href="/login"    style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" style={{ padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 700, fontSize: '14px', textDecoration: 'none', color: 'white', background: G }}>Start free</Link>
          </div>
        )}
      </nav>



      {/* ── Hero ── */}
        {/* <HeroAnimated/> */}

    <HeroImage/>

      {/* ── Free Generator ── */}
      <section id="generator" style={{ padding: '3rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(0,194,255,0.25)', background: 'rgba(0,194,255,0.06)', marginBottom: '0.75rem' }}>
              <Sparkles size={12} color="#00C2FF" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#00C2FF' }}>Try it free — no account needed</span>
            </div>
            <h2 className="display-font" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: 'white' }}>
              Create something <span style={gradText}>right now.</span>
            </h2>
          </div>

          {/* Generator box */}
          <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', boxShadow: '0 0 80px rgba(123,47,190,0.08)' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
              {TOOLS.map(tool => {
                const Icon = tool.icon
                const active = activeTool === tool.id
                return (
                  <button key={tool.id} onClick={() => setActiveTool(tool.id)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 6px', borderRadius: '14px', border: active ? '1px solid rgba(123,47,190,0.35)' : '1px solid transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: active ? 'rgba(123,47,190,0.2)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.35)' }}
                  >
                    <Icon size={14} style={{ color: active ? '#C4A8FF' : undefined }} />
                    <span className="hidden sm:inline">{tool.label}</span>
                  </button>
                )
              })}
            </div>
            {/* Prompt */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <textarea rows={3} disabled={isGenerating} value={prompt} onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate() } }}
                placeholder={currentTool.placeholder}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: '15px', lineHeight: 1.6, color: 'white', fontFamily: 'inherit' }}
              />
            </div>
            {/* Bottom */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 1.5rem 1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: 'rgba(123,47,190,0.15)', border: '1px solid rgba(123,47,190,0.25)', color: '#C4A8FF' }}>
                  ⚡ {currentTool.cost}
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  {currentTool.free ? 'Free · No signup' : 'Requires account'}
                </span>
              </div>
              <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: 'white', background: G, boxShadow: '0 4px 20px rgba(123,47,190,0.3)', opacity: (!prompt.trim() || isGenerating) ? 0.4 : 1, transition: 'opacity 0.2s' }}
              >
                {isGenerating ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : <><Sparkles size={14} /> Generate</>}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: '13px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {!hasResult && !isGenerating && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '10px' }}>
              Enter → Generate · Image, Website & Builder are free
            </p>
          )}
        </div>
      </section>

      {/* ── Result ── */}
      {(isGenerating || hasResult) && (
        <section ref={resultRef} style={{ padding: '0 1.5rem 4rem' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(255,255,255,0.02)' }}>
            {isGenerating && (
              <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={26} color="white" className="animate-spin" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'white', margin: '0 0 4px' }}>
                    {activeTool === 'image' ? 'Creating your image…' : activeTool === 'website' ? 'Building your website…' : 'Analyzing your project…'}
                  </p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Usually 15–30 seconds</p>
                </div>
              </div>
            )}
            {imageUrl && !isGenerating && (
              <div className="group" style={{ position: 'relative' }}>
                <img src={imageUrl} alt={prompt} style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', background: 'black', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.5)', fontSize: '10px', padding: '3px 10px', borderRadius: '100px' }}>Studio42.ai</div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <Link href="/register" style={{ background: 'white', color: '#111', fontWeight: 700, padding: '12px 24px', borderRadius: '14px', fontSize: '14px', textDecoration: 'none' }}>
                    Sign up to download full resolution →
                  </Link>
                </div>
              </div>
            )}
            {websiteHtml && (
              <div>
                <iframe srcDoc={websiteHtml} style={{ width: '100%', height: '480px', border: 'none', display: 'block' }} sandbox="allow-scripts" title="Preview" />
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Sign up to download without watermark</p>
                  <Link href="/register" style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', color: 'white', background: G }}>Get 30 free credits →</Link>
                </div>
              </div>
            )}
            {builderPlans.length > 0 && !isGenerating && (
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1rem' }}>
                  {builderPlans.map(plan => {
                    const isSel = selectedPlan?.plan === plan.plan
                    return (
                      <div key={plan.plan} onClick={() => setSelectedPlan(plan)} style={{ borderRadius: '14px', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s', background: isSel ? 'rgba(123,47,190,0.12)' : 'rgba(255,255,255,0.03)', border: isSel ? '2px solid rgba(123,47,190,0.5)' : '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(123,47,190,0.2)', color: '#C4A8FF' }}>{plan.plan}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#93C5FD' }}>~{plan.estimatedCredits} cr</span>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>{plan.title}</p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px', lineHeight: 1.4 }}>{plan.description}</p>
                        {plan.features.slice(0, 3).map(f => (
                          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                            <Check size={10} color="#10B981" />
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{f.title}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
                {selectedPlan && (
                  <div style={{ borderRadius: '14px', padding: '1.25rem', textAlign: 'center', background: 'rgba(123,47,190,0.08)', border: '1px solid rgba(123,47,190,0.2)' }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Ready to build {selectedPlan.title}?</p>
                    <p style={{ fontSize: '13px', color: 'rgba(196,168,255,0.7)', margin: '0 0 1rem' }}>~{selectedPlan.estimatedCredits} credits · Sign up free, get 30 to start</p>
                    <Link href={`/register?plan=${selectedPlan.plan}&desc=${encodeURIComponent(prompt)}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', color: 'white', background: G }}>
                      Sign up free — start building <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Marquee ── */}
      <section style={{ padding: '2rem 0 3rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Generated with Studio42 · FLUX 1.1 Pro
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <MarqueeRow items={ROW1} direction="left" />
          <MarqueeRow items={ROW2} direction="right" />
        </div>
      </section>

      {/* ── BENTO GRID ── */}
      <section id="tools" style={{ padding: '5rem 1.5rem 3rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(79,142,247,0.3)', background: 'rgba(79,142,247,0.07)', marginBottom: '1rem' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#93C5FD' }}>5 powerful tools</span>
            </div>
            <h2 className="display-font" style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 12px', color: 'white' }}>
              One platform. <span style={gradText}>Every tool.</span>
            </h2>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.4)', maxWidth: '520px', margin: '0 auto' }}>
              Everything a developer, designer or creator needs — in one credit wallet.
            </p>
          </div>

          {/* Bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'auto auto', gap: '14px' }}>

            {/* IMAGE — large, 5 cols */}
            <div className="bento-card" style={{ gridColumn: 'span 5', borderRadius: '22px', overflow: 'hidden', border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(123,47,190,0.06)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(123,47,190,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={18} style={{ color: '#C4A8FF' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', margin: 0 }}>Image Generation</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>FLUX 1.1 Pro · 4 credits</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '1rem' }}>
                {SHOWCASE.slice(0, 4).map((img, i) => (
                  <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
                    <img src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: '0 0 12px' }}>
                Photorealistic images from text prompts. Multiple styles, sizes and aspect ratios.
              </p>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#C4A8FF', textDecoration: 'none' }}>
                Try free <ArrowRight size={13} />
              </Link>
            </div>

            {/* VIDEO — 3 cols */}
            <div className="bento-card" style={{ gridColumn: 'span 4', borderRadius: '22px', overflow: 'hidden', border: '1px solid rgba(79,142,247,0.2)', background: 'rgba(79,142,247,0.05)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(79,142,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={18} style={{ color: '#93C5FD' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', margin: 0 }}>Video Generation</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Wan 2.1 · 40 credits</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                {VIDEO_SAMPLES.slice(0, 3).map((v, i) => (
                  <div key={i} className="group" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '70px', cursor: 'pointer' }}>
                    <img src={v.src} alt={v.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(79,142,247,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={12} color="white" fill="white" style={{ marginLeft: '2px' }} />
                      </div>
                      <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{v.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#93C5FD', textDecoration: 'none' }}>
                Sign up to generate <ArrowRight size={13} />
              </Link>
            </div>

            {/* WEBSITE — 3 cols */}
            <div className="bento-card" style={{ gridColumn: 'span 3', borderRadius: '22px', overflow: 'hidden', border: '1px solid rgba(0,194,255,0.2)', background: 'rgba(0,194,255,0.04)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(0,194,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={18} style={{ color: '#00C2FF' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', margin: 0 }}>Website Builder</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Claude Sonnet 4 · 20 cr</p>
                </div>
              </div>
              {/* Mini browser */}
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
                <div style={{ padding: '6px 8px', background: '#111827', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {['#FF5F57','#FFBD2E','#28C840'].map(c => <div key={c} style={{ width: '7px', height: '7px', borderRadius: '50%', background: c }} />)}
                </div>
                <div style={{ height: '120px', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px' }}>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px', width: '70%' }} />
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.25)', borderRadius: '3px', width: '90%' }} />
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.25)', borderRadius: '3px', width: '75%' }} />
                  <div style={{ marginTop: '4px', padding: '4px 12px', background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', borderRadius: '6px' }}>
                    <div style={{ height: '6px', width: '40px', background: 'rgba(255,255,255,0.9)', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: '0 0 10px' }}>
                Full HTML/CSS/JS websites. Responsive, beautiful, downloadable.
              </p>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#00C2FF', textDecoration: 'none' }}>
                Try free <ArrowRight size={13} />
              </Link>
            </div>

            {/* AI BUILDER — 7 cols */}
            <div className="bento-card" style={{ gridColumn: 'span 7', borderRadius: '22px', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Code2 size={18} style={{ color: '#FCD34D' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', margin: 0 }}>AI Code Builder</h3>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Claude Sonnet 4 · Free preview</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.2)' }}>Full stack</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 12px' }}>
                    Describe any app. Get a complete production codebase with MongoDB, Node.js and Next.js — step by step.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                    {['Choose Basic / Medium / Advanced plan', 'Generate step by step code', 'Download production-ready ZIP'].map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <Check size={12} color="#10B981" />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#FCD34D', textDecoration: 'none' }}>
                    Try free preview <ArrowRight size={13} />
                  </Link>
                </div>
                <BuilderCards />
              </div>
            </div>

            {/* AI CHAT — 5 cols */}
            <div className="bento-card" style={{ gridColumn: 'span 5', borderRadius: '22px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.04)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={18} style={{ color: '#34D399' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', margin: 0 }}>AI Chat</h3>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>6 models · from 1 credit/msg</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }}>New</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {CHAT_MODELS.map(m => (
                  <span key={m.name} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '8px', background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}25` }}>
                    {m.name} · {m.credits}cr
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: '0 0 12px' }}>
                GPT-4o, Claude, Gemini in one chat. Switch models mid-conversation. Pay per message.
              </p>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#34D399', textDecoration: 'none' }}>
                Start chatting <ArrowRight size={13} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── ALTERNATING ROWS ── */}
      <section style={{ padding: '4rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '6rem' }}>

          {/* ROW 1 — IMAGE (text left, images right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(123,47,190,0.12)', border: '1px solid rgba(123,47,190,0.25)', marginBottom: '1.25rem' }}>
                <ImageIcon size={13} style={{ color: '#C4A8FF' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#C4A8FF' }}>Image Generation</span>
              </div>
              <h2 className="display-font" style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 1rem', lineHeight: 1.1 }}>
                Stunning images from a single sentence.
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                Powered by FLUX 1.1 Pro — the most advanced image model available. Photorealistic quality with exceptional prompt adherence.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
                {[
                  ['FLUX 1.1 Pro model',     'Best quality available anywhere'],
                  ['Multiple styles & sizes', 'Square, portrait, landscape, wide'],
                  ['Full resolution download','No watermarks, full ownership'],
                  ['4 credits per image',     '~$0.20 per generation'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'rgba(123,47,190,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <Check size={11} color="#C4A8FF" />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0 }}>{title}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="#generator" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '11px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: G, textDecoration: 'none' }}>
                  Try free <ArrowRight size={14} />
                </a>
                <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '11px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                  Sign up
                </Link>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {SHOWCASE.slice(0, 4).map((img, i) => (
                <div key={i} className="group" style={{ borderRadius: '16px', overflow: 'hidden', aspectRatio: '1', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src={img.src} alt="" className="group-hover:scale-105 transition-transform duration-500" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          </div>

          {/* ROW 2 — VIDEO (videos left, text right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {VIDEO_SAMPLES.slice(0, 4).map((v, i) => (
                <div key={i} className="group" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                  <img src={v.src} alt={v.label} className="group-hover:scale-105 transition-transform duration-500" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(79,142,247,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={14} color="white" fill="white" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                    <p style={{ color: 'white', fontSize: '10px', fontWeight: 600, margin: 0 }}>{v.label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', margin: 0 }}>{v.duration}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.25)', marginBottom: '1.25rem' }}>
                <Video size={13} style={{ color: '#93C5FD' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#93C5FD' }}>Video Generation</span>
              </div>
              <h2 className="display-font" style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 1rem', lineHeight: 1.1 }}>
                Cinematic videos from text prompts.
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                Powered by Wan 2.1 — realistic motion, physics, and dramatic cinematic composition from a single sentence.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
                {[
                  ['Wan 2.1 video model',   'Cinematic quality and motion'],
                  ['5s and 10s durations',   'Choose your video length'],
                  ['Download as MP4',        'Full ownership, no watermark'],
                  ['40 credits per video',   '~$2 per generation'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'rgba(79,142,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <Check size={11} color="#93C5FD" />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0 }}>{title}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '11px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #4F8EF7, #00C2FF)', textDecoration: 'none' }}>
                Sign up to generate <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* ROW 3 — WEBSITE (text left, browser right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(0,194,255,0.08)', border: '1px solid rgba(0,194,255,0.25)', marginBottom: '1.25rem' }}>
                <Globe size={13} style={{ color: '#00C2FF' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#00C2FF' }}>Website Builder</span>
              </div>
              <h2 className="display-font" style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 1rem', lineHeight: 1.1 }}>
                Full websites in 30 seconds.
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                Describe any website. Claude Sonnet 4 builds a complete, responsive, production-ready site with real content.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
                {[
                  ['Claude Sonnet 4 powered', 'World-class AI for code generation'],
                  ['Full HTML + CSS + JS',     'Production-ready, no frameworks needed'],
                  ['Fully responsive',         'Works on mobile, tablet and desktop'],
                  ['20 credits per website = $1',   '~$1 per generation'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'rgba(0,194,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <Check size={11} color="#00C2FF" />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0 }}>{title}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="#generator" onClick={() => setActiveTool('website')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '11px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #00C2FF, #4F8EF7)', textDecoration: 'none' }}>
                  Try free <ArrowRight size={14} />
                </a>
              </div>
            </div>
            <div className="float-anim">
              <BrowserMockup />
            </div>
          </div>

          {/* ROW 4 — AI BUILDER (builder left, text right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ borderRadius: '22px', padding: '2rem', border: '1px solid rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.04)' }}>
              <div style={{ marginBottom: '1.25rem', padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>You said:</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0, fontStyle: 'italic' }}>
                  "Build me an e-commerce store with products, cart and Stripe payments"
                </p>
              </div>
              <BuilderCards />
              <div style={{ marginTop: '1rem', padding: '10px 14px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ fontSize: '12px', color: '#34D399', fontWeight: 600 }}>Plan generated · Choose and start building</span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', marginBottom: '1.25rem' }}>
                <Code2 size={13} style={{ color: '#FCD34D' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FCD34D' }}>AI Code Builder</span>
              </div>
              <h2 className="display-font" style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 1rem', lineHeight: 1.1 }}>
                Full stack apps, built step by step.
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                Describe your app idea. Get a complete production codebase with MongoDB, Node.js backend and Next.js frontend — generated step by step.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
                {[
                  ['3 complexity plans',         'Basic (5 steps) → Advanced (15 steps)'],
                  ['MongoDB + Node + Next.js',   'Full stack production architecture'],
                  ['Step by step generation',    'Review and understand each step'],
                  ['Download production ZIP',    'Deploy anywhere immediately'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <Check size={11} color="#FCD34D" />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0 }}>{title}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="#generator" onClick={() => setActiveTool('builder')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '11px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', textDecoration: 'none' }}>
                  Try free preview <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── AI CHAT — full width dark ── */}
      <section style={{ padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ borderRadius: '28px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.15)', background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(13,15,26,0.8) 50%, rgba(123,47,190,0.06) 100%)', padding: '3.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', marginBottom: '1.25rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#34D399' }}>New · Multi-model AI Chat</span>
                </div>
                <h2 className="display-font" style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 900, letterSpacing: '-0.02em', color: 'white', margin: '0 0 1rem', lineHeight: 1.1 }}>
                  Every AI model.
                  <br />
                  <span style={gradText}>One chat.</span>
                </h2>
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                  Stop paying $20/month each for ChatGPT, Claude and Gemini. Access all 6 models from one credit wallet. Switch mid-conversation.
                </p>

                {/* Model pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                  {CHAT_MODELS.map(m => (
                    <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', background: `${m.color}12`, border: `1px solid ${m.color}25` }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.color }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: m.color }}>{m.name}</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>⚡{m.credits}cr</span>
                    </div>
                  ))}
                </div>

                {/* Savings callout */}
                <div style={{ padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TrendingDown size={18} color="#FCA5A5" />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', margin: 0 }}>Average developer pays $60/month for AI</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Studio42 Chat costs $2–3 for the same usage</p>
                    </div>
                  </div>
                </div>

                <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 22px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, color: 'white', background: G, textDecoration: 'none', boxShadow: '0 4px 20px rgba(123,47,190,0.3)' }}>
                  Start chatting free <ArrowRight size={14} />
                </Link>
              </div>

              <div>
                <ChatMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Models ── */}
      <section id="models" style={{ padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="display-font" style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 10px' }}>
              Only the <span style={gradText}>best models.</span>
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '500px', margin: '0 auto' }}>
              We curate only the highest quality AI models for reliability, output quality and speed.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {[
              { tool: 'Image Generation', model: 'FLUX 1.1 Pro',    maker: 'Black Forest Labs', icon: ImageIcon, desc: 'State-of-the-art photorealistic image generation with exceptional prompt adherence.',  badge: 'Best quality',     color: '#7B2FBE' },
              { tool: 'Video Generation', model: 'Wan 2.1',         maker: 'WaveSpeed AI',      icon: Video,     desc: 'Cinematic text-to-video with realistic motion, physics and dramatic composition.',     badge: 'Cinematic',        color: '#4F8EF7' },
              { tool: 'Website Builder',  model: 'Claude Sonnet 4', maker: 'Anthropic',         icon: Globe,     desc: 'Advanced reasoning model generating complete production-ready websites instantly.',     badge: 'Production ready', color: '#00C2FF' },
              { tool: 'AI Code Builder',  model: 'Claude Sonnet 4', maker: 'Anthropic',         icon: Code2,     desc: 'Generates complete MongoDB + Node.js + Next.js codebases with step-by-step output.',    badge: 'Full stack',       color: '#F59E0B' },
            ].map(m => {
              const Icon = m.icon
              return (
                <div key={m.tool} className="bento-card" style={{ borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${m.color}30` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', borderRadius: '50%', background: `radial-gradient(circle, ${m.color}10 0%, transparent 70%)`, pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${m.color}18`, border: `1px solid ${m.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} style={{ color: m.color }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 2px', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{m.tool}</p>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1 }}>{m.model}</h3>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>by {m.maker}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}20`, whiteSpace: 'nowrap' as const }}>{m.badge}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{m.desc}</p>
                </div>
              )
            })}
          </div>
          {/* Powered by */}
          <div style={{ marginTop: '14px', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>Powered by</span>
            {[{name:'Black Forest Labs',color:'#7B2FBE'},{name:'WaveSpeed AI',color:'#4F8EF7'},{name:'Anthropic',color:'#00C2FF'},{name:'Replicate',color:'#7B2FBE'}].map(b => (
              <span key={b.name} style={{ fontSize: '13px', fontWeight: 600, padding: '5px 14px', borderRadius: '10px', background: `${b.color}10`, border: `1px solid ${b.color}20`, color: b.color }}>{b.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>

            {/* Comparison */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1.25rem' }}>
                <TrendingDown size={13} color="#FCA5A5" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FCA5A5' }}>Stop overpaying</span>
              </div>
              <h2 className="display-font" style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 1.5rem', lineHeight: 1.1 }}>
                The smarter way to pay.
              </h2>
              <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Platform','Price','Tools','Expires'].map(h => <div key={h} style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)' }}>{h}</div>)}
                </div>
                {COMPETITORS.map((c, i) => (
                  <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 14px', alignItems: 'center', background: (c as any).highlight ? 'rgba(123,47,190,0.08)' : 'transparent', borderLeft: (c as any).highlight ? '3px solid #7B2FBE' : '3px solid transparent', borderBottom: i !== COMPETITORS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: (c as any).highlight ? 'white' : 'rgba(255,255,255,0.45)' }}>{c.name}</span>
                      {(c as any).highlight && <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '5px', background: G, color: 'white' }}>YOU</span>}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: (c as any).highlight ? '#34D399' : '#F87171' }}>{c.price}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: (c as any).highlight ? 'white' : 'rgba(255,255,255,0.35)' }}>{c.tools}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: c.expires ? '#F87171' : '#34D399' }}>{c.expires ? '✗ Yes' : '✓ Never'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="display-font" style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 6px', lineHeight: 1.1 }}>
                Simple, honest pricing.
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: '0 0 1.5rem' }}>
                20 credits = $1 · Buy once · Never expires
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '1.25rem' }}>
                {[
                  { credits: 100,  price: 5,  desc: '~25 images',  popular: false },
                  { credits: 250,  price: 10, desc: '~62 images',  popular: true  },
                  { credits: 600,  price: 20, desc: '~150 images', popular: false },
                  { credits: 1500, price: 40, desc: '~375 images', popular: false },
                ].map(pkg => (
                  <div key={pkg.credits} style={{ position: 'relative', borderRadius: '18px', padding: '1.25rem', textAlign: 'center', border: pkg.popular ? '2px solid rgba(123,47,190,0.5)' : '1px solid rgba(255,255,255,0.07)', background: pkg.popular ? 'rgba(123,47,190,0.1)' : 'rgba(255,255,255,0.02)', transition: 'transform 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
                  >
                    {pkg.popular && <span style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '100px', background: G, color: 'white', whiteSpace: 'nowrap' as const }}>POPULAR</span>}
                    <div className="display-font" style={{ fontSize: '26px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{pkg.credits}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: '2px 0 4px' }}>credits</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>{pkg.desc}</div>
                    <div className="display-font" style={{ fontSize: '22px', fontWeight: 900, ...gradText }}>
  ${pkg.price}<span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>.00</span>
</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem' }}>
                {['Credits never expire', 'No subscription', 'Stripe secured', 'Instant delivery'].map(f => (
                  <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    <Check size={12} color="#10B981" /> {f}
                  </span>
                ))}
              </div>
              <Link href="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '16px', fontSize: '15px', fontWeight: 700, color: 'white', background: G, textDecoration: 'none', boxShadow: '0 6px 24px rgba(123,47,190,0.3)' }}>
                Start with 30 free credits <ArrowRight size={16} />
              </Link>
              <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '10px' }}>No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '8rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 'clamp(160px, 25vw, 320px)', fontWeight: 900, color: 'rgba(255,255,255,0.018)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', fontFamily: "'Cabinet Grotesk', sans-serif" }}>42</div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,190,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '680px', margin: '0 auto' }}>
          <div className='flex justify-center'>
                   <Logo size={80} />
                   </div>
          <h2 className="display-font" style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'white', margin: '1.5rem 0 1rem', lineHeight: 1.05 }}>
            Everything you imagine.
            <br />
            <span style={gradText}>Built by AI.</span>
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: '2.5rem' }}>
            In The Hitchhiker's Guide, 42 is the answer to life, the universe and everything.
            Studio42 is the answer to all your AI creation needs.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '18px 40px', borderRadius: '18px', fontSize: '16px', fontWeight: 800, color: '#0D0F1A', background: 'white', boxShadow: '0 8px 40px rgba(255,255,255,0.12)', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
          >
            Get started free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.75rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <Logo size={42} />
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            © {new Date().getFullYear()} Studio42.ai · Everything you imagine. Built by AI.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/login"    style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Register</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}