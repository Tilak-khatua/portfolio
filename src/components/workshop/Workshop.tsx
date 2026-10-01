import { useRef } from 'react'
import { projects } from '../../data/projects'
import { additionalQuestions, featuredQuestions } from './data'
import { useEntranceMotion } from './useEntranceMotion'
import ElectorateDemo from './demos/ElectorateDemo'
import ThreatGraphDemo from './demos/ThreatGraphDemo'
import ConfidenceDemo from './demos/ConfidenceDemo'
import ThoughtMachine from './ThoughtMachine'
import QueryDemo from './demos/QueryDemo'
import EditorialDemo from './demos/EditorialDemo'
import LogDemo from './demos/LogDemo'
import ContactForm from './contact/ContactForm'
import AnimatedWords from './AnimatedWords'

type Props = { openProject: (slug: string, focusId?: string) => void; entranceReady?: boolean }

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/Tilak-khatua' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tilak-kumar-khatua-2b966437a' },
]

function ExperimentPanel({
  slug,
  number,
  topics,
  question,
  accent,
  openProject,
  children,
}: {
  slug: string
  number: string
  topics: string
  question: string
  accent: string
  openProject: Props['openProject']
  children: React.ReactNode
}) {
  const project = projects.find((item) => item.slug === slug)
  if (!project) return null
  const linkId = `project-link-${slug}`
  return (
    <article className={`experiment experiment--${accent}`} data-experiment aria-labelledby={`${slug}-question`}>
      <div className="experiment-copy">
        <div className="experiment-heading">
          <p className="experiment-number"><span>{number} /</span> {project.title}</p>
          <span className="experiment-topics">{topics}</span>
        </div>
        <h3 id={`${slug}-question`} aria-label={question}><AnimatedWords text={question} /></h3>
        <p className="experiment-intro">{project.summary}</p>
      </div>
      {children}
      <a
        className="experiment-link"
        id={linkId}
        href={`#/project/${project.slug}`}
        onClick={(event) => { event.preventDefault(); openProject(project.slug, linkId) }}
      >
        Read the build <span aria-hidden="true">↗</span>
      </a>
    </article>
  )
}

export default function Workshop({ openProject, entranceReady = true }: Props) {
  const root = useRef<HTMLDivElement>(null)
  useEntranceMotion(root, entranceReady)

  return (
    <div className="workshop" id="top" ref={root}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Tilak Khatua, top of page">TILAK KHATUA</a>
        <nav aria-label="Main navigation">
          <a href="#experiments">Experiments</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        <div className="reading-progress" aria-hidden="true" />
        <section className="workshop-hero" aria-labelledby="hero-title">
          <div className="hero-copy" data-hero-copy>
            <h1 id="hero-title" aria-label="Things I couldn’t stop thinking about.">
              <span className="hero-title-line" aria-hidden="true"><span data-title-line>Things I couldn’t</span></span>
              <span className="hero-title-line" aria-hidden="true"><span data-title-line>stop <em>thinking</em></span></span>
              <span className="hero-title-line" aria-hidden="true"><span data-title-line>about<span className="hero-dot">.</span></span></span>
            </h1>
            <p className="hero-subtitle">I build tools for questions that won’t leave me alone.</p>
            <a className="hero-invitation" href="#experiments"><svg viewBox="0 0 76 20" aria-hidden="true"><path data-draw-mark d="M2 3c18 18 43 18 64 7m-8-5 10 5-10 5" /></svg>Pick a question. Play with it.</a>
          </div>
          <div className="hero-art"><ThoughtMachine /></div>
          <div className="hero-bottom"><span>DESIGN / INFERENCE / INFRASTRUCTURE</span><a href="#experiments">Start exploring ↓</a></div>
        </section>

        <section className="experiments-section" id="experiments" aria-labelledby="experiments-title">
          <div className="section-intro" data-reveal>
            <div><p className="eyebrow">THE EXPERIMENTS</p><h2 id="experiments-title" aria-label="A question is a good place to start."><AnimatedWords text="A question is a good place to start." /></h2></div>
            <p>Three working sketches from three very different rabbit holes. Change a value, follow a connection, see what moves.</p>
          </div>
          <div className="experiment-grid">
            <ExperimentPanel {...featuredQuestions[0]} openProject={openProject}>
              <ElectorateDemo />
            </ExperimentPanel>
            <ExperimentPanel {...featuredQuestions[1]} openProject={openProject}>
              <ThreatGraphDemo />
            </ExperimentPanel>
            <ExperimentPanel {...featuredQuestions[2]} openProject={openProject}>
              <ConfidenceDemo />
            </ExperimentPanel>
          </div>
        </section>

        <section className="more-section" id="more-experiments" aria-labelledby="more-title">
          <div className="section-intro section-intro--compact" data-reveal>
            <div><p className="eyebrow">OTHER THINGS I BUILT</p><h2 id="more-title" aria-label="A few more questions."><AnimatedWords text="A few more questions." /></h2></div>
            <p>Turn a question into a query, try an editorial layout, or see what survives a crash. Three more ways to explore.</p>
          </div>
          <div className="experiment-grid">
            <ExperimentPanel {...additionalQuestions[0]} openProject={openProject}><QueryDemo /></ExperimentPanel>
            <ExperimentPanel {...additionalQuestions[1]} openProject={openProject}><EditorialDemo /></ExperimentPanel>
            <ExperimentPanel {...additionalQuestions[2]} openProject={openProject}><LogDemo /></ExperimentPanel>
          </div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title" data-reveal>
          <div className="about-index"><p className="eyebrow">A NOTE ABOUT THE PERSON MAKING THESE</p><span aria-hidden="true">TK / 26</span></div>
          <div className="about-copy"><h2 id="about-title" aria-label="Hi, I’m Tilak."><AnimatedWords text="Hi, I’m Tilak." /></h2><p>I have a habit of turning “I wonder how that works” into a project. Occasionally, a small project. More often, a system with a diagram and a suspicious number of moving parts.</p><p>I like following a question through the interface, the data, and the code until it makes sense. These projects are the evidence. The demos are here so you can poke around without having to read my entire commit history.</p></div>
          <div className="about-stamp" aria-hidden="true">MADE WHILE<br />FIGURING IT OUT</div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title" data-reveal>
          <svg className="contact-drawing" viewBox="0 0 240 150" aria-hidden="true"><path data-closing-draw d="M18 27c70-37 124 67 61 71-63 4-28-103 65-50 33 18 38 37 69 38m-17-15 18 15-23 9" /></svg>
          <p className="eyebrow">SOMETHING ON YOUR MIND?</p>
          <div className="contact-row"><h2 id="contact-title" aria-label="Send me the question."><AnimatedWords text="Send me the question." /></h2><a className="contact-email" href="mailto:tilakkhatua01@gmail.com">tilakkhatua01@gmail.com <span aria-hidden="true">↗</span></a></div>
          <div className="contact-form-grid">
            <div className="contact-form-note"><p className="contact-note">I’m always up for a thoughtful problem or an interesting conversation. Leave a note here, or email me directly.</p><p className="eyebrow">WRITING FROM</p><small>IST · UTC+5:30</small></div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Tilak Khatua</span>
        <span className="footer-tags">DESIGN · MACHINE LEARNING · SYSTEMS</span>
        <div className="footer-links">{socialLinks.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}<a href="#top">Back to top ↑</a></div>
      </footer>
    </div>
  )
}
