import { useId, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const examples = [
  { question: 'How did revenue change?', sql: 'SELECT month, SUM(revenue)\nFROM orders\nGROUP BY month\nORDER BY month;', labels: ['JAN', 'FEB', 'MAR', 'APR'], values: [38, 61, 49, 84], unit: 'REVENUE / SAMPLE UNITS' },
  { question: 'Which products sold most?', sql: 'SELECT product, COUNT(*)\nFROM order_items\nGROUP BY product\nORDER BY COUNT(*) DESC\nLIMIT 4;', labels: ['DESK', 'LAMP', 'CHAIR', 'SHELF'], values: [89, 72, 51, 32], unit: 'SALES / SAMPLE COUNTS' },
] as const

export default function QueryDemo() {
  const root = useRef<HTMLDivElement>(null)
  const [example, setExample] = useState(0)
  const [version, setVersion] = useState(0)
  const sample = examples[example]
  const [code, setCode] = useState<string>(sample.sql)
  const [status, setStatus] = useState('Sample result ready.')
  const id = useId()

  useLayoutEffect(() => {
    if (version === 0) return
    const media = gsap.matchMedia(root)
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.killTweensOf(root.current?.querySelectorAll('.query-bar-fill') ?? [])
      const cursor = { count: 0 }
      setCode('')
      setStatus('Retrieving the sample schema…')
      const sequence = gsap.timeline({ onComplete: () => setStatus('Sample query complete. Four result rows shown.') })
      sequence.fromTo('.query-schema span', { backgroundColor: '#fffcf6' }, { backgroundColor: '#ddebe8', duration: 0.3, stagger: 0.15 }, 0)
        .to(cursor, { count: sample.sql.length, duration: 1.15, ease: 'none', onStart: () => setStatus('Writing the sample query…'), onUpdate: () => setCode(sample.sql.slice(0, Math.floor(cursor.count))) }, 0.4)
        .fromTo('.query-bar-fill', { scaleY: 0 }, { scaleY: 1, duration: 0.65, stagger: 0.1, ease: 'back.out(1.3)' }, 1.5)
      return () => { sequence.kill() }
    })
    media.add('(prefers-reduced-motion: reduce)', () => { setCode(sample.sql); setStatus('Sample query complete. Four result rows shown.') })
    return () => media.revert()
  }, [sample, version])

  const run = (index: number) => { setExample(index); setVersion(value => value + 1) }
  return <div className="demo demo--query" ref={root}>
    <figure className="demo-figure query-figure">
      <div className="query-schema" aria-hidden="true"><span>orders</span><span>order_items</span><span>schema →</span></div>
      <div className="query-code-head"><span>QUESTION → SQL</span><span aria-hidden="true">.sql</span></div>
      <pre className="query-code" aria-hidden="true"><code>{code}<span className="query-caret">▌</span></code></pre>
      <span className="demo-sr-only">Sample SQL: {sample.sql}</span>
      <div className="query-chart" role="img" aria-label={`${sample.unit.toLowerCase()}: ${sample.labels.map((label, i) => `${label} ${sample.values[i]}`).join(', ')}`}>
        <span className="query-chart-label">{sample.unit}</span>
        <div className="query-bars" aria-hidden="true">{sample.values.map((value, index) => <div className="query-bar" key={index}><span>{value}</span><div className="query-bar-track"><i className="query-bar-fill" style={{ height: `${value}%` }} /></div><small>{sample.labels[index]}</small></div>)}</div>
      </div>
      <figcaption>Two fixed questions, sample SQL, invented results. A sketch of the workflow.</figcaption>
    </figure>
    <div className="demo-controls">
      <span className="eyebrow" id={`${id}-questions`}>PICK A QUESTION</span>
      <div className="query-questions" role="group" aria-labelledby={`${id}-questions`}>{examples.map((item, index) => <button type="button" className="sketch-choice" aria-pressed={example === index} onClick={() => run(index)} key={item.question}>{item.question}<span aria-hidden="true">↗</span></button>)}</div>
      <button type="button" className="quiet-button" onClick={() => run(example)}>Run again ↻</button>
      <p className="demo-run-status" role="status">{status}</p>
    </div>
  </div>
}
