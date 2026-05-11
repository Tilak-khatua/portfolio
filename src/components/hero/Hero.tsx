import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { getLenis } from '../../hooks/useLenis'
import './hero.css'

export default function Hero() {
  const reduced = useReducedMotion()
  const nameRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const glitchTimer = useRef<number>(0)

  useEffect(() => {
    if (!nameRef.current) return
    if (reduced) {
      gsap.set([nameRef.current, subRef.current, metaRef.current], { opacity: 1 })
      return
    }

    const split = new SplitType(nameRef.current, { types: 'chars' })
    gsap.set(split.chars, { yPercent: 110, opacity: 0 })
    gsap.set([subRef.current, metaRef.current], { opacity: 0, y: 18 })

    const tl = gsap.timeline({ delay: 0.1 })
    tl.to(split.chars, {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.035,
      ease: 'power3.out',
    })
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
      .to(metaRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')

    const triggerGlitch = () => {
      if (!nameRef.current) return
      const el = nameRef.current
      el.classList.add('glitch-on')
      setTimeout(() => el.classList.remove('glitch-on'), 140)
      glitchTimer.current = window.setTimeout(triggerGlitch, 5000 + Math.random() * 6000)
    }
    glitchTimer.current = window.setTimeout(triggerGlitch, 3000)

    return () => {
      clearTimeout(glitchTimer.current)
      split.revert()
    }
  }, [reduced])

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
          <span>INDEX / 01 — home</span>
          <span>EST. 2026</span>
        </div>

        <div className="hero-main">
          <h1 ref={nameRef} className="hero-name display" data-text="TILAK">
            TILAK
          </h1>
          <div ref={subRef} className="hero-sub">
            <span className="serif hero-sub-serif">designs & ships</span>
            <span className="hero-sub-mono mono">
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
          <div className="hero-strip mono">
            UI/UX DESIGNER · ML APPRENTICE · INDIA · 2026 /
            UI/UX DESIGNER · ML APPRENTICE · INDIA · 2026
          </div>
        </div>

        <div className="hero-hint mono">scroll ▼</div>
      </div>
    </section>
  )
}
