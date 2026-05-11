import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getProject } from '../../data/projects'
import { getLenis } from '../../hooks/useLenis'

type Props = {
  slug: string | null
  onClose: () => void
}

export default function FileOpenDialog({ slug, onClose }: Props) {
  const project = slug ? getProject(slug) : null
  const [progress, setProgress] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!slug) {
      setProgress(0)
      setExpanded(false)
      return
    }
    let raf = 0
    const start = performance.now()
    const DURATION = 900
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      setProgress(p)
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        window.setTimeout(() => setExpanded(true), 150)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [slug])

  useEffect(() => {
    if (!slug) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const lenis = getLenis()
    lenis?.stop()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onWheel = (e: WheelEvent) => {
      const content = contentRef.current
      if (!content) return
      e.stopPropagation()
      e.preventDefault()
      content.scrollTop += e.deltaY
    }
    window.addEventListener('wheel', onWheel, { passive: false, capture: true })

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions)
      lenis?.start()
      document.body.style.overflow = prevOverflow
    }
  }, [slug, onClose])

  return (
    <AnimatePresence>
      {slug && project && (
        <motion.div
          className="file-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={`file-dialog win ${expanded ? 'file-dialog-expanded' : ''}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="win-bar">
              <div className="win-dots">
                <span className="win-dot red clickable" onClick={onClose} />
                <span className="win-dot yellow" />
                <span className="win-dot green" />
              </div>
              <div className="win-title">opening — {project.filename}</div>
              <div className="win-actions">
                <span className="win-action clickable" onClick={onClose}>×</span>
              </div>
            </div>

            {!expanded ? (
              <div className="file-loader">
                <div className="file-loader-text mono">
                  reading {project.filename}… <span style={{ opacity: 0.5 }}>(pretending this is a real OS)</span>
                </div>
                <div className="file-loader-bar">
                  <div className="file-loader-fill" style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="file-loader-hint mono">{Math.round(progress * 100)}%</div>
              </div>
            ) : (
              <>
                <div ref={contentRef} className="file-content">
                  <div className="file-content-head">
                    <div className="label">case / {project.year} / {project.role}</div>
                    <h3 className="file-title display">{project.title}</h3>
                    <p className="file-tagline serif">{project.tagline}</p>
                    <div className="file-stack mono">
                      {project.stack.map((s) => (
                        <span key={s} className="work-chip">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="file-body">
                    <section>
                      <div className="label">problem</div>
                      <p>{project.problem}</p>
                    </section>
                    <section>
                      <div className="label">process</div>
                      <p>{project.process}</p>
                    </section>
                    <section>
                      <div className="label">outcome</div>
                      <p>{project.outcome}</p>
                    </section>
                  </div>

                  {project.links && project.links.length > 0 && (
                    <div className="file-links mono">
                      {project.links.map((l) => (
                        <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="file-link">
                          {l.label} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="file-foot mono">
                  <button className="chrome-btn" onClick={onClose}>← close</button>
                  <span style={{ opacity: 0.5 }}>esc also works, if you're fancy.</span>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
