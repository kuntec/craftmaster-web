import {
    ImageIcon, Video, Globe, Code2, MessageSquare,
    Check, ArrowRight, Loader2, AlertCircle,
    X, TrendingDown, Sparkles, Menu, Zap,
    Play, ChevronRight, Star, Download,
  } from 'lucide-react'
import Link from 'next/link'
export default function HeroAnimated() {
    
    const G = 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 50%, #00C2FF 100%)'
    const gradText = { background: G, WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const, backgroundClip: 'text' as const }

    return (
        <section style={{ position: 'relative', overflow: 'hidden', padding: '5rem 1.5rem 3rem' }}>
        {/* Background */}
        {/* <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="pulse-glow" style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(123,47,190,0.15) 0%, rgba(79,142,247,0.08) 50%, transparent 70%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div> */}

        {/* Animated gradient background */}
<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
  {/* Animated mesh orbs */}
  {/* Orb 1 */}
  <div
  className="mesh-orb-1"
  style={{
    position: 'absolute', top: '-10%', left: '20%',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(123,47,190,0.25) 0%, transparent 65%)',
    filter: 'blur(40px)',
    animation: 'mesh-move-1 12s ease-in-out infinite',  // ← add this
  }}
/>

{/* Orb 2 */}
<div
  className="mesh-orb-2"
  style={{
    position: 'absolute', top: '10%', right: '10%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79,142,247,0.2) 0%, transparent 65%)',
    filter: 'blur(40px)',

  animation: 'mesh-move-2 15s ease-in-out infinite',
  }}
/>

{/* Orb 3 */}
<div
  className="mesh-orb-3"
  style={{
    position: 'absolute', bottom: '-10%', left: '40%',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,194,255,0.15) 0%, transparent 65%)',
    filter: 'blur(40px)',
    animation: 'mesh-move-3 10s ease-in-out infinite',
  }}
/>

{/* Orb 4 */}
<div
  className="mesh-orb-4"
  style={{
    position: 'absolute', top: '30%', left: '-5%',
    width: '350px', height: '350px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(123,47,190,0.12) 0%, transparent 65%)',
    filter: 'blur(40px)',
    animation: 'mesh-move-4 18s ease-in-out infinite',
  }}
/>
  {/* Noise texture overlay */}
  <div style={{
    position: 'absolute', inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
    opacity: 0.4,
  }} />
  {/* Subtle grid */}
  <div style={{
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
  }} />
  {/* Bottom fade to page background */}
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px',
    background: 'linear-gradient(to bottom, transparent, #0D0F1A)',
  }} />
</div>

        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', border: '1px solid rgba(123,47,190,0.3)', background: 'rgba(123,47,190,0.1)', marginBottom: '2rem' }}>
            <Zap size={12} color="#C4A8FF" fill="#C4A8FF" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#C4A8FF', letterSpacing: '0.06em' }}>
              Pay as you go · No subscription · Credits never expire
            </span>
          </div>

          {/* Headline */}
          <h1 className="display-font" style={{ fontSize: 'clamp(44px, 7vw, 84px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em', margin: '0 0 1.5rem', color: 'white' }}>
            Everything you imagine.
            <br />
            <span style={gradText}>Built by AI.</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.65, color: 'rgba(255,255,255,0.5)', maxWidth: '580px', margin: '0 auto 2.5rem', fontWeight: 400 }}>
            Images, videos, websites and complete codebases.
            One platform. One credit wallet. Pay only when you create.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', color: 'white', background: G, boxShadow: '0 8px 32px rgba(123,47,190,0.35)' }}>
              Start free — 30 credits <ArrowRight size={16} />
            </Link>
            <a href="#generator" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 24px', borderRadius: '14px', fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none' }}>
              Try without signup <ChevronRight size={16} />
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[['5', 'AI tools in one'], ['$0', 'wasted on unused credits'], ['∞', 'credit expiry'], ['93%', 'average margin savings']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="display-font" style={{ fontSize: '28px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    );
}
