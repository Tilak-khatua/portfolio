import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './boot.css'

type Props = {
  onBreak: () => void
  onDone: () => void
}

const PANELS = [0, 1, 2, 3]

export default function BootSequence({ onBreak, onDone }: Props) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLDivElement>(null)
  const onBreakRef = useRef(onBreak)
  const onDoneRef = useRef(onDone)
  onBreakRef.current = onBreak
  onDoneRef.current = onDone

  useEffect(() => {
    if (reduced) {
      onBreakRef.current()
      onDoneRef.current()
    }
  }, [reduced])

  useEffect(() => {
    if (reduced) return
    const root = rootRef.current
    const screen = screenRef.current
    const countEl = countRef.current
    if (!root || !screen || !countEl) return

    const panels = root.querySelectorAll<HTMLElement>('.boot-panel')
    const counter = { value: 0 }
    let leaving = false

    const tl = gsap.timeline({ onComplete: () => onDoneRef.current() })

    tl.to(counter, {
      value: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        countEl.textContent = String(Math.round(counter.value)).padStart(3, '0')
      },
    })

    tl.addLabel('exit', '+=0.25')
    tl.call(() => onBreakRef.current(), undefined, 'exit')
    tl.to(screen, { opacity: 0, duration: 0.25, ease: 'power1.out' }, 'exit')
    tl.to(
      panels,
      {
        yPercent: -100,
        duration: 0.7,
        ease: 'expo.inOut',
        stagger: 0.07,
      },
      'exit+=0.1',
    )

    const skip = () => {
      if (leaving || tl.currentLabel() === 'exit' || tl.labels.exit <= tl.time()) return
      leaving = true
      countEl.textContent = '100'
      tl.play('exit')
    }
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
      tl.kill()
    }
  }, [reduced])

  if (reduced) return null

  return (
    <div ref={rootRef} className="boot" role="dialog" aria-label="Loading">
      <div className="boot-panels" aria-hidden>
        {PANELS.map((i) => (
          <div key={i} className="boot-panel" />
        ))}
      </div>
      <div ref={screenRef} className="boot-screen">
        <div className="boot-label mono">tilak khatua — portfolio</div>
        <div ref={countRef} className="boot-count mono">000</div>
      </div>
    </div>
  )
}
