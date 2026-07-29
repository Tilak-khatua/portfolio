/**
 * Progress-driven pixel fill.
 *
 * Cells across the whole viewport each get a deterministic threshold; a cell
 * paints once progress passes it. The threshold is a broad bottom-to-top sweep
 * plus per-cell jitter, so the surface floods upward with a dithered, scattered
 * leading edge rather than a clean line.
 *
 * Colour is picked per cell by hash from a small ramp, keeping the hard-edged
 * indexed-colour look used elsewhere on the page.
 */

export type PixelFillOptions = {
  colours: string[]
  cell?: number
  /** How much of the reveal is jitter vs. ordered sweep, 0..1. */
  scatter?: number
}

export type PixelFill = {
  /** 0..1 — how much of the surface has filled in. */
  setProgress(value: number): void
  /**
   * 0..1 — how much has cleared away again. Cells clear on a *different*
   * threshold order than they filled, so the dissolve doesn't just rewind.
   */
  setClear(value: number): void
  destroy(): void
}

const DEFAULTS = {
  cell: 10,
  scatter: 0.42,
}

export function createPixelFill(
  canvas: HTMLCanvasElement,
  options: PixelFillOptions
): PixelFill {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { setProgress() {}, setClear() {}, destroy() {} }

  const opts = { ...DEFAULTS, ...options }
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const seed = Math.random() * 1000

  let width = 0
  let height = 0
  let cols = 0
  let rows = 0
  let thresholds = new Float32Array(0)
  let clearOrder = new Float32Array(0)
  let colourIndex = new Uint8Array(0)
  let progress = 0
  let cleared = 0

  function hash(c: number, r: number) {
    const n = Math.sin(c * 127.1 + r * 311.7 + seed * 0.13) * 43758.5453
    return n - Math.floor(n)
  }

  function build() {
    // Measure the element, not the viewport — the same fill is reused at dialog
    // size as well as full screen.
    const rect = canvas.getBoundingClientRect()

    // A CSS-sized canvas (width/height: 100%) can still measure 0 on the frame
    // it mounts. Returning early here left the grid empty and every later
    // setProgress() drew nothing, so fall back to the viewport and let the
    // ResizeObserver correct the size once layout settles.
    width = rect.width >= 2 ? rect.width : window.innerWidth
    height = rect.height >= 2 ? rect.height : window.innerHeight
    if (width < 2 || height < 2) return
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

    cols = Math.ceil(width / opts.cell) + 1
    rows = Math.ceil(height / opts.cell) + 1
    thresholds = new Float32Array(cols * rows)
    clearOrder = new Float32Array(cols * rows)
    colourIndex = new Uint8Array(cols * rows)

    const ordered = 1 - opts.scatter
    for (let r = 0; r < rows; r++) {
      // 0 at the bottom row, 1 at the top — the fill floods upward.
      const sweep = 1 - r / rows
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        // A slow horizontal wave keeps the edge from reading as a flat line.
        const wave = Math.sin(c * 0.12 + seed) * 0.05
        thresholds[i] = Math.min(
          0.999,
          Math.max(0, sweep * ordered + hash(c, r) * opts.scatter + wave)
        )
        colourIndex[i] = Math.floor(hash(c + 5.3, r + 1.9) * opts.colours.length)

        // Clearing sweeps the SAME direction as the fill (bottom-to-top), so the
        // two phases read as one continuous wave travelling upward: a cell fills,
        // the crest passes, and it clears again from the bottom up. Reversing
        // direction here would make the exit look like a second, opposing pass.
        clearOrder[i] = Math.min(
          0.999,
          Math.max(0, sweep * ordered + hash(c + 11.7, r + 4.3) * opts.scatter + wave)
        )
      }
    }
  }

  function render() {
    if (!cols) return
    ctx!.clearRect(0, 0, width, height)
    const size = opts.cell - 1

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        if (progress < thresholds[i]) continue
        // already dissolved away
        if (cleared > 0 && cleared >= clearOrder[i]) continue
        ctx!.fillStyle = opts.colours[colourIndex[i]] ?? opts.colours[0]
        ctx!.fillRect(c * opts.cell, r * opts.cell, size, size)
      }
    }
  }

  function onResize() {
    build()
    render()
  }

  build()
  render()
  window.addEventListener('resize', onResize)
  // The element can resize without the window doing so (dialog layout settling).
  // Skip zero-size reports: the observer fires once on observe(), and rebuilding
  // from a 0×0 rect would discard a grid that was already built correctly.
  const observer = new ResizeObserver((entries) => {
    const box = entries[0]?.contentRect
    if (box && (box.width < 2 || box.height < 2)) return
    onResize()
  })
  observer.observe(canvas)

  return {
    setProgress(value) {
      progress = value
      render()
    },
    setClear(value) {
      cleared = value
      render()
    },
    destroy() {
      window.removeEventListener('resize', onResize)
      observer.disconnect()
    },
  }
}
