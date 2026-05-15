'use client'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Zap, Check } from 'lucide-react'

const STATS = [
  { value: '5',   label: 'AI tools in one'           },
  { value: '$0',  label: 'wasted on unused credits'  },
  { value: '∞',   label: 'credit expiry'             },
  { value: '93%', label: 'average margin savings'    },
]

export default function HeroImage() {
  const G        = 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 50%, #00C2FF 100%)'
  const gradText = {
    background:             G,
    WebkitBackgroundClip:   'text' as const,
    WebkitTextFillColor:    'transparent' as const,
    backgroundClip:         'text' as const,
  }

  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '6rem 1.5rem 4rem', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>

      {/* ── Background image ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img
          src="/samples/r2-aurora.jpg"
          alt=""
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            display: 'block',
            opacity: 0.4,
          }}
        />

        {/* Dark overlay — top to bottom fade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(13,15,26,0.55) 0%, rgba(13,15,26,0.25) 35%, rgba(13,15,26,0.65) 75%, #0D0F1A 100%)',
        }} />

        {/* Side vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(13,15,26,0.55) 100%)',
        }} />

        {/* Brand color tint — subtle purple overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(123,47,190,0.15) 0%, transparent 60%)',
        }} />
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1, width: '100%' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '7px 18px', borderRadius: '100px',
          border: '1px solid rgba(123,47,190,0.4)',
          background: 'rgba(123,47,190,0.15)',
          backdropFilter: 'blur(12px)',
          marginBottom: '2rem',
        }}>
          <Zap size={13} color="#C4A8FF" fill="#C4A8FF" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#C4A8FF', letterSpacing: '0.04em' }}>
            Pay as you go · No subscription · Credits never expire
          </span>
        </div>

        {/* Headline */}
        <h1
          className="display-font"
          style={{
            fontSize: 'clamp(48px, 7.5vw, 88px)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            margin: '0 0 1.5rem',
            color: 'white',
            textShadow: '0 2px 40px rgba(0,0,0,0.5)',
          }}
        >
          Everything you imagine.
          <br />
          <span style={gradText}>Built by AI.</span>
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: 'clamp(17px, 2.2vw, 21px)',
          lineHeight: 1.65,
          color: 'rgba(255,255,255,0.75)',
          maxWidth: '600px',
          margin: '0 auto 2.5rem',
          fontWeight: 400,
          textShadow: '0 1px 20px rgba(0,0,0,0.4)',
        }}>
          Images, videos, websites and complete codebases.
          <br />
          One platform. One credit wallet. Pay only when you create.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '2.5rem' }}>
          {['4 AI tools', 'No subscription', 'Credits never expire', 'Stripe secured'].map(f => (
            <span
              key={f}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.8)',
              }}
            >
              <Check size={12} color="#34D399" />
              {f}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <Link
            href="/register"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '15px 30px', borderRadius: '14px',
              fontSize: '16px', fontWeight: 700,
              textDecoration: 'none', color: 'white',
              background: G,
              boxShadow: '0 8px 32px rgba(123,47,190,0.45)',
            }}
          >
            Start free — 30 credits <ArrowRight size={17} />
          </Link>

          <a
            href="#generator"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '15px 26px', borderRadius: '14px',
              fontSize: '16px', fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              textDecoration: 'none',
            }}
          >
            Try without signup <ChevronRight size={16} />
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'inline-grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
        }}>
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '1.25rem 1.5rem',
                background: 'rgba(13,15,26,0.5)',
                textAlign: 'center',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <div
                className="display-font"
                style={{ fontSize: '26px', fontWeight: 900, color: 'white', lineHeight: 1 }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '5px', lineHeight: 1.3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom fade into page */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '120px', zIndex: 1,
        background: 'linear-gradient(to bottom, transparent, #0D0F1A)',
        pointerEvents: 'none',
      }} />

    </section>
  )
}