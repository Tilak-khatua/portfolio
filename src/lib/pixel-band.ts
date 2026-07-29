/**
 * Pixel band.
 *
 * A self-animating strip of pixel cells that sits below the masthead: solid
 * along the top edge, breaking up into scattered single cells toward the bottom.
 * Unlike the cursor field this generates its own texture continuously, and it is
 * bounded to its own element rather than the viewport.
 *
 * Density falls off with depth, so the dissolve is a property of the gradient
 * rather than a mask painted over a uniform fill. Cells are coloured by a heat
 * value thresholded into a small palette — the same indexed-colour vocabulary as
 * the rest of the site.
 */

export type PixelBandOptions = {
  /** Colour stops, coldest first. */
  colours: string[]
  cell?: number
  /** Seconds for one full drift cycle; higher is slower. */
  period?: number
}

export type PixelBand = {
  destroy(): void
}

const DEFAULTS = {
  cell: 9,
  period: 26,
}

export function createPixelBand(
  canvas: HTMLCanvasElement,
  options: PixelBandOptions
): PixelBand {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { destroy() {} }

  const opts = { ...DEFAULTS, ...options }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const seed = Math.random() * 1000

  let width = 0
  let height = 0
  let cols = 0
  let rows = 0
  let time = 0
  let raf = 0
  let visible = true
  // pointer position in canvas space, or -1 when away
  let px = -1
  let py = -1
  /** 0..1 eased scroll energy — thickens the band while the page moves. */
  let energy = 0
  let lastScrollY = window.scrollY

  function resize() {
    const rect = canvas.getBoundingClientRect()
    if (rect.width < 2) return
    width = rect.width
    height = rect.height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    cols = Math.ceil(width / opts.cell) + 1
    rows = Math.ceil(height / opts.cell) + 1
  }

  function hash(c: number, r: number) {
    const n = Math.sin(c * 127.1 + r * 311.7 + seed * 0.13) * 43758.5453
    return n - Math.floor(n)
  }

  /**
   * Low-frequency blob field. Multiplied into the density so surviving cells
   * gather into drifting clumps instead of even speckle — a flat per-cell hash
   * scatters uniformly, which reads as TV static rather than a dissolving edge.
   */
  function clump(nx: number, ny: number, t: number) {
    const a = Math.sin(nx * 3.1 + t * 0.16 + seed * 0.7) * Math.cos(ny * 2.4 - t * 0.11)
    const b = Math.sin((nx * 1.3 - ny * 1.9) * 2.2 + t * 0.09 + seed)
    return 0.5 + 0.5 * ((a + b) / 2)
  }

  /** Layered sines — the drifting structure inside the band. */
  function noise(nx: number, ny: number, t: number) {
    const v =
      Math.sin(nx * 6.1 + seed + t * 0.55) * Math.cos(ny * 3.7 - seed * 0.7 + t * 0.4) +
      Math.sin((nx * 1.7 + ny * 2.3) * 3.4 - seed + t * 0.3) +
      Math.sin(ny * 8 + nx * 4 + seed * 2.1) * 0.5
    return 0.5 + 0.5 * (v / 2.5)
  }

  function render() {
    if (!cols) return
    ctx!.clearRect(0, 0, width, height)

    const t = time / 1000
    const size = opts.cell - 1
    const last = opts.colours.length - 1

    for (let r = 0; r < rows; r++) {
      const y = r * opts.cell
      // 0 at the top edge, 1 at the bottom — drives the dissolve
      const depth = r / rows

      // Density: solid near the top, thinning out with an eased falloff.
      // Scroll energy softens the falloff, so the band reaches further down the
      // page while you're moving and settles back when you stop.
      let density = Math.pow(1 - depth, 1.7 - energy * 0.55)

      // Ease the first few rows in too, so the band grows out of the masthead
      // edge instead of butting against it as a hard ruled line.
      const lip = Math.min(1, depth / 0.07)
      density *= 0.55 + lip * 0.45

      // A wavy per-column offset so the lower boundary tears instead of ruling
      // straight across.
      for (let c = 0; c < cols; c++) {
        const nx = c / cols
        const wobble =
          (Math.sin(c * 0.22 + seed) + Math.sin(c * 0.07 - seed * 1.3)) * 0.06 +
          hash(Math.floor(c / 2), 7) * 0.14
        // Bias toward the clump field: patches hold together, gaps open up.
        const patch = 0.45 + clump(nx, depth, t) * 0.9
        const localDensity = (density - wobble) * patch

        if (localDensity <= 0) continue
        if (hash(c, r) > localDensity) continue

        let v = noise(nx, depth, t)

        // The cursor lifts nearby cells. Falloff is smoothstepped and capped so
        // it reads as a soft bloom rather than flooding a solid square.
        if (px >= 0) {
          const dx = (c + 0.5) * opts.cell - px
          const dy = y + opts.cell * 0.5 - py
          const reach = 110
          const d = Math.sqrt(dx * dx + dy * dy) / reach
          if (d < 1) {
            const f = 1 - d
            v += f * f * 0.34
          }
        }

        if (v < 0.3) continue
        const band = Math.min(last, Math.max(0, Math.round(v * last)))
        ctx!.fillStyle = opts.colours[band]
        ctx!.fillRect(c * opts.cell, y, size, size)
      }
    }
  }

  function frame(ts: number) {
    const prev = (frame as unknown as { last?: number }).last ?? ts
    const dt = Math.min(48, ts - prev)
    ;(frame as unknown as { last?: number }).last = ts
    // Scale so `period` is roughly one full cycle of the slowest term.
    // Track scroll delta here rather than in a listener, so the decay is
    // frame-rate independent and one scroll burst eases out smoothly.
    const y = window.scrollY
    const delta = Math.abs(y - lastScrollY)
    lastScrollY = y
    energy = Math.min(1, energy * 0.92 + Math.min(0.5, delta / 90))

    // drift speeds up with energy — the texture stirs as the page moves
    time += dt * (26 / opts.period) * (1 + energy * 2.4)
    if (visible) render()
    raf = requestAnimationFrame(frame)
  }

  function onPointerMove(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      px = -1
      return
    }
    px = e.clientX - rect.left
    py = e.clientY - rect.top
  }

  const resizeObserver = new ResizeObserver(() => {
    resize()
    if (reduced) render()
  })
  resizeObserver.observe(canvas)

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true
    },
    { rootMargin: '100px' }
  )
  io.observe(canvas)

  resize()
  render()

  if (!reduced) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    raf = requestAnimationFrame(frame)
  }

  return {
    destroy() {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
    },
  }
}
