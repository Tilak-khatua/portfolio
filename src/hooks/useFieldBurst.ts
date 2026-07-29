import { useEffect } from 'react'
import { getField } from './usePixelField'

/** Typing this anywhere on the page stamps the ✦ glyph across the viewport. */
const EGG = 'tilak'

/**
 * Wires page-level gestures into the pixel field:
 *
 * - press and hold — heat pools and widens under the pointer
 * - release        — an expanding shockwave ring, scaled by how long you held
 * - double click   — an immediate hard wave
 * - type "tilak"   — stamps the ✦ glyph big, with a few scattered waves
 *
 * Interactive elements are excluded so a click on a button or link doesn't also
 * detonate the background.
 */
export function useFieldBurst() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    /** True for clicks that belong to a control rather than the page itself. */
    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element &&
      target.closest('a, button, input, textarea, select, [role="dialog"]') !== null

    let heldFrom = 0

    const onDown = (e: PointerEvent) => {
      if (isInteractive(e.target)) return
      heldFrom = performance.now()
      getField()?.setCharge(e.clientX, e.clientY)
    }

    const onUp = (e: PointerEvent) => {
      const field = getField()
      if (!field || !heldFrom) return
      field.setCharge(null)
      // 2.2s to full, matching the charge ramp — a tap stays gentle.
      const held = Math.min((performance.now() - heldFrom) / 2200, 1)
      heldFrom = 0
      field.wave(e.clientX, e.clientY, 0.35 + held * 2.1)
      field.burst(e.clientX, e.clientY, 0.6 + held * 0.4)
    }

    const onCancel = () => {
      heldFrom = 0
      getField()?.setCharge(null)
    }

    const onDoubleClick = (e: MouseEvent) => {
      if (isInteractive(e.target)) return
      getField()?.wave(e.clientX, e.clientY, 2.8)
    }

    let typed = ''
    const onKey = (e: KeyboardEvent) => {
      // Ignore typing that belongs to a form field.
      if (isInteractive(e.target)) return
      if (!e.key || e.key.length !== 1) return
      typed = (typed + e.key.toLowerCase()).slice(-EGG.length)
      if (typed !== EGG) return

      const field = getField()
      if (!field) return
      field.stamp()
      for (let i = 0; i < 6; i++) {
        field.wave(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 0.9)
      }
      typed = ''
    }

    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('dblclick', onDoubleClick)
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('dblclick', onDoubleClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [])
}
