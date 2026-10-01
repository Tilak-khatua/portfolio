import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import emailjs from '@emailjs/browser'
import { projects, type Project } from '../../data/projects'
import ProjectCanvas from './ProjectCanvas'
import './editorial.css'

gsap.registerPlugin(ScrollTrigger)

const EMAILJS = {
  key: 'U-r5XsJ_RAo2elvRv',
  service: 'service_oqeswp6',
  template: 'template_c8l3l9a',
}

const ACCENT: Record<string, string> = {
  hot: '#b0392a',
  cyan: '#2e7f78',
  lime: '#71902f',
  violet: '#7a5fa6',
}

const MANIFESTO =
  'I don\u2019t ship templates. I build the thing a problem actually deserves \u2014 a synthetic electorate that votes, a threat graph that explains itself, a review loop that learns from its own uncertainty. What follows are six case files from 2024 to 2026: design obsessive, systems-first, occasionally unhinged.'

/* ------------------------------------------------------------------ loader */

function Loader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const ctx = gsap.context(() => {
      gsap.timeline()
        .from('.ed-loader-rule i', { scaleX: 0, duration: 0.9, ease: 'power2.inOut' }, 0.35)
        .from('.ed-loader-name', { yPercent: 115, autoAlpha: 0, duration: 0.9, ease: 'power4.out' }, 0.15)
        .from('.ed-loader-kicker', { y: 10, autoAlpha: 0, duration: 0.6 }, 0.55)

      Promise.race([
        document.fonts.ready,
        new Promise((r) => window.setTimeout(r, 1600)),
      ])
        .then(() => new Promise((r) => window.setTimeout(r, 380)))
        .then(() => {
          if (cancelled) return
          gsap.timeline({ onComplete: onDone })
            .to('.ed-loader-inner', { yPercent: -40, autoAlpha: 0, duration: 0.45, ease: 'power2.in' })
            .to(ref.current, { yPercent: -101, duration: 1, ease: 'power4.inOut' }, '-=0.15')
        })
    }, ref)
    return () => { cancelled = true; ctx.revert() }
  }, [onDone])

  return (
    <div className="ed-loader" ref={ref} aria-hidden>
      <div className="ed-loader-inner">
        <span className="ed-kicker ed-loader-kicker">Design &middot; Machine Learning &middot; Systems</span>
        <span className="ed-loader-mask"><span className="ed-loader-name">Tilak Khatua</span></span>
        <div className="ed-loader-rule"><i /></div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ word reveal */

function RevealWords({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('.ed-rw')
      gsap.set(words, { opacity: 0.16 })
      gsap.to(words, {
        opacity: 1,
        stagger: 0.55,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 55%', scrub: 0.6 },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <p className="ed-manifesto-text" ref={ref}>
      {text.split(' ').map((w, i) => (
        <span className="ed-rw" key={i}>{w}</span>
      ))}
    </p>
  )
}

/* -------------------------------------------------------------- dossier panels */

function CoverPanel({ p, index }: { p: Project; index: number }) {
  const nn = String(index + 1).padStart(2, '0')
  return (
    <div className="dp dp--cover" style={{ '--accent': ACCENT[p.accent] ?? ACCENT.hot } as React.CSSProperties}>
      <div className="dp-cover-text">
        <span className="dp-num"><b>{nn}</b><s>/</s>{String(projects.length).padStart(2, '0')}</span>
        <h2 className="dp-title">{p.title}</h2>
        <p className="dp-tag">{p.tagline}</p>
        <ul className="dp-stack">
          {p.stack.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <div className="dp-year">{p.year} &middot; {p.role}</div>
      </div>
      <div className="dp-art">
        <span className="dp-halftone" aria-hidden />
        <ProjectCanvas geometry={p.geometry} accent={p.accent} />
        <span className="dp-key" aria-hidden>
          {p.keyword[0]}
          {p.keyword[1] && <em>{p.keyword[1]}</em>}
        </span>
        <span className="dp-burst" aria-hidden><i>{nn}</i></span>
        <span className="dp-file">{p.filename}</span>
      </div>
    </div>
  )
}

function CasePanel({ p }: { p: Project }) {
  return (
    <div className="dp dp--case" style={{ '--accent': ACCENT[p.accent] ?? ACCENT.hot } as React.CSSProperties}>
      <header className="dp-case-head">
        <span className="ed-kicker">The Case of {p.title}</span>
        <i className="dp-case-sep" />
      </header>
      <div className="dp-cells">
        <article>
          <span className="dp-tab">I &mdash; The Problem</span>
          <p>{p.problem}</p>
        </article>
        <article>
          <span className="dp-tab">II &mdash; How It Was Built</span>
          <p>{p.process}</p>
        </article>
        <article>
          <span className="dp-tab">III &mdash; What It Proved</span>
          <p>{p.outcome}</p>
        </article>
        <article className="dp-cell--dossier">
          <span className="dp-tab">IV &mdash; The Dossier</span>
          <p className="dp-sum">{p.summary}</p>
          {p.links && p.links.length > 0 && (
            <div className="dp-links">
              {p.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label} &nearr;</a>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- form */

type FormStatus = 'idle' | 'sending' | 'sent' | 'error'

function EdForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [error, setError] = useState('')
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    emailjs.init(EMAILJS.key)
  }, [])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error'); setError('All three, please.'); return
    }
    setStatus('sending'); setError('')
    try {
      await emailjs.send(EMAILJS.service, EMAILJS.template, {
        from_name: name, from_email: email, message,
      })
      setStatus('sent')
    } catch {
      setStatus('error'); setError('That did not send. Mail me at tilakkhatua01@gmail.com.')
    }
  }

  const locked = status === 'sending' || status === 'sent'

  return (
    <form className="ed-form" onSubmit={send}>
      <label className="ed-field">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} disabled={locked} autoComplete="name" />
      </label>
      <label className="ed-field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={locked} autoComplete="email" />
      </label>
      <label className="ed-field">
        <span>Message</span>
        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} disabled={locked} />
      </label>
      {status === 'error' && <p className="ed-form-note is-error" role="alert">{error}</p>}
      {status === 'sent' && <p className="ed-form-note" role="status">Sent. I&rsquo;ll reply soon.</p>}
      <button className="ed-submit" type="submit" disabled={locked}>
        {status === 'sending' ? 'sending\u2026' : status === 'sent' ? 'sent \u2713' : 'send it \u2192'}
      </button>
    </form>
  )
}

/* ------------------------------------------------------------------- root */

export default function Editorial() {
  const [loaded, setLoaded] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const hSectionRef = useRef<HTMLElement>(null)
  const hTrackRef = useRef<HTMLDivElement>(null)
  const hTriggerRef = useRef<ScrollTrigger | null>(null)

  const finish = useCallback(() => setLoaded(true), [])

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: 0, duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const scrollToProject = useCallback((i: number) => {
    const st = hTriggerRef.current
    const lenis = lenisRef.current
    const track = hTrackRef.current
    if (!st || !lenis || !track) return
    const child = track.children[i * 2] as HTMLElement | undefined
    const x = child ? child.offsetLeft : i * 2 * window.innerWidth
    const max = st.end - st.start - 2
    lenis.scrollTo(st.start + Math.min(x, max), { duration: 2 })
  }, [])

  /* horizontal pinned panels */
  useEffect(() => {
    if (!loaded) return
    const ctx = gsap.context(() => {
      const track = hTrackRef.current
      const section = hSectionRef.current
      if (!track || !section) return
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: (self) => { hTriggerRef.current = self },
          onUpdate: (self) => {
            const i = Math.min(projects.length - 1, Math.floor(self.progress * projects.length))
            document.querySelectorAll<HTMLElement>('.ed-rail-dot')
              .forEach((d) => d.classList.toggle('is-active', d.dataset.index === String(i)))
          },
        },
      })
      tl.to(track, { x: () => -dist(), ease: 'none', duration: 1 })
      tl.fromTo('.dp-key', { xPercent: 7 }, { xPercent: -7, ease: 'none', duration: 1 }, 0)
      tl.fromTo('.dp-burst', { rotation: -14 }, { rotation: 6, ease: 'none', duration: 1 }, 0)
      tl.fromTo('.dp-progress i', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0)
    }, rootRef)
    return () => ctx.revert()
  }, [loaded])

  /* page furniture */
  useEffect(() => {
    if (!loaded) return
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ delay: 0.08 })
      t.from('.ed-cover .ed-kicker', { y: 16, autoAlpha: 0, duration: 0.7 })
        .from('.ed-mask > *', { yPercent: 112, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, '<0.15')
        .from('.ed-cover-rule', { scaleX: 0, duration: 0.8, ease: 'power3.inOut' }, '-=0.5')
        .from('.ed-cover-sub', { y: 20, autoAlpha: 0, duration: 0.8 }, '-=0.35')
        .from('.ed-cover-meta li', { y: 12, autoAlpha: 0, stagger: 0.09, duration: 0.5 }, '-=0.5')
        .from('.ed-cover-cue', { autoAlpha: 0, duration: 0.8 }, '<')

      gsap.timeline({
        scrollTrigger: { trigger: '.ed-cover', start: 'top top', end: '+=70%', scrub: 1 },
      })
        .to('.ed-cover-inner, .ed-cover-cue', { y: -90, autoAlpha: 0, ease: 'none' })
        .fromTo('.ed-cover', { clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 14% 0)', ease: 'none' }, 0)

      /* cinematic curtain wipes on section entry */
      gsap.utils.toArray<HTMLElement>('.ed-wipe').forEach((el) => {
        gsap.from(el, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.1,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      })

      gsap.utils.toArray<HTMLElement>('.ed-fade').forEach((el) => {
        gsap.from(el, {
          y: 36, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%' },
        })
      })

      gsap.from('.ed-con-rows li', {
        y: 24, autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.ed-contents', start: 'top 70%' },
      })

      gsap.from('.ed-end > *', {
        y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.ed-contact', start: 'top 72%' },
      })

      gsap.to('.ed-progress', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.4 },
      })

      ScrollTrigger.refresh()
      document.fonts.ready.then(() => ScrollTrigger.refresh())
    }, rootRef)
    return () => ctx.revert()
  }, [loaded])

  return (
    <div className="ed" ref={rootRef}>
      {!loaded && <Loader onDone={finish} />}

      <div className="ed-grain" aria-hidden />
      <div className="ed-progress" aria-hidden><i /></div>

      <nav className="ed-nav">
        <button className="ed-nav-name" onClick={() => scrollTo('top')}>Tilak&nbsp;Khatua</button>
        <div className="ed-nav-links">
          <button onClick={() => scrollTo('premise')}>Premise</button>
          <button onClick={() => scrollTo('contents')}>Dossiers</button>
          <button onClick={() => scrollTo('contact')}>Contact</button>
        </div>
      </nav>

      <nav className="ed-rail" aria-label="Chapters">
        {projects.map((p, i) => (
          <button
            key={p.slug}
            className="ed-rail-dot"
            data-index={i}
            title={p.title}
            onClick={() => scrollToProject(i)}
            aria-label={p.title}
          ><i /></button>
        ))}
      </nav>

      {/* cover */}
      <section className="ed-cover" id="top">
        <span className="ed-cover-halftone" aria-hidden />
        <div className="ed-cover-box" aria-hidden>
          <span>Six&nbsp;Dossiers</span>
          <span className="ed-cover-box-sep" />
          <span>2024&mdash;2026</span>
        </div>
        <div className="ed-cover-inner">
          <span className="ed-kicker">Portfolio &middot; Case Files 2024&mdash;2026</span>
          <h1 className="ed-cover-title">
            <span className="ed-mask"><span>Tilak</span></span>
            <span className="ed-mask"><span><em>Khatua</em></span></span>
          </h1>
          <div className="ed-cover-rule"><i className="ed-diamond" /></div>
          <p className="ed-cover-sub">
            Somewhere between a UI/UX sorcerer and an ML apprentice who googled
            &ldquo;what is gradient descent&rdquo; at 2am. Makes things pretty.
            Makes things think. Mostly makes things.
          </p>
          <ul className="ed-cover-meta">
            <li>Design</li><li>Machine Learning</li><li>Systems</li>
          </ul>
        </div>
        <div className="ed-cover-cue" role="presentation">
          <span className="ed-cue-burst"><i>Scroll</i></span>
          <span className="ed-cue-word">turn the page</span>
        </div>
      </section>

      {/* premise */}
      <section className="ed-manifesto" id="premise">
        <span className="ed-kicker">The Premise</span>
        <h2 className="ed-fade">Design obsessive.<br /><em>Systems first.</em></h2>
        <RevealWords text={MANIFESTO} />
        <dl className="ed-fade ed-manifesto-spec">
          <div><dt>Based</dt><dd>India &rarr; everywhere the work is</dd></div>
          <div><dt>Discipline</dt><dd>Interface, inference, infrastructure</dd></div>
          <div><dt>Files</dt><dd>Six dossiers, 2024&mdash;2026</dd></div>
        </dl>
      </section>

      {/* contents */}
      <section className="ed-contents ed-wipe" id="contents">
        <span className="ed-kicker">Contents</span>
        <h2 className="ed-fade">The Dossiers</h2>
        <ol className="ed-con-rows">
          {projects.map((p, i) => (
            <li key={p.slug} style={{ '--accent': ACCENT[p.accent] ?? ACCENT.hot } as React.CSSProperties}>
              <button onClick={() => scrollToProject(i)}>
                <span className="ed-con-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="ed-con-t">{p.title}</span>
                <span className="ed-con-tag">{p.tagline}</span>
                <span className="ed-con-y">{p.year}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="ed-con-hint">Then keep scrolling &mdash; the panels run sideways.</p>
      </section>

      {/* dossiers — horizontal comic panels */}
      <section className="ed-dossiers" ref={hSectionRef} id="dossiers">
        <div className="ed-track" ref={hTrackRef}>
          {projects.flatMap((p, i) => [
            <CoverPanel key={`${p.slug}-cover`} p={p} index={i} />,
            <CasePanel key={`${p.slug}-case`} p={p} />,
          ])}
        </div>
        <div className="ed-dossier-label" aria-hidden>
          <span>The Dossiers</span>
          <i className="ed-arrow" />
        </div>
        <div className="dp-progress" aria-hidden><i /></div>
      </section>

      {/* contact */}
      <section className="ed-contact" id="contact">
        <div className="ed-end">
          <span className="ed-kicker">Fin</span>
          <h2 className="ed-end-title">Say <em>something.</em></h2>
          <p className="ed-end-sub">
            The last page &mdash; not the end of the story. Leave a signal;
            I read everything that lands here.
          </p>
          <a className="ed-end-mail" href="mailto:tilakkhatua01@gmail.com">tilakkhatua01@gmail.com</a>
          <EdForm />
          <div className="ed-end-links">
            <a href="https://github.com/Tilak-khatua" target="_blank" rel="noreferrer">GitHub &nearr;</a>
            <a href="https://www.linkedin.com/in/tilak-kumar-khatua-2b966437a" target="_blank" rel="noreferrer">LinkedIn &nearr;</a>
          </div>
        </div>
        <footer className="ed-foot">
          <span>&copy; {new Date().getFullYear()} Tilak Khatua</span>
          <span>Written, designed &amp; built by hand</span>
          <span>React &middot; TypeScript &middot; GSAP &middot; Three.js</span>
        </footer>
      </section>
    </div>
  )
}
