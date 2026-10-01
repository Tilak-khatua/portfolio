import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

type Props = { onReveal: () => void; onEnter: () => void; onComplete: () => void }

export default function LoadingScreen({ onReveal, onEnter, onComplete }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const leave = useRef<() => void>(() => {})
  const [status, setStatus] = useState('Setting the type…')

  useLayoutEffect(() => {
    const scope = root.current
    if (!scope) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    let cancelled = false
    let exiting = false
    let minimumElapsed = preference.matches
    let fontsReady = preference.matches || !document.fonts || document.fonts.status === 'loaded'
    let minimumTimer: number | undefined
    let deadline: number | undefined
    let exitSequence: gsap.core.Timeline | undefined
    const context = gsap.context(() => {
      if (preference.matches) return
      gsap.from('.loading-letter', { yPercent: 115, rotation: () => gsap.utils.random(-18, 18), scale: 0.6, duration: 0.8, stagger: 0.035, ease: 'back.out(1.8)' })
      gsap.from('.loading-chip', { y: 25, autoAlpha: 0, rotation: -9, duration: 0.65, stagger: 0.12, ease: 'back.out(1.8)', delay: 0.4 })
      gsap.to('.loading-star', { rotation: 360, duration: 3.2, repeat: -1, ease: 'none', svgOrigin: '50 50' })
      gsap.to('.loading-dot', { y: -5, duration: 0.35, repeat: -1, yoyo: true, stagger: 0.12, ease: 'sine.inOut' })
      const line = scope.querySelector<SVGPathElement>('.loading-scribble path')
      if (line) {
        const length = line.getTotalLength()
        gsap.fromTo(line, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.1, delay: 0.25, ease: 'power2.inOut' })
      }
    }, scope)

    const exit = () => {
      if (cancelled || exiting) return
      exiting = true
      window.clearTimeout(minimumTimer)
      window.clearTimeout(deadline)
      setStatus('Ready. Come on in.')
      onReveal()
      if (preference.matches) { onEnter(); onComplete(); return }
      context.add(() => {
        exitSequence = gsap.timeline({ onComplete })
          .to('.loading-content, .loading-header, .loading-footer', { y: -45, rotation: -3, autoAlpha: 0, duration: 0.32, ease: 'power2.in' }, 0)
          .to('.loading-panel', { yPercent: -105, duration: 0.85, stagger: 0.07, ease: 'power4.inOut' }, 0.15)
          .call(onEnter, [], 0.45)
      })
    }
    leave.current = exit
    const check = () => { if (minimumElapsed && fontsReady) exit() }
    minimumTimer = window.setTimeout(() => { minimumElapsed = true; check() }, preference.matches ? 0 : 1200)
    deadline = window.setTimeout(exit, 2500)
    document.fonts?.ready.then(() => { if (!cancelled) { fontsReady = true; check() } })
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') exit() }
    const change = () => {
      if (!preference.matches) return
      if (exiting) { exitSequence?.kill(); onEnter(); onComplete() }
      else exit()
    }
    document.addEventListener('keydown', escape)
    preference.addEventListener('change', change)
    return () => {
      cancelled = true
      leave.current = () => {}
      window.clearTimeout(minimumTimer)
      window.clearTimeout(deadline)
      document.removeEventListener('keydown', escape)
      preference.removeEventListener('change', change)
      context.revert()
      document.body.style.overflow = previousOverflow
    }
  }, [onReveal, onEnter, onComplete])

  return <div className="loading-screen" ref={root}>
    <div className="loading-curtain" aria-hidden="true">{[0, 1, 2, 3].map(index => <div className="loading-panel" key={index} />)}</div>
    <div className="loading-header"><span>TILAK KHATUA</span><span>A PERSONAL WORKSHOP</span></div>
    <div className="loading-content">
      <svg className="loading-emblem" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" /><path className="loading-star" d="m50 15 7 21 19-11-11 18 21 7-21 7 11 19-19-11-7 21-7-21-19 11 11-19-21-7 21-7-11-18 19 11z" /></svg>
      <h1 className="loading-title" aria-label="A little curiosity.">{['A little', 'curiosity.'].map((line, index) => <span className={`loading-title-line${index ? ' loading-title-line--italic' : ''}`} aria-hidden="true" key={line}>{Array.from(line).map((letter, i) => <span className="loading-letter" key={i}>{letter === ' ' ? '\u00a0' : letter}</span>)}</span>)}</h1>
      <svg className="loading-scribble" viewBox="0 0 420 40" aria-hidden="true"><path d="M8 26C91 3 212 1 399 16 326 10 167 9 80 34" /></svg>
      <div className="loading-chips" aria-hidden="true"><span className="loading-chip">IDEAS</span><span className="loading-chip">CODE</span><span className="loading-chip">EXPERIMENTS</span></div>
    </div>
    <div className="loading-footer"><p role="status">{status}<span className="loading-dots" aria-hidden="true">{[0, 1, 2].map(dot => <i className="loading-dot" key={dot} />)}</span></p><button type="button" onClick={() => leave.current()}>Skip intro <span aria-hidden="true">↗</span></button></div>
  </div>
}
