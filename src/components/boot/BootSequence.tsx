import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './boot.css'

type Props = { onDone: () => void }

const LINES = [
  'tilak.os — bios v2.26',
  'CPU ............ vibes, clocked too fast',
  'MEMORY ......... enough to forget your name',
  'GPU ............ borrowed from 2003',
  '',
  'loading TILAK.SYS',
  'decompressing personality.pak',
  'mounting /work, /play, /about ... ok',
  'warming up pixel cursor ... ok',
  '',
  'ready. press any key to continue.',
]

export default function BootSequence({ onDone }: Props) {
  const reduced = useReducedMotion()
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [ready, setReady] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) {
      onDone()
      return
    }
    let timer: number
    if (lineIdx >= LINES.length) {
      setReady(true)
      return
    }
    const line = LINES[lineIdx]
    if (line === '') {
      timer = window.setTimeout(() => {
        setLineIdx((i) => i + 1)
        setCharIdx(0)
      }, 120)
      return () => clearTimeout(timer)
    }
    if (charIdx < line.length) {
      timer = window.setTimeout(() => setCharIdx((c) => c + 1), 18)
    } else {
      timer = window.setTimeout(() => {
        setLineIdx((i) => i + 1)
        setCharIdx(0)
      }, 120)
    }
    return () => clearTimeout(timer)
  }, [lineIdx, charIdx, reduced, onDone])

  useEffect(() => {
    const leave = () => {
      if (leaving) return
      setLeaving(true)
      const tl = gsap.timeline({
        onComplete: () => {
          onDone()
        },
      })
      tl.to(flashRef.current, {
        opacity: 1,
        duration: 0.08,
        ease: 'none',
      })
        .to(rootRef.current, {
          scaleY: 0.004,
          duration: 0.25,
          ease: 'power3.in',
        }, 0)
        .to(rootRef.current, {
          scaleX: 0,
          duration: 0.3,
          ease: 'power2.in',
        })
        .to(flashRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.out',
        }, '>-0.15')
    }

    const onKey = () => { if (ready) leave() }
    const onClick = () => { if (ready) leave() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('click', onClick)
    window.addEventListener('touchstart', onClick)
    const autoTimer = ready ? window.setTimeout(leave, 2500) : null
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('click', onClick)
      window.removeEventListener('touchstart', onClick)
      if (autoTimer) clearTimeout(autoTimer)
    }
  }, [ready, leaving, onDone])

  if (reduced) return null

  return (
    <>
      <div ref={rootRef} className="boot" role="dialog" aria-label="Boot sequence">
        <div className="boot-screen">
          <div className="boot-lines">
            {LINES.slice(0, lineIdx).map((l, i) => (
              <div key={i} className="boot-line">{l || ' '}</div>
            ))}
            {lineIdx < LINES.length && (
              <div className="boot-line">
                {LINES[lineIdx].slice(0, charIdx)}
                <span className="boot-caret">▋</span>
              </div>
            )}
            {ready && (
              <div className="boot-line boot-press">
                <span className="boot-blink">▋</span> press any key
              </div>
            )}
          </div>
        </div>
      </div>
      <div ref={flashRef} className="boot-flash" />
    </>
  )
}
