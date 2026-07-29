import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePixelHover } from '../../hooks/usePixelHover'
import './about.css'

const DISCIPLINES = [
  {
    label: 'Design',
    blurb: 'Interfaces, typography, motion, and the systems that keep them consistent.',
    tools: ['Figma', 'GSAP', 'Framer Motion', 'Design systems'],
  },
  {
    label: 'Frontend',
    blurb: 'Typed, accessible, fast. No component library doing my thinking for me.',
    tools: ['React', 'TypeScript', 'Next.js', 'Vite', 'Tailwind'],
  },
  {
    label: 'Backend',
    blurb: 'APIs and workers that stay boring under load, which is the whole point.',
    tools: ['FastAPI', 'tRPC', 'Postgres', 'Redis', 'Celery', 'Rust'],
  },
  {
    label: 'Applied ML',
    blurb: 'Where a model actually earns its keep — and where a human should decide instead.',
    tools: ['AWS Bedrock', 'scikit-learn', 'Human-in-the-loop'],
  },
]

const FACTS = [
  { k: 'Based', v: 'India · remote' },
  { k: 'Focus', v: 'Design engineering' },
  { k: 'Writing', v: 'Rust, lately' },
  { k: 'Open to', v: 'Work & collaboration' },
]

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/Tilak-khatua' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tilak-kumar-khatua-2b966437a' },
  { label: 'Email', href: 'mailto:tilakkhatua01@gmail.com' },
]

export default function About() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const bioRef = usePixelHover<HTMLElement>({ mode: 'corners', density: 0.22 })
  const factsRef = usePixelHover<HTMLElement>({ mode: 'corners', density: 0.22 })

  useEffect(() => {
    if (reduced || !rootRef.current || !headingRef.current) return

    const split = new SplitType(headingRef.current, { types: 'lines,words' })
    const words = (split.words ?? []) as HTMLElement[]

    const ctx = gsap.context(() => {
      // The headline inks in word by word as the section scrolls through.
      gsap.set(words, { opacity: 0.14 })
      gsap.to(words, {
        opacity: 1,
        ease: 'none',
        stagger: 0.5,
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 82%',
          end: 'bottom 58%',
          scrub: 0.6,
        },
      })

      gsap.from('.about-panel', {
        opacity: 0,
        y: 26,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.about-grid', start: 'top 84%', once: true },
      })

      // Cells rise in reading order — sliding from the left suited a list, but
      // reads oddly on a grid where two cells share each row.
      gsap.from('.about-disc', {
        opacity: 0,
        y: 20,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.about-disciplines', start: 'top 88%', once: true },
      })
    }, rootRef)

    return () => {
      ctx.revert()
      split.revert()
    }
  }, [reduced])

  return (
    <section id="about" ref={rootRef} className="section about">
      <div className="container">
        <div className="eyebrow about-eyebrow" data-field-safe="10">
          About / 02
        </div>

        <h2 ref={headingRef} className="about-heading display">
          I design interfaces people can use without swearing, and write code that ships.
        </h2>

        <div className="about-grid">
          {/* ---- bio panel ---- */}
          <article ref={bioRef} className="about-panel about-panel-bio">
            <header className="about-panel-bar mono">
              <span>readme</span>
              <span className="about-panel-dot" aria-hidden />
            </header>

            <div className="about-panel-body">
              <p>
                I care about typography more than I should, type-safety as much as I should, and
                deadlines exactly as much as the project deserves.
              </p>
              <p>
                Most of what I build sits where design and systems meet — a threat-intel graph
                that replaces fourteen browser tabs, a review pipeline that teaches a model when
                to ask a human, a write-ahead log built from scratch because reading papers only
                gets you so far.
              </p>
              <p>
                Currently building on the web, learning where ML actually earns its keep, and
                hunting for this page's next <em className="serif">one weird detail</em>.
              </p>

              <div className="about-links">
                {LINKS.map((l) => (
                  <a key={l.label} className="link" href={l.href} target="_blank" rel="noreferrer">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </article>

          {/* ---- facts panel ---- */}
          <article ref={factsRef} className="about-panel about-panel-facts">
            <header className="about-panel-bar mono">
              <span>details</span>
              <span className="about-panel-dot" aria-hidden />
            </header>

            <dl className="about-facts">
              {FACTS.map((f) => (
                <div key={f.k} className="about-fact mono">
                  <dt>{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>

        {/* All four visible at once — an accordion hid three of them behind a
            click and left most of the row empty. */}
        <div className="about-disc-label eyebrow">What I work in</div>

        <div className="about-disciplines">
          {DISCIPLINES.map((d, i) => (
            <Discipline key={d.label} index={i} {...d} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Own component so each cell can hold its own pixel-hover ref. */
function Discipline({
  index,
  label,
  blurb,
  tools,
}: {
  index: number
  label: string
  blurb: string
  tools: string[]
}) {
  const ref = usePixelHover<HTMLElement>({ mode: 'corners', density: 0.2, corner: 3 })

  return (
    <article ref={ref} className="about-disc">
      <header className="about-disc-top">
        <span className="about-disc-n mono">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="about-disc-name display">{label}</h3>
      </header>

      <p className="about-disc-blurb">{blurb}</p>

      <div className="about-disc-tools">
        {tools.map((t) => (
          <span key={t} className="chip">{t}</span>
        ))}
      </div>
    </article>
  )
}
