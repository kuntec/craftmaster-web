'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ImageIcon, Video, Globe, Code2, MessageSquare,
  ArrowRight, Check, ChevronDown, ChevronUp,
  Sparkles, Star, Menu, X, Play,
  Clock, Layers, Bot, Wand2,
  Loader2, AlertCircle,
} from 'lucide-react'

// ── Brand ─────────────────────────────────────────────────
const P  = '#7C3AED'
const P2 = '#4F46E5'
const G  = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`

// ── Generator tabs ─────────────────────────────────────────
type GenTool = 'image' | 'video' | 'website' | 'chat' | 'builder'
const GEN_TOOLS: { id: GenTool; label: string; icon: any; placeholder: string; badge: string; free: boolean }[] = [
  { id: 'image',   label: 'Image',      icon: ImageIcon,     placeholder: 'A lone wolf on a moonlit cliff, aurora borealis above, photorealistic…', badge: '4 cr · Free trial', free: true  },
  { id: 'video',   label: 'Video',      icon: Video,         placeholder: 'Slow cinematic drone shot over a misty Japanese forest at golden hour…',  badge: 'From 35 cr',        free: false },
  { id: 'website', label: 'Website',    icon: Globe,         placeholder: 'A premium landing page for a luxury watch brand called Aurum…',           badge: '20 cr · Free trial',free: true  },
  { id: 'chat',    label: 'AI Chat',    icon: MessageSquare, placeholder: 'Help me write a marketing strategy for my SaaS startup…',                 badge: 'From 1 cr',         free: false },
  { id: 'builder', label: 'AI Builder', icon: Code2,         placeholder: 'A stock trading platform with live charts and portfolio tracker…',        badge: 'Free plan preview', free: true  },
]

// ── Nav data ───────────────────────────────────────────────
const NAV = [
  {
    label: 'Tools',
    dropdown: [
      { icon: ImageIcon,     label: 'Image Generator',  desc: 'FLUX 1.1 Pro · Photorealistic AI art',  href: '/register', color: '#7C3AED' },
      { icon: Video,         label: 'Video Generator',  desc: 'Wan · Seedance 2.0 · Kling v3',          href: '/register', color: '#2563EB' },
      { icon: Globe,         label: 'Website Builder',  desc: 'Full site from one sentence',             href: '/register', color: '#059669' },
      { icon: MessageSquare, label: 'AI Chat',          desc: 'GPT-4o, Claude, Gemini & more',           href: '/register', color: '#D97706' },
      { icon: Code2,         label: 'AI Code Builder',  desc: 'Full-stack apps, step-by-step',           href: '/register', color: '#DC2626' },
    ],
  },
  {
    label: 'Use Cases',
    dropdown: [
      { icon: Sparkles, label: 'For Creators',    desc: 'Images, videos & social content',    href: '/register', color: '#7C3AED' },
      { icon: Code2,    label: 'For Developers',  desc: 'Build apps & websites with AI',      href: '/register', color: '#2563EB' },
      { icon: Bot,      label: 'For Marketers',   desc: 'Copy, visuals & campaign assets',    href: '/register', color: '#059669' },
      { icon: Layers,   label: 'For Agencies',    desc: 'Scale AI creation for clients',      href: '/register', color: '#D97706' },
    ],
  },
  { label: 'Pricing', href: '#pricing' },
  {
    label: 'Resources',
    dropdown: [
      { icon: Globe,  label: 'Blog',       desc: 'Tips, tutorials & updates',  href: '#', color: '#6B7280' },
      { icon: Code2,  label: 'API Docs',   desc: 'Integrate Studio42 into your app', href: '#', color: '#6B7280' },
      { icon: Clock,  label: 'Changelog',  desc: 'What\'s new in Studio42',     href: '#', color: '#6B7280' },
    ],
  },
]

// ── Tools grid data ────────────────────────────────────────
const TOOLS = [
  { icon: ImageIcon,     label: 'AI Image Generator', desc: 'FLUX 1.1 Pro · Photorealistic',   color: '#7C3AED', bg: '#F5F3FF' },
  { icon: Video,         label: 'AI Video Generator', desc: 'Wan · Seedance · Kling v3',       color: '#2563EB', bg: '#EFF6FF' },
  { icon: Globe,         label: 'Website Builder',    desc: 'Full HTML/CSS/JS in seconds',     color: '#059669', bg: '#ECFDF5' },
  { icon: MessageSquare, label: 'AI Chat',            desc: 'GPT-4o · Claude · Gemini',        color: '#D97706', bg: '#FFFBEB' },
  { icon: Code2,         label: 'AI Code Builder',    desc: 'Full-stack apps, step-by-step',   color: '#DC2626', bg: '#FEF2F2' },
  { icon: Wand2,         label: 'Coming Soon',        desc: 'More tools shipping in Phase 2',  color: '#9CA3AF', bg: '#F3F4F6' },
]

const FEATURES = [
  {
    badge: '🖼️ Image Generation', badgeColor: '#7C3AED',
    heading: 'Photorealistic images from any idea.',
    sub: 'Powered by FLUX 1.1 Pro — one of the world\'s highest-quality image models. Just describe what you want and watch it appear in seconds.',
    bullets: ['FLUX 1.1 Pro — best-in-class quality','Any style: photorealistic, anime, oil painting, 3D','Only 4 credits ($0.20) per image','Stored permanently in your gallery'],
    cta: 'Generate your first image free', color: '#7C3AED',
    visual: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        {[
          '/images/1778156865707-syeem9.webp',
          '/images/1778156946691-iy1pq1.webp',
          '/images/1778157651159-2035b2.webp',
          '/images/1778161123866-bvvl7k.webp',
        ].map((src, i) => (
          <div key={i} style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '1', position: 'relative' as const }}>
            <img src={src} alt="AI Generated" style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
            <div style={{ position: 'absolute' as const, bottom: 8, left: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'white', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', padding: '2px 8px', borderRadius: 6 }}>AI Generated</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    badge: '🎬 Video Generation', badgeColor: '#2563EB',
    heading: 'Text to stunning video in minutes.',
    sub: 'Choose from Wan 2.1, Seedance 2.0, or Kling v3 — ranging from fast 480p clips to cinematic 1080p with audio.',
    bullets: ['Wan 2.1 · Seedance 2.0 · Kling v3 · Kling v3 Omni','Up to 1080p with native audio (Kling v3)','From 35 credits ($1.75) per video','Reference-image support with Kling Omni'],
    cta: 'Try video generation', color: '#2563EB', reverse: true,
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
        {/* Featured video */}
        <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
          <video
            src="/videos/1779008414439-e6i06s.mp4"
            autoPlay muted loop playsInline
            style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' as const }}
          />
          <div style={{ position: 'absolute' as const, top: 12, left: 12, display: 'flex', gap: 6 }}>
            {([['Seedance 2.0','#3B82F6']] as [string,string][]).map(([n,c]) => (
              <span key={n} style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.5)', color: c, border: `1px solid ${c}50`, backdropFilter: 'blur(8px)' }}>{n}</span>
            ))}
          </div>
          <div style={{ position: 'absolute' as const, bottom: 10, right: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', padding: '3px 10px', borderRadius: 100 }}>AI Generated</span>
          </div>
        </div>
        {/* Two smaller thumbnails */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { src: '/videos/1779105628352-gfmmos.mp4', label: 'Wan 2.1', color: '#10B981' },
            { src: '/videos/1784103117442-ecvj7i.mp4', label: 'Kling v3', color: '#8B5CF6' },
          ].map((v, i) => (
            <div key={i} style={{ borderRadius: 14, overflow: 'hidden', position: 'relative' as const, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
              <video
                src={v.src}
                autoPlay muted loop playsInline
                style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' as const }}
              />
              <span style={{ position: 'absolute' as const, top: 6, left: 6, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: 'rgba(0,0,0,0.55)', color: v.color, backdropFilter: 'blur(6px)' }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    badge: '🌐 Website Builder', badgeColor: '#059669',
    heading: 'A full website from one sentence.',
    sub: 'Powered by Claude Sonnet 4. Describe your site and get a complete, deployable HTML/CSS/JS page — no coding required.',
    bullets: ['Complete HTML + CSS + JS in one shot','Claude Sonnet 4 — best coding model','Only 20 credits ($1.00) per website','Live preview in your browser instantly'],
    cta: 'Build a website free', color: '#059669',
    visual: (
      <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #E5E7EB' }}>
        <div style={{ background: '#F1F5F9', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', gap: 5 }}>{['#FF5F57','#FFBD2E','#28C840'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}</div>
          <div style={{ flex: 1, background: 'white', borderRadius: 6, padding: '3px 10px', fontSize: 10, color: '#9CA3AF', textAlign: 'center' as const }}>studio42.ai/preview/landing</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,#1E1B4B,#312E81,#1E3A5F)', padding: '28px 20px', minHeight: 200 }}>
          <div style={{ height: 10, background: 'rgba(255,255,255,0.85)', borderRadius: 5, width: '55%', margin: '0 auto 10px' }} />
          <div style={{ height: 7, background: 'rgba(255,255,255,0.3)', borderRadius: 4, width: '70%', margin: '0 auto 6px' }} />
          <div style={{ height: 7, background: 'rgba(255,255,255,0.2)', borderRadius: 4, width: '55%', margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ padding: '6px 18px', background: G, borderRadius: 6 }}><div style={{ height: 6, width: 52, background: 'rgba(255,255,255,0.9)', borderRadius: 3 }} /></div>
            <div style={{ padding: '6px 18px', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 6 }}><div style={{ height: 6, width: 42, background: 'rgba(255,255,255,0.4)', borderRadius: 3 }} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[1,2,3].map(i => <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: 10, border: '1px solid rgba(255,255,255,0.1)' }}><div style={{ height: 6, background: 'rgba(255,255,255,0.5)', borderRadius: 3, width: '60%', marginBottom: 5 }} /><div style={{ height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 3 }} /></div>)}
          </div>
        </div>
      </div>
    ),
  },
  {
    badge: '💬 AI Chat', badgeColor: '#D97706',
    heading: 'Every top AI model. One credit wallet.',
    sub: 'Stop juggling six subscriptions. Chat with GPT-4o, Claude Sonnet, Gemini Pro and more — switching models mid-conversation without losing context.',
    bullets: ['GPT-4o, GPT-4o mini, Claude Sonnet 4, Haiku, Gemini','Streaming responses, full conversation history','From 1 credit per message','Switch models at any point in the chat'],
    cta: 'Start chatting free', color: '#D97706', reverse: true,
    visual: (
      <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        <div style={{ background: 'white', borderBottom: '1px solid #F3F4F6', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>{[['GPT-4o','#10A37F'],['Claude','#D97706'],['Gemini','#4285F4']].map(([n,c]) => <span key={n as string} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${c}15`, color: c as string }}>{n as string}</span>)}</div>
          <span style={{ fontSize: 10, color: '#9CA3AF' }}>Active: Claude Sonnet 4</span>
        </div>
        <div style={{ background: '#FAFAFA', padding: '14px', display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ maxWidth: '72%', padding: '10px 14px', borderRadius: '14px 14px 4px 14px', background: G, fontSize: 12, color: 'white', lineHeight: 1.5 }}>Write a marketing plan for a PAYG AI platform targeting freelancers</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#D97706,#F59E0B)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>AI</div>
            <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: 'white', border: '1px solid #E5E7EB', fontSize: 12, color: '#374151', lineHeight: 1.5 }}>Here's a concise plan: Target <strong>freelancers & indie devs</strong> who create occasionally — they hate paying $20/mo for tools they use twice a week…</div>
          </div>
        </div>
        <div style={{ background: 'white', borderTop: '1px solid #F3F4F6', padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB', padding: '7px 10px', fontSize: 11, color: '#9CA3AF' }}>Ask anything…</div>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight size={13} color="white" /></div>
        </div>
      </div>
    ),
  },
]

