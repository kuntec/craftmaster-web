'use client'
import Link from 'next/link'
import { useState } from 'react'

/* ─── Theme tokens ─────────────────────────────────────────── */
const THEMES = {
  light: {
    bg:          '#F7F8FC',
    surface:     '#FFFFFF',
    surfaceAlt:  '#F0F1F8',
    border:      'rgba(0,0,0,0.08)',
    borderStrong:'rgba(0,0,0,0.13)',
    text:        '#0D0F1A',
    muted:       'rgba(13,15,26,0.45)',
    faint:       'rgba(13,15,26,0.22)',
    navBg:       'rgba(247,248,252,0.88)',
    statsBg:     '#FFFFFF',
    cardBg:      '#FFFFFF',
    cardHover:   '#F5F3FF',
    cardBorder:  'rgba(0,0,0,0.07)',
    faqBg:       '#FFFFFF',
    footerBorder:'rgba(0,0,0,0.08)',
    stepNumCol:  'rgba(123,47,190,0.18)',
    pricingBg:   '#FFFFFF',
    exampleBg:   '#F5F3FF',
    exampleBorder:'rgba(123,47,190,0.2)',
    ctaCard:     'linear-gradient(135deg,rgba(123,47,190,0.08),rgba(79,142,247,0.06))',
    ctaBorder:   'rgba(123,47,190,0.2)',
    badgeBg:     'rgba(123,47,190,0.08)',
    badgeBorder: 'rgba(123,47,190,0.22)',
    badgeText:   '#6D28D9',
    toggleBg:    '#E8E4F4',
    toggleIcon:  '#7B2FBE',
    switchVisual:'#F0EDFA',
  },
  dark: {
    bg:          '#07080F',
    surface:     '#0D0F1A',
    surfaceAlt:  '#111320',
    border:      'rgba(255,255,255,0.06)',
    borderStrong:'rgba(255,255,255,0.11)',
    text:        '#FFFFFF',
    muted:       'rgba(255,255,255,0.45)',
    faint:       'rgba(255,255,255,0.22)',
    navBg:       'rgba(7,8,15,0.88)',
    statsBg:     'transparent',
    cardBg:      'rgba(255,255,255,0.03)',
    cardHover:   'rgba(123,47,190,0.08)',
    cardBorder:  'rgba(255,255,255,0.07)',
    faqBg:       'rgba(255,255,255,0.03)',
    footerBorder:'rgba(255,255,255,0.06)',
    stepNumCol:  'rgba(123,47,190,0.35)',
    pricingBg:   'rgba(255,255,255,0.03)',
    exampleBg:   'rgba(123,47,190,0.08)',
    exampleBorder:'rgba(123,47,190,0.2)',
    ctaCard:     'linear-gradient(135deg,rgba(123,47,190,0.2),rgba(79,142,247,0.15))',
    ctaBorder:   'rgba(123,47,190,0.3)',
    badgeBg:     'rgba(123,47,190,0.15)',
    badgeBorder: 'rgba(123,47,190,0.35)',
    badgeText:   '#C4A8FF',
    toggleBg:    'rgba(255,255,255,0.08)',
    toggleIcon:  '#C4A8FF',
    switchVisual:'rgba(123,47,190,0.15)',
  },
}

/* ─── Step visual mock cards ───────────────────────────────── */
function StepVisual01({ t }: { t: typeof THEMES.light }) {
  return (
    <div style={{ background: t.switchVisual, borderRadius: 14, padding: 20, minHeight: 180, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#7B2FBE', letterSpacing: '0.1em', textTransform: 'uppercase' }}>New Project</div>
      <div style={{ background: t.surface, borderRadius: 10, padding: '12px 14px', border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 11, color: t.muted, marginBottom: 6 }}>Project name</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>My YouTube Short</div>
      </div>
      <div style={{ background: t.surface, borderRadius: 10, padding: '12px 14px', border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 11, color: t.muted, marginBottom: 6 }}>Your idea</div>
        <div style={{ fontSize: 12, color: t.text, lineHeight: 1.5 }}>A 60-second explainer about how black holes form...</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {['YouTube', 'TikTok', 'Reel'].map((c, i) => (
          <div key={c} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: i === 0 ? '#7B2FBE' : t.border, color: i === 0 ? 'white' : t.muted, fontWeight: 600 }}>{c}</div>
        ))}
      </div>
    </div>
  )
}

