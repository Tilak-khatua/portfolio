import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { getLenis } from '../../hooks/useLenis'
import { usePixelHover } from '../../hooks/usePixelHover'
import HeroBand from './HeroBand'
import './hero.css'

/** Two lines so the name stacks and can be set very large. */
const NAME_LINES = ['TILAK', 'KHATUA']

/** Cycles under the name — scrambles between entries rather than cross-fading. */
const ROLES = [
  'Forward engineer',
  'Interfaces & systems',
  'Rust, lately',
  'High on caffeine',
  'Ships on Wednesdays',
]

const SCRAMBLE = '▚▞█▓▒░◧◨#%@'

type Props = { booted: boolean }

export default function Hero({ booted }: Props) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const played = useRef(false)
  const ctaRef = usePixelHover<HTMLButtonElement>()

  useEffect(() => {
    const headline = headlineRef.current
    if (!headline || !rootRef.current) return

    if (reduced) {
      gsap.set(rootRef.current.querySelectorAll('[data-anim]'), { opacity: 1, y: 0 })
      return
    }
    if (!booted || played.current) return
    played.current = true

    const role = rootRef.current.querySelector<HTMLElement>('.hero-name-role')
    const split = new SplitType(headline, { types: 'lines' })
    const lines = (split.lines ?? []) as HTMLElement[]
    const rest = rootRef.current.querySelectorAll<HTMLElement>('[data-anim]')

    // The name is uncovered from the bottom up, matching the direction of the
    // loader's pixel wave — so the two read as the same motion continuing, not
    // as a separate entrance. Stepped, so the edge advances in cell-sized chunks.
    gsap.set(lines, { clipPath: 'inset(100% 0% 0% 0%)' })
    gsap.set(rest, { opacity: 0, y: 12 })
    if (role) gsap.set(role, { opacity: 0, scale: 0.94 })

    const tl = gsap.timeline()
    tl.to(lines, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.85,
      ease: 'steps(12)',
      // last line first — the wave reaches the lower line before the upper one
      stagger: { each: 0.12, from: 'end' },
    })
    if (role) {
      tl.to(role, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' }, '-=0.5')
    }
    tl.to(rest, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, '-=0.45')

    // Headline drifts up faster than the page as you scroll away from it.
    const drift = gsap.to(headline, {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: {
        trigger: rootRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    return () => {
      drift.scrollTrigger?.kill()
      drift.kill()
      tl.kill()
      split.revert()
    }
  }, [reduced, booted])

  /**
   * Cycle the strip. The scramble resolves *into* the next phrase — characters
   * settle onto their target left to right, so the new text emerges from the
   * noise. Writing straight to the DOM (rather than through React state) is what
   * makes that possible: a state swap would hard-cut to the next string at the
   * end of the animation instead of the animation producing it.
   */
  useEffect(() => {
    if (reduced || !booted) return
    const el = rootRef.current?.querySelector<HTMLElement>('.hero-strip-text')
    if (!el) return

    let cancelled = false
    let index = 0
    let tween: gsap.core.Tween | null = null

    const cycle = () => {
      const from = ROLES[index]
      index = (index + 1) % ROLES.length
      const to = ROLES[index]
      const len = Math.max(from.length, to.length)
      const state = { t: 0 }

      tween = gsap.to(state, {
        t: 1,
        duration: 0.7,
        ease: 'none',
        onUpdate: () => {
          if (cancelled) return
          // A settle front sweeps left to right; ahead of it, glyphs churn.
          const front = state.t * len
          let out = ''
          for (let i = 0; i < len; i++) {
            const target = to[i] ?? ''
            if (i < front) {
              out += target
            } else if (target === ' ' && i > front + 3) {
              out += ' '
            } else {
              out += SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0]
            }
          }
          el.textContent = out
        },
        onComplete: () => {
          if (!cancelled) el.textContent = to
        },
      })
    }

    el.textContent = ROLES[0]
    const id = window.setInterval(cycle, 3200)

    return () => {
      cancelled = true
      tween?.kill()
      window.clearInterval(id)
    }
  }, [reduced, booted])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el)
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" ref={rootRef} className="hero">
      {/* Masthead on solid paper. The name stacks big and the supporting info
          tucks into the rows beside it; the field begins at the bottom edge. */}
      <div className="hero-head">
        <div className="hero-mast">
          {/* The role is a sibling of the split target, not a child — SplitType
              has no way to exclude nested nodes and would shred it into chars. */}
          <div className="hero-name-wrap">
            <h1 ref={headlineRef} className="hero-name display">
              {NAME_LINES.map((line) => (
                <span key={line} className="hero-name-line">
                  {line}
                </span>
              ))}
            </h1>
            <em className="hero-name-role serif">designs &amp; ships</em>
          </div>

          {/* rotating one-liner keeps the masthead from being wholly static */}
          <div className="hero-strip" data-anim>
            <span className="hero-strip-mark mono" aria-hidden>▚</span>
            <span className="hero-strip-text mono" aria-live="polite">
              {ROLES[0]}
            </span>
          </div>

          <div className="hero-base">
            <p className="hero-bio" data-anim>
              Somewhere between a UI/UX sorcerer and an ML apprentice who googled{' '}
              <em className="serif">'what is gradient descent'</em> at 2am. Makes things pretty.
              Makes things think. Mostly makes things.
            </p>

            <div className="hero-actions" data-anim>
              <button ref={ctaRef} className="btn" onClick={() => scrollTo('work')}>
                Selected work
              </button>
              <a className="link" href="mailto:tilakkhatua01@gmail.com">
                tilakkhatua01@gmail.com ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* self-animating pixel band, dense at the masthead edge and dissolving down */}
      <div className="hero-field">
        <HeroBand />
      </div>

    </section>
  )
}
