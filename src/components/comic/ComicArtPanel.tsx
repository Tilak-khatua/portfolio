import { useEffect, useRef } from 'react'

const ACCENT_COLORS: Record<string, { primary: string; r: number; g: number; b: number }> = {
  hot:    { primary: '#e63946', r: 230, g: 57,  b: 70  },
  cyan:   { primary: '#2d8f8f', r: 45,  g: 143, b: 143 },
  lime:   { primary: '#71902f', r: 113, g: 144, b: 47  },
  violet: { primary: '#7a5fa6', r: 122, g: 95,  b: 166 },
}

interface Props {
  sfx: string
  accent: string
  keywords: string[]
}

interface Chip {
  x: number
  y: number
  vx: number
  vy: number
  text: string
  w: number
  opacity: number
  targetOpacity: number
  scale: number
}

export default function ComicArtPanel({ sfx, accent, keywords }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const col = ACCENT_COLORS[accent] ?? ACCENT_COLORS.hot
    let raf: number
    let t = 0
    let mouseX = 0.5
    let mouseY = 0.5

    // ── Chips (keyword pills) ────────────────────────────────────────────────
    const chips: Chip[] = keywords.map((text, i) => {
      const angle = (i / keywords.length) * Math.PI * 2
      const r = 0.28
      return {
        x: 0.5 + Math.cos(angle) * r,
        y: 0.5 + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.0004,
        vy: (Math.random() - 0.5) * 0.0004,
        text,
        w: 0,
        opacity: 0,
        targetOpacity: 0.9,
        scale: 1,
      }
    })

    // ── Speed-line spokes ───────────────────────────────────────────────────
    const SPOKE_COUNT = 32
    const spokes = Array.from({ length: SPOKE_COUNT }, (_, i) => ({
      angle: (i / SPOKE_COUNT) * Math.PI * 2,
      speed: 0.18 + Math.random() * 0.24,
      width: 1 + Math.random() * 3.5,
      phase: Math.random() * Math.PI * 2,
    }))

    // ── Dot particles ───────────────────────────────────────────────────────
    const DOT_COUNT = 22
    const dots = Array.from({ length: DOT_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.5 + Math.random() * 3.5,
      speed: 0.00018 + Math.random() * 0.00022,
      angle: Math.random() * Math.PI * 2,
      opacity: 0.25 + Math.random() * 0.35,
    }))

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseX = (e.clientX - r.left) / r.width
      mouseY = (e.clientY - r.top) / r.height
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    // measure chip widths once fonts are ready
    document.fonts.ready.then(() => {
      const w = canvas.clientWidth
      chips.forEach((c) => {
        ctx.font = `bold ${Math.max(11, w * 0.022)}px 'Bangers', cursive`
        c.w = ctx.measureText(c.text).width + 28
      })
    })

    // Only animate when visible — prevents all 6 panels running simultaneously during scroll
    let visible = false
    const io = new IntersectionObserver(
      (entries) => { visible = entries[0].isIntersecting },
      { threshold: 0.01 }
    )
    io.observe(canvas)

    const draw = () => {
      raf = requestAnimationFrame(draw)
      if (!visible || document.hidden) return
      const W = canvas.clientWidth
      const H = canvas.clientHeight
      if (!W || !H) return

      t += 0.016
      ctx.clearRect(0, 0, W, H)

      // ── Background ────────────────────────────────────────────────────────
      const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, W * 0.72)
      bgGrad.addColorStop(0, `rgba(${col.r},${col.g},${col.b},0.18)`)
      bgGrad.addColorStop(0.55, `rgba(${col.r},${col.g},${col.b},0.06)`)
      bgGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, W, H)

      // ── Halftone grid ─────────────────────────────────────────────────────
      const gridSize = Math.max(14, W * 0.032)
      const cols = Math.ceil(W / gridSize) + 1
      const rows = Math.ceil(H / gridSize) + 1
      ctx.save()
      for (let row = 0; row < rows; row++) {
        for (let col2 = 0; col2 < cols; col2++) {
          const px = col2 * gridSize
          const py = row * gridSize
          const dx = px / W - 0.5
          const dy = py / H - 0.5
          const dist = Math.sqrt(dx * dx + dy * dy)
          const wave = Math.sin(dist * 8 - t * 1.4) * 0.5 + 0.5
          const maxR = gridSize * 0.28
          const r2 = maxR * wave * (1 - dist * 0.9)
          if (r2 < 0.5) continue
          ctx.beginPath()
          ctx.arc(px, py, r2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${0.06 + wave * 0.07})`
          ctx.fill()
        }
      }
      ctx.restore()

      // ── Speed lines ───────────────────────────────────────────────────────
      const cx = W * (0.5 + (mouseX - 0.5) * 0.08)
      const cy = H * (0.5 + (mouseY - 0.5) * 0.08)
      const maxLen = Math.sqrt(W * W + H * H) * 0.6
      const minLen = maxLen * 0.22

      spokes.forEach((s) => {
        const pulse = Math.sin(t * s.speed * 3 + s.phase) * 0.5 + 0.5
        const len = minLen + (maxLen - minLen) * (0.55 + pulse * 0.45)
        const spread = 0.008 + pulse * 0.006

        const x1 = cx + Math.cos(s.angle) * (minLen * 0.12)
        const y1 = cy + Math.sin(s.angle) * (minLen * 0.12)
        const x2 = cx + Math.cos(s.angle - spread) * len
        const y2 = cy + Math.sin(s.angle - spread) * len
        const x3 = cx + Math.cos(s.angle + spread) * len
        const y3 = cy + Math.sin(s.angle + spread) * len

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.closePath()
        const opacity = 0.06 + pulse * 0.11
        ctx.fillStyle = `rgba(26,26,26,${opacity})`
        ctx.fill()
        ctx.restore()
      })

      // Thin line spokes on top for crispness
      spokes.forEach((s, i) => {
        if (i % 3 !== 0) return
        const pulse = Math.sin(t * s.speed * 2.5 + s.phase + 1) * 0.5 + 0.5
        const len = maxLen * (0.7 + pulse * 0.3)
        const x2 = cx + Math.cos(s.angle) * len
        const y2 = cy + Math.sin(s.angle) * len
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${0.12 + pulse * 0.1})`
        ctx.lineWidth = s.width * 0.4
        ctx.stroke()
        ctx.restore()
      })

      // ── Floating dots ─────────────────────────────────────────────────────
      dots.forEach((d) => {
        d.x += Math.cos(d.angle) * d.speed
        d.y += Math.sin(d.angle) * d.speed
        d.angle += 0.008
        if (d.x < -0.05) d.x = 1.05
        if (d.x > 1.05) d.x = -0.05
        if (d.y < -0.05) d.y = 1.05
        if (d.y > 1.05) d.y = -0.05

        ctx.beginPath()
        ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${d.opacity})`
        ctx.fill()
      })

      // ── Giant SFX word ────────────────────────────────────────────────────
      const sfxSize = Math.max(48, Math.min(W * 0.22, 160))
      const bob = Math.sin(t * 0.9) * H * 0.012
      const wobble = Math.sin(t * 0.6) * 2.5
      const sfxScale = 1 + Math.sin(t * 1.1) * 0.025

      ctx.save()
      ctx.translate(cx, cy + bob)
      ctx.rotate((wobble * Math.PI) / 180)
      ctx.scale(sfxScale, sfxScale)

      ctx.font = `400 ${sfxSize}px 'Bangers', cursive`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Outline / shadow layers
      ctx.strokeStyle = `rgba(26,26,26,0.55)`
      ctx.lineWidth = sfxSize * 0.085
      ctx.lineJoin = 'round'
      ctx.strokeText(sfx, 0, 0)

      // Accent color fill
      ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},0.88)`
      ctx.fillText(sfx, 0, 0)

      // Inner highlight
      ctx.fillStyle = 'rgba(255,255,255,0.13)'
      ctx.fillText(sfx, -2, -3)

      ctx.restore()

      // ── Keyword chips ─────────────────────────────────────────────────────
      const chipFontSize = Math.max(10, W * 0.022)
      ctx.font = `400 ${chipFontSize}px 'Bangers', cursive`

      chips.forEach((chip) => {
        // drift
        chip.x += chip.vx + Math.sin(t * 0.4 + chip.x * 10) * 0.00015
        chip.y += chip.vy + Math.cos(t * 0.35 + chip.y * 10) * 0.00015

        // bounce off edges
        const margin = 0.08
        if (chip.x < margin || chip.x > 1 - margin) chip.vx *= -1
        if (chip.y < margin || chip.y > 1 - margin) chip.vy *= -1
        chip.x = Math.max(margin, Math.min(1 - margin, chip.x))
        chip.y = Math.max(margin, Math.min(1 - margin, chip.y))

        // fade in
        chip.opacity += (chip.targetOpacity - chip.opacity) * 0.04

        const px = chip.x * W
        const py = chip.y * H
        const chipW = ctx.measureText(chip.text).width + 24
        const chipH = chipFontSize * 1.8
        const o = chip.opacity

        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(Math.sin(t * 0.3 + chip.x * 5) * 0.04)

        // pill background
        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${o * 0.92})`
        roundRect(ctx, -chipW / 2, -chipH / 2, chipW, chipH, 4)
        ctx.fill()

        // border
        ctx.strokeStyle = `rgba(26,26,26,${o})`
        ctx.lineWidth = 2.5
        roundRect(ctx, -chipW / 2, -chipH / 2, chipW, chipH, 4)
        ctx.stroke()

        // text
        ctx.fillStyle = `rgba(250,243,224,${o})`
        ctx.font = `400 ${chipFontSize}px 'Bangers', cursive`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(chip.text, 0, 1)
        ctx.restore()
      })
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      ro.disconnect()
      io.disconnect()
    }
  }, [sfx, accent, keywords])

  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      aria-hidden
    />
  )
}

/** Helper: draw a rounded rectangle path */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
