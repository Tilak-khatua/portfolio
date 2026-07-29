import type { Project } from '../../data/projects'
import { usePixelHover } from '../../hooks/usePixelHover'
import './artwork.css'

type Props = {
  project: Project
  index: number
  total: number
  accent: string
  onOpen: () => void
}

export default function WorkCard({ project, index, total, accent, onOpen }: Props) {
  const boxRef = usePixelHover<HTMLDivElement>({ mode: 'corners', density: 0.22 })

  return (
    <article className="work-card" style={{ ['--accent' as string]: accent }}>
      {/* the stage takes the scroll-driven rotation; the card itself stays put */}
      <div className="work-card-stage">
        <div ref={boxRef} className="work-card-inner">
          <button className="work-card-hit" onClick={onOpen}>
            <span className="sr-only">Open {project.title} case study</span>
          </button>

          {/* Typographic panel instead of imagery — the stack set as a dense
              mono rule, an oversized index, and the project's own keyword. */}
          <div className="work-card-media">
            <div className="work-card-panel" aria-hidden>
              <div className="panel-stack mono">{project.stack.join(' · ')}</div>

              <div className="panel-body">
                <span className="panel-index mono">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="panel-keyword display">
                  {project.keyword.map((word) => (
                    <span key={word} className="panel-keyword-line">
                      {word}
                    </span>
                  ))}
                </p>
              </div>

              <div className="panel-foot mono">
                <span>{project.role}</span>
                <span className="panel-rule" />
                <span>{project.year}</span>
              </div>
            </div>
            <span className="work-card-file mono">{project.filename}</span>
          </div>

          <div className="work-card-body">
            <div className="work-card-top">
              <span className="work-index mono">
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
              <span className="work-meta mono">{project.year}</span>
            </div>

            <h3 className="work-title display">{project.title}</h3>
            <p className="work-tagline">{project.tagline}</p>

            <div className="work-stack">
              {project.stack.slice(0, 4).map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>

            <span className="work-cta mono">
              Open <span className="work-cta-arrow">↗</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
