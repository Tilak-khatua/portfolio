import { useEffect, useRef } from 'react'
import { createPixelField, type PixelField, type PixelFieldPalette } from '../lib/pixel-field'
import { PIXEL_BANDS, PIXEL_PEAK } from '../lib/palette'

const PALETTE: PixelFieldPalette = { bands: PIXEL_BANDS, peak: PIXEL_PEAK }

/** Module-level handle so any component can reach the field without prop drilling. */
let field: PixelField | null = null

/**
 * Set while a modal covers the field. Safe-zone syncing walks the DOM and reads
 * layout, so it has to stop too — otherwise a scrolling dialog keeps triggering
 * `getBoundingClientRect` over every marked element.
 */
let suspended = false

export function suspendFieldSync(value: boolean) {
  suspended = value
}

export function getField(): PixelField | null {
  return field
}

/**
 * Mounts the pixel field on a canvas and keeps its safe zones in sync with any
 * element marked `data-field-safe`, so text stays legible as the layout reflows.
 */
export function usePixelField(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const ref = useRef<PixelField | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ambient: 0 — the field is cursor-painted only, no self-generating texture.
    const instance = createPixelField(canvas, {
      palette: PALETTE,
      ambient: 0,
      cell: 9,
      // ~4 cells of radius: a tight, dense blob rather than a broad wash.
      brush: 3.4,
    })
    ref.current = instance
    field = instance

    const sync = () => {
      if (suspended) return
      const zones = Array.from(
        document.querySelectorAll<HTMLElement>('[data-field-safe]')
      ).map((el) => {
        const r = el.getBoundingClientRect()
        const pad = Number(el.dataset.fieldSafe) || 0
        return {
          x: r.left - pad,
          y: r.top - pad,
          w: r.width + pad * 2,
          h: r.height + pad * 2,
          feather: 22,
        }
      })
      instance.setSafeZones(zones)
    }

    sync()
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        sync()
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', sync)
    // Scoped to `main`, not `document.body`: the dialog mounts outside it, so a
    // dialog re-render no longer triggers a full safe-zone recalculation.
    const observer = new MutationObserver(sync)
    const target = document.querySelector('main') ?? document.body
    observer.observe(target, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', sync)
      observer.disconnect()
      instance.destroy()
      ref.current = null
      field = null
    }
  }, [canvasRef])

  return ref
}
