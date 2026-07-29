import { useEffect, useRef } from 'react'
import { createPixelBand } from '../../lib/pixel-band'
import { PIXEL_RAMP } from '../../lib/palette'


export default function HeroBand() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const band = createPixelBand(canvasRef.current, { colours: [...PIXEL_RAMP] })
    return () => band.destroy()
  }, [])

  return <canvas ref={canvasRef} className="hero-band" aria-hidden />
}