const STATS = [
  { value: '5',     label: 'AI tools in one platform' },
  { value: '$0.20', label: 'per AI image (4 credits)'  },
  { value: '∞',     label: 'Credits never expire'      },
  { value: '6',     label: 'Top AI models for chat'    },
]

const PRICING = [
  {
    name: 'Starter', price: '$5', credits: '100', desc: 'Perfect for trying everything out', highlight: false,
    features: ['100 credits ($5 pack)','25 AI images','2 AI videos','5 websites','All 6 chat models','Credits never expire'],
  },
  {
    name: 'Creator', price: '$20', credits: '400 + 40 bonus', desc: 'Most popular for active creators', highlight: true,
    features: ['440 credits ($20 pack)','110 AI images','8 AI videos','20 websites','All 6 chat models','Permanent R2 storage','Credits never expire'],
  },
  {
    name: 'Pro', price: '$50', credits: '1,000 + 150 bonus', desc: 'For power users and agencies', highlight: false,
    features: ['1,150 credits ($50 pack)','280+ AI images','20+ AI videos','50+ websites','All 6 chat models','Permanent R2 storage','Priority generation','Credits never expire'],
  },
]

const TESTIMONIALS = [
  { name: 'Sarah K.',  role: 'Freelance Designer',  rating: 5, text: 'Finally an AI platform where I only pay for what I actually use. The image quality from FLUX is incredible — I\'ve replaced my Midjourney subscription entirely.' },
  { name: 'Marcus T.', role: 'Indie Developer',      rating: 5, text: 'Built a client landing page in 90 seconds with the website builder. The client thought I spent hours on it. Studio42 is a game changer.' },
  { name: 'Priya M.',  role: 'Content Creator',      rating: 5, text: 'Switching between GPT-4o and Claude in the same conversation without losing context is brilliant. No other platform does this.' },
  { name: 'James L.',  role: 'Startup Founder',      rating: 5, text: 'Credits never expire — that\'s the killer feature. I can buy a big pack and use it over months instead of a monthly bill.' },
  { name: 'Aisha R.',  role: 'Marketing Manager',    rating: 5, text: 'The video quality from Kling v3 is stunning. 1080p with audio at $3 per video — I was paying $15/month for way lower quality before.' },
  { name: 'Tom B.',    role: 'Developer',             rating: 4, text: 'The AI builder is exactly what I needed to prototype fast. Describe the app, get a full plan with cost estimate, then execute step by step.' },
]

