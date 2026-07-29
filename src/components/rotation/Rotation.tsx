import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { tracks, vibe } from '../../data/tracks'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePixelHover } from '../../hooks/usePixelHover'
import './rotation.css'

/** Track accent keys mapped onto the warm-earth palette. */
const ACCENTS: Record<string, string> = {
  hot: 'var(--terracotta)',
  cyan: 'var(--brown)',
  lime: 'var(--ochre)',
  violet: 'var(--clay)',
}

/** Deterministic bar heights per track, so a song's waveform never changes. */
function waveform(seed: string, bars = 28) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Array.from({ length: bars }, (_, i) => {
    h = Math.imul(h ^ (i + 1), 16777619)
    const n = ((h >>> 0) % 1000) / 1000
    // keep bars in a readable band rather than spiking to zero
    return 0.25 + n * 0.75
  })
}

export default function Rotation() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const playerRef = usePixelHover<HTMLDivElement>({ mode: 'corners', density: 0.22 })
  const [active, setActive] = useState(0)

  const current = tracks[active]
  const bars = waveform(current.title)
  const top = Math.max(...tracks.map((t) => Number(t.plays)))

  useEffect(() => {
    if (reduced || !rootRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.rot-row', {
        opacity: 0,
        y: 16,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: { trigger: '.rot-list', start: 'top 85%', once: true },
      })
      gsap.from('.rot-player', {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.rot-grid', start: 'top 82%', once: true },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="play" ref={rootRef} className="section rot">
      <div className="container">
        <div className="eyebrow rot-eyebrow" data-field-safe="10">
          On rotation / {String(tracks.length).padStart(2, '0')} tracks
        </div>

        <div className="rot-grid">
          {/* ---- now playing panel ---- */}
          <div
            ref={playerRef}
            className="rot-player"
            style={{ ['--accent' as string]: ACCENTS[current.accent] }}
          >
            <div className="rot-player-bar mono">
              <span className="rot-player-dot" aria-hidden />
              <span>Now playing</span>
              <span className="rot-player-time">{current.duration}</span>
            </div>

            <div className="rot-player-body">
              <p className="rot-player-title display">{current.title}</p>
              <p className="rot-player-artist">{current.artist}</p>
              <p className="rot-player-album mono">{current.album}</p>
            </div>

            {/* deterministic per-track waveform; animates only when not reduced */}
            <div className={`rot-wave ${reduced ? '' : 'is-live'}`} aria-hidden>
              {bars.map((height, i) => (
                <span
                  key={i}
                  className="rot-wave-bar"
                  style={{
                    height: `${height * 100}%`,
                    animationDelay: `${(i % 7) * 0.11}s`,
                  }}
                />
              ))}
            </div>

            <p className="rot-vibe mono">{vibe.mood}</p>
          </div>

          {/* ---- track list ---- */}
          <ol className="rot-list">
            {tracks.map((t, i) => {
              const isActive = i === active
              return (
                <li
                  key={`${t.title}-${t.rank}`}
                  className={`rot-row ${isActive ? 'is-active' : ''}`}
                  style={{ ['--accent' as string]: ACCENTS[t.accent] }}
                >
                  <button className="rot-row-btn" onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)}>
                    <span className="rot-rank mono">
                      {isActive ? '▶' : String(t.rank).padStart(2, '0')}
                    </span>

                    <span className="rot-main">
                      <span className="rot-title">{t.title}</span>
                      <span className="rot-artist">{t.artist}</span>
                    </span>

                    <span className="rot-bar" aria-hidden>
                      <span
                        className="rot-bar-fill"
                        style={{ transform: `scaleX(${Number(t.plays) / top})` }}
                      />
                    </span>

                    <span className="rot-plays mono">{t.plays}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
