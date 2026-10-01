import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project } from '../../../data/projects'

gsap.registerPlugin(ScrollTrigger)

const sketches: Record<string, string[]> = {
  'third-angle': ['Reweighted survey data', 'India-native persona layer', 'Prediction + map pipeline', 'Evaluation against results'],
  recondart: ['Indicators', 'Parallel enrichment', 'Analysis + recommendations', 'Interactive evidence graph'],
  hitl: ['Prediction request', 'Confidence + rules', 'Review + consensus', 'Label feedback'],
  conversql: ['Question + schema', 'Retrieve relevant tables', 'Generate typed SQL', 'Validate before execution'],
  'eldridge-morgan': ['Editorial direction', 'Content model', 'CMS-backed pages', 'Published brand site'],
  'write-ahead-log': ['Append record', 'Checksum + durable write', 'Checkpoint', 'Recovery / replay'],
}

export default function ProjectProcessSketch({ project }: { project: Project }) {
  const steps = sketches[project.slug] ?? []
  const root = useRef<HTMLElement>(null)
  const trace = useRef<gsap.core.Timeline | null>(null)
  const [activeStep, setActiveStep] = useState(-1)
  const [status, setStatus] = useState('Follow the workflow from left to right.')

  useLayoutEffect(() => {
    const media = gsap.matchMedia(root)
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const sequence = gsap.timeline({ paused: true, onStart: () => setStatus('Tracing the workflow…'), onComplete: () => { setActiveStep(-1); setStatus('Workflow traced. Each step feeds the next.') } })
      const nodes = root.current?.querySelectorAll('.process-step') ?? []
      sequence.fromTo('.process-signal', { attr: { cx: 24 } }, { attr: { cx: 976 }, duration: 2.6, ease: 'none' }, 0)
        .fromTo('.process-rail-progress', { strokeDasharray: 952, strokeDashoffset: 952 }, { strokeDashoffset: 0, duration: 2.6, ease: 'none' }, 0)
      nodes.forEach((node, index) => {
        sequence.call(() => setActiveStep(index), [], index * 0.65)
          .fromTo(node, { y: 10, backgroundColor: '#fffcf6' }, { y: 0, backgroundColor: '#efe9dc', duration: 0.4, ease: 'power3.out' }, index * 0.65)
          .to(node, { backgroundColor: '#fffcf6', duration: 0.3 }, index * 0.65 + 0.4)
      })
      trace.current = sequence
      ScrollTrigger.create({ trigger: root.current, start: 'top 88%', once: true, onEnter: () => sequence.play() })
      return () => { trace.current = null; sequence.kill() }
    })
    media.add('(prefers-reduced-motion: reduce)', () => { setActiveStep(-1); setStatus('Four connected stages in the workflow.') })
    return () => media.revert()
  }, [project.slug])
  return (
    <figure ref={root} className={`process-sketch process-sketch--${project.accent}`}>
      <div className="process-sketch-head"><span className="eyebrow">SYSTEM SKETCH</span><span>{project.year} / {project.slug.toUpperCase()}</span></div>
      <svg className="process-rail" viewBox="0 0 1000 28" aria-hidden="true"><path d="M24 14h952" /><path className="process-rail-progress" d="M24 14h952" /><circle className="process-signal" cx="976" cy="14" r="5" /></svg>
      <ol className="process-flow">
        {steps.map((step, index) => <li className={`process-step${activeStep === index ? ' is-tracing' : ''}`} key={step}>
          <span className="process-step-index">0{index + 1}</span>
          <strong>{step}</strong>
          {index < steps.length - 1 && <span className="process-step-arrow" aria-hidden="true">→</span>}
        </li>)}
      </ol>
      <div className="process-actions"><button type="button" className="quiet-button process-replay" onClick={() => trace.current?.restart()}>Trace workflow ↻</button><p role="status">{status}</p></div>
      <figcaption>A simplified diagram of the described workflow, not a screenshot of the running application.</figcaption>
    </figure>
  )
}
