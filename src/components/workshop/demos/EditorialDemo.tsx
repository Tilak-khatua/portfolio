import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const pages = [
  { name: 'Studio', kicker: 'INDEPENDENT / BY DESIGN', title: ['Good work.', 'Quiet confidence.'], note: 'A considered approach to the things that matter.', edition: '01', theme: 'studio' },
  { name: 'Work', kicker: 'SELECTED / NOT EVERYTHING', title: ['Details make', 'the difference.'], note: 'A small collection of carefully made things.', edition: '02', theme: 'work' },
  { name: 'Journal', kicker: 'NOTES / FROM THE STUDIO', title: ['Room for', 'a new thought.'], note: 'Ideas worth keeping. Questions worth following.', edition: '03', theme: 'journal' },
] as const

export default function EditorialDemo() {
  const root = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState(0)
  const [version, setVersion] = useState(0)
  const page = pages[selected]
  useLayoutEffect(() => {
    if (version === 0) return
    const media = gsap.matchMedia(root)
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.killTweensOf(root.current?.querySelectorAll('.editorial-title-line > span') ?? [])
      const sequence = gsap.timeline()
      sequence.fromTo('.editorial-sheet', { rotation: -2, y: 14, opacity: 0.65 }, { rotation: 0, y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
        .fromTo('.editorial-title-line > span', { yPercent: 115 }, { yPercent: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0.05)
        .fromTo('.editorial-art', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.inOut' }, 0.15)
        .fromTo('.editorial-rule', { scaleX: 0 }, { scaleX: 1, duration: 0.85, ease: 'power2.inOut' }, 0.2)
      return () => sequence.kill()
    })
    return () => media.revert()
  }, [version])
  return <div className="demo demo--editorial" ref={root}>
    <figure className="demo-figure editorial-figure">
      <div className={`editorial-sheet editorial-sheet--${page.theme}`} aria-hidden="true">
        <div className="editorial-masthead"><span>E / M</span><span>VOL. {page.edition}</span></div>
        <div className="editorial-rule" />
        <div className="editorial-layout">
          <div className="editorial-type"><small>{page.kicker}</small><div className="editorial-title">{page.title.map(line => <span className="editorial-title-line" key={line}><span>{line}</span></span>)}</div><p>{page.note}</p></div>
          <div className="editorial-art"><span className="editorial-art-disc" /><span className="editorial-art-column" /><span className="editorial-art-line" /></div>
        </div>
        <div className="editorial-sheet-footer"><span>A LITTLE LESS. A LITTLE BETTER.</span><span>↗</span></div>
      </div>
      <figcaption>An editorial layout study: typography, composition, and a change of pace.</figcaption>
    </figure>
    <div className="demo-controls">
      <div className="editorial-tabs" role="group" aria-label="Choose an editorial layout">{pages.map((item, index) => <button type="button" className="sketch-choice" aria-pressed={selected === index} onClick={() => { setSelected(index); setVersion(value => value + 1) }} key={item.name}>{item.name}<span aria-hidden="true">0{index + 1}</span></button>)}</div>
      <p className="demo-run-status" role="status">{page.name} layout — {page.title.join(' ')}</p>
    </div>
  </div>
}
