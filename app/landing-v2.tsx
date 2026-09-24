'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ImageIcon, Video, Globe, Code2, MessageSquare,
  Check, ArrowRight, Loader2, AlertCircle,
  Sparkles, Menu, X, Zap, Play, ChevronDown,
  TrendingDown, Star,
} from 'lucide-react'
import { api } from '@/lib/api'
import Logo from '@/components/ui/Logo'

type Tool = 'image' | 'video' | 'website' | 'builder'
type HeroTab = 'image' | 'video' | 'chat' | 'website' | 'builder'

interface Plan {
  plan: string; title: string; description: string
  features: { id: string; title: string }[]
  totalSteps: number; estimatedCredits: number
}

// ── Local images ──────────────────────────────────────────
const SHOWCASE = [
  { src: '/samples/s1.jpg' }, { src: '/samples/s2.jpg' },
  { src: '/samples/s3.jpg' }, { src: '/samples/s4.jpg' },
  { src: '/samples/s5.jpg' }, { src: '/samples/s6.jpg' },
  { src: '/samples/s7.jpg' }, { src: '/samples/s8.jpg' },
]
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

// ── Models ────────────────────────────────────────────────
const ALL_MODELS = [
  { name: 'FLUX 1.1 Pro',    category: 'Image',   color: '#7B2FBE' },
  { name: 'GPT Image 2',     category: 'Image',   color: '#10A37F' },
  { name: 'Ideogram v2',     category: 'Image',   color: '#E11D48' },
  { name: 'Recraft v3',      category: 'Image',   color: '#0284C7' },
  { name: 'FLUX Schnell',    category: 'Image',   color: '#7B2FBE' },
  { name: 'Seedance 2.0',    category: 'Video',   color: '#4F8EF7' },
  { name: 'Kling v3',        category: 'Video',   color: '#7B2FBE' },
  { name: 'Kling v3 Omni',   category: 'Video',   color: '#F59E0B' },
  { name: 'Wan 2.1',         category: 'Video',   color: '#10B981' },
  { name: 'Claude Sonnet 4', category: 'Chat',    color: '#D97706' },
  { name: 'Claude Haiku',    category: 'Chat',    color: '#D97706' },
  { name: 'GPT-4o',          category: 'Chat',    color: '#10A37F' },
  { name: 'GPT-4o mini',     category: 'Chat',    color: '#10A37F' },
  { name: 'Gemini Pro',      category: 'Chat',    color: '#4F8EF7' },
  { name: 'Gemini Flash',    category: 'Chat',    color: '#4F8EF7' },
]

// ── Generator tools ───────────────────────────────────────
const TOOLS = [
  { id: 'image'   as Tool, label: 'Image',      icon: ImageIcon, placeholder: 'A lone wolf on a cliff at midnight, aurora borealis above…',    cost: '4 cr',  free: true  },
  { id: 'website' as Tool, label: 'Website',    icon: Globe,     placeholder: 'A premium landing page for a luxury watch brand called Aurum…',  cost: '20 cr', free: true  },
  { id: 'video'   as Tool, label: 'Video',      icon: Video,     placeholder: 'A slow cinematic drone shot over a misty forest at golden hour…', cost: '40 cr', free: false },
  { id: 'builder' as Tool, label: 'AI Builder', icon: Code2,     placeholder: 'A stock trading platform with charts and portfolio tracker…',     cost: 'Free',  free: true  },
]

const HERO_TABS = [
  { id: 'image'   as HeroTab, label: 'Image',      icon: ImageIcon    },
  { id: 'video'   as HeroTab, label: 'Video',      icon: Video        },
  { id: 'chat'    as HeroTab, label: 'AI Chat',    icon: MessageSquare},
  { id: 'website' as HeroTab, label: 'Website',    icon: Globe        },
  { id: 'builder' as HeroTab, label: 'AI Builder', icon: Code2        },
]

const COMPETITORS = [
  { name: 'Midjourney', price: '$10/mo',        tools: 1, expires: true  },
  { name: 'Runway',     price: '$15/mo',        tools: 1, expires: true  },
  { name: 'Higgsfield', price: '$15/mo',        tools: 2, expires: true  },
  { name: 'HIX.AI',     price: '$20+/mo',       tools: 5, expires: true  },
  { name: 'Studio42',   price: 'Pay as you go', tools: 5, expires: false, highlight: true },
]

