import { useEffect, useLayoutEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../../data/projects'
import Contact from '../flat/Contact'
import '../flat/flat.css'
import './story.css'

gsap.registerPlugin(ScrollTrigger)


const FEATURED = ['third-angle', 'recondart', 'hitl']
const LINKS = [
  { label: 'GitHub', href: 'https://github.com/Tilak-khatua' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tilak-kumar-khatua-2b966437a' },
]

function SceneArt({ slug }: { slug: string }) {
  if (slug === 'third-angle') {
    return (
      <div className="story-art story-art--city" aria-label="Illustrated city map resolving from data points" role="img">
        <span className="art-coordinate">19°04′ N / 72°52′ E</span>
        <svg viewBox="0 0 640 540" aria-hidden="true">
          <path className="city-coast" d="M485 -20 C430 90 518 118 450 206 S510 340 412 560" />
          <path className="city-road" d="M-10 112 250 170 670 94M-20 310 194 265 650 385M80 -10 214 548M278 -20 310 560M530 -20 398 560M-20 440 650 230" />
          <path className="city-district" d="m104 194 118-57 101 34-16 112-127 31-90-46zM326 112l96 24-17 99-98 48-18-112zM216 334l116-43 94 40-25 124-146 24-72-74z" />
          {Array.from({ length: 44 }, (_, i) => {
            const x = 90 + ((i * 73) % 390)
            const y = 72 + ((i * 97) % 390)
            return <circle key={i} className={i % 6 === 0 ? 'city-point is-hot' : 'city-point'} cx={x} cy={y} r={i % 6 === 0 ? 5 : 2.5} />
          })}
          <circle className="city-focus" cx="310" cy="276" r="37" />
          <circle className="city-focus city-focus--outer" cx="310" cy="276" r="55" />
        </svg>
        <span className="art-caption">01 / THE CITY, SEAT BY SEAT</span>
      </div>
    )
  }

  if (slug === 'recondart') {
    const nodes = [
      [105, 132, 'IP'], [237, 82, 'DNS'], [268, 242, 'FILE'], [418, 122, 'C2'],
      [493, 278, 'TTP'], [364, 390, 'IOC'], [154, 382, 'MAIL'], [528, 430, 'MITRE'],
    ] as const
    return (
      <div className="story-art story-art--graph" aria-label="Illustrated threat intelligence graph connecting indicators" role="img">
        <span className="art-coordinate">SIGNAL → CONTEXT → ACTION</span>
        <svg viewBox="0 0 640 540" aria-hidden="true">
          <path className="graph-link" d="M105 132 237 82 418 122 493 278 528 430M105 132 268 242 493 278M268 242 364 390 528 430M154 382 268 242 364 390M105 132 154 382" />
          {nodes.map(([x, y, label], i) => (
            <g className={`graph-node graph-node--${i}`} key={label} transform={`translate(${x} ${y})`}>
              <circle r="24" /><circle className="graph-node-core" r="4" />
              <text y="43" textAnchor="middle">{label}</text>
            </g>
          ))}
        </svg>
        <span className="art-caption">02 / FOLLOW THE EVIDENCE</span>
      </div>
    )
  }

  return (
    <div className="story-art story-art--loop" aria-label="Illustrated human review loop for uncertain model predictions" role="img">
      <span className="art-coordinate">CONFIDENCE IS A ROUTING SIGNAL</span>
      <svg viewBox="0 0 640 540" aria-hidden="true">
        <path className="loop-line" d="M50 270h142c52 0 55-112 126-112h55" />
        <path className="loop-line loop-line--return" d="M373 382h-55c-71 0-74-112-126-112H50" />
        <path className="loop-line loop-line--direct" d="M318 270h258" />
        <circle className="loop-node loop-node--input" cx="72" cy="270" r="30" />
        <circle className="loop-node loop-node--model" cx="318" cy="270" r="48" />
        <circle className="loop-node loop-node--human" cx="373" cy="158" r="34" />
        <circle className="loop-node loop-node--data" cx="373" cy="382" r="34" />
        <text x="72" y="330" textAnchor="middle">INPUT</text>
        <text x="318" y="348" textAnchor="middle">MODEL</text>
        <text x="373" y="218" textAnchor="middle">REVIEW</text>
        <text x="373" y="442" textAnchor="middle">TRAIN</text>
        <text x="518" y="252" textAnchor="middle">AUTO</text>
        <text x="518" y="286" textAnchor="middle">APPROVE</text>
      </svg>
      <span className="art-caption">03 / UNCERTAINTY GETS A HUMAN</span>
    </div>
  )
}

function Chapter({ slug, index }: { slug: string; index: number }) {
  const project = projects.find((item) => item.slug === slug)
  if (!project) return null
  const isCity = slug === 'third-angle'
  const hook = isCity
    ? 'A city is not an average.'
    : slug === 'recondart'
      ? 'Fourteen tabs. One investigation.'
      : 'A confident model can still be wrong.'
  const tension = isCity
    ? 'Small polls and imported assumptions miss the local detail that can decide a constituency.'
    : slug === 'recondart'
      ? 'Indicators live across separate tools. Analysts spend time moving data instead of judging it.'
      : 'Teams either accept bad predictions or review everything by hand.'
  const decision = isCity
    ? 'Build an India-native synthetic electorate and ground its estimates in reweighted survey data.'
    : slug === 'recondart'
      ? 'Bring scans together, connect related indicators, and explain why a finding matters.'
      : 'Route uncertain predictions to people, capture consensus, then return labels to the training loop.'

  return (
    <section className={`chapter chapter--${slug}`} id={slug} aria-labelledby={`${slug}-title`}>
      <div className="chapter-index"><span>CHAPTER {String(index + 1).padStart(2, '0')}</span><i />{project.year}</div>
      <div className="chapter-heading">
        <p className="chapter-kicker">{project.role} · {project.year}</p>
        <h2 id={`${slug}-title`}>{project.title}<span className="chapter-period">.</span></h2>
        <p className="chapter-tagline">{project.tagline}</p>
      </div>
      <div className="chapter-scene">
        <SceneArt slug={slug} />
        {isCity ? (
          <div className="scene-note scene-note--story">
            <div className="scene-caption"><span>01 / THE QUESTION</span><p>{hook}</p></div>
            <div className="scene-caption"><span>02 / THE FRICTION</span><p>A seat can turn on the identity of one neighbourhood.</p></div>
            <div className="scene-caption"><span>03 / THE TURN</span><p>Build a population that reflects the city, then test it against real results.</p></div>
            <div className="scene-progress" aria-hidden="true"><i /></div>
            <span className="scene-scroll-cue">SCROLL TO FOLLOW THE LINE ↓</span>
          </div>
        ) : <div className="scene-note"><span>THE QUESTION</span><p>{hook}</p></div>}
      </div>
      <div className="chapter-story">
        <article className="story-beat story-beat--tension">
          <span className="beat-label">01 / THE FRICTION</span><h3>Why this was hard</h3><p>{tension}</p>
        </article>
        <article className="story-beat story-beat--decision">
          <span className="beat-label">02 / THE CHOICE</span><h3>What I built</h3><p>{decision}</p>
        </article>
        <article className="story-beat story-beat--proof">
          <span className="beat-label">03 / THE PROOF</span><h3>What came out of it</h3><p>{project.outcome}</p>
          <div className="chapter-meta"><span>{project.role}</span><span>{project.stack.slice(0, 4).join(' · ')}</span></div>
          {project.links?.map((link) => <a className="chapter-link" key={link.href} href={link.href} target="_blank" rel="noreferrer">Explore the build <span aria-hidden>↗</span></a>)}
        </article>
      </div>
    </section>
  )
}

export default function StoryExperience() {
  const [openSideStory, setOpenSideStory] = useState<string | null>(null)
  const featured = FEATURED.map((slug) => projects.find((project) => project.slug === slug)).filter((project) => project !== undefined)
  const sideStories = projects.filter((project) => !FEATURED.includes(project.slug))

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(min-width: 961px) and (prefers-reduced-motion: no-preference)', () => {
      const hero = document.querySelector<HTMLElement>('.story-hero')
      const mark = hero?.querySelector<HTMLElement>('.hero-mark')
      const title = hero?.querySelector<HTMLElement>('h1')
      if (title) gsap.fromTo(title, { y: 54, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'power4.out' })
      if (hero && mark) {
        gsap.fromTo(mark, { scale: .72, autoAlpha: 0, rotation: -44 }, { scale: 1, autoAlpha: .78, rotation: -23, duration: 1.25, ease: 'power3.out' })
        gsap.to(mark, { rotation: 66, yPercent: 22, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } })
      }

      const chapter = document.querySelector<HTMLElement>('.chapter--third-angle')
      const scene = chapter?.querySelector<HTMLElement>('.chapter-scene')
      const art = chapter?.querySelector<HTMLElement>('.story-art--city')
      const captions = chapter?.querySelectorAll<HTMLElement>('.scene-caption')
      const meter = chapter?.querySelector<HTMLElement>('.scene-progress i')
      if (!chapter || !scene || !art || !captions || captions.length !== 3 || !meter) return

      chapter.classList.add('has-scroll-story')
      gsap.context(() => {
      gsap.set(captions[1], { autoAlpha: 0, y: 24 })
      gsap.set(captions[2], { autoAlpha: 0, y: 24 })
      gsap.set(meter, { scaleX: 0, transformOrigin: 'left center' })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: 'center center',
          end: '+=210%',
          pin: true,
          scrub: .7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      timeline.fromTo(art,
        { clipPath: 'inset(9% 10%)', scale: .94 },
        { clipPath: 'inset(0% 0%)', scale: 1, duration: .8, ease: 'power2.out' }, 0)

      const road = chapter.querySelector<SVGPathElement>('.city-road')
      const districts = chapter.querySelector<SVGPathElement>('.city-district')
      ;[road, districts].forEach((path) => {
        if (!path) return
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        timeline.to(path, { strokeDashoffset: 0, duration: path === road ? 1.35 : .9, ease: 'none' }, path === road ? .15 : 1.35)
      })

      const points = chapter.querySelectorAll<SVGCircleElement>('.city-point')
      timeline.fromTo(points,
        { scale: 0, autoAlpha: 0, transformOrigin: 'center center' },
        { scale: 1, autoAlpha: 1, stagger: .014, duration: .7, ease: 'back.out(1.5)' }, 1.95)
      timeline.fromTo(chapter.querySelectorAll('.city-focus'),
        { scale: .55, autoAlpha: 0, transformOrigin: '310px 276px' },
        { scale: 1, autoAlpha: .9, stagger: .18, duration: .65, ease: 'power2.out' }, 2.45)

      timeline.to(captions[0], { autoAlpha: 0, y: -22, duration: .4 }, 1.05)
      timeline.to(captions[1], { autoAlpha: 1, y: 0, duration: .4 }, 1.18)
      timeline.to(captions[1], { autoAlpha: 0, y: -22, duration: .4 }, 2.35)
      timeline.to(captions[2], { autoAlpha: 1, y: 0, duration: .4 }, 2.48)
      timeline.to(meter, { scaleX: 1, duration: 3.1, ease: 'none' }, 0)
      }, chapter)

      const refresh = () => ScrollTrigger.refresh()
      document.fonts.ready.then(refresh)
      return () => chapter.classList.remove('has-scroll-story')
    })
    return () => media.revert()
  }, [])

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.reveal')
    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="story-world" id="top">
      <div className="story-grain" aria-hidden />
      <header className="story-nav">
        <a className="story-mark" href="#top" aria-label="Tilak Khatua, back to start">TK<span>®</span></a>
        <nav aria-label="Main navigation">
          <a href="#chapters">The work</a><a href="#side-stories">Side stories</a><a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="story-hero" aria-labelledby="hero-title">
        <div className="hero-issue">FIELD NOTES · 2024—2026 <span>VOL. 001</span></div>
        <div className="hero-mark" aria-hidden><i /><i /><i /></div>
        <p className="hero-overline">A collection of difficult questions</p>
        <h1 id="hero-title">Tilak<br /><em>Khatua</em></h1>
        <div className="hero-baseline"><span>Design · Machine Learning · Systems</span><span>Scroll to enter ↓</span></div>
        <p className="hero-intro">I build tools for problems that do not fit inside a template.</p>
        <div className="hero-actions"><a className="action-primary" href="#chapters">Enter the story <span aria-hidden>↘</span></a><a className="action-secondary" href="#contact">Start a conversation</a></div>
        <span className="hero-vertical" aria-hidden>DESIGN / INFERENCE / INFRASTRUCTURE</span>
      </section>

      <section className="story-premise reveal" id="chapters">
        <span className="section-label">PROLOGUE · THREE OPEN QUESTIONS</span>
        <h2>Every build begins<br />where the easy answer ends.</h2>
        <p>One city. A thousand signals. A model that needs to know when it is unsure. Three different worlds, connected by the same instinct: understand the problem before reaching for a solution.</p>
        <div className="chapter-shortcuts">{featured.map((project, i) => <a key={project.slug} href={`#${project.slug}`}><span>0{i + 1}</span>{project.title}<b aria-hidden>↘</b></a>)}</div>
      </section>

      {featured.map((project, index) => <Chapter key={project.slug} slug={project.slug} index={index} />)}

      <section className="side-stories reveal" id="side-stories">
        <div className="side-heading"><span className="section-label">INTERLUDE · OTHER WORLDS</span><h2>Side stories<span>.</span></h2><p>Different questions, smaller chapters.</p></div>
        <div className="side-list">
          {sideStories.map((project, index) => {
            const open = openSideStory === project.slug
            return (
              <article className={`side-card${open ? ' is-open' : ''}`} key={project.slug}>
                <button aria-expanded={open} onClick={() => setOpenSideStory(open ? null : project.slug)}>
                  <span className="side-number">0{index + 4}</span><span className="side-title">{project.title}</span><span className="side-tag">{project.tagline}</span><span className="side-toggle" aria-hidden>{open ? '−' : '+'}</span>
                </button>
                {open && <div className="side-detail"><p>{project.summary}</p><p>{project.outcome}</p><div>{project.stack.slice(0, 5).map((item) => <span key={item}>{item}</span>)}</div>{project.links?.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>}
              </article>
            )
          })}
        </div>
      </section>

      <section className="story-contact reveal" id="contact">
        <div className="contact-orbit" aria-hidden><i /><i /><i /></div>
        <span className="section-label">EPILOGUE · YOUR TURN</span>
        <h2>What are you<br /><em>trying to solve?</em></h2>
        <p>Have a difficult question, an interesting system, or a project that needs a thoughtful first pass? Send me a signal.</p>
        <div className="story-contact-grid"><Contact /><div className="contact-aside"><span>ELSEWHERE</span>{LINKS.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}<a href="mailto:tilakkhatua01@gmail.com">Email directly ↗</a></div></div>
      </section>
      <footer className="story-footer"><span>© {new Date().getFullYear()} Tilak Khatua</span><span>Design · Machine Learning · Systems</span><a href="#top">Back to the beginning ↑</a></footer>
    </main>
  )
}
