import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const NAME = 'TILAK'
// belt covers T(0), L(2), K(4) — I(1) and A(3) show above belt
const ABOVE = new Set([1, 3])

const TICKER_ITEMS = [
  'UI/UX DESIGN', '✦', 'MACHINE LEARNING', '✦',
  'FIGMA', '✦', 'NEXT.JS', '✦', 'PYTHON', '✦',
  '3AM DEBUGGER', '✦', 'CTRL+Z ENTHUSIAST', '✦',
  'UI/UX DESIGN', '✦', 'MACHINE LEARNING', '✦',
  'FIGMA', '✦', 'NEXT.JS', '✦', 'PYTHON', '✦',
  '3AM DEBUGGER', '✦', 'CTRL+Z ENTHUSIAST', '✦',
]

interface Props { ready: boolean }

export default function Hero({ ready }: Props) {
  const nameRef     = useRef<HTMLDivElement>(null)
  const nameBackRef = useRef<HTMLDivElement>(null)
  const nameFrontRef= useRef<HTMLDivElement>(null)
  const tagRef      = useRef<HTMLDivElement>(null)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const tickerRef   = useRef<HTMLDivElement>(null)
  const greetRef    = useRef<HTMLDivElement>(null)


  // Entrance animation
  useEffect(() => {
    if (!ready) return

    gsap.set(greetRef.current,  { opacity: 0, y: 16 })
    gsap.set(bottomRef.current, { opacity: 0, y: 24 })
    gsap.set(tagRef.current,    { y: '110%' })
    gsap.set('.hero-name-inner', { y: 0 })
    window.scrollTo(0, 0)

    const letters = nameBackRef.current!.querySelectorAll<HTMLElement>('.hero-name-letter')
    const frontLetters = nameFrontRef.current!.querySelectorAll<HTMLElement>('.hero-name-letter')
    gsap.set(letters, { y: '110%', opacity: 0 })
    gsap.set(frontLetters, { y: '110%', opacity: 0 })
    gsap.set(tickerRef.current, { x: -2000 })

    const tl = gsap.timeline({ delay: 0.1 })

    tl.to(greetRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0)

    // animate paired back+front letters together
    Array.from(letters).forEach((letter, i) => {
      tl.to([letter, frontLetters[i]], {
        y: 0, opacity: 1,
        duration: 0.7,
        ease: 'back.out(1.4)',
      }, 0.2 + i * 0.07)
    })

    tl.to(tickerRef.current, {
      x: 0,
      duration: 0.8,
      ease: 'power4.out',
    }, 0.55)

    tl.to(tagRef.current, { y: 0, duration: 0.8, ease: 'power3.out' }, 0.75)
    tl.to(bottomRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.0)

  }, [ready])

  // Scroll parallax + letter repel
  useEffect(() => {
    let parallaxEnabled = false
    const onScroll = () => {
      if (!parallaxEnabled) return
      gsap.set('.hero-name-inner', { y: window.scrollY * 0.14 })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const t = setTimeout(() => { parallaxEnabled = true }, 2200)

    const nameInner   = nameBackRef.current!
    const backLetters = Array.from(nameBackRef.current!.querySelectorAll<HTMLElement>('.hero-name-letter'))
    const frontLetters= Array.from(nameFrontRef.current!.querySelectorAll<HTMLElement>('.hero-name-letter'))

    const setColor = (i: number, color: string) => {
      gsap.to(backLetters[i],  { color, duration: 0.2 })
      // front letter is transparent for below-belt letters — keep it transparent
      if (ABOVE.has(i)) gsap.to(frontLetters[i], { color, duration: 0.2 })
    }

    const onNameMove = (e: MouseEvent) => {
      backLetters.forEach((letter, i) => {
        const rect = letter.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
        const maxDist = 140
        if (dist < maxDist) {
          const force = Math.pow(1 - dist / maxDist, 2)
          const dx = (cx - e.clientX) * force * 0.8
          const dy = (cy - e.clientY) * force * 0.8
          gsap.to(letter, { x: dx, y: dy, duration: 0.25, ease: 'power2.out' })
          // sync front layer letter movement
          gsap.to(frontLetters[i], { x: dx, y: dy, duration: 0.25, ease: 'power2.out' })
          setColor(i, 'var(--pink)')
        } else {
          gsap.to(letter, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
          gsap.to(frontLetters[i], { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
          setColor(i, 'var(--ink)')
        }
      })
    }
    const onNameLeave = () => {
      backLetters.forEach((l, i) => {
        gsap.to(l, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
        gsap.to(frontLetters[i], { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
        setColor(i, 'var(--ink)')
      })
    }

    nameInner.addEventListener('mousemove', onNameMove)
    nameInner.addEventListener('mouseleave', onNameLeave)

    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
      nameInner.removeEventListener('mousemove', onNameMove)
      nameInner.removeEventListener('mouseleave', onNameLeave)
    }
  }, [])

  const letters = NAME.split('').map((ch, i) => (
    <span className="hero-name-letter" key={i} style={{ display: 'inline-block', opacity: 0 }}>{ch}</span>
  ))

  return (
    <section className="hero" id="home">
      <div className="hero-bg-text" aria-hidden>TILAK</div>

      <div className="hero-name" ref={nameRef}>
        <div ref={greetRef} className="hero-greeting" style={{ opacity: 0 }}>hey, i'm</div>

        <div className="hero-name-stack">
          {/* BACK layer — all letters behind belt, belt lives here */}
          <div className="hero-name-inner hero-name-back" ref={nameBackRef}>
            {letters}
            <div className="ticker-wrap" ref={tickerRef} aria-hidden>
              <div className="ticker-track">
                {TICKER_ITEMS.map((item, i) =>
                  item === '✦' ? <em key={i}>✦</em> : <span key={i}>{item}</span>
                )}
              </div>
            </div>
          </div>

          {/* FRONT layer — T,L,K visible (above belt), I,A transparent (below belt) */}
          <div className="hero-name-inner hero-name-front" ref={nameFrontRef} aria-hidden>
            {NAME.split('').map((ch, i) => (
              <span
                className="hero-name-letter"
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: 0,
                  color: ABOVE.has(i) ? 'var(--ink)' : 'transparent',
                }}
              >{ch}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-tagline-wrap">
        <div className="hero-tagline" ref={tagRef} style={{ transform: 'translateY(110%)' }}>
          a <em>UI/UX sorcerer</em> &amp; ML apprentice.
        </div>
      </div>

      <div className="hero-bottom" ref={bottomRef} style={{ opacity: 0 }}>
        <p className="hero-desc">
          Googled <strong>"what is gradient descent"</strong> at 2am. Makes things pretty. Makes things think. Mostly makes things.
        </p>
        <div className="hero-actions">
          <a href="#work" className="btn-primary"
            onClick={e => { e.preventDefault(); document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' }) }}>
            View Work <span className="btn-arrow">↓</span>
          </a>
          <a href="#contact" className="btn-outline"
            onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}>
            Say hello <span className="btn-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