// ── Marquee ───────────────────────────────────────────────
function MarqueeRow({ items, direction = 'left' }: {
  items: { src: string; label: string }[]
  direction?: 'left' | 'right'
}) {
  const doubled = [...items, ...items]
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', zIndex: 10, background: 'linear-gradient(to right, #0D0F1A, transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', zIndex: 10, background: 'linear-gradient(to left, #0D0F1A, transparent)', pointerEvents: 'none' }} />
      <div className={direction === 'left' ? 'marquee-left' : 'marquee-right'}
        style={{ display: 'flex', gap: '12px', width: 'max-content' }}>
        {doubled.map((item, i) => (
          <div key={i} className="group" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, width: '180px', height: '130px' }}>
            <img src={item.src} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} className="group-hover:scale-110" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-end p-2" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <span style={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Model marquee ─────────────────────────────────────────
function ModelMarquee() {
  const doubled = [...ALL_MODELS, ...ALL_MODELS]
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100px', zIndex: 10, background: 'linear-gradient(to right, #0D0F1A, transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100px', zIndex: 10, background: 'linear-gradient(to left, #0D0F1A, transparent)', pointerEvents: 'none' }} />
      <div className="marquee-left" style={{ display: 'flex', gap: '10px', width: 'max-content', padding: '4px 0' }}>
        {doubled.map((m, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '7px 14px', borderRadius: '100px', flexShrink: 0,
            background: `${m.color}12`,
            border: `1px solid ${m.color}25`,
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.color, flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{m.name}</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{m.category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Hero tab content ──────────────────────────────────────
function HeroTabContent({ tab }: { tab: HeroTab }) {
  if (tab === 'image') return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {SHOWCASE.slice(0, 8).map((img, i) => (
          <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '1' }}>
            <img src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Generated with FLUX 1.1 Pro · 4 credits each</p>
        <Link href="/register" style={{ fontSize: '12px', fontWeight: 700, color: '#C4A8FF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Generate yours <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )

  if (tab === 'video') return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {VIDEO_SAMPLES.map((v, i) => (
          <div key={i} className="group" style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '16/9' }}>
            <img src={v.src} alt={v.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(123,47,190,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={12} color="white" fill="white" style={{ marginLeft: '2px' }} />
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
              <p style={{ color: 'white', fontSize: '10px', fontWeight: 600, margin: 0 }}>{v.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Wan 2.1 · Seedance 2.0 · Kling v3 · from 35 credits</p>
        <Link href="/register" style={{ fontSize: '12px', fontWeight: 700, color: '#93C5FD', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Generate yours <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )

  if (tab === 'chat') return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'linear-gradient(135deg, #D97706, #4F8EF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white' }}>AI</div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>Claude Sonnet 4</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[{ name: 'GPT-4o', color: '#10A37F' }, { name: 'Gemini', color: '#4F8EF7' }, { name: 'Haiku', color: '#D97706' }].map(m => (
            <span key={m.name} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '6px', background: `${m.color}15`, color: m.color, fontWeight: 600 }}>{m.name}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ maxWidth: '70%', padding: '8px 12px', borderRadius: '12px', borderBottomRightRadius: '4px', background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', fontSize: '12px', color: 'white', lineHeight: 1.5 }}>
            Write a marketing strategy for a PAYG AI platform
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, #D97706, #4F8EF7)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: 'white' }}>AI</div>
          <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: '12px', borderTopLeftRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
            Here's a comprehensive strategy: Focus on <strong style={{ color: 'white' }}>developers and freelancers</strong> who create occasionally. The key message: pay only when you create, credits never expire…
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ maxWidth: '70%', padding: '8px 12px', borderRadius: '12px', borderBottomRightRadius: '4px', background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', fontSize: '12px', color: 'white', lineHeight: 1.5 }}>
            Now switch to GPT-4o and expand on social media
          </div>
        </div>
      </div>
      <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Switch models anytime…</div>
        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowRight size={12} color="white" />
        </div>
      </div>
    </div>
  )

  if (tab === 'website') return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
      <div style={{ padding: '8px 12px', background: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#FF5F57', '#FFBD2E', '#28C840'].map(c => <div key={c} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '5px', padding: '3px 10px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>studio42.ai/preview/website</div>
      </div>
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' }}>
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '5px', width: '55%', margin: '0 auto' }} />
        <div style={{ height: '7px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', width: '75%', margin: '0 auto' }} />
        <div style={{ height: '7px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', width: '60%', margin: '0 auto' }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
          <div style={{ padding: '6px 16px', background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', borderRadius: '6px' }}>
            <div style={{ height: '6px', width: '50px', background: 'rgba(255,255,255,0.9)', borderRadius: '3px' }} />
          </div>
          <div style={{ padding: '6px 16px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px' }}>
            <div style={{ height: '6px', width: '40px', background: 'rgba(255,255,255,0.4)', borderRadius: '3px' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '3px', width: '60%', marginBottom: '6px' }} />
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', width: '90%' }} />
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', width: '70%', marginTop: '4px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (tab === 'builder') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '4px' }}>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 3px' }}>Your idea:</p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0, fontStyle: 'italic' }}>"Build an e-commerce store with products, cart and Stripe payments"</p>
      </div>
      {[
        { label: 'BASIC',    steps: 5,  credits: 45,  color: '#10B981', features: ['Auth', 'Products', 'Cart', 'Payments', 'Deploy'] },
        { label: 'MEDIUM',   steps: 10, credits: 125, color: '#4F8EF7', features: ['Everything in Basic', 'Admin panel', 'Email', 'Analytics'] },
        { label: 'ADVANCED', steps: 15, credits: 245, color: '#7B2FBE', features: ['Everything in Medium', 'AI features', 'Mobile API', 'CI/CD'] },
      ].map(plan => (
        <div key={plan.label} style={{ borderRadius: '10px', padding: '10px 14px', border: `1px solid ${plan.color}25`, background: `${plan.color}08`, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: `${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Code2 size={14} style={{ color: plan.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: plan.color, letterSpacing: '0.06em' }}>{plan.label}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{plan.steps} steps · ~{plan.credits} cr</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {plan.features.slice(0, 3).map(f => (
                <span key={f} style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>{f}</span>
              ))}
              {plan.features.length > 3 && <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>+{plan.features.length - 3}</span>}
            </div>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Free preview · Sign up to start building</p>
        <Link href="/register" style={{ fontSize: '12px', fontWeight: 700, color: '#FCD34D', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Try free <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )

  return null
}

// ── Feature row ───────────────────────────────────────────
function FeatureRow({
  badge, badgeColor, headline, description, features, featureColor,
  cta, ctaHref, ctaColor, visual, reverse = false,
}: {
  badge: string; badgeColor: string; headline: string; description: string
  features: string[]; featureColor: string; cta: string; ctaHref: string
  ctaColor: string; visual: React.ReactNode; reverse?: boolean
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '5rem',
      alignItems: 'center',
      direction: reverse ? 'rtl' : 'ltr',
    }}>
      <div style={{ direction: 'ltr' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          padding: '5px 12px', borderRadius: '100px',
          background: `${badgeColor}12`, border: `1px solid ${badgeColor}25`,
          marginBottom: '1.25rem',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: badgeColor }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: badgeColor }}>{badge}</span>
        </div>
        <h2 style={{
          fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800,
          letterSpacing: '-0.02em', color: 'white',
          margin: '0 0 1rem', lineHeight: 1.1,
        }}>
          {headline}
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
          {description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '2rem' }}>
          {features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: `${featureColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={11} style={{ color: featureColor }} />
              </div>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}>{f}</span>
            </div>
          ))}
        </div>
        <Link href={ctaHref} style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          padding: '11px 22px', borderRadius: '12px',
          fontSize: '14px', fontWeight: 700, textDecoration: 'none', color: 'white',
          background: `linear-gradient(135deg, ${ctaColor}, ${ctaColor}aa)`,
          boxShadow: `0 4px 20px ${ctaColor}30`,
        }}>
          {cta} <ArrowRight size={14} />
        </Link>
      </div>
      <div style={{ direction: 'ltr' }}>
        {visual}
      </div>
    </div>
  )
}

// ── Screen mockup wrapper ─────────────────────────────────
function ScreenCard({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div style={{
      borderRadius: '20px', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
      background: '#111827',
      boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    }}>
      {title && (
        <div style={{ padding: '10px 14px', background: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['#FF5F57', '#FFBD2E', '#28C840'].map(c => <div key={c} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c }} />)}
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{title}</span>
        </div>
      )}
      {children}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────
export default function LandingV2() {
  const [heroTab,      setHeroTab]      = useState<HeroTab>('image')
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

  const G        = 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 50%, #00C2FF 100%)'
  const gradText = { background: G, WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const, backgroundClip: 'text' as const }

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
          setImagePolling(false); setLoading(false); clearInterval(interval)
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        } else if (res.data.status === 'failed') {
          setError('Generation failed.'); setImagePolling(false); setLoading(false); clearInterval(interval)
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
        setBuilderPlans(res.data.plans); setSelectedPlan(res.data.plans[1] || res.data.plans[0])
        setLoading(false)
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Generation failed.'); setLoading(false)
    }
  }

  const isGenerating = loading || imagePolling
  const hasResult    = imageUrl || websiteHtml || builderPlans.length > 0

  return (
    <div className="min-h-screen text-white" style={{ background: '#0D0F1A', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,15,26,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '1.75rem' }}>
            {[['#hero-tabs', 'Try free'], ['#how-it-works', 'How it works'], ['#models', 'Models'], ['#pricing', 'Pricing']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >{label}</a>
            ))}
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
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
            <Link href="/login"    style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" style={{ padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 700, fontSize: '14px', textDecoration: 'none', color: 'white', background: G }}>Start free</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '5rem 1.5rem 3rem', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(123,47,190,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', border: '1px solid rgba(123,47,190,0.3)', background: 'rgba(123,47,190,0.1)', marginBottom: '1.75rem' }}>
            <Zap size={12} color="#C4A8FF" fill="#C4A8FF" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#C4A8FF' }}>Pay as you go · No subscription · Credits never expire</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em', margin: '0 0 1.25rem', color: 'white' }}>
            Your ultimate
            <br />
            <span style={gradText}>AI creation platform.</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', maxWidth: '580px', margin: '0 auto 2.5rem' }}>
            Images, videos, websites, code and AI chat.
            One wallet. Pay only when you create. Credits never expire.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', color: 'white', background: G, boxShadow: '0 8px 32px rgba(123,47,190,0.35)' }}>
              Start free — 30 credits <ArrowRight size={16} />
            </Link>
            <a href="#try-free" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 24px', borderRadius: '14px', fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none' }}>
              Try without signup
            </a>
          </div>

          {/* ── HERO TABS ── */}
          <div id="hero-tabs" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', boxShadow: '0 0 100px rgba(123,47,190,0.08)' }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', gap: '2px', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
              {HERO_TABS.map(tab => {
                const Icon   = tab.icon
                const active = heroTab === tab.id
                return (
                  <button key={tab.id} onClick={() => setHeroTab(tab.id)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '9px 6px', borderRadius: '12px', border: active ? '1px solid rgba(123,47,190,0.3)' : '1px solid transparent',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                      background: active ? 'rgba(123,47,190,0.18)' : 'transparent',
                      color: active ? 'white' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    <Icon size={14} style={{ color: active ? '#C4A8FF' : undefined }} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>
            {/* Tab content */}
            <div style={{ padding: '1.5rem' }}>
              <HeroTabContent tab={heroTab} />
            </div>
          </div>

          {/* Trust line */}
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginTop: '1rem' }}>
            No credit card required · 30 free credits on signup · Image, Website & Builder free to try
          </p>
        </div>
      </section>

      {/* ── MODEL MARQUEE ── */}
      <section style={{ padding: '2.5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          Powered by the world's best AI models
        </p>
        <ModelMarquee />
      </section>

      {/* ── FREE GENERATOR ── */}
      <section id="try-free" style={{ padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(0,194,255,0.25)', background: 'rgba(0,194,255,0.06)', marginBottom: '1rem' }}>
              <Sparkles size={12} color="#00C2FF" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#00C2FF' }}>Try it free — no account needed</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: 0 }}>
              Create something <span style={gradText}>right now.</span>
            </h2>
          </div>

          <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', gap: '4px', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
              {TOOLS.map(tool => {
                const Icon   = tool.icon
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
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <textarea rows={3} disabled={isGenerating} value={prompt} onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate() } }}
                placeholder={currentTool.placeholder}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: '15px', lineHeight: 1.6, color: 'white', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 1.5rem 1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: 'rgba(123,47,190,0.15)', border: '1px solid rgba(123,47,190,0.25)', color: '#C4A8FF' }}>⚡ {currentTool.cost}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>{currentTool.free ? 'Free · No signup' : 'Requires account'}</span>
              </div>
              <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: 'white', background: G, opacity: (!prompt.trim() || isGenerating) ? 0.4 : 1, transition: 'opacity 0.2s' }}
              >
                {isGenerating ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : <><Sparkles size={14} /> Generate</>}
              </button>
            </div>
          </div>
          {error && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: '13px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      </section>

      {/* ── Generator result ── */}
      {(isGenerating || hasResult) && (
        <section ref={resultRef} style={{ padding: '0 1.5rem 4rem' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(255,255,255,0.02)' }}>
            {isGenerating && (
              <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={24} color="white" className="animate-spin" />
                </div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'white', margin: 0 }}>
                  {activeTool === 'image' ? 'Creating your image…' : activeTool === 'website' ? 'Building your website…' : 'Analyzing your project…'}
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Usually 15–30 seconds</p>
              </div>
            )}
            {imageUrl && !isGenerating && (
              <div className="group" style={{ position: 'relative' }}>
                <img src={imageUrl} alt={prompt} style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', background: 'black', display: 'block' }} />
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

      {/* ── IMAGE GALLERY MARQUEE ── */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          Generated with Studio42 · FLUX 1.1 Pro
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <MarqueeRow items={ROW1} direction="left" />
          <MarqueeRow items={ROW2} direction="right" />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '6rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 12px' }}>
              Five tools. <span style={gradText}>One platform.</span>
            </h2>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', maxWidth: '520px', margin: '0 auto' }}>
              Everything a developer, designer or creator needs — pay only for what you use.
            </p>
          </div>

          {/* Feature rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7rem' }}>

            {/* ROW 1 — AI CHAT */}
            <FeatureRow
              badge="AI Chat · New"
              badgeColor="#10B981"
              headline="Every AI model. One chat. No subscription."
              description="Stop paying $20/month each for ChatGPT, Claude and Gemini. Access all 6 models from one credit wallet. Switch models mid-conversation."
              features={[
                'GPT-4o, Claude Sonnet, Gemini Pro and more',
                'Streaming responses word by word',
                'Switch models mid-conversation',
                'From 1 credit per message',
                'Full conversation history saved',
              ]}
              featureColor="#10B981"
              cta="Start chatting free"
              ctaHref="/register"
              ctaColor="#10B981"
              visual={
                <ScreenCard title="studio42.ai/dashboard/chat">
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      {[{ name: 'GPT-4o', color: '#10A37F' }, { name: 'Claude Sonnet', color: '#D97706' }, { name: 'Gemini Pro', color: '#4F8EF7' }, { name: 'GPT mini', color: '#10A37F' }, { name: 'Haiku', color: '#D97706' }, { name: 'Flash', color: '#4F8EF7' }].map(m => (
                        <span key={m.name} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '7px', background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}25` }}>{m.name}</span>
                      ))}
                    </div>
                    {[
                      { role: 'user', text: 'Write a compelling value prop for Studio42' },
                      { role: 'ai', text: 'Studio42 is the only AI creation platform that charges you nothing until you actually create something. Every other tool bills you $15-99/month whether you use it or not...' },
                      { role: 'user', text: 'Now switch to GPT-4o and make it punchier' },
                      { role: 'ai', text: 'Pay when you create. Not when you don\'t. Studio42 gives you every major AI model — FLUX, Claude, GPT-4o, Kling — with credits that never expire.' },
                    ].map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '7px' }}>
                        {msg.role === 'ai' && (
                          <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #D97706, #4F8EF7)', flexShrink: 0, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: 'white' }}>AI</div>
                        )}
                        <div style={{ maxWidth: '80%', padding: '8px 11px', borderRadius: '11px', fontSize: '12px', lineHeight: 1.5, background: msg.role === 'user' ? 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' : 'rgba(255,255,255,0.06)', border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none', color: msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.75)' }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '9px', padding: '7px 11px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Message AI…</div>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowRight size={13} color="white" />
                      </div>
                    </div>
                  </div>
                </ScreenCard>
              }
            />

            {/* ROW 2 — IMAGE */}
            <FeatureRow
              reverse
              badge="Image Generation"
              badgeColor="#7B2FBE"
              headline="Stunning images from a single sentence."
              description="Powered by FLUX 1.1 Pro — the most advanced image model. Photorealistic quality with exceptional prompt adherence. Multiple models coming soon."
              features={[
                'FLUX 1.1 Pro — best quality available',
                'Multiple styles and aspect ratios',
                'Download full resolution, no watermark',
                '4 credits per image (~$0.20)',
                'GPT Image 2, Ideogram, Recraft coming soon',
              ]}
              featureColor="#7B2FBE"
              cta="Generate free"
              ctaHref="#try-free"
              ctaColor="#7B2FBE"
              visual={
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '8px' }}>
                    {['/samples/s1.jpg', '/samples/s2.jpg', '/samples/s3.jpg', '/samples/s4.jpg'].map((src, i) => (
                      <div key={i} className="group" style={{ borderRadius: '14px', overflow: 'hidden', aspectRatio: '1', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <img src={src} alt="" className="group-hover:scale-105 transition-transform duration-500" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {['/samples/s5.jpg', '/samples/s6.jpg', '/samples/s7.jpg', '/samples/s8.jpg'].map((src, i) => (
                      <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '1', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ))}
                  </div>
                </div>
              }
            />

            {/* ROW 3 — VIDEO */}
            <FeatureRow
              badge="Video Generation"
              badgeColor="#4F8EF7"
              headline="Cinematic videos with native audio."
              description="Choose from 4 video models — from budget to pro. Native audio, 1080p, up to 15 seconds. Powered by Seedance 2.0, Kling v3 and Wan 2.1."
              features={[
                'Wan 2.1 — fast and reliable (35 cr)',
                'Seedance 2.0 — native audio + better motion (50 cr)',
                'Kling v3 — cinematic 1080p up to 15s (60 cr)',
                'Kling v3 Omni — reference images + editing (80 cr)',
                '16:9, 9:16 and 1:1 aspect ratios',
              ]}
              featureColor="#4F8EF7"
              cta="Sign up to generate"
              ctaHref="/register"
              ctaColor="#4F8EF7"
              visual={
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {VIDEO_SAMPLES.slice(0, 4).map((v, i) => (
                    <div key={i} className="group" style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                      <img src={v.src} alt={v.label} className="group-hover:scale-105 transition-transform duration-500" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(79,142,247,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play size={12} color="white" fill="white" style={{ marginLeft: '2px' }} />
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                        <p style={{ color: 'white', fontSize: '10px', fontWeight: 600, margin: 0 }}>{v.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              }
            />

            {/* ROW 4 — WEBSITE */}
            <FeatureRow
              reverse
              badge="Website Builder"
              badgeColor="#00C2FF"
              headline="Full websites in 30 seconds."
              description="Describe any website. Claude Sonnet 4 builds a complete, responsive, production-ready site with real content — not a template."
              features={[
                'Claude Sonnet 4 — world-class code generation',
                'Full HTML + CSS + JS in one file',
                'Fully responsive — mobile, tablet, desktop',
                'Download source code, no watermark',
                '20 credits per website (~$1.00)',
              ]}
              featureColor="#00C2FF"
              cta="Try free"
              ctaHref="#try-free"
              ctaColor="#00C2FF"
              visual={
                <ScreenCard title="studio42.ai/preview/website">
                  <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '260px' }}>
                    <div style={{ height: '11px', background: 'rgba(255,255,255,0.85)', borderRadius: '6px', width: '52%', margin: '0 auto' }} />
                    <div style={{ height: '7px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', width: '72%', margin: '0 auto' }} />
                    <div style={{ height: '7px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', width: '58%', margin: '0 auto' }} />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
                      <div style={{ padding: '7px 18px', background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', borderRadius: '7px' }}>
                        <div style={{ height: '7px', width: '55px', background: 'rgba(255,255,255,0.9)', borderRadius: '4px' }} />
                      </div>
                      <div style={{ padding: '7px 18px', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '7px' }}>
                        <div style={{ height: '7px', width: '45px', background: 'rgba(255,255,255,0.4)', borderRadius: '4px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '9px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div style={{ height: '7px', background: 'rgba(255,255,255,0.5)', borderRadius: '4px', width: '55%', marginBottom: '7px' }} />
                          <div style={{ height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', marginBottom: '4px' }} />
                          <div style={{ height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', width: '75%' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: '6px' }}>Generated by Claude Sonnet 4 · studio42.ai</span>
                    </div>
                  </div>
                </ScreenCard>
              }
            />

            {/* ROW 5 — BUILDER */}
            <FeatureRow
              badge="AI Code Builder"
              badgeColor="#F59E0B"
              headline="Full stack apps, built step by step."
              description="Describe your app idea. Get a complete production codebase with MongoDB, Node.js backend and Next.js frontend — generated step by step with explanations."
              features={[
                'Choose Basic (5 steps) to Advanced (15 steps)',
                'MongoDB + Node.js + Next.js full stack',
                'Step by step with full explanations',
                'Download production-ready ZIP',
                'Free plan preview — no signup needed',
              ]}
              featureColor="#F59E0B"
              cta="Try free preview"
              ctaHref="#try-free"
              ctaColor="#F59E0B"
              visual={
                <div style={{ borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.04)' }}>
                  <div style={{ marginBottom: '1rem', padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>Your idea:</p>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0, fontStyle: 'italic' }}>"A food delivery app with restaurants, cart and Stripe payments"</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'BASIC',    steps: 5,  credits: 45,  color: '#10B981', features: ['Auth', 'Products', 'Cart', 'Payments'] },
                      { label: 'MEDIUM',   steps: 10, credits: 125, color: '#4F8EF7', features: ['Everything in Basic', 'Admin', 'Emails', 'Analytics'] },
                      { label: 'ADVANCED', steps: 15, credits: 245, color: '#7B2FBE', features: ['Everything in Medium', 'AI', 'Mobile API', 'CI/CD'] },
                    ].map(plan => (
                      <div key={plan.label} style={{ borderRadius: '12px', padding: '12px 14px', border: `1px solid ${plan.color}25`, background: `${plan.color}08`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Code2 size={15} style={{ color: plan.color }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: plan.color }}>{plan.label}</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{plan.steps} steps · ~{plan.credits} cr</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {plan.features.slice(0, 3).map(f => (
                              <span key={f} style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '5px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>{f}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#34D399', fontWeight: 600 }}>Plan ready · Choose and start building</span>
                  </div>
                </div>
              }
            />

          </div>
        </div>
      </section>

      {/* ── MODELS SECTION ── */}
      <section id="models" style={{ padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 12px' }}>
              Only the <span style={gradText}>best models.</span>
            </h2>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', maxWidth: '500px', margin: '0 auto' }}>
              We integrate only the highest quality models — curated for reliability, output quality and speed.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {[
              { category: 'Image Models',   color: '#7B2FBE', icon: ImageIcon,    models: ['FLUX 1.1 Pro', 'GPT Image 2', 'Ideogram v2', 'Recraft v3', 'FLUX Schnell'], coming: ['FLUX Ultra', 'Midjourney'] },
              { category: 'Video Models',   color: '#4F8EF7', icon: Video,        models: ['Wan 2.1', 'Seedance 2.0', 'Kling v3', 'Kling v3 Omni'], coming: ['Veo 3', 'Sora 2'] },
              { category: 'Chat Models',    color: '#10B981', icon: MessageSquare, models: ['GPT-4o', 'GPT-4o mini', 'Claude Sonnet 4', 'Claude Haiku', 'Gemini Pro', 'Gemini Flash'], coming: [] },
            ].map(cat => {
              const Icon = cat.icon
              return (
                <div key={cat.category} style={{ borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', borderRadius: '50%', background: `radial-gradient(circle, ${cat.color}10 0%, transparent 70%)`, pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} style={{ color: cat.color }} />
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'white', margin: 0 }}>{cat.category}</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {cat.models.map(m => (
                      <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{m}</span>
                      </div>
                    ))}
                    {cat.coming.map(m => (
                      <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>{m}</span>
                        <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>Soon</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>

            {/* Comparison */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1.25rem' }}>
                <TrendingDown size={13} color="#FCA5A5" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FCA5A5' }}>Stop overpaying</span>
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 1rem', lineHeight: 1.1 }}>
                The smarter way to pay.
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                Most creators waste 60-80% of their monthly credits. Studio42 charges nothing until you actually create.
              </p>
              <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Platform', 'Price', 'Tools', 'Expires'].map(h => <div key={h} style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)' }}>{h}</div>)}
                </div>
                {COMPETITORS.map((c, i) => (
                  <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 14px', alignItems: 'center', background: (c as any).highlight ? 'rgba(123,47,190,0.08)' : 'transparent', borderLeft: (c as any).highlight ? '3px solid #7B2FBE' : '3px solid transparent', borderBottom: i !== COMPETITORS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: (c as any).highlight ? 'white' : 'rgba(255,255,255,0.45)' }}>{c.name}</span>
                      {(c as any).highlight && <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '5px', background: G, color: 'white' }}>YOU</span>}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: (c as any).highlight ? '#34D399' : '#F87171' }}>{c.price}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: (c as any).highlight ? 'white' : 'rgba(255,255,255,0.35)' }}>{c.tools}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: c.expires ? '#F87171' : '#34D399' }}>{c.expires ? '✗ Yes' : '✓ Never'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Packages */}
            <div>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 6px', lineHeight: 1.1 }}>
                Simple, honest pricing.
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', margin: '0 0 1.5rem' }}>
                20 credits = $1 · Buy once · Never expires
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '1.25rem' }}>
                {[
                  { credits: 100,  price: 5,  desc: '~25 images',  popular: false },
                  { credits: 250,  price: 10, desc: '~62 images',  popular: true  },
                  { credits: 600,  price: 20, desc: '~150 images', popular: false },
                  { credits: 1500, price: 40, desc: '~375 images', popular: false },
                ].map(pkg => (
                  <div key={pkg.credits} style={{ position: 'relative', borderRadius: '16px', padding: '1.25rem', textAlign: 'center', border: pkg.popular ? '2px solid rgba(123,47,190,0.5)' : '1px solid rgba(255,255,255,0.07)', background: pkg.popular ? 'rgba(123,47,190,0.1)' : 'rgba(255,255,255,0.02)', transition: 'transform 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
                  >
                    {pkg.popular && <span style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '100px', background: G, color: 'white', whiteSpace: 'nowrap' as const }}>POPULAR</span>}
                    <div style={{ fontSize: '26px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{pkg.credits}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 4px' }}>credits</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>{pkg.desc}</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, ...gradText }}>${pkg.price}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem' }}>
                {['Credits never expire', 'No subscription', 'Stripe secured', 'Instant delivery'].map(f => (
                  <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    <Check size={12} color="#10B981" /> {f}
                  </span>
                ))}
              </div>
              <Link href="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '16px', fontSize: '15px', fontWeight: 700, color: 'white', background: G, textDecoration: 'none', boxShadow: '0 6px 24px rgba(123,47,190,0.3)' }}>
                Start with 30 free credits <ArrowRight size={16} />
              </Link>
              <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '10px' }}>No credit card required</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '8rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 'clamp(160px, 25vw, 320px)', fontWeight: 900, color: 'rgba(255,255,255,0.018)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>42</div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,190,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '680px', margin: '0 auto' }}>
          <Logo size={64} />
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'white', margin: '1.5rem 0 1rem', lineHeight: 1.05 }}>
            Everything you imagine.
            <br />
            <span style={gradText}>Built by AI.</span>
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: '2.5rem' }}>
            In The Hitchhiker's Guide, 42 is the answer to life, the universe and everything.
            Studio42 is the answer to all your AI creation needs.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '18px 40px', borderRadius: '18px', fontSize: '16px', fontWeight: 800, color: '#0D0F1A', background: 'white', boxShadow: '0 8px 40px rgba(255,255,255,0.12)', textDecoration: 'none' }}>
            Get started free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.75rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <Logo size={28} />
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
