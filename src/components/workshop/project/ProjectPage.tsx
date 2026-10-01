import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project } from '../../../data/projects'
import { projects } from '../../../data/projects'
import ProjectProcessSketch from './ProjectProcessSketch'

gsap.registerPlugin(ScrollTrigger)

type Props = {
  project: Project
  openProject: (slug: string, focusId?: string) => void
  goHome: () => void
  entranceReady?: boolean
}

export default function ProjectPage({ project, openProject, goHome, entranceReady = true }: Props) {
  const page = useRef<HTMLDivElement>(null)
  const projectMain = useRef<HTMLElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const entrance = useRef<gsap.core.Timeline | null>(null)
  const ready = useRef(entranceReady)
  const projectIndex = projects.findIndex((item) => item.slug === project.slug)
  const previous = projects[projectIndex - 1]
  const next = projects[projectIndex + 1]

  useLayoutEffect(() => {
    ready.current = entranceReady
    if (entranceReady) entrance.current?.play()
  }, [entranceReady])

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    title.current?.focus({ preventScroll: true })
    if (!page.current) return
    const media = gsap.matchMedia(page)
    media.add('(prefers-reduced-motion: no-preference)', () => {
      entrance.current = gsap.timeline({ paused: true })
        .from('.site-header .wordmark, .site-header nav a, .back-link', { y: -20, rotation: -3, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'back.out(1.3)' }, 0)
        .from('.project-cover > .eyebrow, .project-cover h1, .project-tagline, .project-summary', { y: 25, autoAlpha: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out' }, 0.1)
      if (ready.current) entrance.current.play()
      gsap.from('.project-facts > div, .project-facts > a', { x: -18, autoAlpha: 0, duration: 0.6, stagger: 0.09, scrollTrigger: { trigger: '.project-facts', start: 'top 92%', once: true } })
      page.current?.querySelectorAll('.project-story section').forEach(section => {
        gsap.from(section, { y: 32, autoAlpha: 0, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 90%', once: true } })
      })
      gsap.from('.project-pagination', { y: 20, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.project-pagination', start: 'top 94%', once: true } })
      return () => { entrance.current = null }
    })
    return () => media.revert()
  }, [project.slug])

  useEffect(() => {
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!description) return
    const original = description.content
    description.content = project.summary
    return () => { description.content = original }
  }, [project.summary])

  return (
    <div className="workshop project-page" id="top" ref={page}>
      <a className="skip-link" href="#project-content" onClick={(event) => {
        event.preventDefault()
        projectMain.current?.focus({ preventScroll: true })
        projectMain.current?.scrollIntoView({ block: 'start' })
      }}>Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#experiments" onClick={(event) => { event.preventDefault(); goHome() }}>TILAK KHATUA</a>
        <nav aria-label="Project navigation">
          <a href="#experiments" onClick={(event) => { event.preventDefault(); goHome() }}>All experiments</a>
          <a href="mailto:tilakkhatua01@gmail.com">Contact</a>
        </nav>
      </header>

      <main className="project-main" id="project-content" ref={projectMain} tabIndex={-1}>
        <a className="back-link" href="#experiments" onClick={(event) => { event.preventDefault(); goHome() }}>← Back to experiments</a>
        <section className={`project-cover experiment--${project.accent}`} aria-labelledby="project-title">
          <p className="eyebrow">{project.year} · {project.role}</p>
          <h1 id="project-title" ref={title} tabIndex={-1}>{project.title}<span>.</span></h1>
          <p className="project-tagline">{project.tagline}</p>
          <p className="project-summary">{project.summary}</p>
          <ProjectProcessSketch key={project.slug} project={project} />
        </section>

        <div className="project-content-grid">
          <aside className="project-facts" aria-label="Project details">
            <div><span className="eyebrow">MY ROLE</span><strong>{project.role}</strong></div>
            <div><span className="eyebrow">YEAR</span><strong>{project.year}</strong></div>
            <div><span className="eyebrow">BUILT WITH</span><ul>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul></div>
            {project.links?.map((link) => <a className="source-link" href={link.href} key={link.href} target="_blank" rel="noreferrer">Open {link.label} ↗</a>)}
          </aside>

          <div className="project-story">
            <section aria-labelledby="project-question-title"><p className="eyebrow">01 / THE QUESTION</p><h2 id="project-question-title">What made me start</h2><p>{project.problem}</p></section>
            <section aria-labelledby="project-process-title"><p className="eyebrow">02 / HOW IT WORKS</p><h2 id="project-process-title">The approach</h2><p>{project.process}</p></section>
            <section aria-labelledby="project-outcome-title"><p className="eyebrow">03 / THE OUTCOME</p><h2 id="project-outcome-title">Where it got to</h2><p>{project.outcome}</p></section>
          </div>
        </div>

        <nav className="project-pagination" aria-label="Other projects">
          {previous ? <button type="button" className="project-step-link" onClick={() => openProject(previous.slug)}><span>← PREVIOUS BUILD</span><strong>{previous.title}</strong></button> : <span />}
          {next ? <button type="button" className="project-step-link project-step-link--next" onClick={() => openProject(next.slug)}><span>NEXT BUILD →</span><strong>{next.title}</strong></button> : <button type="button" className="project-step-link project-step-link--next" onClick={goHome}><span>BACK TO THE INDEX →</span><strong>All experiments</strong></button>}
        </nav>
      </main>

      <footer className="site-footer"><span>© {new Date().getFullYear()} Tilak Khatua</span><a href="#experiments" onClick={(event) => { event.preventDefault(); goHome() }}>Back to experiments ↑</a></footer>
    </div>
  )
}
