import { useRef } from 'react'
import { usePixelField } from '../../hooks/usePixelField'
import './field.css'

export default function PixelField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  usePixelField(canvasRef)

  return <canvas ref={canvasRef} className="pixel-field" aria-hidden />
}
