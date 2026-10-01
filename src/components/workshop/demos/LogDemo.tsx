import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function LogDemo() {
  const root = useRef<HTMLDivElement>(null)
  const [records, setRecords] = useState(3)
  const [checkpoint, setCheckpoint] = useState(2)
  const [applied, setApplied] = useState(3)
  const [action, setAction] = useState<'append' | 'checkpoint' | 'recover' | 'reset'>('reset')
  const [version, setVersion] = useState(0)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('Three durable records. Snapshot covers the first two.')
  useLayoutEffect(() => {
    if (version === 0) return
    const scope = root.current
    if (!scope) return
    const media = gsap.matchMedia(scope)
    const finish = () => {
      setApplied(records)
      setRunning(false)
      if (action === 'recover') setStatus(records === checkpoint ? 'Recovered from the snapshot. No pending records to replay.' : `Recovery complete. Replayed ${records - checkpoint} records after the snapshot.`)
    }
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const sequence = gsap.timeline({ onComplete: finish })
      if (action === 'append') sequence.fromTo('.wal-record:last-child', { x: -25, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' })
      if (action === 'checkpoint') sequence.fromTo('.wal-snapshot', { scale: 0.94, backgroundColor: '#e6ecd8' }, { scale: 1, backgroundColor: '#fffcf6', duration: 0.6, ease: 'back.out(1.5)' })
      if (action === 'recover') {
        sequence.fromTo('.wal-memory', { opacity: 0.35 }, { opacity: 1, duration: 0.35 })
        scope.querySelectorAll<HTMLElement>('[data-wal-pending]').forEach((row, index) => {
          sequence.fromTo(row, { backgroundColor: '#eee6d9', x: -8 }, { backgroundColor: '#e6ecd8', x: 0, duration: 0.4, ease: 'power2.out', onComplete: () => setApplied(checkpoint + index + 1) }, 0.4 + index * 0.3)
        })
      }
      return () => sequence.kill()
    })
    media.add('(prefers-reduced-motion: reduce)', finish)
    return () => media.revert()
  }, [version, action, records, checkpoint])

  const append = () => { setRecords(value => value + 1); setApplied(value => value + 1); setAction('append'); setStatus(`Record ${records + 1} appended to the durable log and applied.`); setVersion(value => value + 1) }
  const takeCheckpoint = () => { setCheckpoint(records); setAction('checkpoint'); setStatus(`Snapshot saved through record ${records}.`); setVersion(value => value + 1) }
  const recover = () => { setApplied(checkpoint); setRunning(true); setAction('recover'); setStatus('Crash simulated. Restoring snapshot, then replaying the durable log…'); setVersion(value => value + 1) }
  const reset = () => { setRecords(3); setCheckpoint(2); setApplied(3); setRunning(false); setAction('reset'); setStatus('Three durable records. Snapshot covers the first two.'); setVersion(value => value + 1) }

  return <div className="demo demo--wal" ref={root}>
    <figure className="demo-figure wal-figure">
      <div className="wal-head"><span>APPEND-ONLY LOG</span><span>CRC ✓</span></div>
      <ol className="wal-records" aria-label="Durable sample records">{Array.from({ length: records }, (_, index) => <li className="wal-record" key={`${version}-${index}`} data-wal-pending={index >= checkpoint ? '' : undefined}><span>{String(index + 1).padStart(3, '0')}</span><code>SET key_{index + 1}</code><small>{index < checkpoint ? 'SNAPSHOT' : 'IN LOG'}</small><i aria-hidden="true">✓</i></li>)}</ol>
      <div className="wal-state"><div className="wal-snapshot"><span>CHECKPOINT</span><strong>{String(checkpoint).padStart(2, '0')}</strong><small>records in snapshot</small></div><span className="wal-state-arrow" aria-hidden="true">→</span><div className="wal-memory"><span>LIVE STATE</span><strong>{String(applied).padStart(2, '0')}</strong><small>records applied</small></div></div>
      <figcaption>In-memory simulation of durable log replay. No files or database are modified.</figcaption>
    </figure>
    <div className="demo-controls wal-controls">
      <button className="quiet-button" type="button" onClick={append} disabled={running || records >= 8}>Append +</button>
      <button className="quiet-button" type="button" onClick={takeCheckpoint} disabled={running || checkpoint === records}>Checkpoint ✓</button>
      <button className="quiet-button" type="button" onClick={recover} disabled={running}>Crash & recover ↻</button>
      <button className="quiet-button" type="button" onClick={reset}>Reset ↺</button>
      <p className="demo-run-status" role="status">{status}</p>
    </div>
  </div>
}
