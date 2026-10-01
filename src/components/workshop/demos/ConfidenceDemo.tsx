import { useId, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { predictionConfidences } from '../data'

export default function ConfidenceDemo() {
  const [threshold, setThreshold] = useState(0.7)
  const [runVersion, setRunVersion] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const previousRun = useRef(0)
  const tweens = useRef<gsap.core.Animation[]>([])
  const [batchStatus, setBatchStatus] = useState<string | null>(null)
  const helpId = useId()
  const accepted = predictionConfidences.filter((confidence) => confidence >= threshold).length
  const reviewed = predictionConfidences.length - accepted
  const completionMessage = `Demo batch complete: ${predictionConfidences.length} fixed example scores routed at ${threshold.toFixed(2)} — ${accepted} automatic, ${reviewed} review.`

  useLayoutEffect(() => {
    const container = root.current
    if (!container) return
    const dots = Array.from(container.querySelectorAll<SVGCircleElement>('.prediction-dot'))
    tweens.current.forEach((tween) => tween.kill())
    tweens.current = []
    gsap.killTweensOf(dots)
    const stages = container.querySelectorAll('.confidence-mobile-stage, .confidence-mobile-route')
    gsap.set(stages, { clearProps: 'backgroundColor,borderColor' })
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isNewBatch = runVersion !== previousRun.current
    const targets = dots.map((dot, index) => {
      const confidence = predictionConfidences[index]
      const goesToAuto = confidence >= threshold
      const slot = (goesToAuto ? predictionConfidences.filter((value) => value >= threshold) : predictionConfidences.filter((value) => value < threshold)).indexOf(confidence)
      return {
        dot,
        x: 454 + (slot % 4) * 28,
        y: (goesToAuto ? 141 : 293) + Math.floor(slot / 4) * 20,
        color: goesToAuto ? '#08777c' : '#6840bc',
        index,
      }
    })
    if (!initialized.current || reduce) {
      targets.forEach(({ dot, x, y, color }) => gsap.set(dot, { attr: { cx: x, cy: y }, fill: color }))
      if (reduce && isNewBatch) setBatchStatus(completionMessage)
    } else {
      if (isNewBatch) {
        const batch = gsap.timeline({ onComplete: () => setBatchStatus(completionMessage) })
        targets.forEach(({ dot, x, y, color, index }) => {
          gsap.set(dot, { attr: { cx: 68, cy: 196 }, fill: '#a7330f' })
          const start = index * 0.095
          batch.to(dot, { attr: { cx: 194, cy: 196 }, duration: 0.35, ease: 'power1.inOut' }, start)
            .to(dot, { attr: { cx: 327, cy: 202 }, duration: 0.4, ease: 'power1.inOut' }, start + 0.35)
            .to(dot, { attr: { cx: 396, cy: y < 220 ? 141 : 293 }, fill: color, duration: 0.45, ease: 'power2.inOut' }, start + 0.75)
            .to(dot, { attr: { cx: x, cy: y }, duration: 0.3, ease: 'power2.out' }, start + 1.2)
        })
        stages.forEach((stage, index) => {
          batch.to(stage, { backgroundColor: '#efe4d4', borderColor: '#a7330f', duration: 0.25 }, Math.min(index, 3) * 0.4)
            .to(stage, { clearProps: 'backgroundColor,borderColor', duration: 0.35 }, Math.min(index, 3) * 0.4 + 0.5)
        })
        tweens.current.push(batch)
      } else targets.forEach(({ dot, x, y, color, index }) => {
        tweens.current.push(gsap.to(dot, {
          attr: { cx: x, cy: y },
          fill: color,
          duration: 0.25,
          delay: (index % 4) * 0.018,
          ease: 'power2.out',
          overwrite: 'auto',
        }))
      })
    }
    initialized.current = true
    previousRun.current = runVersion
    return () => {
      tweens.current.forEach((tween) => tween.kill())
      tweens.current = []
    }
  }, [threshold, runVersion])

  useLayoutEffect(() => () => {
    tweens.current.forEach((tween) => tween.kill())
    tweens.current = []
  }, [])

  const runBatch = () => {
    setBatchStatus('Routing the illustrative batch…')
    setRunVersion((version) => version + 1)
  }

  const reset = () => {
    setBatchStatus(null)
    setThreshold(0.7)
    setRunVersion((version) => version + 1)
  }

  return (
    <div className="demo demo--confidence" ref={root}>
      <figure className="demo-figure confidence-figure">
        <svg viewBox="0 0 620 400" role="img" aria-labelledby={`${helpId}-title ${helpId}-desc`}>
          <title id={`${helpId}-title`}>Predictions routed by a confidence threshold</title>
          <desc id={`${helpId}-desc`}>Twelve example predictions pass through a model and decision point. Predictions above the selected threshold go to automatic acceptance; the rest go to human review.</desc>
          <defs>
            {/* Travelling dots disappear behind label areas, including while
                changing thresholds. Text stays readable throughout a batch. */}
            <mask id={`${helpId}-dot-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="620" height="400">
              <rect width="620" height="400" fill="white" />
              <rect x="43" y="170" width="50" height="21" fill="black" />
              <rect x="164" y="170" width="60" height="22" fill="black" />
              <rect x="297" y="162" width="60" height="34" fill="black" />
              <rect x="434" y="85" width="130" height="40" fill="black" />
              <rect x="434" y="237" width="130" height="40" fill="black" />
              <rect x="419" y="40" width="150" height="21" fill="black" />
              <rect x="419" y="360" width="150" height="21" fill="black" />
            </mask>
          </defs>
          <path className="route-line" d="M70 196h142m54 0h61m0 6c44 0 30-61 69-61h25m-94 61c44 0 30 91 69 91h25" />
          <rect className="route-box route-box--input" x="32" y="154" width="72" height="52" rx="4" />
          <text className="route-label" x="68" y="185" textAnchor="middle">INPUT</text>
          <rect className="route-box route-box--model" x="150" y="151" width="88" height="58" rx="4" />
          <text className="route-label" x="194" y="186" textAnchor="middle">MODEL</text>
          <path className="route-decision" d="m293 180 34-34 34 34-34 34z" />
          <text className="route-small" x="327" y="177" textAnchor="middle">ABOVE</text>
          <text className="route-small" x="327" y="190" textAnchor="middle">THRESHOLD?</text>
          <rect className="route-box route-box--auto" x="421" y="72" width="157" height="124" rx="4" />
          <text className="route-label" x="499" y="99" textAnchor="middle">AUTOMATIC</text>
          <text className="route-small" x="499" y="116" textAnchor="middle">ACCEPT</text>
          <path className="route-divider route-divider--auto" d="M433 126h133" />
          <rect className="route-box route-box--human" x="421" y="224" width="157" height="124" rx="4" />
          <text className="route-label" x="499" y="251" textAnchor="middle">HUMAN</text>
          <text className="route-small" x="499" y="268" textAnchor="middle">REVIEW</text>
          <path className="route-divider route-divider--human" d="M433 278h133" />
          <text className="route-outcome" x="421" y="55">{accepted} ACCEPTED</text>
          <text className="route-outcome route-outcome--human" x="421" y="375">{reviewed} TO REVIEW</text>
          <g aria-hidden="true" mask={`url(#${helpId}-dot-mask)`}>
          {predictionConfidences.map((confidence, index) => <circle
            key={`${index}-${confidence}`}
            className="prediction-dot"
            cx="265"
            cy={165 + (index % 4) * 10}
            r="6"
            data-order={index}
          />)}
          </g>
        </svg>
        <div className="confidence-mobile" aria-hidden="true">
          <div className="confidence-mobile-stage"><span>01 / REQUEST</span><span>INPUT</span></div>
          <div className="confidence-mobile-arrow">↓</div>
          <div className="confidence-mobile-stage"><span>02 / PREDICT</span><span>MODEL</span></div>
          <div className="confidence-mobile-arrow">↓</div>
          <div className="confidence-mobile-stage"><span>03 / DECIDE</span><span>AT {threshold.toFixed(2)}</span></div>
          <div className="confidence-mobile-routes">
            <div className="confidence-mobile-route"><small>ABOVE THRESHOLD</small><strong>{accepted}</strong><span>AUTOMATIC</span></div>
            <div className="confidence-mobile-route confidence-mobile-route--human"><small>BELOW THRESHOLD</small><strong>{reviewed}</strong><span>HUMAN REVIEW</span></div>
          </div>
          <p className="confidence-mobile-feedback">Reviewed labels can return to the training workflow.</p>
        </div>
        <figcaption>Confidence alone is simplified here. The full framework supports other review rules and consensus workflows.</figcaption>
      </figure>
      <div className="demo-controls confidence-controls">
        <div className="range-heading">
          <label htmlFor={`${helpId}-range`}>Confidence threshold</label>
          <output htmlFor={`${helpId}-range`}>{threshold.toFixed(2)}</output>
        </div>
        <input
          id={`${helpId}-range`}
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={threshold}
          onChange={(event) => {
            setBatchStatus(null)
            setThreshold(Number(event.currentTarget.value))
          }}
        />
        <div className="routing-counts" aria-live="polite" aria-atomic="true">
          <span><i className="count-swatch count-swatch--auto" />{accepted} automatic</span>
          <span><i className="count-swatch count-swatch--review" />{reviewed} review</span>
          <small>of {predictionConfidences.length} example predictions</small>
        </div>
        <div className="confidence-actions">
          <button className="quiet-button" type="button" onClick={runBatch}>Run batch ↻</button>
          <button className="quiet-button" type="button" onClick={reset}>Reset ↺</button>
        </div>
        {batchStatus && <p className="demo-run-status" role="status">{batchStatus}</p>}
        <p className="demo-note">Twelve fixed example scores. Equality goes to automatic acceptance. This illustrates one routing rule, not model accuracy.</p>
      </div>
    </div>
  )
}
