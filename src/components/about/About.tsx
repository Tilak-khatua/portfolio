import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './about.css'

const STATS = [
  { label: 'design', value: 88 },
  { label: 'frontend', value: 82 },
  { label: 'backend', value: 75 },
  { label: 'ml (dangerous)', value: 55 },
  { label: 'taste', value: 94 },
]

const LINKS = [
  { label: 'github', href: 'https://github.com/tilak-khatua' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/tilak-kumar-khatua-2b966437a' },
  { label: 'email', href: 'mailto:tilakkhatua01@gmail.com' },
]

export default function About() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    if (!rootRef.current) return

    const bars = rootRef.current.querySelectorAll<HTMLDivElement>('.about-stat-fill')
    const nums = rootRef.current.querySelectorAll<HTMLSpanElement>('.about-stat-num')

    const ctx = gsap.context(() => {
      bars.forEach((bar, i) => {
        const v = STATS[i].value
        gsap.fromTo(
          bar,
          { width: '0%' },
          {
            width: `${v}%`,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: { trigger: bar, start: 'top 85%' },
          }
        )
      })
      nums.forEach((num, i) => {
        const v = STATS[i].value
        const obj = { n: 0 }
        gsap.to(obj, {
          n: v,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: num, start: 'top 85%' },
          onUpdate: () => { num.textContent = String(Math.round(obj.n)) },
        })
      })
    }, rootRef)

    return () => {
      ctx.revert()
      ScrollTrigger.refresh()
    }
  }, [reduced])

  return (
    <section id="about" ref={rootRef} className="about">
      <div className="about-inner">
        <div className="about-left">
          <div className="about-photo win">
            <div className="win-bar win-bar-light">
              <div className="win-dots">
                <span className="win-dot red" />
                <span className="win-dot yellow" />
                <span className="win-dot green" />
              </div>
              <div className="win-title">tilak.bmp</div>
            </div>
            <div className="about-photo-body">
              <div className="about-photo-face display">★</div>
              <div className="about-photo-sig mono">tilak khatua / 2026</div>
            </div>
          </div>

          <div className="win about-stats">
            <div className="win-bar win-bar-light">
              <div className="win-dots">
                <span className="win-dot red" />
                <span className="win-dot yellow" />
                <span className="win-dot green" />
              </div>
              <div className="win-title">stats.sys</div>
            </div>
            <div className="about-stats-body">
              {STATS.map((s, i) => (
                <div key={s.label} className="about-stat mono">
                  <div className="about-stat-row">
                    <span className="about-stat-label">{s.label}</span>
                    <span className="about-stat-value">
                      <span className="about-stat-num">{reduced ? s.value : 0}</span>/100
                    </span>
                  </div>
                  <div className="about-stat-bar">
                    <div
                      className="about-stat-fill"
                      style={reduced ? { width: `${s.value}%` } : undefined}
                      data-i={i}
                    />
                  </div>
                </div>
              ))}
              <div className="about-stats-foot mono">
                <span>▮ self-assessed · unvalidated · partially fake</span>
              </div>
            </div>
          </div>
        </div>

        <div className="about-right">
          <div className="label about-label">[ ABOUT / readme.txt ]</div>
          <h2 className="about-heading display">hey, i'm tilak.</h2>
          <div className="about-body serif">
            <p>
              somewhere between a UI/UX sorcerer and an ML apprentice who googled
              <em> 'what is gradient descent'</em> at 2am.
            </p>
            <p>
              i design interfaces people can use without swearing, and i write code that ships.
              i care about typography more than i should, type-safety as much as i should, and
              deadlines exactly as much as the project deserves.
            </p>
            <p>
              currently building things on the web, learning where ML actually earns its keep,
              and hunting for the portfolio's next <em>one weird detail</em>.
            </p>
          </div>

          <div className="about-links mono">
            {LINKS.map((l) => (
              <a key={l.label} className="about-link" href={l.href} target="_blank" rel="noreferrer">
                <span>{l.label}</span>
                <span>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
