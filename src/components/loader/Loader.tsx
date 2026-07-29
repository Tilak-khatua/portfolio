import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { createPixelFill } from '../../lib/pixel-fill'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './loader.css'
import { PIXEL_RAMP } from '../../lib/palette'

type Props = {
  /** Fired as the panel starts lifting, so the hero can animate underneath it. */
  onReveal: () => void
  /** Fired once the panel is fully off-screen and safe to unmount. */
  onDone: () => void
}


export default function Loader({ onReveal, onDone }: Props) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const countBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) {
      onReveal()
      onDone()
      return
    }
    if (!canvasRef.current) return

    const fill = createPixelFill(canvasRef.current, { colours: [...PIXEL_RAMP] })

    // StrictMode runs this effect twice; the first pass leaves the counter faded
    // and the root transparent, so reset both before building the timeline.
    gsap.set(countBoxRef.current, { opacity: 1 })
    if (rootRef.current) rootRef.current.style.background = ''

    const state = { n: 0 }
    const tl = gsap.timeline()

    // Counter and fill share one value, so the number reports the actual fill.
    tl.to(state, {
      n: 100,
      duration: 1.5,
      ease: 'none',
      onUpdate: () => {
        fill.setProgress(state.n / 100)
        if (countRef.current) {
          countRef.current.textContent = String(Math.round(state.n)).padStart(3, '0')
        }
      },
    })
      .to(countBoxRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 1.15)
      // The clear chases the fill in the same upward direction and starts before
      // the fill finishes, so it's one wave crossing the screen — filling at the
      // crest, clearing behind it — rather than two separate passes.
      .to(
        { c: 0 },
        {
          c: 1,
          duration: 1.5,
          ease: 'none',
          onStart: () => {
            // Drop the opaque backdrop so the clearing cells expose the page,
            // not more paper. The cells themselves are the only cover left.
            if (rootRef.current) rootRef.current.style.background = 'transparent'
            onReveal()
          },
          onUpdate: function () {
            fill.setClear(this.targets()[0].c as number)
          },
          onComplete: onDone,
        },
        // trails the fill by a fixed gap — this is the depth of the wave
        0.55
      )

    return () => {
      tl.kill()
      fill.destroy()
    }
  }, [reduced, onReveal, onDone])

  if (reduced) return null

  return (
    <div ref={rootRef} className="loader">
      <canvas ref={canvasRef} className="loader-canvas" aria-hidden />

      <div ref={countBoxRef} className="loader-count mono">
        <span ref={countRef}>000</span>
        <span className="loader-pct">%</span>
      </div>
    </div>
  )
}
