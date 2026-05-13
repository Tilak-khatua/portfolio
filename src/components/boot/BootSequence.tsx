import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './boot.css'

type Props = {
  onBreak: () => void
  onDone: () => void
}

const LINES = [
  'tilak.os — bios v2.26',
  'CPU ............ vibes, clocked too fast',
  'MEMORY ......... enough to forget your name',
  'GPU ............ borrowed from 2003',
  '',
  'loading TILAK.SYS',
  'decompressing personality.pak',
  'mounting /work, /about, /contact ... ok',
  'warming up pixel cursor ... ok',
  '',
  'ready. press any key to continue.',
]

export default function BootSequence({ onBreak, onDone }: Props) {
  const reduced = useReducedMotion()
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [ready, setReady] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const leavingRef = useRef(false)

  useEffect(() => {
    if (reduced) {
      onBreak()
      onDone()
    }
  }, [reduced, onBreak, onDone])

  useEffect(() => {
    if (reduced) return
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
  }, [lineIdx, charIdx, reduced])

  useEffect(() => {
    if (reduced) return
    const startCut = () => {
      if (!ready || leavingRef.current) return
      if (!barRef.current || !rootRef.current || !caretRef.current) return
      leavingRef.current = true
      runCut()
    }
    const onKey = (e: KeyboardEvent) => {
      if (!ready) return
      e.preventDefault()
      startCut()
    }
    const onPointer = () => startCut()
    window.addEventListener('keydown', onKey)
    window.addEventListener('click', onPointer)
    window.addEventListener('touchstart', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('click', onPointer)
      window.removeEventListener('touchstart', onPointer)
    }
  }, [ready, reduced])

  const runCut = () => {
    const bar = barRef.current!
    const root = rootRef.current!
    const caretEl = caretRef.current!
    const screen = screenRef.current!

    const rect = caretEl.getBoundingClientRect()
    caretEl.style.visibility = 'hidden'

    const state = {
      barX: rect.left,
      barY: rect.top,
      barH: Math.max(rect.height, 18),
    }
    bar.style.opacity = '1'
    bar.style.top = `${state.barY}px`
    bar.style.height = `${state.barH}px`
    bar.style.transform = `translateX(${state.barX}px)`

    const tl = gsap.timeline({ onComplete: () => onDone() })

    // Phase 1: caret shoots to left edge, stretches to full viewport height.
    tl.to(state, {
      barX: 0,
      barY: 0,
      barH: window.innerHeight,
      duration: 0.4,
      ease: 'expo.inOut',
      onUpdate: () => {
        bar.style.transform = `translateX(${state.barX}px)`
        bar.style.top = `${state.barY}px`
        bar.style.height = `${state.barH}px`
      },
    })

    // Boot text dims out behind the bar.
    tl.to(screen, { opacity: 0, duration: 0.2, ease: 'power1.out' }, '<0.1')

    // Start revealing the hero while the sweep is about to begin.
    tl.call(() => onBreak())

    // Phase 2: bar sweeps right; boot clips with the bar's edge.
    tl.to(state, {
      barX: window.innerWidth + 12,
      duration: 0.7,
      ease: 'power3.inOut',
      onUpdate: () => {
        bar.style.transform = `translateX(${state.barX}px)`
        root.style.clipPath = `inset(0 0 0 ${state.barX}px)`
      },
    })

    // Phase 3: bar exits.
    tl.to(bar, { opacity: 0, duration: 0.18, ease: 'power2.out' })
  }

  if (reduced) return null

  return (
    <>
      <div ref={rootRef} className="boot" role="dialog" aria-label="Boot sequence">
        <div ref={screenRef} className="boot-screen">
          <div className="boot-lines">
            {LINES.slice(0, lineIdx).map((l, i) => (
              <div key={i} className="boot-line">{l || ' '}</div>
            ))}
            {lineIdx < LINES.length && (
              <div className="boot-line">
                {LINES[lineIdx].slice(0, charIdx)}
                <span className="boot-caret">▋</span>
              </div>
            )}
            {ready && (
              <div className="boot-line boot-press">
                <span ref={caretRef} className="boot-blink">▋</span> press any key
              </div>
            )}
          </div>
        </div>
      </div>
      <div ref={barRef} className="boot-cut-bar" aria-hidden />
    </>
  )
}