const FAQS = [
  { q: 'Do credits expire?',                  a: 'Never. Credits stay in your account forever. No monthly resets, no pressure to use them before a deadline.' },
  { q: 'What is the free tier?',              a: 'You get 30 credits when you sign up — no credit card required. Image generation (3/day) and website building (1/day) are also free without an account.' },
  { q: 'Which AI models are available?',      a: 'Image: FLUX 1.1 Pro. Video: Wan 2.1, Seedance 2.0, Kling v3, Kling v3 Omni. Chat: GPT-4o, GPT-4o mini, Claude Sonnet 4, Claude Haiku, Gemini Pro, Gemini Flash.' },
  { q: 'How are credits charged?',            a: '20 credits = $1. Images cost 4 credits ($0.20), videos from 35 credits ($1.75), websites 20 credits ($1.00), and chat from 1 credit per message.' },
  { q: 'Are generated files stored permanently?', a: 'Yes. All images and videos are uploaded to Cloudflare R2 storage and accessible from your history page forever.' },
  { q: 'Can I try before buying?',            a: 'Absolutely. No-account image generation (3/day), website builder (1/day), and AI builder planning are all free without any signup.' },
]

// ── Helpers ────────────────────────────────────────────────
function StarRow({ n }: { n: number }) {
  return <div style={{ display: 'flex', gap: 2 }}>{Array.from({ length: n }).map((_, i) => <Star key={i} size={13} fill="#FBBF24" color="#FBBF24" />)}</div>
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #F3F4F6' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{q}</span>
        {open ? <ChevronUp size={18} color="#6B7280" /> : <ChevronDown size={18} color="#6B7280" />}
      </button>
      {open && <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, marginBottom: 16, paddingRight: 32 }}>{a}</p>}
    </div>
  )
}

