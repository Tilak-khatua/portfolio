import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Workshop from './components/workshop/Workshop'
import ProjectPage from './components/workshop/project/ProjectPage'
import { usePortfolioLocation } from './components/workshop/usePortfolioLocation'
import { getProject } from './data/projects'
import './components/workshop/workshop.css'
import './components/workshop/project/project.css'
import './components/workshop/motion.css'
import './components/workshop/demos/sketches.css'
import './components/workshop/contact/contact.css'
import LoadingScreen from './components/workshop/loading/LoadingScreen'
import './components/workshop/loading/loading.css'

export default function App() {
  const [contentReady, setContentReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [entranceReady, setEntranceReady] = useState(false)
  const reveal = useCallback(() => setContentReady(true), [])
  const enter = useCallback(() => setEntranceReady(true), [])
  const complete = useCallback(() => setLoading(false), [])
  const { location, openProject, goHome } = usePortfolioLocation(contentReady)
  const missingProjectContent = useRef<HTMLElement>(null)
  const currentProject = location.type === 'project' ? getProject(location.slug) : undefined

  useEffect(() => {
    document.title = location.type === 'project'
      ? currentProject ? `${currentProject.title} — Tilak Khatua` : 'Project not found — Tilak Khatua'
      : 'Tilak Khatua — Things I couldn’t stop thinking about'
  }, [currentProject, location.type])

  useEffect(() => {
    if (!loading && location.type === 'project') document.getElementById('project-title')?.focus({ preventScroll: true })
  }, [loading, location.type])

  let content: ReactNode
  if (location.type === 'project') {
    if (!currentProject) {
      content = (
        <main className="workshop project-page">
          <a className="skip-link" href="#project-content" onClick={(event) => {
            event.preventDefault()
            missingProjectContent.current?.focus({ preventScroll: true })
            missingProjectContent.current?.scrollIntoView({ block: 'start' })
          }}>Skip to content</a>
          <a className="back-link" href="#experiments" onClick={(event) => { event.preventDefault(); goHome() }}>← Back to experiments</a>
          <section id="project-content" ref={missingProjectContent} className="project-not-found" tabIndex={-1}>
            <p className="eyebrow">PROJECT NOT FOUND</p>
            <h1>That page wandered off.</h1>
            <p>Try the experiment index instead.</p>
            <button className="text-link" onClick={goHome}>Return to the experiments ↗</button>
          </section>
        </main>
      )
    } else content = <ProjectPage project={currentProject} openProject={openProject} goHome={goHome} entranceReady={entranceReady} />
  } else content = <Workshop openProject={openProject} entranceReady={entranceReady} />

  return <>
    <div className="portfolio-stage" inert={loading} aria-hidden={loading || undefined}>{contentReady && content}</div>
    {loading && <LoadingScreen onReveal={reveal} onEnter={enter} onComplete={complete} />}
  </>
}
