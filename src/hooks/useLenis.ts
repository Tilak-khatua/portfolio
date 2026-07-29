import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let singleton: Lenis | null = null

export function getLenis(): Lenis | null {
  return singleton
}

export function useLenis() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Lenis captures wheel events for the whole document, so any internally
      // scrollable panel (the case-study dialog) would never receive them.
      // Opt those subtrees out and let them scroll natively.
      prevent: (node) => node.hasAttribute?.('data-lenis-prevent') ?? false,
    })
    singleton = lenis

    // Lenis snapshots the document's scroll position on construction, so it has
    // to be told to sit at the top too — otherwise a refresh mid-page leaves it
    // out of sync with the window we just reset.
    lenis.scrollTo(0, { immediate: true })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      singleton = null
    }
  }, [])
}
