import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useEntranceMotion(root: RefObject<HTMLElement | null>, ready = true) {
  const entranceTimeline = useRef<gsap.core.Timeline | null>(null)
  const entranceReady = useRef(ready)
  useLayoutEffect(() => {
    entranceReady.current = ready
    if (ready) entranceTimeline.current?.play()
  }, [ready])

  useLayoutEffect(() => {
    const scope = root.current
    if (!scope) return
    const media = gsap.matchMedia(scope)
    media.add({ motion: '(prefers-reduced-motion: no-preference)', pointer: '(hover: hover) and (pointer: fine)' }, (context) => {
      if (!context.conditions?.motion) return
      const disposers: Array<() => void> = []
      const entrance = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      entranceTimeline.current = entrance
      entrance.from('.site-header .wordmark', { y: -28, rotation: -6, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)' }, 0.2)
        .from('.site-header nav a', { y: -25, rotation: 5, autoAlpha: 0, duration: 0.65, stagger: 0.09, ease: 'back.out(1.5)' }, 0.3)
        .from('[data-title-line]', { yPercent: 120, rotation: 7, scale: 0.96, duration: 1.15, stagger: 0.14, ease: 'back.out(1.15)' }, 0.28)
        .from('.thought-machine', { x: 65, y: 20, rotation: -9, scale: 0.82, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.4)' }, 0.4)
        .from('.hero-subtitle, .hero-invitation', { y: 26, rotation: -2, autoAlpha: 0, duration: 0.75, stagger: 0.12, ease: 'back.out(1.3)' }, 0.95)
        .from('.hero-bottom > *', { y: 18, autoAlpha: 0, duration: 0.65, stagger: 0.12 }, 1.2)

      scope.querySelectorAll<SVGGeometryElement>('[data-draw-mark]').forEach((mark) => {
        const length = mark.getTotalLength()
        entrance.fromTo(mark, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, 0.8)
      })
      if (entranceReady.current) entrance.play()
      const hero = scope.querySelector<HTMLElement>('.workshop-hero')!
      gsap.to('.hero-copy', { y: -36, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.hero-art', { y: -70, rotation: 3, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.fromTo('.reading-progress', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom bottom', scrub: true } })
      scope.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
        const sequence = gsap.timeline({ paused: true })
        sequence.from(element, { y: 30, autoAlpha: 0, duration: 0.75, ease: 'power3.out' }, 0)
        const words = element.querySelectorAll('[data-word]')
        if (words.length) sequence.from(words, { yPercent: 120, rotation: 8, duration: 0.8, stagger: 0.055, ease: 'back.out(1.25)' }, 0.12)
        const details = element.querySelectorAll('.eyebrow, .section-intro > p, .about-copy > p, .contact-form-note > *, .contact-email')
        if (details.length) sequence.from(details, { y: 15, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.35)
        ScrollTrigger.create({ trigger: element, start: 'top 92%', once: true, onEnter: () => sequence.play() })
      })

      scope.querySelectorAll<HTMLElement>('[data-experiment]').forEach((panel) => {
        const timeline = gsap.timeline({ paused: true })
        timeline.from(panel, { y: 65, autoAlpha: 0, rotationX: 5, transformPerspective: 1200, duration: 0.9, ease: 'power3.out' }, 0)
          .fromTo(panel, { '--edge-scale': 0 }, { '--edge-scale': 1, duration: 1.2, ease: 'power2.inOut' }, 0.1)
          .from(panel.querySelectorAll('.experiment-copy, .demo-controls, .experiment-link'), { y: 20, autoAlpha: 0, duration: 0.65, stagger: 0.1 }, 0.2)
          .from(panel.querySelectorAll('.demo-figure'), { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.inOut' }, 0.2)
          .from(panel.querySelectorAll('[data-word]'), { yPercent: 120, rotation: 7, duration: 0.75, stagger: 0.05, ease: 'back.out(1.25)' }, 0.3)
          .from(panel.querySelectorAll('.experiment-number, .experiment-topics, .experiment-intro'), { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.3)
          .from(panel.querySelectorAll('.demo-controls > *, .graph-node-picker > button, .graph-detail > *, .graph-actions > *'), { y: 12, autoAlpha: 0, duration: 0.5, stagger: 0.045 }, 0.75)
        panel.querySelectorAll<SVGPathElement>('.city-grid path, .city-land, .graph-edge, .route-line').forEach((path, index) => {
          const length = path.getTotalLength()
          timeline.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, {
            strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', overwrite: 'auto',
            onComplete: () => { path.style.removeProperty('stroke-dasharray'); path.style.removeProperty('stroke-dashoffset') },
          }, 0.4 + index * 0.05)
        })
        const population = panel.querySelectorAll('.electorate-dot')
        if (population.length) timeline.from(population, { attr: { cx: 300, cy: 175 }, duration: 1.2, stagger: { amount: 0.6, from: 'center' }, ease: 'power3.out' }, 0.6)
        const graphLabels = panel.querySelectorAll('.graph-node-label')
        if (graphLabels.length) timeline.from(graphLabels, { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08 }, 0.65)
        const mobileStages = panel.querySelectorAll('.confidence-mobile-stage, .confidence-mobile-route')
        if (mobileStages.length) timeline.from(mobileStages, { y: 18, autoAlpha: 0, duration: 0.5, stagger: 0.1 }, 0.55)
        const predictions = panel.querySelectorAll('.prediction-dot')
        if (predictions.length) timeline.from(predictions, { autoAlpha: 0, duration: 0.75, stagger: 0.045, overwrite: 'auto', ease: 'power2.inOut' }, 0.8)
        const bars = panel.querySelectorAll('.query-bar-fill')
        if (bars.length) timeline.from(bars, { scaleY: 0, duration: 0.8, stagger: 0.12, ease: 'back.out(1.3)' }, 0.7)
        const sheets = panel.querySelectorAll('.editorial-title-line > span')
        if (sheets.length) timeline.from(sheets, { yPercent: 110, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0.65)
        const records = panel.querySelectorAll('.wal-record')
        if (records.length) timeline.from(records, { x: -25, autoAlpha: 0, duration: 0.55, stagger: 0.15, ease: 'power3.out' }, 0.65)
        // Build the sequence before creating its trigger. Timeline triggers defer
        // refresh and can remove one another while loading at a lower-page hash.
        ScrollTrigger.create({ trigger: panel, start: 'top 87%', once: true, onEnter: () => timeline.play() })
        if (context.conditions?.pointer) {
          const move = (event: PointerEvent) => {
            const bounds = panel.getBoundingClientRect()
            panel.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`)
            panel.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`)
          }
          panel.addEventListener('pointermove', move)
          disposers.push(() => { panel.removeEventListener('pointermove', move); panel.style.removeProperty('--spot-x'); panel.style.removeProperty('--spot-y') })
        }
      })
      gsap.from('.about-stamp', { rotation: -18, scale: 0.7, duration: 1, ease: 'elastic.out(1, 0.65)', scrollTrigger: { trigger: '.about-section', start: 'top 75%', once: true } })
      gsap.from('[data-contact-field]', { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: '.workshop-contact-form', start: 'top 90%', once: true } })
      gsap.from('.site-footer > span, .site-footer a', { y: 16, autoAlpha: 0, duration: 0.65, stagger: 0.07, scrollTrigger: { trigger: '.site-footer', start: 'top 98%', once: true } })
      scope.querySelectorAll<SVGPathElement>('[data-closing-draw]').forEach((path) => {
        const length = path.getTotalLength()
        gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: '.contact-section', start: 'top 85%', once: true } })
      })
      if (context.conditions?.pointer) {
        scope.querySelectorAll<HTMLElement>('.hero-invitation, .experiment-link, .contact-email').forEach((link) => {
          const x = gsap.quickTo(link, 'x', { duration: 0.4, ease: 'power3.out' })
          const y = gsap.quickTo(link, 'y', { duration: 0.4, ease: 'power3.out' })
          const move = (event: PointerEvent) => {
            const bounds = link.getBoundingClientRect()
            x((event.clientX - bounds.left - bounds.width / 2) * 0.07)
            y((event.clientY - bounds.top - bounds.height / 2) * 0.15)
          }
          const leave = () => { x(0); y(0) }
          link.addEventListener('pointermove', move); link.addEventListener('pointerleave', leave)
          disposers.push(() => { link.removeEventListener('pointermove', move); link.removeEventListener('pointerleave', leave) })
        })
      }
      return () => { entranceTimeline.current = null; disposers.forEach((dispose) => dispose()) }
    })
    return () => media.revert()
  }, [root])
}
