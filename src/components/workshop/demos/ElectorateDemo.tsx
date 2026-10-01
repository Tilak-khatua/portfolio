import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { getTurnout, seededUnit, turnoutGroups } from '../data'

const DOTS = Array.from({ length: 240 }, (_, index) => ({
  id: index,
  x: 42 + seededUnit(index, 1) * 516,
  y: 32 + seededUnit(index, 2) * 282,
  group: Math.floor(seededUnit(index, 3) * turnoutGroups.length),
  threshold: seededUnit(index, 4),
}))

export default function ElectorateDemo() {
  const [multiplier, setMultiplier] = useState(1)
  const root = useRef<HTMLDivElement>(null)
  const helpId = useId()
  const turnout = getTurnout(multiplier)

  const activeIds = useMemo(() => new Set(DOTS.filter((dot) => {
    const group = turnoutGroups[dot.group]
    return dot.threshold < Math.min(1, group.turnout * multiplier)
  }).map((dot) => dot.id)), [multiplier])

  useLayoutEffect(() => {
    const container = root.current
    if (!container) return
    const dots = container.querySelectorAll<SVGCircleElement>('.electorate-dot')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dots.forEach((dot) => { dot.style.opacity = dot.classList.contains('is-active') ? '.78' : '.16' })
      return
    }
    const tween = gsap.to(dots, {
      opacity: (_index, target) => target.classList.contains('is-active') ? 0.78 : 0.16,
      duration: 0.22,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    return () => { tween.kill() }
  }, [activeIds])

  const reset = () => setMultiplier(1)

  return (
    <div className="demo demo--city" ref={root}>
      <div className="demo-figure-wrap">
        <figure className="demo-figure city-figure">
          <svg className="city-map" viewBox="0 0 600 350" role="img" aria-labelledby={`${helpId}-title ${helpId}-desc`}>
            <title id={`${helpId}-title`}>Schematic population sample</title>
            <desc id={`${helpId}-desc`}>A decorative outline and fixed sample of synthetic population points. The shape is not a geographic map.</desc>
            <path className="city-water" d="M0 0h600v350H0z" />
            <path className="city-land" d="M0 42c48 7 42 54 92 49s63 29 113 22 35 45 85 41 69 27 93 56 45 29 48 67 47 31 52 73H0z" />
            <g className="city-grid" aria-hidden="true">
              <path d="M30 76 525 284M57 50 473 318M6 131 433 337M104 34 560 235M158 22 577 185M70 332 277 33M178 343 350 31M272 343 409 45M360 338 469 91M449 331 536 156" />
              <path d="M56 116 525 284M93 265 550 143M43 191 485 87M145 323 564 212M19 299 385 54" />
            </g>
            <g aria-hidden="true">
              {DOTS.map((dot) => <circle
                key={dot.id}
                className={`electorate-dot${activeIds.has(dot.id) ? ' is-active' : ''}`}
                cx={dot.x}
                cy={dot.y}
                r={dot.id % 11 === 0 ? 3.1 : 2.25}
                data-group={dot.group}
              />)}
            </g>
            <text className="map-label" x="30" y="28">SYNTHETIC GROUPS / SCHEMATIC</text>
            <text className="map-label map-label--sea" x="28" y="326">ILLUSTRATIVE OUTLINE</text>
            <g className="map-north" aria-hidden="true"><path d="M555 61v25m0-25-5 8m5-8 5 8" /><text x="550" y="54">N</text></g>
          </svg>
          <figcaption>Fixed sample markers change with the turnout assumption. They do not represent actual ward populations.</figcaption>
        </figure>
      </div>
      <div className="demo-controls">
        <div className="range-heading">
          <label htmlFor={`${helpId}-range`}>Turnout multiplier</label>
          <output htmlFor={`${helpId}-range`}>{multiplier.toFixed(2)}×</output>
        </div>
        <input
          id={`${helpId}-range`}
          type="range"
          min="0.70"
          max="1.30"
          step="0.05"
          value={multiplier}
          aria-describedby={`${helpId}-note`}
          onChange={(event) => setMultiplier(Number(event.currentTarget.value))}
        />
        <div className="demo-result">
          <span>Illustrative expected turnout</span>
          <strong>{turnout.percent.toFixed(2)}%</strong>
          <small>{turnout.expected.toFixed(0)} of {turnout.population} synthetic people</small>
        </div>
        <button className="quiet-button" type="button" onClick={reset}>Reset ↺</button>
        <p className="demo-note" id={`${helpId}-note`}>A simplified sensitivity example using invented group sizes and turnout probabilities. It does not forecast an election.</p>
      </div>
    </div>
  )
}
