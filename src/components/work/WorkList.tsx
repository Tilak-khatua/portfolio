import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../../data/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { getField } from '../../hooks/usePixelField'
import WorkCard from './WorkCard'
import './work.css'

type Props = { onOpen: (slug: string) => void }

/** The accent keys in projects.ts, remapped onto the warm-earth palette. */
const ACCENTS: Record<string, string> = {
  hot: 'var(--terracotta)',
  cyan: 'var(--brown)',
  lime: 'var(--ochre)',
  violet: 'var(--clay)',
}

export default function WorkList({ onOpen }: Props) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return

    const mm = gsap.matchMedia()

    // Desktop only: pin the section and translate the track sideways.
    mm.add('(min-width: 900px)', () => {
      /**
       * Total horizontal overflow. Measured from layout values only — offsetLeft
       * and offsetWidth ignore transforms, so this returns the same number
       * whether or not the track is already shifted. (Using getBoundingClientRect
       * here double-counts the live transform and cuts the scroll short.)
       */
      const distance = () => {
        const last = track.lastElementChild as HTMLElement | null
        if (!last) return 0
        const contentRight = last.offsetLeft + last.offsetWidth
        const padRight = parseFloat(getComputedStyle(track).paddingRight) || 0
        return Math.max(0, contentRight + padRight - window.innerWidth)
      }

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`
            }
          },
        },
      })

      /**
       * Cards turn as they pass through the middle of the viewport: angled away
       * on approach, square at centre, angled the other way as they leave.
       *
       * The trigger window is centre-relative ('center right' → 'center left')
       * rather than edge-relative, so a card only starts turning once it is
       * genuinely near the middle. With an edge-relative window every card that
       * happens to sit offscreen-right is already mid-rotation on first paint,
       * which is what made the second card look pre-tilted before any scrolling.
       */
      const cards = gsap.utils.toArray<HTMLElement>('.work-card-stage')
      cards.forEach((card) => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: 'center right',
              end: 'center left',
              scrub: 0.5,
            },
          })
          .fromTo(
            card,
            { transformPerspective: 1000, rotationY: -26, z: -150 },
            { transformPerspective: 1000, rotationY: 0, z: 0, ease: 'none', duration: 1 }
          )
          .to(card, {
            transformPerspective: 1000,
            rotationY: 26,
            z: -150,
            ease: 'none',
            duration: 1,
          })
      })

      // Card widths shift when the web fonts swap in, which invalidates the
      // measured distance — remeasure once they're ready.
      let cancelled = false
      document.fonts?.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh()
      })

      return () => {
        cancelled = true
        cards.forEach((c) => gsap.set(c, { clearProps: 'all' }))
      }
    })

    return () => mm.revert()
  }, [reduced])

  const open = (slug: string) => {
    getField()?.burst(window.innerWidth / 2, window.innerHeight * 0.6, 0.8)
    onOpen(slug)
  }

  return (
    <section id="work" ref={rootRef} className="work">
      <div ref={trackRef} className="work-track">
        <div className="work-intro">
          <div className="eyebrow" data-field-safe="10">
            Selected work / {String(projects.length).padStart(2, '0')} cases
          </div>
          <h2 className="work-heading display">Things I finished.</h2>
          <p className="work-intro-sub">
            Scroll sideways. Click a card for the full case.
          </p>
          <div className="work-intro-arrow mono">▸▸▸</div>
        </div>

        {projects.map((p, i) => (
          <WorkCard
            key={p.slug}
            project={p}
            index={i}
            total={projects.length}
            accent={ACCENTS[p.accent]}
            onOpen={() => open(p.slug)}
          />
        ))}

        <div className="work-end mono">
          <span>End of directory</span>
          <span className="work-end-sub">More when I finish them</span>
        </div>
      </div>

      <div className="work-progress">
        <div ref={progressRef} className="work-progress-fill" />
      </div>
    </section>
  )
}
