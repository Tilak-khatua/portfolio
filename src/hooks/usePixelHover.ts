import { useEffect, useRef } from 'react'
import { PIXEL_RAMP } from '../lib/palette'

/** ms between reshuffles — slow enough to read as discrete cells, not noise. */
const INTERVAL = 130
const CELL = 9

type Options = {
  /**
   * 'fill' scatters across the whole element — for solid buttons, where there is
   * no text to obscure at the edges.
   *
   * 'corners' confines cells to the four corners, leaving the middle clear. Use
   * on content boxes: a full scatter over body copy makes it unreadable.
   */
  mode?: 'fill' | 'corners'
  /** Share of eligible cells lit on each tick. */
  density?: number
  /** Corner block size in cells, for 'corners'. */
  corner?: number
}

/**
 * Scatters pixel cells across an element while it's hovered.
 *
 * A grid of spans is laid over the target once, then each tick assigns a random
 * subset a colour from the ramp and clears the rest. Cheap: no canvas, no rAF —
 * just a background swap on a fixed set of nodes.
 */
export function usePixelHover<T extends HTMLElement>(options: Options = {}) {
  const { mode = 'fill', density = 0.16, corner = 4 } = options
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // 'fill' covers the element, so its children must be lifted above the cell
    // layer — a button's bare text node has no wrapper to raise on its own.
    // 'corners' leaves the middle clear, so existing content is left untouched
    // (re-parenting a whole content box would fight React's own children).
    let label: HTMLElement | null = null
    if (mode === 'fill') {
      label = document.createElement('span')
      label.className = 'pxlbl'
      while (el.firstChild) label.appendChild(el.firstChild)
    }

    const layer = document.createElement('span')
    layer.className = 'pxfx'
    layer.setAttribute('aria-hidden', 'true')
    // Appended in both modes. 'fill' puts the layer behind the raised .pxlbl via
    // z-index; 'corners' deliberately paints ABOVE the box's content, because any
    // child with its own opaque background — a title bar, a panel body — would
    // otherwise cover the cells. Corners never overlap text, so nothing is hidden.
    el.appendChild(layer)
    if (label) el.appendChild(label)

    let cells: HTMLElement[] = []

    const build = () => {
      const cols = Math.ceil(el.offsetWidth / CELL)
      const rows = Math.ceil(el.offsetHeight / CELL)
      if (cols < 1 || rows < 1) return
      layer.textContent = ''
      layer.style.gridTemplateColumns = `repeat(${cols}, ${CELL}px)`
      layer.style.gridAutoRows = `${CELL}px`

      cells = []

      if (mode === 'corners') {
        // Build ONLY the four corner blocks, absolutely placed. Filling the whole
        // grid with spacer nodes to position them cost ~28k elements across the
        // page — enough to block the main thread through the loader animation.
        layer.style.display = 'block'
        for (const [ry, rx] of [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ]) {
          for (let r = 0; r < corner; r++) {
            for (let c = 0; c < corner; c++) {
              const node = document.createElement('i')
              node.style.position = 'absolute'
              node.style.width = `${CELL}px`
              node.style.height = `${CELL}px`
              node.style[rx ? 'right' : 'left'] = `${c * CELL}px`
              node.style[ry ? 'bottom' : 'top'] = `${r * CELL}px`
              layer.appendChild(node)
              cells.push(node)
            }
          }
        }
        return
      }

      for (let i = 0; i < cols * rows; i++) {
        cells.push(layer.appendChild(document.createElement('i')))
      }
    }

    build()
    const observer = new ResizeObserver(build)
    observer.observe(el)

    let timer: number | null = null

    const tick = () => {
      for (const cell of cells) {
        cell.style.background =
          Math.random() < density
            ? PIXEL_RAMP[(Math.random() * PIXEL_RAMP.length) | 0]
            : 'transparent'
      }
    }

    const clear = () => {
      for (const cell of cells) cell.style.background = 'transparent'
    }

    const onEnter = () => {
      if (timer !== null) return
      tick()
      timer = window.setInterval(tick, INTERVAL)
    }

    const onLeave = () => {
      if (timer !== null) window.clearInterval(timer)
      timer = null
      clear()
    }

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)

    return () => {
      if (timer !== null) window.clearInterval(timer)
      observer.disconnect()
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      layer.remove()
      // Put the original children back where React expects them.
      if (label) {
        while (label.firstChild) el.appendChild(label.firstChild)
        label.remove()
      }
    }
  }, [mode, density, corner])

  return ref
}
