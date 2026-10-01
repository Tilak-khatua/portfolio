import { useState } from 'react'
import { projects } from '../../data/projects'
import Contact from './Contact'
import './flat.css'

const DISCIPLINES = [
  { label: 'Design', value: 'Figma · Motion · Design systems' },
  { label: 'Frontend', value: 'React · TypeScript · Next.js · WebGL' },
  { label: 'Backend', value: 'FastAPI · tRPC · Postgres · Rust' },
  { label: 'Applied ML', value: 'Bedrock · scikit-learn · Human-in-the-loop' },
]

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/Tilak-khatua' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tilak-kumar-khatua-2b966437a' },
  { label: 'Email', href: 'mailto:tilakkhatua01@gmail.com' },
]

const SECTIONS = [
  { key: 'problem', label: 'Why it existed' },
  { key: 'process', label: 'How it was built' },
  { key: 'outcome', label: 'What it proved' },
] as const

/**
 * Small screens, reduced motion, and machines without a usable GPU.
 *
 * The city needs width and hardware; on a phone it would be a slideshow of a
 * slideshow. Same content, as a document — not a crippled 3D scene.
 */
export default function Flat() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <main className="flat">
      <header className="flat-face">
        <span className="flat-index">Reality</span>
        <h1 className="flat-heading">
          <span>Tilak</span>
          <span>Khatua</span>
        </h1>
        <p className="flat-body">
          Somewhere between a UI/UX sorcerer and an ML apprentice who googled &ldquo;what is
          gradient descent&rdquo; at 2am. Makes things pretty. Makes things think. Mostly makes
          things.
        </p>
      </header>

      <section className="flat-face">
        <span className="flat-index">Six districts</span>
        <ul className="flat-work">
          {projects.map((project, i) => {
            const isOpen = open === project.slug
            return (
              <li key={project.slug} className={isOpen ? 'is-open' : ''}>
                <button onClick={() => setOpen(isOpen ? null : project.slug)} aria-expanded={isOpen}>
                  <span className="flat-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flat-work-main">
                    <span className="flat-work-title">{project.title}</span>
                    <span className="flat-work-tagline">{project.tagline}</span>
                  </span>
                  <span className="flat-work-mark" aria-hidden>
                    {isOpen ? '—' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="flat-detail">
                    <p className="flat-lead">{project.summary}</p>

                    <dl className="flat-spec">
                      <div>
                        <dt>Year</dt>
                        <dd>{project.year}</dd>
                      </div>
                      <div>
                        <dt>Role</dt>
                        <dd>{project.role}</dd>
                      </div>
                      <div>
                        <dt>Stack</dt>
                        <dd>{project.stack.join(' · ')}</dd>
                      </div>
                    </dl>

                    {SECTIONS.map(({ key, label }) => (
                      <section key={key}>
                        <h3>{label}</h3>
                        <p>{project[key]}</p>
                      </section>
                    ))}

                    {project.links?.map((link) => (
                      <a key={link.href} className="flat-link" href={link.href} target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="flat-face">
        <span className="flat-index">About</span>
        <h2 className="flat-heading is-sub">
          <span>How I</span>
          <span>work</span>
        </h2>
        <p className="flat-body">
          I care about typography more than I should, type-safety as much as I should, and
          deadlines exactly as much as the project deserves.
        </p>

        <dl className="flat-spec">
          {DISCIPLINES.map((d) => (
            <div key={d.label}>
              <dt>{d.label}</dt>
              <dd>{d.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flat-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </div>
      </section>

      <section className="flat-face">
        <span className="flat-index">Contact</span>
        <h2 className="flat-heading is-sub">
          <span>Say</span>
          <span>something</span>
        </h2>
        <Contact />
      </section>

      <footer className="flat-foot">
        <span>© {new Date().getFullYear()} Tilak Khatua</span>
        <span>There is a descent over there — best on a desktop</span>
      </footer>
    </main>
  )
}
