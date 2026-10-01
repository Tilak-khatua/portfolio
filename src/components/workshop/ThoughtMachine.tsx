import { useId, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { thoughtShapes } from './thoughtShapes'

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger)

export default function ThoughtMachine() {
  const root = useRef<HTMLDivElement>(null)
  const [shapeIndex, setShapeIndex] = useState(0)
  const shape = thoughtShapes[shapeIndex]
  const id = useId().replace(/:/g, '')

  useLayoutEffect(() => {
    const scope = root.current
    if (!scope) return
    // Keep dots on their paths even when reduced motion disables the loops.
    scope.querySelectorAll<SVGCircleElement>('[data-machine-packet]').forEach((packet, index) => {
      const path = scope.querySelector<SVGPathElement>(`[data-machine-orbit="${packet.dataset.machinePacket}"]`)
      if (!path) return
      const point = path.getPointAtLength(path.getTotalLength() * (index % 2 ? 0.5 : 0))
      packet.setAttribute('cx', String(point.x))
      packet.setAttribute('cy', String(point.y))
    })
    const media = gsap.matchMedia(scope)
    media.add({ motion: '(prefers-reduced-motion: no-preference)', pointer: '(hover: hover) and (pointer: fine)' }, (context) => {
      if (!context.conditions?.motion) return
      const lines = Array.from(scope.querySelectorAll<SVGGeometryElement>('[data-machine-draw]'))
      const loops: gsap.core.Tween[] = []
      const intro = gsap.timeline({ paused: true })
      intro.from('.machine-drawing', { autoAlpha: 0, scale: 0.96, svgOrigin: '260 235', duration: 0.45, ease: 'power2.out' }, 0)
      lines.forEach((line, index) => {
        const length = line.getTotalLength()
        intro.fromTo(line, { strokeDasharray: length, strokeDashoffset: length }, {
          strokeDashoffset: 0, duration: 1.35, ease: 'power3.inOut',
        }, index * 0.12)
      })
      intro.from(scope.querySelectorAll('[data-machine-label]'), { autoAlpha: 0, y: 10, duration: 0.6, stagger: 0.07 }, 0.65)
      intro.from('.machine-core', { scale: 0, rotation: -90, svgOrigin: '260 235', duration: 0.85, ease: 'back.out(1.8)' }, 0.9)
      ScrollTrigger.create({ trigger: scope, start: 'top 92%', onEnter: () => intro.play(), once: true })

      scope.querySelectorAll<SVGGElement>('[data-machine-ring]').forEach((ring, index) => {
        loops.push(gsap.to(ring, { x: index ? 12 : -12, y: index ? -7 : 7, duration: 3.2 + index * 0.65, repeat: -1, yoyo: true, ease: 'sine.inOut' }))
      })
      scope.querySelectorAll<SVGCircleElement>('[data-machine-packet]').forEach((packet, index) => {
        const path = scope.querySelector<SVGPathElement>(`[data-machine-orbit="${packet.dataset.machinePacket}"]`)
        if (!path) return
        const offset = index % 2 ? 0.5 : 0
        loops.push(gsap.to(packet, {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: offset, end: offset + (index < 2 ? 1 : -1) },
          duration: 7 + index * 1.4, repeat: -1, ease: 'none',
        }))
      })
      loops.push(gsap.to('.machine-calibration', { rotation: 360, svgOrigin: '260 235', duration: 80, repeat: -1, ease: 'none' }))
      loops.push(gsap.to('.machine-core-shape', { rotation: 180, svgOrigin: '260 235', duration: 18, repeat: -1, ease: 'none' }))
      loops.push(gsap.to('.machine-outer-orbit', { strokeDashoffset: -160, duration: 14, repeat: -1, ease: 'none' }))

      let view: ScrollTrigger | undefined
      const syncLoops = () => loops.forEach((loop) => loop.paused(!view?.isActive || document.hidden))
      view = ScrollTrigger.create({ trigger: scope, start: 'top bottom', end: 'bottom top', onToggle: syncLoops })
      syncLoops()
      document.addEventListener('visibilitychange', syncLoops)

      const tilt = scope.querySelector<HTMLElement>('.machine-tilt')!
      const rotateX = gsap.quickTo(tilt, 'rotationX', { duration: 0.7, ease: 'power3.out' })
      const rotateY = gsap.quickTo(tilt, 'rotationY', { duration: 0.7, ease: 'power3.out' })
      const moveX = gsap.quickTo(tilt, 'x', { duration: 0.7, ease: 'power3.out' })
      gsap.set(tilt, { transformPerspective: 850 })
      const move = (event: PointerEvent) => {
        const bounds = scope.getBoundingClientRect()
        const x = (event.clientX - bounds.left) / bounds.width - 0.5
        const y = (event.clientY - bounds.top) / bounds.height - 0.5
        rotateX(-y * 14); rotateY(x * 16); moveX(x * 10)
      }
      const leave = () => { rotateX(0); rotateY(0); moveX(0) }
      if (context.conditions.pointer) {
        scope.addEventListener('pointermove', move)
        scope.addEventListener('pointerleave', leave)
      }
      return () => {
        document.removeEventListener('visibilitychange', syncLoops)
        scope.removeEventListener('pointermove', move)
        scope.removeEventListener('pointerleave', leave)
      }
    })
    return () => media.revert()
  }, [shapeIndex])

  return (
    <div className="thought-machine" ref={root} data-composition={shapeIndex}>
      <div className="machine-caption"><span>FIG. 01</span><span>{shape.name.toUpperCase()}</span></div>
      <div className="machine-tilt">
        <svg className="machine-svg" viewBox="0 0 520 485" aria-hidden="true">
          <defs>
            <pattern id={`${id}-dots`} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="currentColor" /></pattern>
          </defs>
          <circle className="machine-grid" cx="260" cy="235" r="220" fill={`url(#${id}-dots)`} />
          <g className="machine-calibration">
            {Array.from({ length: 48 }, (_, i) => <line key={i} x1="260" y1="19" x2="260" y2={i % 4 ? '23' : '29'} transform={`rotate(${i * 7.5} 260 235)`} />)}
          </g>
          <path className="machine-outer-orbit" d="M41 235a219 140 0 1 1 438 0 219 140 0 1 1-438 0" transform="rotate(-27 260 235)" />
          <g className="machine-drawing">
          <g data-machine-ring="curiosity">
            <path className="machine-ring machine-ring--left" data-machine-draw data-machine-orbit="curiosity" d={shape.curiosity} />
            <circle className="machine-packet" data-machine-packet="curiosity" cx="194" cy="102" r="5" />
            <circle className="machine-packet machine-packet--small" data-machine-packet="curiosity" cx="194" cy="368" r="3" />
            <text className="machine-ring-label" data-machine-label x={shape.curiosityLabelX ?? 155} y="238" textAnchor="middle">CURIOSITY</text>
          </g>
          <g data-machine-ring="tools">
            <path className="machine-ring machine-ring--right" data-machine-draw data-machine-orbit="tools" d={shape.tools} />
            <circle className="machine-packet machine-packet--teal" data-machine-packet="tools" cx="326" cy="102" r="5" />
            <circle className="machine-packet machine-packet--small" data-machine-packet="tools" cx="326" cy="368" r="3" />
            <text className="machine-ring-label" data-machine-label x={shape.toolsLabelX ?? 366} y="230" textAnchor="middle">USEFUL</text>
            <text className="machine-ring-label" data-machine-label x={shape.toolsLabelX ?? 366} y="245" textAnchor="middle">THINGS</text>
          </g>
          <path className="machine-overlap" data-machine-draw d={shape.overlap} />
          <g className="machine-core">
            <path className="machine-core-shape" d={shape.core} />
            <text className="machine-core-label" x="260" y="242" textAnchor="middle">?</text>
          </g>
          </g>
          <g data-machine-label>
            <path className="machine-pointer" data-machine-draw d="M271 378c7 33 31 33 49 25m-57-32 8 8 8-8" />
            <text className="machine-hand-note" x="324" y="411">start here.</text>
            <text className="machine-coordinate" x="40" y="69">IDEAS →</text>
            <text className="machine-coordinate" x="376" y="69">→ PROTOTYPES</text>
            <path className="machine-cross" d="M40 235h16m-8-8v16m416-8h16m-8-8v16" />
          </g>
        </svg>
      </div>
      <div className="machine-bottom"><span>THE INTERESTING PART IS THE OVERLAP.</span><button type="button" className="machine-replay" onClick={() => setShapeIndex(index => (index + 1) % thoughtShapes.length)}>Redraw ↻</button></div>
      <span className="machine-status" role="status">Drawing {shapeIndex + 1} of {thoughtShapes.length}: {shape.name}.</span>
    </div>
  )
}
