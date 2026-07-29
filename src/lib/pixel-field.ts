/**
 * Pixel heat field.
 *
 * A grid of fixed-size cells, each holding a heat value in 0..1. Heat comes from
 * two places: an ambient noise field that drifts on its own, and the pointer,
 * which stamps a gaussian disk as it moves. Heat maps to a small palette by hard
 * threshold — no blending — which is what gives the field its indexed-colour,
 * pixel-art look. Cells below the floor don't draw at all, so edges dissolve
 * into scattered single pixels.
 *
 * Text regions register as "safe zones" and are punched out of the field with a
 * ragged border, keeping headlines readable through the texture.
 */

export type PixelFieldPalette = {
  /** Colour stops, coldest first. Each entry is [heatThreshold, cssColour]. */
  bands: [number, string][]
  /** Colour for the hottest cells — pointer core and easter-egg glyph. */
  peak: string
}

export type PixelFieldOptions = {
  cell?: number
  /** Radius of the pointer's heat stamp, in cells. */
  brush?: number
  /** Heat below this never draws. Controls how ragged the field's edges read. */
  floor?: number
  /** Ambient field strength, 0..1. Zero leaves only pointer-painted heat. */
  ambient?: number
  palette: PixelFieldPalette
  /** Seconds of pointer stillness before the idle glyph plays. */
  idleDelay?: number
  /** Colour of the hairline cell grid, or null to draw none. */
  grid?: string | null
}

type SafeZone = { x: number; y: number; w: number; h: number; feather: number }

const DEFAULTS = {
  cell: 14,
  brush: 10,
  floor: 0.3,
  ambient: 1,
  idleDelay: 3,
  /**
   * Hairline ruled at every cell boundary — it should register as paper texture
   * you barely notice, not as a visible table. Kept very low-contrast on purpose.
   */
  grid: 'rgba(26, 23, 20, 0.022)',
}

/** ✦ — four-pointed star, drawn as a 11x11 bitmap. Rows are read left to right. */
const GLYPH = [
  '00000100000',
  '00000100000',
  '00001110000',
  '00001110000',
  '01111111110',
  '00111111100',
  '00001110000',
  '00011111000',
  '00010101000',
  '00100100100',
  '01000100010',
]

export type PixelField = {
  destroy(): void
  /** Replace the set of rectangles the field refuses to draw behind. */
  setSafeZones(zones: SafeZone[]): void
  /** Fade the whole field. Used to pull it back over dense text sections. */
  setIntensity(value: number): void
  /** Column wipe, 0..1. Below 1 the field is still arriving. */
  setReveal(value: number): void
  /** Splash heat at a point — used for clicks and section entrances. */
  burst(x: number, y: number, strength?: number): void
  /**
   * Expanding ring travelling outward from a point. `power` scales its radius,
   * brightness and lifetime — a tap is gentle, a charged release is violent.
   */
  wave(x: number, y: number, power?: number): void
  /** Plot the ✦ glyph large at the centre of the viewport, for the typed egg. */
  stamp(): void
  /**
   * Begin or end a charge at a point. While charging, heat pools and the blob
   * widens, so a held pointer visibly winds up before its wave is released.
   */
  setCharge(x: number | null, y?: number): void
  /**
   * Suspend the render loop. Used while a modal is open: the field is fully
   * covered, and repainting thousands of cells per frame competes with the
   * dialog's own scrolling.
   */
  setPaused(value: boolean): void
}