// ── Dropdown nav item ──────────────────────────────────────
function NavItem({ item }: { item: typeof NAV[0] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!item.dropdown) {
    return (
      <a href={item.href} style={{ fontSize: 14, fontWeight: 500, color: '#6B7280', textDecoration: 'none', padding: '8px 4px', transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
        onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
      >{item.label}</a>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' as const }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500, color: open ? '#111827' : '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px', transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = '#6B7280' }}
      >
        {item.label}
        <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {open && (
        <div style={{ position: 'absolute' as const, top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: 16, border: '1px solid #F3F4F6', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', padding: '10px', minWidth: 280, zIndex: 100 }}>
          {item.dropdown.map((d: any) => {
            const Icon = d.icon
            return (
              <Link key={d.label} href={d.href} onClick={() => setOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${d.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} style={{ color: d.color }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 1px' }}>{d.label}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>{d.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Logo component ─────────────────────────────────────────
function Logo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <img src="/logo.png" alt="Studio42" style={{ width: size, height: size, objectFit: 'contain' }} />
      <span style={{ fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Studio42</span>
    </div>
  )
}

function LogoLight({ size = 26 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <img src="/logo.png" alt="Studio42" style={{ width: size, height: size, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
      <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Studio42</span>
    </div>
  )
}

// ── Hero Generator ─────────────────────────────────────────
function HeroGenerator() {
  const [tool, setTool] = useState<GenTool>('image')
  const [prompt, setPrompt] = useState('')
  const current = GEN_TOOLS.find(t => t.id === tool)!

  const handleGenerate = () => {
    const params = new URLSearchParams({ redirect: `/dashboard/${tool}`, prompt })
    window.location.href = `/login?${params.toString()}`
  }

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #E5E7EB', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', overflow: 'hidden', textAlign: 'left' as const, maxWidth: 720, margin: '0 auto' }}>
      {/* Tool tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA', padding: '8px 8px 0' }}>
        {GEN_TOOLS.map(t => {
          const Icon = t.icon
          const active = tool === t.id
          return (
            <button key={t.id} onClick={() => { setTool(t.id); setPrompt('') }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500, transition: 'all 0.15s', background: active ? 'white' : 'transparent', color: active ? P : '#9CA3AF', borderBottom: active ? '2px solid white' : '2px solid transparent', marginBottom: -1 }}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Input area */}
      <div style={{ padding: '20px 20px 12px' }}>
        <textarea
          rows={3}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate() } }}
          placeholder={current.placeholder}
          style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 15, lineHeight: 1.6, color: '#111827', fontFamily: 'inherit', background: 'transparent' }}
        />
      </div>

      {/* Footer bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 16px', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: `${P}10`, border: `1px solid ${P}20`, color: P }}>⚡ {current.badge}</span>
          {current.free && <span style={{ fontSize: 12, color: '#9CA3AF' }}>No account needed</span>}
        </div>
        <button
          onClick={handleGenerate}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'white', background: G, boxShadow: '0 4px 16px rgba(124,58,237,0.3)', transition: 'opacity 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Sparkles size={14} /> Generate with AI
        </button>
      </div>

      {/* Quick examples */}
      <div style={{ borderTop: '1px solid #F3F4F6', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: '#FAFAFA' }}>
        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Try:</span>
        {tool === 'image' && ['Aurora wolf','Cyberpunk city','Cozy cafe interior'].map(ex => (
          <button key={ex} onClick={() => setPrompt(ex)} style={{ fontSize: 12, color: '#6B7280', background: 'white', border: '1px solid #E5E7EB', borderRadius: 100, padding: '3px 10px', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
          >{ex}</button>
        ))}
        {tool === 'website' && ['SaaS landing page','Portfolio site','Restaurant menu'].map(ex => (
          <button key={ex} onClick={() => setPrompt(ex)} style={{ fontSize: 12, color: '#6B7280', background: 'white', border: '1px solid #E5E7EB', borderRadius: 100, padding: '3px 10px', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
          >{ex}</button>
        ))}
        {tool === 'video' && ['Mountain timelapse','Ocean waves','City at night'].map(ex => (
          <button key={ex} onClick={() => setPrompt(ex)} style={{ fontSize: 12, color: '#6B7280', background: 'white', border: '1px solid #E5E7EB', borderRadius: 100, padding: '3px 10px', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
          >{ex}</button>
        ))}
        {tool === 'chat' && ['Marketing plan','Email copy','Code review'].map(ex => (
          <button key={ex} onClick={() => setPrompt(ex)} style={{ fontSize: 12, color: '#6B7280', background: 'white', border: '1px solid #E5E7EB', borderRadius: 100, padding: '3px 10px', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
          >{ex}</button>
        ))}
        {tool === 'builder' && ['E-commerce store','SaaS dashboard','Blog platform'].map(ex => (
          <button key={ex} onClick={() => setPrompt(ex)} style={{ fontSize: 12, color: '#6B7280', background: 'white', border: '1px solid #E5E7EB', borderRadius: 100, padding: '3px 10px', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
          >{ex}</button>
        ))}
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────
export default function HixLanding() {
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <div style={{ background: 'white', fontFamily: "'Inter', system-ui, sans-serif", color: '#111827' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <Logo />

          {/* Desktop nav */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}>
            {NAV.map(item => <NavItem key={item.label} item={item} />)}
          </div>

          {/* Auth CTAs */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <Link href="/login"    style={{ fontSize: 14, fontWeight: 500, color: '#6B7280', textDecoration: 'none', padding: '8px 14px' }}>Sign in</Link>
            <Link href="/register" style={{ fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none', padding: '9px 20px', borderRadius: 10, background: G, boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
              Get started free
            </Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="block md:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenu && (
          <div style={{ borderTop: '1px solid #F3F4F6', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12, background: 'white' }}>
            {NAV.map(item => (
              <div key={item.label}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>{item.label}</p>
                {item.dropdown?.map(d => <Link key={d.label} href={d.href} style={{ display: 'block', fontSize: 14, color: '#374151', textDecoration: 'none', padding: '4px 0' }}>{d.label}</Link>)}
                {!item.dropdown && <a href={item.href} style={{ display: 'block', fontSize: 14, color: '#374151', textDecoration: 'none', padding: '4px 0' }}>{item.label}</a>}
              </div>
            ))}
            <hr style={{ borderColor: '#F3F4F6', margin: '4px 0' }} />
            <Link href="/login"    style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" style={{ fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none', padding: 11, borderRadius: 10, background: G, textAlign: 'center' as const }}>Get started free</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '72px 24px 80px', background: 'linear-gradient(180deg,#FAFBFF 0%,white 100%)', textAlign: 'center' as const, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse at center,rgba(124,58,237,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 100, background: '#F5F3FF', border: '1px solid #DDD6FE', marginBottom: 24 }}>
            <Star size={13} fill="#7C3AED" color="#7C3AED" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#7C3AED' }}>Pay as you go · Credits never expire · No subscription</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(40px,6vw,72px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', color: '#111827', margin: '0 0 18px' }}>
            Create anything with AI.
            <br />
            <span style={{ background: G, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Pay only when you do.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: '#6B7280', lineHeight: 1.65, maxWidth: 540, margin: '0 auto 40px' }}>
            Images, videos, websites, code and AI chat — all from one credit wallet.
            No subscriptions. No expiry. Just creation.
          </p>

          {/* ── GENERATOR PANEL ── */}
          <HeroGenerator />

          {/* Trust line */}
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 20 }}>
            No credit card required &nbsp;·&nbsp; 30 free credits on signup &nbsp;·&nbsp; Image & website free without account
          </p>
        </div>
      </section>


      {/* ── IMAGE SHOWCASE ── */}
      <section style={{ padding: '12px 0 56px', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
            Real outputs · Generated by Studio42 users
          </p>
        </div>
        {/* Scrolling strip */}
        <div style={{ display: 'flex', gap: 14, paddingLeft: 32, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
          {[
            '/images/1778156865707-syeem9.webp',
            '/images/1778156946691-iy1pq1.webp',
            '/images/1778157651159-2035b2.webp',
            '/images/1778161123866-bvvl7k.webp',
            '/images/1779177612513-7ydsv9.webp',
            '/images/1778156865707-syeem9.webp',
            '/images/1778156946691-iy1pq1.webp',
          ].map((src, i) => (
            <div key={i} style={{ flexShrink: 0, borderRadius: 18, overflow: 'hidden', width: 240, height: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <img src={src} alt="AI Generated" style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── **/}
      <section style={{ background: '#F9FAFB', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' as const }}>
          {STATS.map(s => (
            <div key={s.label}>
              <p style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.03em' }}>{s.value}</p>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOOLS GRID ── */}
      <section id="tools" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: P, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 10 }}>All tools included</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#111827', margin: '0 0 14px' }}>Five AI tools. One platform. One wallet.</h2>
            <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 520, margin: '0 auto' }}>Everything a creator, developer or marketer needs — without juggling five subscriptions.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {TOOLS.map(tool => {
              const Icon = tool.icon
              return (
                <div key={tool.label} style={{ borderRadius: 20, border: '1.5px solid #F3F4F6', padding: '28px 24px', cursor: 'pointer', background: 'white', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#E5E7EB' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#F3F4F6' }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: tool.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon size={22} style={{ color: tool.color }} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>{tool.label}</h3>
                  <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>{tool.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '20px 24px 80px', background: '#FAFBFF' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 100 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', direction: (f as any).reverse ? 'rtl' : 'ltr' }}>
              <div style={{ direction: 'ltr' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: `${f.badgeColor}10`, border: `1px solid ${f.badgeColor}25`, marginBottom: 18 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: f.badgeColor }}>{f.badge}</span>
                </div>
                <h2 style={{ fontSize: 'clamp(26px,3vw,38px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#111827', margin: '0 0 14px', lineHeight: 1.15 }}>{f.heading}</h2>
                <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, margin: '0 0 24px' }}>{f.sub}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {f.bullets.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={11} style={{ color: f.color }} />
                      </div>
                      <span style={{ fontSize: 14, color: '#374151' }}>{b}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none', background: `linear-gradient(135deg,${f.color},${f.color}cc)`, boxShadow: `0 4px 16px ${f.color}30` }}>
                  {f.cta} <ArrowRight size={14} />
                </Link>
              </div>
              <div style={{ direction: 'ltr' }}>{f.visual}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 52 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: P, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 10 }}>Simple pricing</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#111827', margin: '0 0 14px' }}>Pay once. Create forever.</h2>
            <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>Buy credits when you need them. No monthly fees. No expiry. 20 credits = $1.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {PRICING.map(plan => (
              <div key={plan.name} style={{ borderRadius: 24, border: plan.highlight ? `2px solid ${P}` : '1.5px solid #E5E7EB', padding: '32px 28px', background: plan.highlight ? '#FAFBFF' : 'white', position: 'relative' as const, boxShadow: plan.highlight ? '0 20px 60px rgba(124,58,237,0.12)' : 'none' }}>
                {plan.highlight && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: G, color: 'white', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' as const }}>Most popular</div>}
                <p style={{ fontSize: 14, fontWeight: 700, color: plan.highlight ? P : '#6B7280', marginBottom: 6 }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 40, fontWeight: 900, color: '#111827', letterSpacing: '-0.04em' }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: '#9CA3AF' }}>one-time</span>
                </div>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6 }}>{plan.credits} credits</p>
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>{plan.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map(feat => (
                    <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#374151' }}>{feat}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" style={{ display: 'block', textAlign: 'center' as const, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', color: plan.highlight ? 'white' : P, background: plan.highlight ? G : '#F5F3FF', boxShadow: plan.highlight ? '0 6px 20px rgba(124,58,237,0.3)' : 'none' }}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, textAlign: 'center' as const, padding: '20px', borderRadius: 16, background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>🎉 <strong>Start free</strong> — 30 credits on signup. No credit card. Image & website generation free without account.</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 24px', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: P, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 10 }}>Loved by creators</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#111827', margin: 0 }}>What our users say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 20, border: '1px solid #F3F4F6', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <StarRow n={t.rating} />
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: '14px 0 18px' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#111827', margin: 0 }}>Frequently asked questions</h2>
          </div>
          {FAQS.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 24px', background: '#FAFBFF', borderTop: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' as const, padding: '60px 40px', borderRadius: 28, background: G, boxShadow: '0 30px 80px rgba(124,58,237,0.25)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'white', margin: '0 0 14px', lineHeight: 1.15 }}>Start creating for free today.</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', margin: '0 0 32px', lineHeight: 1.6 }}>30 free credits on signup. No credit card needed. Credits never expire.</p>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', borderRadius: 14, fontSize: 16, fontWeight: 700, color: P, textDecoration: 'none', background: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              Get started free <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#111827', padding: '60px 24px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ marginBottom: 14 }}>
                <LogoLight />
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 260, color: 'rgba(255,255,255,0.45)', marginBottom: 14 }}>
                Pay-as-you-go AI creation platform. Images, videos, websites, chat and code — no subscription needed.
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>20 credits = $1 · Credits never expire</p>
            </div>
            {[
              { title: 'Tools',   links: ['Image Generator','Video Generator','Website Builder','AI Chat','Code Builder'] },
              { title: 'Company', links: ['About','Blog','Pricing','Sign in','Register'] },
              { title: 'Legal',   links: ['Privacy Policy','Terms of Service','Cookie Policy'] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{col.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                    >{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>© 2025 Studio42. All rights reserved.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>studio42.ai · Everything you imagine. Built by AI.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
