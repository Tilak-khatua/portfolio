import { useEffect } from 'react'
import gsap from 'gsap'

export default function Cursor() {
  useEffect(() => {
    const dot  = document.getElementById('cursor-dot')!
    const ring = document.getElementById('cursor-ring')!

    let mx = 0, my = 0
    let rx = 0, ry = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      gsap.to(dot, { x: mx, y: my, duration: 0.1, ease: 'power2.out' })
    }
    window.addEventListener('mousemove', onMove)

    const tick = () => {
      rx += (mx - rx) * 0.1
      ry += (my - ry) * 0.1
      gsap.set(ring, { x: rx, y: ry })
      requestAnimationFrame(tick)
    }
    tick()

    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <div id="cursor-dot" />
      <div id="cursor-ring" />
    </>
  )
}
