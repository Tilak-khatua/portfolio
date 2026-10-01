import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const ACCENT_HEX: Record<string, number> = {
  hot: 0xe04a35,
  cyan: 0x45b3a6,
  lime: 0xa9c254,
  violet: 0xa68ade,
}

function makeGeometry(name: string) {
  switch (name) {
    case 'icosahedron': return new THREE.IcosahedronGeometry(1.35, 0)
    case 'dodecahedron': return new THREE.DodecahedronGeometry(1.25, 0)
    case 'octahedron': return new THREE.OctahedronGeometry(1.45, 0)
    case 'torus': return new THREE.TorusGeometry(1.05, 0.36, 16, 48)
    case 'box': return new THREE.BoxGeometry(1.5, 1.95, 0.55)
    case 'cone': return new THREE.ConeGeometry(1.15, 2.1, 6)
    default: return new THREE.IcosahedronGeometry(1.35, 0)
  }
}

interface Props {
  geometry: string
  accent: string
}

/** Wireframe relic floating in the chapter's right-hand vitrine. */
export default function ProjectCanvas({ geometry, accent }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 4.6

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(el.clientWidth, el.clientHeight)
    el.appendChild(renderer.domElement)

    const color = ACCENT_HEX[accent] ?? 0xc82924
    const geo = makeGeometry(geometry)
    const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.7 })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    const haloGeo = new THREE.EdgesGeometry(geo)
    const haloMat = new THREE.LineBasicMaterial({ color: 0xece4d4, transparent: true, opacity: 0.12 })
    const halo = new THREE.LineSegments(haloGeo, haloMat)
    halo.scale.setScalar(1.15)
    scene.add(halo)

    const particlesGeo = new THREE.BufferGeometry()
    const count = 50
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 7
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particlesMat = new THREE.PointsMaterial({ color: 0xcfa961, size: 0.022, transparent: true, opacity: 0.4 })
    const points = new THREE.Points(particlesGeo, particlesMat)
    scene.add(points)

    let mouseX = 0, mouseY = 0, tx = 0, ty = 0
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight
      if (!w || !h) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    const ro = new ResizeObserver(onResize)
    ro.observe(el)

    // Six pinned chapters each own a renderer — only paint while on screen.
    let visible = true
    const io = new IntersectionObserver(
      (entries) => { visible = entries[0].isIntersecting },
      { threshold: 0.01 }
    )
    io.observe(el)

    let raf: number
    const clock = new THREE.Clock()
    const animate = () => {
      raf = requestAnimationFrame(animate)
      if (!visible || document.hidden) return
      const t = clock.getElapsedTime()
      mouseX += (tx - mouseX) * 0.04
      mouseY += (ty - mouseY) * 0.04

      mesh.rotation.x = t * 0.14 + mouseY * 0.25
      mesh.rotation.y = t * 0.2 + mouseX * 0.25
      mesh.position.y = Math.sin(t * 0.7) * 0.1
      halo.rotation.copy(mesh.rotation)
      halo.position.copy(mesh.position)
      points.rotation.y = t * 0.03

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      io.disconnect()
      ro.disconnect()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      haloGeo.dispose()
      haloMat.dispose()
      particlesGeo.dispose()
      particlesMat.dispose()
    }
  }, [geometry, accent])

  return <div ref={ref} className="ed-canvas" />
}
