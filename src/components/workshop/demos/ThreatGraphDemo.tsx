import { useId, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { threatEdges, threatNodes } from '../data'

function curve(from: (typeof threatNodes)[number], to: (typeof threatNodes)[number]) {
  const middleX = (from.x + to.x) / 2
  const middleY = (from.y + to.y) / 2 - 13
  return `M${from.x} ${from.y} Q${middleX} ${middleY} ${to.x} ${to.y}`
}

export default function ThreatGraphDemo() {
  const [selectedId, setSelectedId] = useState<string>(threatNodes[0].id)
  const [traceVersion, setTraceVersion] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const trace = useRef<gsap.core.Timeline | null>(null)
  const helpId = useId()
  const selected = threatNodes.find((node) => node.id === selectedId) ?? threatNodes[0]
  const selectedEdges = threatEdges.filter((edge) => edge.from === selectedId || edge.to === selectedId)
  const relatedIds = new Set([selectedId, ...selectedEdges.map((edge) => edge.from), ...selectedEdges.map((edge) => edge.to)])

  useLayoutEffect(() => {
    const svg = root.current?.querySelector('svg')
    if (!svg || traceVersion === 0) return
    trace.current?.kill()
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>('[data-trace-edge]'))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paths.forEach((path) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: 0 })
      })
      setSelectedId('report')
      return
    }
    trace.current = gsap.timeline({ onComplete: () => setSelectedId('report') })
    const demoPath = ['domain-dns', 'dns-file', 'file-behaviour', 'behaviour-report']
    demoPath.forEach((id, index) => {
      const path = paths.find((item) => item.dataset.traceEdge === id)
      if (!path) return
      const length = path.getTotalLength()
      trace.current?.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, {
        strokeDashoffset: 0,
        duration: 0.2,
        ease: 'none',
        overwrite: 'auto',
      }, index * 0.2)
    })
    return () => { trace.current?.kill(); trace.current = null }
  }, [traceVersion])

  useLayoutEffect(() => () => { trace.current?.kill() }, [])

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      gsap.fromTo('.graph-detail', { y: 8, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.3, overwrite: 'auto' })
    }, root)
    return () => context.revert()
  }, [selectedId])

  const chooseNode = (id: string) => {
    trace.current?.kill()
    trace.current = null
    const paths = root.current?.querySelectorAll<SVGPathElement>('[data-trace-edge]')
    paths?.forEach((path) => {
      gsap.killTweensOf(path)
      path.style.removeProperty('stroke-dasharray')
      path.style.removeProperty('stroke-dashoffset')
    })
    setSelectedId(id)
  }

  return (
    <div className="demo demo--graph" ref={root}>
      <figure className="demo-figure graph-figure">
        <svg viewBox="0 0 580 320" role="group" aria-label="Illustrative threat relationship graph">
          <g aria-hidden="true">
            {threatEdges.map((edge) => {
              const from = threatNodes.find((node) => node.id === edge.from)!
              const to = threatNodes.find((node) => node.id === edge.to)!
              const related = relatedIds.has(edge.from) && relatedIds.has(edge.to)
              return <path
                key={`${edge.from}-${edge.to}`}
                d={curve(from, to)}
                className={`graph-edge${related ? ' is-related' : ''}`}
                data-trace-edge={`${edge.from}-${edge.to}`}
              />
            })}
          </g>
          {threatNodes.map((node) => {
            const active = selectedId === node.id
            const nearby = relatedIds.has(node.id)
            return (
              <g
                key={node.id}
                className={`graph-node${active ? ' is-selected' : ''}${nearby ? ' is-nearby' : ''}`}
                transform={`translate(${node.x} ${node.y})`}
                aria-hidden="true"
                onClick={() => chooseNode(node.id)}
              >
                <circle className="graph-hit" r="28" />
                <circle className="graph-node-ring" r={active ? 15 : 12} />
                <circle className="graph-node-core" r="3.5" />
                <text className="graph-node-label" textAnchor="middle" y="36">{node.label}</text>
              </g>
            )
          })}
        </svg>
        <figcaption>Choose a node to see its sample relationships. This fictional graph does not identify a real threat.</figcaption>
      </figure>
      <div className="graph-node-picker" role="group" aria-label="Choose a graph node">
        {threatNodes.map((node) => <button
          key={node.id}
          className={`graph-node-button${selectedId === node.id ? ' is-selected' : ''}`}
          type="button"
          aria-pressed={selectedId === node.id}
          aria-describedby={`${helpId}-detail`}
          onClick={() => chooseNode(node.id)}
        >{node.label}</button>)}
      </div>
      <div className="graph-controls">
        <div className="graph-detail" id={`${helpId}-detail`} aria-live="polite">
          <span className="eyebrow">SELECTED NODE</span>
          <strong>{selected.label}</strong>
          <p>{selected.detail}</p>
          {selectedEdges.length > 0 && <ul aria-label="Selected relationships">
            {selectedEdges.map((edge) => {
              const other = threatNodes.find((node) => node.id === (edge.from === selectedId ? edge.to : edge.from))!
              return <li key={`${edge.from}-${edge.to}`}><span>{edge.relation}</span><b>{other.label}</b></li>
            })}
          </ul>}
        </div>
        <div className="graph-actions">
          <button className="quiet-button" type="button" onClick={() => setTraceVersion((version) => version + 1)}>Trace example ↗</button>
          <button className="quiet-button" type="button" onClick={() => chooseNode(threatNodes[0].id)}>Reset ↺</button>
        </div>
        <p className="demo-note">Every relationship here is fictional and explanatory. A graph connection is not proof of malicious activity.</p>
      </div>
    </div>
  )
}
