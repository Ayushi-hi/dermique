import { useState, useRef, useEffect, useCallback } from 'react'

/* ─────────────────────────── CONSTANTS ─────────────────────────── */
const SKIN_TYPES = [
  { id: 'Normal',         icon: '◉', sub: 'Balanced & even-toned' },
  { id: 'Dry',            icon: '◎', sub: 'Tight, flaky, dehydrated' },
  { id: 'Oily',           icon: '◈', sub: 'Shiny, enlarged pores' },
  { id: 'Combination',    icon: '◑', sub: 'Mixed T-zone' },
  { id: 'Sensitive',      icon: '◍', sub: 'Reactive, easily irritated' },
  { id: 'Acne-Prone',     icon: '◐', sub: 'Breakout-prone skin' },
  { id: 'Mature',         icon: '◆', sub: 'Fine lines & firmness' },
  { id: 'Hyperpigmented', icon: '◇', sub: 'Dark spots & uneven tone' },
]

const SAFETY_META = {
  Safe:    { color: '#7ab68a', glow: 'rgba(122,182,138,0.18)', label: 'SAFE FOR YOUR SKIN' },
  Caution: { color: '#d4a855', glow: 'rgba(212,168,85,0.18)',  label: 'USE WITH CAUTION'   },
  Unsafe:  { color: '#c47060', glow: 'rgba(196,112,96,0.18)',  label: 'NOT RECOMMENDED'    },
}

const VERDICT_META = {
  'Great Match': { bg: 'rgba(122,182,138,0.1)',  fg: '#7ab68a', br: 'rgba(122,182,138,0.28)' },
  'Good Match':  { bg: 'rgba(138,100,24,0.15)',   fg: '#c9a84c', br: 'rgba(201,168,76,0.28)'  },
  'Neutral':     { bg: 'rgba(0,0,0,0.04)', fg: 'rgba(30,20,10,0.52)', br: 'rgba(138,100,24,0.25)' },
  'Poor Match':  { bg: 'rgba(212,168,85,0.1)',   fg: '#d4a855', br: 'rgba(212,168,85,0.25)'  },
  'Avoid':       { bg: 'rgba(196,112,96,0.1)',   fg: '#c47060', br: 'rgba(196,112,96,0.28)'  },
}

const SEV_COLOR = { High: '#c47060', Medium: '#d4a855', Low: '#7ab68a' }

/* ─────────────────────────── CURSOR ─────────────────────────── */
function LuxuryCursor() {
  const dotRef   = useRef(null)
  const ringRef  = useRef(null)
  const posRef   = useRef({ x: -100, y: -100 })
  const ringPos  = useRef({ x: -100, y: -100 })
  const rafRef   = useRef(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const onMove = (e) => { posRef.current = { x: e.clientX, y: e.clientY } }
    const onEnter = (e) => { if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) setHovering(true) }
    const onLeave = () => setHovering(false)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onEnter)
    document.addEventListener('mouseout',  onLeave)

    const animate = () => {
      const { x, y } = posRef.current
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 4}px, ${y - 4}px)`
      }
      const ease = 0.12
      ringPos.current.x += (x - ringPos.current.x) * ease
      ringPos.current.y += (y - ringPos.current.y) * ease
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px) ${hovering ? 'scale(1.8)' : 'scale(1)'}`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnter)
      document.removeEventListener('mouseout',  onLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [hovering])

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, width: 8, height: 8, borderRadius: '50%',
        background: '#c9a84c', pointerEvents: 'none', zIndex: 99999,
        transition: 'opacity 0.2s', mixBlendMode: 'difference',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, width: 40, height: 40, borderRadius: '50%',
        border: '1px solid rgba(201,168,76,0.5)', pointerEvents: 'none', zIndex: 99998,
        transition: 'transform 0.1s ease, opacity 0.2s',
      }} />
    </>
  )
}

/* ─────────────────────────── NAV ─────────────────────────── */
function Nav({ onScanClick }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 72, padding: '0 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(245,240,232,0.98)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(201,168,76,0.12)' : '1px solid transparent',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17" stroke="#c9a84c" strokeWidth="0.8" opacity="0.6"/>
          <path d="M18 5C13 9 9 14 10 19.5C11 25 18 29 18 29C18 29 25 25 26 19.5C27 14 23 9 18 5Z" fill="#c9a84c" opacity="0.2"/>
          <path d="M18 5C13 9 9 14 10 19.5C11 25 18 29 18 29C18 29 25 25 26 19.5C27 14 23 9 18 5Z" stroke="#c9a84c" strokeWidth="0.8" fill="none"/>
          <circle cx="18" cy="18" r="3.5" fill="none" stroke="#c9a84c" strokeWidth="0.8"/>
          <circle cx="18" cy="18" r="1" fill="#c9a84c"/>
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: '#5a3e10', letterSpacing: '4px' }}>DERMIQUÉ</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'rgba(201,168,76,0.5)', letterSpacing: '3.5px', textTransform: 'uppercase', marginTop: 2 }}>Luxury Ingredient Intelligence</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        {[
          { label: 'Our Method',   id: 'method'      },
          { label: 'Ingredients',  id: 'ingredients' },
          { label: 'Science',      id: 'promise'     },
        ].map(({ label, id }) => (
          <span key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
            style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#5a4020', letterSpacing: '2px', textTransform: 'uppercase', transition: 'color 0.2s', pointerEvents: 'all' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(30,20,10,0.48)'}
          >{label}</span>
        ))}
        <button onClick={onScanClick} style={{
          fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 500, letterSpacing: '2.5px',
          color: '#1c1008', background: 'linear-gradient(135deg,#c9a84c,#e4c46a)',
          border: 'none', borderRadius: 2, padding: '12px 28px',
          boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
          transition: 'all 0.25s ease', pointerEvents: 'all',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >ANALYSE NOW</button>
      </div>
    </nav>
  )
}

