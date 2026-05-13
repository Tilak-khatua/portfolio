import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { getLenis } from '../../hooks/useLenis'
import './hero.css'

type Props = { booted: boolean }

const SCRAMBLE_GLYPHS = '!<>-_\\/[]{}—=+*^?#█▓▒░@$%&'
const NAME = 'TILAK'

export default function Hero({ booted }: Props) {
  const reduced = useReducedMotion()
  const topLeftRef = useRef<HTMLSpanElement>(null)
  const topRightRef = useRef<HTMLSpanElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const subSerifRef = useRef<HTMLSpanElement>(null)
  const subMonoRef = useRef<HTMLSpanElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const glitchTimer = useRef<number>(0)
  const played = useRef(false)

  useEffect(() => {
    if (!nameRef.current) return
    if (reduced) {
      gsap.set(
        [
          topLeftRef.current,
          topRightRef.current,
          nameRef.current,
          subSerifRef.current,
          subMonoRef.current,
          metaRef.current,
          stripRef.current,
        ],
        { opacity: 1, clearProps: 'transform' }
      )
      if (nameRef.current) nameRef.current.textContent = NAME
      return
    }
    if (!booted || played.current) return
    played.current = true

    const split = new SplitType(nameRef.current, { types: 'chars' })
    const chars = split.chars as HTMLElement[]

    gsap.set(chars, { yPercent: 110, opacity: 0 })
    gsap.set([subSerifRef.current, subMonoRef.current, metaRef.current], {
      opacity: 0,
      y: 16,
    })
    gsap.set(stripRef.current, { '--strip-underline': '0%' } as gsap.TweenVars)

    const tl = gsap.timeline({ delay: 0.15 })

    // Top meta — typewriter
    tl.add(typeInto(topLeftRef.current, 'INDEX / 01 — home', 22))
    tl.add(typeInto(topRightRef.current, 'EST. 2026', 28), '<+0.15')

    // Name — chars rise in; during each char's rise, scramble its glyph before settling
    chars.forEach((ch, i) => {
      const final = ch.textContent ?? ''
      const start = 0.35 + i * 0.08
      tl.to(
        ch,
        { yPercent: 0, opacity: 1, duration: 0.55, ease: 'power3.out' },
        start
      )
      tl.add(scrambleChar(ch, final, 0.4), start)
    })

    // Sub lines and meta
    tl.to(subSerifRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.25')
    tl.to(subMonoRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.4')
    tl.to(metaRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.4')

    // Strip underline draw
    tl.to(
      stripRef.current,
      { '--strip-underline': '100%', duration: 0.8, ease: 'power2.out' } as gsap.TweenVars,
      '-=0.45'
    )

    const triggerGlitch = () => {
      if (!nameRef.current) return
      const el = nameRef.current
      el.classList.add('glitch-on')
      setTimeout(() => el.classList.remove('glitch-on'), 140)
      glitchTimer.current = window.setTimeout(triggerGlitch, 5000 + Math.random() * 6000)
    }
    glitchTimer.current = window.setTimeout(triggerGlitch, tl.duration() * 1000 + 1500)

    return () => {
      clearTimeout(glitchTimer.current)
      tl.kill()
      split.revert()
    }
  }, [reduced, booted])

  const scrollToWork = () => {
    const el = document.getElementById('work')
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el, { offset: -12 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="hero">
      <div className="hero-grid">
        <div className="hero-top mono">
          <span ref={topLeftRef} className="hero-top-slot" />
          <span ref={topRightRef} className="hero-top-slot" />
        </div>

        <div className="hero-main">
          <h1 ref={nameRef} className="hero-name display" data-text="TILAK">
            {NAME}
          </h1>
          <div className="hero-sub">
            <span ref={subSerifRef} className="serif hero-sub-serif">
              designs &amp; ships
            </span>
            <span ref={subMonoRef} className="hero-sub-mono mono">
              — somewhere between a UI/UX sorcerer and an ML apprentice who googled
              'what is gradient descent' at 2am.
            </span>
          </div>
        </div>

        <div ref={metaRef} className="hero-meta">
          <button className="chrome-btn" onClick={scrollToWork}>
            see work
            <span className="hero-arrow">▸</span>
          </button>
          <div ref={stripRef} className="hero-strip mono">
            UI/UX DESIGNER · ML APPRENTICE · INDIA · 2026 /
            UI/UX DESIGNER · ML APPRENTICE · INDIA · 2026
          </div>
        </div>

      </div>
    </section>
  )
}

function typeInto(el: HTMLElement | null, text: string, cps: number) {
  const obj = { i: 0 }
  const duration = text.length / cps
  return gsap.to(obj, {
    i: text.length,
    duration,
    ease: 'none',
    onUpdate: () => {
      if (!el) return
      el.textContent = text.slice(0, Math.round(obj.i))
    },
    onStart: () => {
      if (el) el.textContent = ''
    },
    onComplete: () => {
      if (el) el.textContent = text
    },
  })
}

function scrambleChar(el: HTMLElement, final: string, duration: number) {
  const state = { t: 0 }
  let lastStep = -1
  return gsap.to(state, {
    t: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      const p = state.t
      if (p > 0.85) {
        el.textContent = final
        return
      }
      const step = Math.floor(p * 18)
      if (step === lastStep) return
      lastStep = step
      const g = SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0]
      el.textContent = g
    },
    onComplete: () => {
      el.textContent = final
    },
  })
}
