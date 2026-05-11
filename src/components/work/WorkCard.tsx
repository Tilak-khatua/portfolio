import { motion } from 'framer-motion'
import type { Project } from '../../data/projects'

type Props = {
  project: Project
  index: number
  onOpen: () => void
}

export default function WorkCard({ project, index, onOpen }: Props) {
  const n = String(index + 1).padStart(2, '0')
  return (
    <motion.button
      className="work-card clickable"
      onClick={onOpen}
      whileHover={{ y: -4, rotate: index % 2 === 0 ? -0.6 : 0.6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      aria-label={`open ${project.title} case study`}
    >
      <div className="win work-win">
        <div className="win-bar">
          <div className="win-dots">
            <span className="win-dot red" />
            <span className="win-dot yellow" />
            <span className="win-dot green" />
          </div>
          <div className="win-title">{project.filename}</div>
          <div className="win-actions">
            <span className="win-action">_</span>
            <span className="win-action">□</span>
            <span className="win-action">×</span>
          </div>
        </div>

        <div className="work-card-body">
          <div className="work-card-thumb" style={{ background: `var(--accent)` }}>
            <div className="work-card-thumb-grid" />
            <div className="work-card-thumb-label mono">{n} / {project.slug}</div>
            <div className="work-card-thumb-shine" />
          </div>

          <div className="work-card-meta">
            <div className="work-card-title display">{project.title}</div>
            <div className="work-card-tag">{project.tagline}</div>
            <div className="work-card-foot mono">
              <span>{project.year}</span>
              <span>·</span>
              <span>{project.role}</span>
            </div>
            <div className="work-card-chips mono">
              {project.stack.map((s) => (
                <span key={s} className="work-chip">{s}</span>
              ))}
            </div>
            <div className="work-card-cta mono">
              <span>open file</span>
              <span>▸</span>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