/* ─────────────────────────── HERO ─────────────────────────── */
function Hero({ onScanClick }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t) }, [])

  return (
    <section style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '120px 48px 80px', overflow: 'hidden', textAlign: 'center',
      background: 'var(--obsidian)',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-55%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)' }}/>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#c9a84c" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
        {[400,640,880,1120].map((s,i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-55%)',
            width: s, height: s, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.06)',
          }}/>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 820 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 36,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.9s var(--ease-luxury)',
        }}>
          <div style={{ height: 1, width: 40, background: 'linear-gradient(90deg,transparent,#c9a84c)' }}/>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#8a6418', letterSpacing: '4px', textTransform: 'uppercase' }}>The Science of Flawless Skin</span>
          <div style={{ height: 1, width: 40, background: 'linear-gradient(90deg,#c9a84c,transparent)' }}/>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 500,
          fontSize: 'clamp(38px,6vw,84px)', lineHeight: 1.0,
          color: 'var(--goldPale)', letterSpacing: '6px', marginBottom: 12,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s var(--ease-luxury) 0.1s',
        }}>DERMIQUÉ</h1>

        <h2 style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(22px,3.5vw,42px)', color: '#2e2010',
          letterSpacing: '1px', marginBottom: 42,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s var(--ease-luxury) 0.2s',
        }}>Know What Touches Your Skin</h2>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 40,
          opacity: mounted ? 1 : 0, transition: 'opacity 1s ease 0.3s',
        }}>
          <div style={{ height: 1, width: 80, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.5))' }}/>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="#c9a84c" opacity="0.7"><polygon points="6,0 12,6 6,12 0,6"/></svg>
          <div style={{ height: 1, width: 80, background: 'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)' }}/>
        </div>

        <p style={{
          fontFamily: 'var(--font-reading)', fontSize: 19, fontWeight: 400,
          color: '#5a4020', lineHeight: 1.9, maxWidth: 620, margin: '0 auto 52px',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 1s var(--ease-luxury) 0.35s',
        }}>
          Every skincare product you purchase carries a hidden list. DERMIQUÉ decodes it —
          revealing harmful chemicals, flagging incompatible actives, and delivering a&nbsp;
          <em>personalised verdict</em> crafted for your unique skin.
        </p>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 1s var(--ease-luxury) 0.45s',
        }}>
          <GoldButton onClick={onScanClick} large>Analyse a Product</GoldButton>
          <OutlineButton onClick={() => document.getElementById('method').scrollIntoView({ behavior: 'smooth' })}>Discover Our Method</OutlineButton>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: 32, marginTop: 56, flexWrap: 'wrap',
          opacity: mounted ? 0.6 : 0, transition: 'opacity 1.2s ease 0.6s',
        }}>
          {[
            { n: '50K+', l: 'Ingredients Mapped' },
            { n: 'Claude AI', l: 'Vision Analysis' },
            { n: '8', l: 'Skin Profiles' },
            { n: '<8s', l: 'Per Analysis' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#8a6418', letterSpacing: '2px' }}>{s.n}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#8a6030', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', opacity: 0.4 }}>
        <div style={{ width: 1, height: 48, background: 'linear-gradient(180deg,rgba(201,168,76,0.6),transparent)', margin: '0 auto' }}/>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#8a6418', letterSpacing: '3px', textTransform: 'uppercase', marginTop: 10 }}>Scroll</div>
      </div>
    </section>
  )
}

/* ─────────────────────────── METHOD SECTION ─────────────────────────── */
function MethodSection() {
  return (
    <section id="method" style={{ padding: '120px 48px', background: 'var(--onyx)', borderTop: '1px solid rgba(201,168,76,0.08)', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <SectionHeader label="The Dermiqué Method" title="Three Steps to Total Clarity" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, marginTop: 64 }}>
          {[
            { n: 'I', title: 'Profile Your Skin', desc: 'Select from eight clinically-defined skin profiles. Every analysis is calibrated to your specific skin biology — not a generic assessment.', icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="18" r="7" stroke="#c9a84c" strokeWidth="1"/><path d="M8 38C8 30 36 30 36 38" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round"/><circle cx="22" cy="18" r="2.5" fill="#c9a84c" opacity="0.4"/></svg>) },
            { n: 'II', title: 'Scan the Label', desc: 'Photograph the INCI ingredient list or barcode of any skincare product. Our AI vision model reads it with pharmaceutical precision.', icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="4" y="4" width="14" height="14" rx="2" stroke="#c9a84c" strokeWidth="1"/><rect x="26" y="4" width="14" height="14" rx="2" stroke="#c9a84c" strokeWidth="1"/><rect x="4" y="26" width="14" height="14" rx="2" stroke="#c9a84c" strokeWidth="1"/><rect x="28" y="28" width="4" height="4" fill="#c9a84c" opacity="0.5"/><path d="M34 26v6M26 34h6M34 34h6v6" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round"/></svg>) },
            { n: 'III', title: 'Receive Your Report', desc: 'A luxury-grade safety report: harmful ingredients flagged, beneficial actives celebrated, and a bespoke recommendation written for your skin.', icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="8" y="4" width="28" height="36" rx="3" stroke="#c9a84c" strokeWidth="1"/><path d="M15 16h14M15 22h14M15 28h9" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round"/><circle cx="33" cy="33" r="8" fill="#0f0f0f" stroke="#7ab68a" strokeWidth="1"/><path d="M29.5 33l2.5 2.5 5-5" stroke="#7ab68a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
          ].map((s, i) => (
            <div key={i} style={{ padding: '52px 44px', background: i === 1 ? 'rgba(138,100,24,0.08)' : 'transparent', border: '1px solid rgba(201,168,76,0.1)', position: 'relative', transition: 'background 0.3s ease' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(138,100,24,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = i === 1 ? 'rgba(138,100,24,0.08)' : 'transparent'}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'rgba(201,168,76,0.35)', letterSpacing: '3px', marginBottom: 28 }}>{s.n}</div>
              <div style={{ marginBottom: 22 }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, color: 'var(--goldPale)', marginBottom: 16, letterSpacing: '0.5px' }}>{s.title}</h3>
              <p style={{ fontFamily: 'var(--font-reading)', fontSize: 15, color: '#2e2010', lineHeight: 1.9 }}>{s.desc}</p>
              <div style={{ position: 'absolute', top: 52, right: 44, fontFamily: 'var(--font-display)', fontSize: 72, color: 'rgba(138,100,24,0.08)', lineHeight: 1, userSelect: 'none' }}>{s.n}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── SCANNER SECTION ─────────────────────────── */
function ScannerSection() {
  const [skins,   setSkins]   = useState([])
  const [file,    setFile]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [phase,   setPhase]   = useState('idle')
  const [result,  setResult]  = useState(null)
  const [errMsg,  setErrMsg]  = useState('')
  const [drag,    setDrag]    = useState(false)
  const [tab,     setTab]     = useState('harmful')
  const [score,   setScore]   = useState(0)
  const fileRef    = useRef()
  const sectionRef = useRef()

  const toggleSkin = id => setSkins(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const handleFile = useCallback((f) => {
    if (!f?.type.startsWith('image/')) return
    setFile(f)
    const r = new FileReader()
    r.onload = e => setPreview(e.target.result)
    r.readAsDataURL(f)
  }, [])

  // ── THIS IS THE FIXED doScan — sends to backend, NOT directly to Anthropic ──
  const doScan = useCallback(async () => {
    if (!file || !skins.length) return
    setPhase('scanning')

    try {
      const fd = new FormData()
      fd.append('image',     file)
      fd.append('skinTypes', skins.join(', '))

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body:   fd,
      })

      const apiData = await response.json()
      if (!response.ok) throw new Error(apiData.error || 'Analysis failed')

      const data = apiData.data || apiData

      setResult(data)
      setScore(0)
      setPhase('result')
      setTimeout(() => setScore(data.safetyScore || 0), 400)

    } catch (e) {
      setErrMsg(e.message)
      setPhase('error')
    }
  }, [file, skins])

  const reset = () => {
    setSkins([]); setFile(null); setPreview(null)
    setPhase('idle'); setResult(null); setErrMsg(''); setTab('harmful'); setScore(0)
  }

  const canScan = skins.length > 0 && file

  return (
    <section id="scanner" ref={sectionRef} style={{ padding: '120px 48px', background: 'var(--obsidian)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <SectionHeader label="Ingredient Intelligence" title="Analyse Your Product" sub="Select your skin profile, then upload any product label or barcode. Receive a personalised safety report in under ten seconds."/>

        {phase === 'idle' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 64 }}>
            <div style={{ padding: '44px', background: 'rgba(255,250,240,0.7)', border: '1px solid rgba(160,120,40,0.2)' }}>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#8a6418', letterSpacing: '3px', marginBottom: 10 }}>STEP ONE</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--goldPale)', marginBottom: 8 }}>Your Skin Profile</h3>
                <p style={{ fontFamily: 'var(--font-reading)', fontSize: 14, color: '#5a4020', lineHeight: 1.7 }}>Select all skin types that apply to you</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {SKIN_TYPES.map(s => {
                  const on = skins.includes(s.id)
                  return (
                    <button key={s.id} onClick={() => toggleSkin(s.id)} style={{
                      background: on ? 'rgba(138,100,24,0.15)' : 'rgba(0,0,0,0.03)',
                      border: on ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.06)',
                      borderLeft: on ? '3px solid #c9a84c' : '3px solid transparent',
                      padding: '14px 16px', textAlign: 'left', cursor: 'none',
                      transition: 'all 0.2s ease', position: 'relative',
                      boxShadow: on ? '0 2px 20px rgba(201,168,76,0.12)' : 'none',
                    }}
                      onMouseEnter={e => { if (!on) { e.currentTarget.style.border = '1px solid rgba(201,168,76,0.25)'; e.currentTarget.style.borderLeft = '3px solid rgba(201,168,76,0.4)' }}}
                      onMouseLeave={e => { if (!on) { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.borderLeft = '3px solid transparent' }}}
                    >
                      {on && (
                        <div style={{ position: 'absolute', top: 10, right: 10, width: 16, height: 16, borderRadius: '50%', background: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="8" height="6" viewBox="0 0 8 6"><path d="M1 3l2.2 2L7 1" stroke="#080808" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 500, color: on ? '#f5e6b8' : 'rgba(30,20,10,0.72)', marginBottom: 3 }}>{s.id}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: on ? 'rgba(201,168,76,0.6)' : 'var(--textFaint)', letterSpacing: '0.5px' }}>{s.sub}</div>
                    </button>
                  )
                })}
              </div>
              {skins.length > 0 && (
                <div style={{ padding: '14px 18px', background: 'rgba(138,100,24,0.1)', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'rgba(201,168,76,0.5)', letterSpacing: '2px', textTransform: 'uppercase' }}>Profile:</span>
                  {skins.map(id => (
                    <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(160,120,40,0.1)', border: '1px solid rgba(201,168,76,0.2)', padding: '3px 10px 3px 12px', fontFamily: 'var(--font-body)', fontSize: 10, color: '#8a6418', letterSpacing: '0.5px' }}>
                      {id}
                      <span onClick={() => toggleSkin(id)} style={{ color: 'rgba(201,168,76,0.6)', fontSize: 14, lineHeight: 1, cursor: 'none' }}>×</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '44px', background: 'rgba(255,250,240,0.7)', border: '1px solid rgba(160,120,40,0.2)', borderLeft: '1px solid rgba(201,168,76,0.06)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#8a6418', letterSpacing: '3px', marginBottom: 10 }}>STEP TWO</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--goldPale)', marginBottom: 8 }}>Upload Product</h3>
                <p style={{ fontFamily: 'var(--font-reading)', fontSize: 14, color: '#5a4020', lineHeight: 1.7 }}>Ingredient label or barcode photograph</p>
              </div>
              {!preview ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDrag(true) }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
                  onClick={() => fileRef.current.click()}
                  style={{ flex: 1, minHeight: 220, border: `1px dashed ${drag ? '#c9a84c' : 'rgba(201,168,76,0.22)'}`, background: drag ? 'rgba(138,100,24,0.1)' : 'rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, cursor: 'none', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.border = '1px dashed rgba(201,168,76,0.5)'; e.currentTarget.style.background = 'rgba(138,100,24,0.06)' }}
                  onMouseLeave={e => { if (!drag) { e.currentTarget.style.border = '1px dashed rgba(201,168,76,0.22)'; e.currentTarget.style.background = 'rgba(0,0,0,0.02)' }}}
                >
                  {drag && <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#c9a84c,transparent)', animation: 'scanMove 1.4s ease-in-out infinite', top: 0 }}/>}
                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" opacity="0.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#c9a84c" strokeWidth="1"/>
                    <rect x="31" y="3" width="18" height="18" rx="2" stroke="#c9a84c" strokeWidth="1"/>
                    <rect x="3" y="31" width="18" height="18" rx="2" stroke="#c9a84c" strokeWidth="1"/>
                    <rect x="33" y="33" width="5" height="5" fill="#c9a84c"/>
                    <path d="M44 31v7M31 44h7M44 44h7v7" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: '#5a4020', marginBottom: 6 }}>Drop your product image</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#8a6030', letterSpacing: '1px' }}>INCI LABEL · BARCODE · JPG PNG WEBP</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ height: 1, width: 32, background: 'rgba(201,168,76,0.15)' }}/>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#8a6030', letterSpacing: '2px' }}>OR</span>
                    <div style={{ height: 1, width: 32, background: 'rgba(201,168,76,0.15)' }}/>
                  </div>
                  <button onClick={e => { e.stopPropagation(); fileRef.current.click() }} style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '2.5px', color: '#8a6418', background: 'transparent', border: '1px solid rgba(201,168,76,0.35)', padding: '10px 24px', cursor: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(138,100,24,0.12)'; e.currentTarget.style.borderColor = '#c9a84c' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)' }}
                  >SELECT FILE</button>
                </div>
              ) : (
                <div style={{ position: 'relative', flex: 1 }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', height: 220, objectFit: 'contain', background: 'rgba(255,250,240,0.7)', border: '1px solid rgba(201,168,76,0.15)', display: 'block' }}/>
                  <button onClick={() => { setFile(null); setPreview(null) }} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(245,240,232,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#2e2010', padding: '5px 12px', fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'none', transition: 'all 0.2s' }}>Remove</button>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, margin: '16px 0' }}>
                {[['Good lighting','No shadows'],['Label visible','INCI in frame'],['Barcode flat','No curled edges'],['Sharp focus','No motion blur']].map(([t]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,250,240,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#c9a84c', opacity: 0.5, flexShrink: 0 }}/>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#5a4020', letterSpacing: '0.5px' }}>{t}</div>
                  </div>
                ))}
              </div>
              <button disabled={!canScan} onClick={doScan} style={{
                width: '100%', padding: '18px',
                fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '3px',
                color: canScan ? '#080808' : 'var(--textFaint)',
                background: canScan ? 'linear-gradient(135deg,#c9a84c,#e4c46a)' : 'rgba(0,0,0,0.04)',
                border: canScan ? 'none' : '1px solid rgba(255,255,255,0.08)',
                cursor: canScan ? 'none' : 'not-allowed',
                transition: 'all 0.3s ease',
                boxShadow: canScan ? '0 6px 28px rgba(201,168,76,0.28)' : 'none',
              }}
                onMouseEnter={e => { if (canScan) { e.currentTarget.style.boxShadow = '0 10px 40px rgba(201,168,76,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
                onMouseLeave={e => { if (canScan) { e.currentTarget.style.boxShadow = '0 6px 28px rgba(201,168,76,0.28)'; e.currentTarget.style.transform = 'translateY(0)' }}}
              >
                {!skins.length ? 'SELECT A SKIN PROFILE FIRST' : !file ? 'UPLOAD A PRODUCT IMAGE' : 'ANALYSE MY PRODUCT'}
              </button>
            </div>
          </div>
        )}

        {phase === 'scanning' && (
          <div style={{ marginTop: 64, display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: 480, padding: '64px 48px', background: 'rgba(255,250,240,0.7)', border: '1px solid rgba(160,120,40,0.2)' }}>
              {preview && (
                <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 36px', border: '1px solid rgba(201,168,76,0.3)', position: 'relative' }}>
                  <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(160,120,40,0.1)', animation: 'scanPulse 1.8s ease-in-out infinite' }}/>
                </div>
              )}
              <ScannerSpinner />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 400, color: 'var(--goldPale)', marginBottom: 10 }}>Analysing Ingredients</h3>
              <p style={{ fontFamily: 'var(--font-reading)', fontSize: 15, color: '#5a4020', marginBottom: 40, lineHeight: 1.7 }}>Cross-referencing with your {skins.join(' · ')} profile</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
                {['Reading ingredient label','Extracting INCI compound list','Cross-referencing dermatological data','Composing your personalised report'].map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', background: 'rgba(138,100,24,0.08)', border: '1px solid rgba(201,168,76,0.08)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', opacity: 0.7, flexShrink: 0, animation: `pulse 2s ease-in-out ${i * 0.3}s infinite` }}/>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#2e2010', letterSpacing: '0.5px' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div style={{ marginTop: 64, display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: 440, padding: '64px 48px', background: 'rgba(196,112,96,0.04)', border: '1px solid rgba(196,112,96,0.2)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(196,112,96,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="#c47060" strokeWidth="1.2" opacity="0.6"/><path d="M14 8v8M14 19.5v1.5" stroke="#c47060" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--goldPale)', marginBottom: 12 }}>Analysis Failed</h3>
              <p style={{ fontFamily: 'var(--font-reading)', fontSize: 15, color: '#5a4020', marginBottom: 36, lineHeight: 1.75 }}>{errMsg}</p>
              <GoldButton onClick={reset}>Try Again</GoldButton>
            </div>
          </div>
        )}

        {phase === 'result' && result && (
          <ResultPanel result={result} preview={preview} skins={skins} score={score} tab={tab} setTab={setTab} onReset={reset}/>
        )}
      </div>

      <style>{`
        @keyframes scanMove { 0%{top:0%} 100%{top:100%} }
        @keyframes scanPulse { 0%,100%{opacity:0.1} 50%{opacity:0.3} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes spinCW { to{transform:rotate(360deg)} }
        @keyframes spinCCW { to{transform:rotate(-360deg)} }
      `}</style>
    </section>
  )
}

function ScannerSpinner() {
  return (
    <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 32px' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(201,168,76,0.1)', borderRadius: '50%' }}/>
      <div style={{ position: 'absolute', inset: 0, border: '1.5px solid transparent', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'spinCW 1.4s linear infinite' }}/>
      <div style={{ position: 'absolute', inset: 12, border: '1px solid transparent', borderTopColor: 'rgba(201,168,76,0.5)', borderRadius: '50%', animation: 'spinCCW 1s linear infinite' }}/>
      <div style={{ position: 'absolute', inset: 24, border: '1px solid transparent', borderTopColor: 'rgba(201,168,76,0.3)', borderRadius: '50%', animation: 'spinCW 0.7s linear infinite' }}/>
    </div>
  )
}

function ResultPanel({ result, preview, skins, score, tab, setTab, onReset }) {
  const safeData = SAFETY_META[result.overallSafety]  || SAFETY_META['Caution']
  const verdData = VERDICT_META[result.skinTypeVerdict] || VERDICT_META['Neutral']
  const circ   = 2 * Math.PI * 40
  const offset = circ * (1 - score / 100)

  return (
    <div style={{ marginTop: 64, animation: 'fadeUp 0.6s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 2, marginBottom: 2 }}>
        <div style={{ padding: '40px', background: 'rgba(255,250,240,0.7)', border: '1px solid rgba(160,120,40,0.2)', position: 'relative', overflow: 'hidden', boxShadow: `0 0 60px \${safeData.glow}` }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at top right,\${safeData.glow},transparent 60%)`, pointerEvents: 'none' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: safeData.color, letterSpacing: '3.5px', marginBottom: 10 }}>{result.productType?.toUpperCase()}</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 500, color: 'var(--goldPale)', lineHeight: 1.1, marginBottom: 5 }}>{result.productName}</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#5a4020', letterSpacing: '1px', marginBottom: 20 }}>{result.brand}</p>
              <div style={{ display: 'inline-block', padding: '6px 16px', background: `\${safeData.color}15`, border: `1px solid \${safeData.color}40`, marginBottom: 16 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: safeData.color, letterSpacing: '3px' }}>{safeData.label}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-reading)', fontSize: 14, color: '#2e2010', lineHeight: 1.85, maxWidth: 440 }}>{result.summary}</p>
            </div>
            {preview && (
              <div style={{ width: 90, height: 90, flexShrink: 0, border: `1px solid \${safeData.color}30`, overflow: 'hidden' }}>
                <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '40px 36px', background: 'rgba(255,250,240,0.7)', border: '1px solid rgba(160,120,40,0.2)', borderLeft: 'none', textAlign: 'center', minWidth: 164 }}>
          <svg width="104" height="104" viewBox="0 0 104 104" style={{ display: 'block', margin: '0 auto 14px' }}>
            <circle cx="52" cy="52" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
            <circle cx="52" cy="52" r="40" fill="none" stroke={safeData.color} strokeWidth="6"
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 52 52)"
              style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.25,0.46,0.45,0.94)' }}/>
          </svg>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--goldPale)', lineHeight: 1 }}>{result.safetyScore}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: '#8a6030', letterSpacing: '2.5px', textTransform: 'uppercase', marginTop: 4, marginBottom: 12 }}>Safety Score</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: safeData.color, letterSpacing: '2px' }}>{result.overallSafety?.toUpperCase()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ padding: '28px 32px', background: verdData.bg, border: `1px solid \${verdData.br}` }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: verdData.fg, letterSpacing: '3px', marginBottom: 8 }}>SKIN COMPATIBILITY — {result.skinTypeVerdict?.toUpperCase()}</div>
            <p style={{ fontFamily: 'var(--font-reading)', fontSize: 14, color: '#2e2010', lineHeight: 1.8, marginBottom: 12 }}>{result.skinTypeNote}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skins.map(s => (
                <span key={s} style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: verdData.fg, background: `\${verdData.fg}15`, border: `1px solid \${verdData.fg}28`, padding: '3px 10px', letterSpacing: '1px' }}>{s.toUpperCase()}</span>
              ))}
            </div>
          </div>
          {result.keyIngredients?.length > 0 && (
            <div style={{ padding: '28px 32px', background: 'rgba(255,250,240,0.7)', border: '1px solid rgba(201,168,76,0.1)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: 'rgba(201,168,76,0.4)', letterSpacing: '3px', marginBottom: 14 }}>KEY ACTIVES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {result.keyIngredients.map(k => (
                  <span key={k} style={{ fontFamily: 'var(--font-reading)', fontStyle: 'italic', fontSize: 13, color: '#8a6418', background: 'rgba(138,100,24,0.12)', border: '1px solid rgba(201,168,76,0.18)', padding: '5px 14px' }}>{k}</span>
                ))}
              </div>
            </div>
          )}
          <div style={{ padding: '28px 32px', background: 'rgba(138,100,24,0.08)', border: '1px solid rgba(160,120,40,0.2)', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: 'rgba(201,168,76,0.4)', letterSpacing: '3px', marginBottom: 12 }}>OUR VERDICT</div>
            <p style={{ fontFamily: 'var(--font-reading)', fontSize: 15, color: '#2e2010', lineHeight: 1.9 }}>{result.recommendation}</p>
          </div>
          {result.certifications?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.certifications.map(c => (
                <span key={c} style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a4020', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', letterSpacing: '1px' }}>✓ {c}</span>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: 'rgba(255,250,240,0.7)', border: '1px solid rgba(201,168,76,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            {[
              { id: 'harmful', label: 'Harmful',   count: result.harmfulIngredients?.length || 0, c: '#c47060' },
              { id: 'caution', label: 'Caution',   count: result.cautionIngredients?.length || 0, c: '#d4a855' },
              { id: 'good',    label: 'Beneficial',count: result.goodIngredients?.length    || 0, c: '#7ab68a' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? `\${t.c}0d` : 'transparent', border: 'none', borderBottom: tab === t.id ? `2px solid \${t.c}` : '2px solid transparent', padding: '18px 8px', cursor: 'none', transition: 'all 0.2s' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: tab === t.id ? t.c : 'var(--textFaint)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 5 }}>{t.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: tab === t.id ? t.c : 'rgba(138,100,24,0.25)' }}>{t.count}</div>
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', maxHeight: 400 }}>
            {(() => {
              let items = []
              if (tab === 'harmful') items = (result.harmfulIngredients || []).map(i => ({ name: i.name, badge: i.concern, desc: i.risk,    sev: i.severity, c: SEV_COLOR[i.severity] || '#c47060', good: false }))
              if (tab === 'caution') items = (result.cautionIngredients || []).map(i => ({ name: i.name, badge: i.concern, desc: i.note,    sev: i.severity, c: SEV_COLOR[i.severity] || '#d4a855', good: false }))
              if (tab === 'good')    items = (result.goodIngredients    || []).map(i => ({ name: i.name, badge: i.role,    desc: i.benefit, sev: i.rating,   c: '#7ab68a', good: true }))
              if (!items.length) return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 12, opacity: 0.4 }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="#c9a84c" strokeWidth="1"/><path d="M10 16h12M16 10v12" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round"/></svg>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#5a4020', letterSpacing: '1px' }}>{tab === 'good' ? 'No beneficial ingredients identified' : 'None found'}</p>
                </div>
              )
              return items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', borderLeft: `2px solid \${item.c}50` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 500, color: '#1c1008' }}>{item.name}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: item.c, background: `\${item.c}15`, border: `1px solid \${item.c}28`, padding: '2px 8px', letterSpacing: '0.5px' }}>{item.badge}</span>
                      {!item.good && item.sev && <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: SEV_COLOR[item.sev] || item.c, letterSpacing: '0.5px' }}>{item.sev}</span>}
                    </div>
                    <p style={{ fontFamily: 'var(--font-reading)', fontSize: 12, color: '#5a4020', lineHeight: 1.7 }}>{item.desc}</p>
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <OutlineButton onClick={onReset}>Scan Another</OutlineButton>
        <GoldButton onClick={onReset}>New Analysis</GoldButton>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

function PromiseSection() {
  return (
    <section id="promise" style={{ padding: '120px 48px', background: 'var(--charcoal)', borderTop: '1px solid rgba(201,168,76,0.08)', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#8a6418', letterSpacing: '4px', marginBottom: 20 }}>THE DERMIQUÉ PROMISE</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 44, color: 'var(--goldPale)', lineHeight: 1.15, marginBottom: 32 }}>
            "Your skin is the canvas.<br/>We illuminate what's on the brush."
          </h2>
          <p style={{ fontFamily: 'var(--font-reading)', fontSize: 16, color: '#2e2010', lineHeight: 2, marginBottom: 36 }}>
            Over 1,400 chemicals have been found in common skincare products. Many are linked to irritation, hormonal disruption, and long-term barrier damage. DERMIQUÉ was built so that every person can make informed decisions about what they apply to their skin.
          </p>
          <GoldButton onClick={() => document.getElementById('scanner').scrollIntoView({ behavior: 'smooth' })}>Start Scanning</GoldButton>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { n: '1,400+', l: 'Chemicals found in common skincare', desc: 'Many linked to irritation and hormonal disruption' },
            { n: '72%',    l: 'Of products contain undisclosed fragrance', desc: 'A catch-all term hiding hundreds of compounds' },
            { n: '38%',    l: 'Of clean products contain allergens', desc: 'Labels can be misleading without expert analysis' },
          ].map(s => (
            <div key={s.n} style={{ padding: '28px 32px', background: 'rgba(138,100,24,0.06)', border: '1px solid rgba(201,168,76,0.1)', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#8a6418', lineHeight: 1, flexShrink: 0, minWidth: 70 }}>{s.n}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#2e2010', letterSpacing: '0.5px', marginBottom: 5 }}>{s.l}</div>
                <div style={{ fontFamily: 'var(--font-reading)', fontStyle: 'italic', fontSize: 13, color: '#5a4020' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function IngredientGuide() {
  return (
    <section id="ingredients" style={{ padding: '120px 48px', background: 'var(--obsidian)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <SectionHeader label="Ingredient Intelligence" title="What We Analyse" sub="DERMIQUÉ evaluates every compound against three criteria — safety, compatibility, and benefit — personalised to your declared skin profile."/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, marginTop: 64 }}>
          {[
            { color: '#c47060', glow: 'rgba(196,112,96,0.12)', label: 'FLAGGED',    title: 'Harmful Compounds',    desc: 'Parabens, synthetic fragrances, SLS, PFAS, formaldehyde releasers, and other substances with documented links to skin irritation, hormonal disruption, or barrier damage.' },
            { color: '#d4a855', glow: 'rgba(212,168,85,0.12)',  label: 'MONITOR',    title: 'Caution Ingredients',  desc: 'Compounds that are broadly safe but may not suit every skin type. Denatured alcohols, high-concentration exfoliants, and sensitising preservatives fall here.' },
            { color: '#7ab68a', glow: 'rgba(122,182,138,0.12)', label: 'BENEFICIAL', title: 'Active Ingredients',   desc: 'Niacinamide, hyaluronic acid, ceramides, retinol, vitamin C, peptides — highlighted with explanations of their specific benefits for your skin type.' },
          ].map(c => (
            <div key={c.title} style={{ padding: '44px 40px', background: c.glow, border: `1px solid \${c.color}22`, borderTop: `2px solid \${c.color}` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: c.color, letterSpacing: '3px', marginBottom: 22 }}>{c.label}</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, color: 'var(--goldPale)', marginBottom: 18 }}>{c.title}</h3>
              <p style={{ fontFamily: 'var(--font-reading)', fontSize: 14, color: '#2e2010', lineHeight: 1.95 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer({ onScanClick }) {
  return (
    <footer style={{ background: '#ede8dc', borderTop: '1px solid rgba(201,168,76,0.1)', padding: '72px 48px 40px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#5a3e10', letterSpacing: '4px', marginBottom: 8 }}>DERMIQUÉ</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'rgba(201,168,76,0.4)', letterSpacing: '3px', marginBottom: 20 }}>LUXURY INGREDIENT INTELLIGENCE</div>
            <p style={{ fontFamily: 'var(--font-reading)', fontSize: 13, color: '#5a4020', lineHeight: 1.85, maxWidth: 280 }}>A luxury intelligence platform dedicated to the transparency of skincare formulation.</p>
          </div>
          {[
            { title: 'Platform', links: ['Analyse a Product','Skin Profiles','Ingredient Library','Safety Ratings'] },
            { title: 'Science',  links: ['Our Method','Research','Dermatology Board','Data Sources'] },
            { title: 'Company',  links: ['About','Privacy','Terms','Contact'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: 'rgba(201,168,76,0.4)', letterSpacing: '3px', marginBottom: 20 }}>{col.title.toUpperCase()}</div>
              {col.links.map(l => (
                <div key={l} style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#5a4020', marginBottom: 12, cursor: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(30,20,10,0.62)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--textDim)'}
                >{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: '36px 44px', background: 'rgba(138,100,24,0.08)', border: '1px solid rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, marginBottom: 48, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 26, color: 'var(--goldPale)', marginBottom: 6 }}>Ready to decode your skincare?</div>
            <p style={{ fontFamily: 'var(--font-reading)', fontSize: 13, color: '#5a4020' }}>Scan any product. Free. Instant. Personalised.</p>
          </div>
          <GoldButton onClick={onScanClick}>Begin Analysis</GoldButton>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#8a6030', letterSpacing: '1px' }}>© 2025 DERMIQUÉ. For informational purposes only.</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#8a6030', letterSpacing: '1px' }}>+91-xxxxxxxxx</div>
        </div>
      </div>
    </footer>
  )
}

function SectionHeader({ label, title, sub }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#8a6418', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: 16 }}>{label}</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px,4vw,52px)', fontWeight: 400, color: 'var(--goldPale)', lineHeight: 1.1, letterSpacing: '0.5px', marginBottom: sub ? 14 : 0 }}>{title}</h2>
      {sub && <p style={{ fontFamily: 'var(--font-reading)', fontSize: 16, color: '#2e2010', lineHeight: 1.85, marginTop: 14 }}>{sub}</p>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 24 }}>
        <div style={{ height: 1, width: 56, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.4))' }}/>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="#c9a84c" opacity="0.5"><polygon points="4,0 8,4 4,8 0,4"/></svg>
        <div style={{ height: 1, width: 56, background: 'linear-gradient(90deg,rgba(201,168,76,0.4),transparent)' }}/>
      </div>
    </div>
  )
}

function GoldButton({ children, onClick, large }) {
  return (
    <button onClick={onClick} style={{ fontFamily: 'var(--font-display)', fontSize: large ? 12 : 10, letterSpacing: '2.5px', color: '#1c1008', background: 'linear-gradient(135deg,#c9a84c,#e4c46a)', border: 'none', padding: large ? '18px 52px' : '14px 36px', cursor: 'none', boxShadow: '0 4px 22px rgba(201,168,76,0.28)', transition: 'all 0.25s ease' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 36px rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 22px rgba(201,168,76,0.28)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >{children}</button>
  )
}

function OutlineButton({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '2.5px', color: '#5a4020', background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', padding: '14px 36px', cursor: 'none', transition: 'all 0.25s ease' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.color = '#c9a84c' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(138,100,24,0.28)'; e.currentTarget.style.color = 'rgba(30,20,10,0.58)' }}
    >{children}</button>
  )
}

export default function App() {
  const scrollToScan = () => document.getElementById('scanner')?.scrollIntoView({ behavior: 'smooth' })
  return (
    <>
      <LuxuryCursor />
      <Nav onScanClick={scrollToScan} />
      <Hero onScanClick={scrollToScan} />
      <MethodSection />
      <ScannerSection />
      <PromiseSection />
      <IngredientGuide />
      <Footer onScanClick={scrollToScan} />
    </>
  )
}
