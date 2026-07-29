import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getProject } from '../../data/projects'
import './case.css'

type Props = { slug: string | null; onClose: () => void }

const EASE = [0.16, 1, 0.3, 1] as const

const box = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, staggerChildren: 0.05, delayChildren: 0.12 },
  },
  out: { opacity: 0, scale: 0.97, y: 12, transition: { duration: 0.25, ease: EASE } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

export default function CaseStudy({ slug, onClose }: Props) {
  const project = slug ? getProject(slug) : undefined
  useEffect(() => {
    if (!slug) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [slug, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="case-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="case-box"
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            variants={box}
            initial="hidden"
            animate="show"
            exit="out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="case-box-bar">
              <span className="case-box-file mono">{project.filename}</span>
              <button className="case-box-close mono" onClick={onClose} aria-label="Close">
                close ×
              </button>
            </div>

            {/* data-lenis-prevent: Lenis owns the document wheel, so this panel
                has to opt out or the mouse wheel does nothing inside it. */}
            <div className="case-box-scroll" data-lenis-prevent>
              <motion.header className="case-box-head" variants={item}>
                <h2 className="case-box-title display">{project.title}</h2>
                <p className="case-box-tagline">{project.tagline}</p>
                <dl className="case-box-facts mono">
                  <div>
                    <dt>Year</dt>
                    <dd>{project.year}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{project.role}</dd>
                  </div>
                  <div className="case-box-facts-wide">
                    <dt>Stack</dt>
                    <dd>{project.stack.join(' · ')}</dd>
                  </div>
                </dl>
              </motion.header>

              <motion.p className="case-box-summary" variants={item}>
                {project.summary}
              </motion.p>

              <Block n="01" title="Problem" body={project.problem} />
              <Block n="02" title="Process" body={project.process} />
              <Block n="03" title="Outcome" body={project.outcome} />

              {project.links && project.links.length > 0 && (
                <motion.footer className="case-box-links" variants={item}>
                  {project.links.map((l) => (
                    <a
                      key={l.href}
                      className="btn btn-ghost"
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </motion.footer>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Block({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <motion.section className="case-box-block" variants={item}>
      <div className="case-box-block-head">
        <span className="case-box-n mono">{n}</span>
        <h3 className="case-box-block-title mono">{title}</h3>
      </div>
      <p className="case-box-body">{body}</p>
    </motion.section>
  )
}