export function createPixelField(
  canvas: HTMLCanvasElement,
  options: PixelFieldOptions
): PixelField {
  const opts = { ...DEFAULTS, ...options }
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return {
      destroy() {},
      setSafeZones() {},
      setIntensity() {},
      setReveal() {},
      burst() {},
      wave() {},
      stamp() {},
      setCharge() {},
      setPaused() {},
    }
  }

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const seed = Math.random() * 1000

  let width = 0
  let height = 0
  let cols = 0
  let rows = 0
  let heat = new Float32Array(0)
  let safeZones: SafeZone[] = []
  let intensity = 1
  /**
   * 0..1 column wipe. Only meaningful when an ambient field exists; with a
   * cursor-only field there is nothing to wipe in, so it starts open.
   */
  let reveal = 1

  // Pointer state. `px`/`py` track the previous position so a fast flick can be
  // interpolated into a continuous stroke rather than leaving gaps between frames.
  let px = -1
  let py = -1
  let hasPointer = false
  let stillFor = 0
  let glyphAt: { x: number; y: number } | null = null
  let glyphAge = 0

  /** Live shockwave rings, advanced each frame and culled when spent. */
  const waves: { x: number; y: number; born: number; power: number }[] = []
  /** Non-null while the pointer is held down — drives the charge-up. */
  let charge: { x: number; y: number; start: number } | null = null

  let time = 0
  let raf = 0
  let running = true
  /** Set while a modal covers the field; suspends the loop entirely. */
  let paused = false

  function resize() {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    cols = Math.ceil(width / opts.cell) + 1
    rows = Math.ceil(height / opts.cell) + 1
    heat = new Float32Array(cols * rows)
  }

  function clamp01(x: number) {
    return x < 0 ? 0 : x > 1 ? 1 : x
  }

  /** Deterministic per-cell hash — used for dither and ragged edges. */
  function hash(c: number, r: number) {
    const n = Math.sin(c * 127.1 + r * 311.7 + seed * 0.13) * 43758.5453
    return n - Math.floor(n)
  }

  /** Layered sines. Returns roughly 0..1, drifting with `t`. */
  function noise(nx: number, ny: number, t: number) {
    const wx = nx + Math.sin(ny * 5 + t * 0.5 + seed) * 0.05
    const wy = ny + Math.cos(nx * 5 - t * 0.4) * 0.05
    const v =
      Math.sin(wx * 5.6 + seed * 1.3 + t * 0.3) * Math.cos(wy * 4.7 - seed * 0.7 + t * 0.22) +
      Math.sin((wx * 1.4 + wy * 1.7) * 4.1 - seed + t * 0.16) +
      Math.sin(wy * 9 + seed * 2.1 + wx * 3) * 0.5 +
      Math.sin(wx * 13 - seed * 1.7) * 0.28
    return 0.5 + 0.5 * (v / 2.55)
  }

  /**
   * Low-frequency mask. Ambient heat only survives inside these slow blobs, so
   * pixels gather into patches instead of speckling the whole viewport.
   */
  function region(nx: number, ny: number, t: number) {
    return (
      0.5 +
      0.5 * Math.sin(nx * 2.1 + t * 0.12 + seed * 0.7) * Math.cos(ny * 1.8 - t * 0.09 + seed * 0.3)
    )
  }

  /** Add a gaussian blob of heat centred on a pixel position. */
  function deposit(x: number, y: number, amount: number, sigma: number) {
    const cc = x / opts.cell
    const cr = y / opts.cell
    const radius = Math.ceil(sigma * 1.6)
    const inv = 1 / (2 * sigma * sigma * 0.18)
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const c = (cc + dc) | 0
        const r = (cr + dr) | 0
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue
        const dx = c + 0.5 - cc
        const dy = r + 0.5 - cr
        const w = Math.exp(-(dx * dx + dy * dy) * inv)
        if (w < 0.02) continue
        const id = r * cols + c
        const next = heat[id] + amount * w
        heat[id] = next > 1 ? 1 : next
      }
    }
  }

  /** Stamp along the path travelled since the last frame, so strokes stay unbroken. */
  function stroke(x: number, y: number) {
    if (px < 0) {
      px = x
      py = y
    }
    const dx = x - px
    const dy = y - py
    const dist = Math.sqrt(dx * dx + dy * dy)
    const steps = Math.max(1, Math.min(48, Math.round(dist / (opts.cell * 0.8))))
    for (let s = 1; s <= steps; s++) {
      const f = s / steps
      deposit(px + dx * f, py + dy * f, 0.26, opts.brush)
    }
    px = x
    py = y
  }

  /**
   * Advance every live ring. Each is a gaussian shell at radius `age * speed`,
   * so heat lands in a band that travels outward rather than a filled disc.
   */
  function advanceWaves() {
    const now = time / 1000
    const diag = Math.hypot(width, height)

    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i]
      const age = now - w.born
      const life = 1.5
      if (age > life) {
        waves.splice(i, 1)
        continue
      }

      const radius = age * diag * 1.7
      const thickness = opts.cell * 5.5 * w.power
      const amp = (1 - age / life) * 1.2 * w.power
      const inv = 1 / (2 * thickness * thickness)

      // Only scan the annulus the ring can actually reach. Sweeping the whole
      // grid per wave per frame cost ~9.4M ops/sec with six rings live.
      const reach = radius + thickness * 3
      const inner = Math.max(0, radius - thickness * 3)
      const r0 = Math.max(0, Math.floor((w.y - reach) / opts.cell))
      const r1 = Math.min(rows - 1, Math.ceil((w.y + reach) / opts.cell))
      const c0 = Math.max(0, Math.floor((w.x - reach) / opts.cell))
      const c1 = Math.min(cols - 1, Math.ceil((w.x + reach) / opts.cell))

      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const dx = (c + 0.5) * opts.cell - w.x
          const dy = (r + 0.5) * opts.cell - w.y
          const dist2 = dx * dx + dy * dy
          // skip the hollow centre without paying for a sqrt
          if (dist2 < inner * inner) continue
          const d = Math.sqrt(dist2) - radius
          const g = amp * Math.exp(-(d * d) * inv)
          if (g < 0.02) continue
          const id = r * cols + c
          if (g > heat[id]) heat[id] = g
        }
      }
    }
  }

  /** Plot the star glyph, scaled to cells, at full heat. */
  function stampGlyph(originX: number, originY: number, alpha: number, scale = 2) {
    const gw = GLYPH[0].length * scale
    const gh = GLYPH.length * scale
    const c0 = Math.round(originX / opts.cell - gw / 2)
    const r0 = Math.round(originY / opts.cell - gh / 2)
    for (let gr = 0; gr < GLYPH.length; gr++) {
      for (let gc = 0; gc < GLYPH[gr].length; gc++) {
        if (GLYPH[gr][gc] !== '1') continue
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const c = c0 + gc * scale + sx
            const r = r0 + gr * scale + sy
            if (c < 0 || r < 0 || c >= cols || r >= rows) continue
            const id = r * cols + c
            if (alpha > heat[id]) heat[id] = alpha
          }
        }
      }
    }
  }

  /**
   * True if a cell should be left blank for legibility. The core of a zone is
   * always clear; a feathered margin around it clears only a random share of
   * cells, so the punch-out has a ragged edge rather than a visible rectangle.
   */
  function isSafe(cx: number, cy: number, c: number, r: number) {
    for (let i = 0; i < safeZones.length; i++) {
      const z = safeZones[i]
      if (cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h) return true
      const f = z.feather
      if (cx < z.x - f || cx > z.x + z.w + f || cy < z.y - f || cy > z.y + z.h + f) continue
      // Closer to the zone => more likely to be cleared, so the edge dissolves.
      const dx = Math.max(0, Math.max(z.x - cx, cx - (z.x + z.w)))
      const dy = Math.max(0, Math.max(z.y - cy, cy - (z.y + z.h)))
      const near = 1 - clamp01(Math.max(dx, dy) / f)
      if (hash(c + 9.1, r + 4.7) < near * 0.9) return true
    }
    return false
  }

  function colourFor(v: number) {
    const bands = opts.palette.bands
    let colour = bands[0][1]
    for (let i = 1; i < bands.length; i++) {
      if (v >= bands[i][0]) colour = bands[i][1]
    }
    return colour
  }

  function render() {
    ctx!.clearRect(0, 0, width, height)
    if (!cols) return

    const t = time / 1000
    const size = opts.cell - 1
    const ambient = opts.ambient * intensity

    // Sample the noise in *document* space so the field is anchored to the page
    // and scrolls with it, rather than sliding around glued to the viewport.
    // On touch the field stays viewport-locked: iOS momentum scroll reports
    // scrollY in jumps, which would make a document-aligned field jitter.
    const scrolled = fine ? window.scrollY : 0
    const rowOffset = Math.floor(scrolled / opts.cell)
    const subPixel = scrolled - rowOffset * opts.cell

    if (opts.grid) {
      ctx!.strokeStyle = opts.grid
      ctx!.lineWidth = 1
      ctx!.beginPath()
      for (let gx = 0; gx <= width; gx += opts.cell) {
        ctx!.moveTo(gx + 0.5, 0)
        ctx!.lineTo(gx + 0.5, height)
      }
      for (let gy = -subPixel; gy <= height; gy += opts.cell) {
        ctx!.moveTo(0, gy + 0.5)
        ctx!.lineTo(width, gy + 0.5)
      }
      ctx!.stroke()
    }

    for (let r = -1; r <= rows; r++) {
      const vy = r * opts.cell - subPixel
      const cy = vy + opts.cell * 0.5
      const dr = r + rowOffset
      const ny = (dr * opts.cell) / height
      const heatRow = r >= 0 && r < rows ? r : -1

      for (let c = 0; c < cols; c++) {
        const cx = (c + 0.5) * opts.cell
        if (isSafe(cx, cy, c, dr)) continue

        // Pointer heat lives in viewport space — it follows the cursor, not the page.
        let v = heatRow >= 0 ? heat[heatRow * cols + c] * 0.9 : 0

        if (ambient > 0) {
          const nx = (c * opts.cell) / width
          // Graded, not binary: only the cores of the slow blobs reach the floor,
          // so coverage stays sparse and clustered rather than a solid sheet.
          const mask = clamp01((region(nx, ny, t) - 0.58) / 0.34)
          if (mask > 0) {
            const tear = hash(Math.floor(c / 2) + 3.3, Math.floor(dr / 4)) * 0.35
            const a =
              noise(nx, ny, t) * 0.62 +
              (hash(c, dr) - 0.5) * 0.22 +
              Math.sin(c * 0.6 + dr * 0.8 + t * 1.7) * 0.05
            v += a * mask * ambient * (1 - tear)
          }
        }

        v *= intensity

        // Reveal wipe: columns fill in left-to-right, with a dithered leading edge.
        if (reveal < 1) {
          const key = c / cols
          if (reveal < key) continue
          if (reveal < key + 0.14 && hash(c + 41.7, dr + 17.3) > (reveal - key) / 0.14) continue
        }

        if (v < opts.floor) continue
        // Dither: drop a share of qualifying cells so edges break into singles.
        if (v < opts.floor + 0.14 && hash(c * 1.7 + 11.3, dr * 1.3 + 5.1) > 0.55) continue

        ctx!.fillStyle = v >= 0.92 ? opts.palette.peak : colourFor(v)
        ctx!.fillRect(c * opts.cell, vy, size, size)
      }
    }
  }

  function decay(dt: number) {
    // Pointer heat fades so strokes trail off instead of accumulating forever.
    const k = Math.pow(0.94, dt / 16.67)
    for (let i = 0; i < heat.length; i++) {
      if (heat[i] > 0) heat[i] *= k
    }
  }

  function frame(ts: number) {
    if (!running || paused) return
    const last = (frame as unknown as { last?: number }).last ?? ts
    const dt = Math.min(48, ts - last)
    ;(frame as unknown as { last?: number }).last = ts
    time += dt

    decay(dt)

    if (hasPointer && fine) {
      // Keep feeding the cursor's position every frame, so heat holds where the
      // pointer rests instead of only appearing while it moves. A small brush
      // needs a firmer deposit to reach the hot bands.
      deposit(px, py, 0.3, opts.brush)

      stillFor += dt / 1000
      if (stillFor > opts.idleDelay) {
        if (!glyphAt) {
          glyphAt = { x: px, y: py }
          glyphAge = 0
        }
        glyphAge += dt / 1000
        // Fade the glyph in, hold, then let decay carry it away.
        const alpha = glyphAge < 0.4 ? glyphAge / 0.4 : glyphAge < 2 ? 1 : Math.max(0, 1 - (glyphAge - 2) / 0.8)
        if (alpha > 0) stampGlyph(glyphAt.x, glyphAt.y, alpha)
      }
    }

    // Charging: heat pools and widens under a held pointer.
    if (charge) {
      const held = Math.min((time / 1000 - charge.start) / 2.2, 1)
      deposit(charge.x, charge.y, 0.4 + held * 0.5, opts.brush * (1.4 + held * 7))
    }

    advanceWaves()

    render()
    raf = requestAnimationFrame(frame)
  }

  function onPointerMove(e: PointerEvent) {
    if (!fine) return
    hasPointer = true
    stillFor = 0
    glyphAt = null
    stroke(e.clientX, e.clientY)
  }

  function onPointerLeave() {
    hasPointer = false
    px = -1
    py = -1
  }

  function onResize() {
    resize()
  }

  /** Reduced-motion has no rAF loop, so scrolling must trigger the depth repaint. */
  function onScrollStatic() {
    render()
  }


  function onVisibility() {
    if (document.hidden) {
      running = false
      cancelAnimationFrame(raf)
    } else if (!running) {
      running = true
      ;(frame as unknown as { last?: number }).last = undefined
      raf = requestAnimationFrame(frame)
    }
  }

  resize()

  if (reduced) {
    reveal = 1
    // No animation — the texture is present but still, repainting only on
    // resize and scroll so the hero fade still applies.
    render()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScrollStatic, { passive: true })
    return {
      destroy() {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('scroll', onScrollStatic)
      },
      setSafeZones(zones) {
        safeZones = zones
        render()
      },
      setIntensity(value) {
        intensity = value
        render()
      },
      setReveal(value) {
        reveal = value
        render()
      },
      burst() {},
      wave() {},
      stamp() {},
      setCharge() {},
      setPaused() {},
    }
  }

  window.addEventListener('resize', onResize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerleave', onPointerLeave)
  document.addEventListener('visibilitychange', onVisibility)
  raf = requestAnimationFrame(frame)

  return {
    destroy() {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    },
    setSafeZones(zones) {
      safeZones = zones
    },
    setIntensity(value) {
      intensity = value
    },
    setReveal(value) {
      reveal = value
    },
    setPaused(value) {
      if (paused === value) return
      paused = value
      if (paused) {
        cancelAnimationFrame(raf)
      } else {
        // reset the frame clock so the resumed loop doesn't jump on a stale dt
        ;(frame as unknown as { last?: number }).last = undefined
        raf = requestAnimationFrame(frame)
      }
    },
    burst(x, y, strength = 0.85) {
      // A ring rather than a disk — reads as an impact, not a blob.
      const rings = 3
      for (let i = 0; i < rings; i++) {
        deposit(x, y, strength * (1 - i * 0.25), opts.brush * (1 + i * 0.9))
      }
    },
    wave(x, y, power = 1) {
      waves.push({ x, y, born: time / 1000, power })
    },
    stamp() {
      // Scale the glyph to a good share of the viewport, then plot it hot.
      const scale = Math.max(3, Math.floor(Math.min(width, height) / opts.cell / 16))
      stampGlyph(width / 2, height / 2, 1, scale)
    },
    setCharge(x, y) {
      charge = x === null ? null : { x, y: y ?? 0, start: time / 1000 }
    },
  }
}