function StepVisual02({ t }: { t: typeof THEMES.light }) {
  return (
    <div style={{ background: t.switchVisual, borderRadius: 14, padding: 20, minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 800 }}>A</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706' }}>Claude Sonnet writing…</div>
      </div>
      {['Hook: "What if the Sun disappeared—"', 'Scene 1 · The Formation', 'Scene 2 · The Event Horizon', 'Scene 3 · Spaghettification'].map((line, i) => (
        <div key={i} style={{ background: t.surface, borderRadius: 8, padding: '9px 12px', border: `1px solid ${t.border}`, fontSize: 12, color: i === 0 ? '#7B2FBE' : t.text, fontWeight: i === 0 ? 700 : 400, opacity: i === 3 ? 0.4 : 1 }}>
          {line}
          {i === 3 && <span style={{ display: 'inline-block', width: 6, height: 12, background: '#7B2FBE', marginLeft: 4, borderRadius: 1, animation: 'blink 1s infinite' }} />}
        </div>
      ))}
    </div>
  )
}

function StepVisual03({ t }: { t: typeof THEMES.light }) {
  const colors = ['#1a1035', '#2d1b5e', '#4c1d95']
  return (
    <div style={{ background: t.switchVisual, borderRadius: 14, padding: 20, minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>FLUX 1.1 Pro generating</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1 }}>
        {colors.slice(0, 2).map((c, i) => (
          <div key={i} style={{ borderRadius: 10, aspectRatio: '16/10', background: `linear-gradient(135deg, ${c}, ${colors[i + 1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, rgba(196,168,255,0.3), transparent 60%)' }} />
            <span style={{ position: 'relative' }}>{i === 0 ? '🌌' : '⚫'}</span>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7B2FBE, #4F8EF7)', borderRadius: '0 0 10px 10px' }} />
          </div>
        ))}
        <div style={{ borderRadius: 10, aspectRatio: '16/10', background: t.border, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${t.borderStrong}` }}>
          <div style={{ fontSize: 18 }}>⏳</div>
        </div>
        <div style={{ borderRadius: 10, aspectRatio: '16/10', background: t.border, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${t.borderStrong}` }}>
          <div style={{ fontSize: 18 }}>⏳</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: t.muted }}>2 of 4 scenes ready</div>
    </div>
  )
}

function StepVisual04({ t }: { t: typeof THEMES.light }) {
  return (
    <div style={{ background: t.switchVisual, borderRadius: 14, padding: 20, minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F8EF7', boxShadow: '0 0 6px #4F8EF7' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4F8EF7' }}>Seedance 2.0 animating</div>
      </div>
      <div style={{ background: 'linear-gradient(135deg, #1a1035, #2d1b5e)', borderRadius: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 10, position: 'relative', minHeight: 100 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, rgba(196,168,255,0.25), transparent 60%)', borderRadius: 10 }} />
        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 28 }}>🌌</span>
        {/* Timeline */}
        <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: '65%', height: '100%', background: 'linear-gradient(90deg,#7B2FBE,#4F8EF7)', borderRadius: 2 }} />
          <div style={{ position: 'absolute', left: '65%', top: '50%', transform: 'translate(-50%,-50%)', width: 10, height: 10, borderRadius: '50%', background: 'white', boxShadow: '0 0 6px rgba(123,47,190,0.8)' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', borderRadius: 8, padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>⬇ Download MP4</div>
      </div>
    </div>
  )
}

/* ─── Data ─────────────────────────────────────────────────── */
const CHANNEL_TYPES = [
  { name: 'YouTube',         icon: '▶',  color: '#FF0000', desc: 'Long-form with chapters' },
  { name: 'TikTok',          icon: '♪',  color: '#69C9D0', desc: 'Viral short-form' },
  { name: 'Instagram Reels', icon: '◎',  color: '#E1306C', desc: 'Square & vertical' },
  { name: 'LinkedIn',        icon: 'in', color: '#0A66C2', desc: 'Professional content' },
  { name: 'Twitter / X',     icon: '𝕏',  color: '#1D9BF0', desc: 'Short clips ≤2 min' },
  { name: 'Documentary',     icon: '🎬', color: '#8B5CF6', desc: 'Cinematic storytelling' },
]

const STEPS = [
  { number: '01', title: 'Describe your idea',   desc: 'Name your project, pick a channel type, describe your idea and audience. Done in 30 seconds.',                           Visual: StepVisual01 },
  { number: '02', title: 'AI writes the script', desc: 'Claude Sonnet drafts a full script with hooks, scene narration, and timing — ready to edit or approve.',                Visual: StepVisual02 },
  { number: '03', title: 'Generate visuals',      desc: 'FLUX 1.1 Pro creates a cinematic image per scene. Each becomes the first frame of your video clip.',                    Visual: StepVisual03 },
  { number: '04', title: 'Animate & download',   desc: 'Seedance 2.0 animates every image into a smooth video. Download all scenes as MP4 files, ready to edit or publish.', Visual: StepVisual04 },
]

const PRICING = [
  { step: 'Script Generation',  credits: 10, desc: 'Full multi-scene script by Claude Sonnet 4.5' },
  { step: 'Scene Breakdown',    credits: 5,  desc: 'AI-structured scene cards with image & video prompts' },
  { step: 'Scene Image (each)', credits: 4,  desc: 'FLUX 1.1 Pro cinematic still — one per scene' },
  { step: 'Scene Video (each)', credits: 50, desc: 'Seedance 2.0 animated clip — animates from image' },
]

const FAQS = [
  { q: 'How long does generation take?',             a: 'Script + scenes: under 60 s. Each image: ~15 s. Each video: 2–4 min. A 5-scene project is done in under 20 min.' },
  { q: 'What resolution is the output?',             a: 'Videos export at 720p as MP4 files, saved to your history and downloadable any time.' },
  { q: 'Can I edit the script before generating?',   a: 'Yes — after the AI draft you can rewrite every word, tweak scene prompts, and regenerate any individual scene.' },
  { q: 'Do credits expire?',                         a: 'Never. Buy once, use whenever. 20 credits = $1, no subscription needed.' },
  { q: 'What video styles can I create?',            a: 'Documentary, cinematic, educational, corporate, vlog, explainer, news-style and more — just describe it.' },
]

/* ─── Page ─────────────────────────────────────────────────── */
export default function VideoLandingPage() {
  const [dark, setDark]       = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const t = dark ? THEMES.dark : THEMES.light

  const grad = 'linear-gradient(135deg, #7B2FBE, #4F8EF7)'

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif', overflowX: 'hidden', transition: 'background 0.25s, color 0.25s' }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: t.navBg, backdropFilter: 'blur(14px)', borderBottom: `1px solid ${t.border}`, transition: 'background 0.25s, border-color 0.25s' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white' }}>S</div>
            <span style={{ fontWeight: 800, fontSize: 16, color: t.text }}>Studio42</span>
          </div>
          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Theme toggle */}
            <button
              onClick={() => setDark(d => !d)}
              aria-label="Toggle theme"
              style={{ width: 38, height: 38, borderRadius: 10, background: t.toggleBg, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'background 0.2s' }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <Link href="/dashboard" style={{ color: t.muted, fontSize: 14, textDecoration: 'none', padding: '8px 14px', borderRadius: 8 }}>
              Dashboard
            </Link>
            <Link href="/login" style={{ background: grad, color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '8px 20px', borderRadius: 8 }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: 160, paddingBottom: 100, textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: dark ? 'radial-gradient(ellipse, rgba(123,47,190,0.22) 0%, transparent 70%)' : 'radial-gradient(ellipse, rgba(123,47,190,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, borderRadius: 100, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7B2FBE', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: t.badgeText, letterSpacing: '0.06em' }}>AI VIDEO STUDIO — NOW LIVE</span>
          </div>

          <h1 style={{ fontSize: 'clamp(38px, 7vw, 74px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.03em', color: t.text }}>
            Turn any idea into
            <br />
            <span style={{ backgroundImage: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              a full video production
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', color: t.muted, lineHeight: 1.65, marginBottom: 44, maxWidth: 580, margin: '0 auto 44px' }}>
            Describe your idea. Studio42 writes the script, generates cinematic images, and animates every scene — publish-ready in minutes.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ background: grad, color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none', padding: '14px 36px', borderRadius: 12 }}>
              Start Creating Free →
            </Link>
            <Link href="/dashboard/video-studio" style={{ background: t.surface, border: `1px solid ${t.borderStrong}`, color: t.text, fontWeight: 600, fontSize: 16, textDecoration: 'none', padding: '14px 32px', borderRadius: 12, boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.07)' }}>
              Open Studio
            </Link>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: t.faint }}>No subscription · Pay per creation · 20 credits = $1 · Credits never expire</p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`, padding: '28px 0', background: t.statsBg, transition: 'background 0.25s' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'center', gap: 'clamp(32px, 6vw, 80px)', flexWrap: 'wrap' }}>
          {[
            { value: '4',     label: 'AI models in pipeline' },
            { value: '11+',   label: 'Channel types' },
            { value: '~20min',label: 'Average project time' },
            { value: '$1',    label: 'per 20 credits' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 800, backgroundImage: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#7B2FBE', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>HOW IT WORKS</p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 46px)', fontWeight: 800, letterSpacing: '-0.02em', color: t.text }}>
            From idea to finished video<br />in four steps
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {STEPS.map((step, i) => {
            const Visual = step.Visual
            const isEven = i % 2 === 0
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, alignItems: 'center' }}>

                {/* Text side */}
                <div style={{ order: isEven ? 1 : 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#7B2FBE', letterSpacing: '0.08em', marginBottom: 12 }}>STEP {step.number}</div>
                  <h3 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: t.text, marginBottom: 14, letterSpacing: '-0.02em' }}>{step.title}</h3>
                  <p style={{ fontSize: 16, color: t.muted, lineHeight: 1.7, maxWidth: 420 }}>{step.desc}</p>
                </div>

                {/* Visual side */}
                <div style={{ order: isEven ? 2 : 1, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: 24, boxShadow: dark ? 'none' : '0 4px 24px rgba(0,0,0,0.07)' }}>
                  <Visual t={t} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Channel types ── */}
      <section style={{ padding: '80px 24px', background: dark ? 'rgba(255,255,255,0.015)' : t.surfaceAlt, transition: 'background 0.25s' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#7B2FBE', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>CHANNEL TYPES</p>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em', color: t.text }}>Built for every platform</h2>
            <p style={{ marginTop: 14, color: t.muted, fontSize: 16, maxWidth: 480, margin: '14px auto 0' }}>
              Studio42 adapts script length, aspect ratio, and style to the platform you're publishing on.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
            {CHANNEL_TYPES.map((ch, i) => (
              <div key={i}
                style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: '24px 18px', textAlign: 'center', transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s', boxShadow: dark ? 'none' : '0 1px 6px rgba(0,0,0,0.05)', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,47,190,0.4)'; e.currentTarget.style.background = t.cardHover }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.background = t.cardBg }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: ch.color + '18', border: `1px solid ${ch.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 17, fontWeight: 800, color: ch.color }}>
                  {ch.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: t.text, marginBottom: 5 }}>{ch.name}</div>
                <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5 }}>{ch.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ padding: '100px 24px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#7B2FBE', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>TRANSPARENT PRICING</p>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em', color: t.text }}>Pay only for what you create</h2>
          <p style={{ marginTop: 14, color: t.muted, fontSize: 16 }}>No subscription · 20 credits = $1 · Credits never expire</p>
        </div>

        <div style={{ background: t.pricingBg, border: `1px solid ${t.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: dark ? 'none' : '0 4px 24px rgba(0,0,0,0.07)' }}>
          {PRICING.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 32px', borderBottom: i < PRICING.length - 1 ? `1px solid ${t.border}` : 'none', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, color: t.text, marginBottom: 3 }}>{item.step}</div>
                <div style={{ fontSize: 13, color: t.muted }}>{item.desc}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 800, backgroundImage: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{item.credits} cr</div>
                <div style={{ fontSize: 12, color: t.faint, marginTop: 2 }}>≈ ${(item.credits / 20).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, padding: '18px 24px', background: t.exampleBg, border: `1px solid ${t.exampleBorder}`, borderRadius: 14, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>📊</span>
          <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.6 }}>
            <strong style={{ color: t.text }}>Example:</strong> A 5-scene YouTube short costs 10 + 5 + (5×4) + (5×50) = <strong style={{ color: '#7B2FBE' }}>285 credits</strong> — about <strong style={{ color: '#7B2FBE' }}>$14.25</strong> for a complete AI-generated production.
          </p>
        </div>
      </section>

      {/* ── Mid CTA ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 740, margin: '0 auto', background: t.ctaCard, border: `1px solid ${t.ctaBorder}`, borderRadius: 24, padding: 'clamp(40px, 6vw, 64px)', textAlign: 'center', boxShadow: dark ? 'none' : '0 4px 32px rgba(123,47,190,0.1)' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 38px)', fontWeight: 800, marginBottom: 14, letterSpacing: '-0.02em', color: t.text }}>Ready to make your first video?</h2>
          <p style={{ fontSize: 16, color: t.muted, marginBottom: 32, lineHeight: 1.6 }}>
            Start with free credits. No credit card required for your first project.
          </p>
          <Link href="/login" style={{ background: grad, color: 'white', fontWeight: 700, fontSize: 17, textDecoration: 'none', padding: '16px 40px', borderRadius: 12, display: 'inline-block' }}>
            Create your first video →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 24px 100px', maxWidth: 740, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#7B2FBE', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>FAQ</p>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: t.text }}>Common questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((faq, i) => (
            <div key={i}
              style={{ background: t.faqBg, border: `1px solid ${t.border}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.05)', transition: 'background 0.2s' }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: t.text, lineHeight: 1.4 }}>{faq.q}</span>
                <span style={{ color: '#7B2FBE', fontSize: 22, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', lineHeight: 1 }}>+</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 22px 18px', fontSize: 14, color: t.muted, lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${t.footerBorder}`, padding: '36px 24px', textAlign: 'center', transition: 'border-color 0.25s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white' }}>S</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: t.text }}>Studio42</span>
        </div>
        <p style={{ fontSize: 13, color: t.faint }}>© 2025 Studio42. Pay-as-you-go AI creation platform.</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 24, justifyContent: 'center' }}>
          <Link href="/login"                        style={{ fontSize: 13, color: t.muted, textDecoration: 'none' }}>Sign In</Link>
          <Link href="/register"                     style={{ fontSize: 13, color: t.muted, textDecoration: 'none' }}>Sign Up</Link>
          <Link href="/dashboard/video-studio"       style={{ fontSize: 13, color: t.muted, textDecoration: 'none' }}>Video Studio</Link>
        </div>
      </footer>

    </div>
  )
}
