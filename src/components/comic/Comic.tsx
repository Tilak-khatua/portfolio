import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import emailjs from '@emailjs/browser'
import { projects, type Project } from '../../data/projects'
import ComicArtPanel from './ComicArtPanel'
import './comic.css'

gsap.registerPlugin(ScrollTrigger)

const EMAILJS = {
  key: 'U-r5XsJ_RAo2elvRv',
  service: 'service_oqeswp6',
  template: 'template_c8l3l9a',
}

const ACCENT: Record<string, string> = {
  hot: '#e63946',
  cyan: '#2d8f8f',
  lime: '#71902f',
  violet: '#7a5fa6',
}

const NARRATIONS = [
  'MEANWHILE\u2026 In a city of 20 million voters, one question no model could answer: what if you could simulate an entire electorate?',
  'LATER THAT NIGHT\u2026 The threat hunter stared at 14 open tabs. The dark web stared back. Someone needed a map.',
  'THE NEXT MORNING\u2026 An AI was making decisions it had no business making \u2014 confidently, catastrophically wrong.',
  'FLASHBACK\u2026 The 47th \u201cquick data question\u201d sat unanswered in Slack. The analyst was on vacation. Again.',
  'CUT TO\u2026 A brand worth millions, dressed in a twelve-dollar template. Something had to give.',
  'ORIGIN STORY\u2026 Before the clients and the chaos \u2014 just a developer, a terminal, and a question: what does durability actually mean?',
]

const SFX = ['VOTE!', 'SCAN!', 'ROUTE!', 'QUERY!', 'CRAFT!', 'FSYNC!']

const MANIFESTO =
  'I don\u2019t ship templates. I build the thing a problem actually deserves \u2014 a synthetic electorate that votes, a threat graph that explains itself, a review loop that learns from its own uncertainty. What follows are six issues from 2024 to 2026: design obsessive, systems-first, occasionally unhinged.'

function Loader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const ctx = gsap.context(() => {
      gsap.timeline()
        .fromTo('.cb-loader-issue',
          { scale: 0, rotation: -12, autoAlpha: 0 },
          { scale: 1, rotation: -2, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.7)' }, 0.1)
        .fromTo('.cb-loader-rule i',
          { scaleX: 0, autoAlpha: 0 },
          { scaleX: 1, autoAlpha: 1, duration: 0.9, ease: 'power2.inOut' }, 0.25)
        .fromTo('.cb-loader-name',
          { yPercent: 115, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 1, ease: 'power4.out' }, 0.1)

      const fontsReady = Promise.all([
        document.fonts.load('1em Bangers'),
        document.fonts.ready,
      ])
      Promise.race([fontsReady, new Promise((r) => window.setTimeout(r, 1400))])
        .then(() => new Promise((r) => window.setTimeout(r, 250)))
        .then(() => {
          if (cancelled) return
          onDone()
          gsap.timeline()
            .to('.cb-loader-inner', { yPercent: -40, autoAlpha: 0, duration: 0.45, ease: 'power2.in' })
            .to(ref.current, { yPercent: -101, duration: 0.9, ease: 'power4.inOut' }, '-=0.15')
            .set(ref.current, { display: 'none' })
        })
    }, ref)
    return () => { cancelled = true; ctx.revert() }
  }, [onDone])

  return (
    <div className="cb-loader" ref={ref} aria-hidden>
      <div className="cb-loader-inner">
        <span className="cb-loader-issue">Issue #001 &middot; First Appearance</span>
        <span className="cb-loader-mask"><span className="cb-loader-name">Tilak Khatua</span></span>
        <div className="cb-loader-rule"><i /></div>
      </div>
    </div>
  )
}

function RevealWords({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('.cb-rw')
      gsap.set(words, { opacity: 0.14 })
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
    <p className="cb-origin-text" ref={ref}>
      {text.split(' ').map((w, i) => (
        <span className="cb-rw" key={i}>{w}</span>
      ))}
    </p>
  )
}

function SplashPanel({ p, index }: { p: Project; index: number }) {
  const nn = String(index + 1).padStart(2, '0')
  return (
    <div className="cb-panel cb-splash" style={{ '--accent': ACCENT[p.accent] ?? ACCENT.hot } as React.CSSProperties}>
      <div className="cb-splash-text">
        <span className="cb-splash-issue">Issue #{nn}</span>
        <h2 className="cb-splash-title">{p.title}</h2>
        <p className="cb-splash-tag">{p.tagline}</p>
        <div className="cb-splash-narration">{NARRATIONS[index]}</div>
        <ul className="cb-splash-stack">
          {p.stack.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <div className="cb-splash-year">{p.year} &middot; {p.role}</div>
      </div>
      <div className="cb-splash-art">
        <ComicArtPanel sfx={SFX[index]} accent={p.accent} keywords={p.keyword} />
        <span className="cb-splash-burst" aria-hidden><i>{nn}</i></span>
        <span className="cb-splash-file">{p.filename}</span>
      </div>
    </div>
  )
}

function StoryPanel({ p }: { p: Project }) {
  return (
    <div className="cb-panel cb-story" style={{ '--accent': ACCENT[p.accent] ?? ACCENT.hot } as React.CSSProperties}>
      <header className="cb-story-head">
        <span className="cb-kicker">The Case of {p.title}</span>
        <i className="cb-story-sep" />
      </header>
      <div className="cb-story-grid">
        <article className="cb-cell">
          <span className="cb-cell-label">I &mdash; The Threat</span>
          <p>{p.problem}</p>
        </article>
        <article className="cb-cell">
          <span className="cb-cell-label">II &mdash; The Strategy</span>
          <p>{p.process}</p>
        </article>
        <article className="cb-cell">
          <span className="cb-cell-label">III &mdash; The Battle</span>
          <p>{p.outcome}</p>
        </article>
        <article className="cb-cell">
          <span className="cb-cell-label">IV &mdash; Resolution</span>
          <p className="cb-cell-sum">{p.summary}</p>
          {p.links && p.links.length > 0 && (
            <div className="cb-cell-links">
              {p.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label} &nearr;</a>
              ))}
            </div>
          )}
          <span className="cb-stamp" aria-hidden>CASE CLOSED</span>
        </article>
      </div>
    </div>
  )
}

type FormStatus = 'idle' | 'sending' | 'sent' | 'error'

function ComicForm() {
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
    <form className="cb-form" onSubmit={send}>
      <label className="cb-field">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} disabled={locked} autoComplete="name" />
      </label>
      <label className="cb-field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={locked} autoComplete="email" />
      </label>
      <label className="cb-field">
        <span>Message</span>
        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} disabled={locked} />
      </label>
      {status === 'error' && <p className="cb-form-note is-error" role="alert">{error}</p>}
      {status === 'sent' && <p className="cb-form-note" role="status">Sent. I&rsquo;ll reply soon.</p>}
      <button className="cb-submit" type="submit" disabled={locked}>
        {status === 'sending' ? 'sending\u2026' : status === 'sent' ? 'sent \u2713' : 'send it \u2192'}
      </button>
    </form>
  )
}

export default function Comic() {
  const [loaded, setLoaded] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const hSectionRef = useRef<HTMLElement>(null)
  const hTrackRef = useRef<HTMLDivElement>(null)
  const hTriggerRef = useRef<ScrollTrigger | null>(null)

  const finish = useCallback(() => setLoaded(true), [])

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, touchMultiplier: 1.6 })
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

  useEffect(() => {
    if (!loaded) return
    const ctx = gsap.context(() => {
      const track = hTrackRef.current
      const section = hSectionRef.current
      if (!track || !section) return

      // On mobile CSS collapses to vertical — skip pinning entirely
      if (window.innerWidth <= 960) return

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
        },
      })
      tl.to(track, { x: () => -dist(), ease: 'none', duration: 1 })
      tl.fromTo('.cb-splash-burst', { rotation: -14 }, { rotation: 6, ease: 'none', duration: 1 }, 0)
      tl.fromTo('.cb-issue-progress i', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0)
    }, rootRef)
    return () => ctx.revert()
  }, [loaded])

  useEffect(() => {
    if (!loaded) return
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ delay: 0.02 })
      t.from('.cb-cover-badges', { y: 12, autoAlpha: 0, duration: 0.6, ease: 'power3.out' })
        .from('.cb-cover-issue-box', { scale: 0, rotation: -12, duration: 0.6, ease: 'back.out(1.7)' }, '<0.1')
        .from('.cb-cover-seal', { scale: 0, rotation: 20, duration: 0.6, ease: 'back.out(1.7)' }, '<0.15')
        .from('.cb-cover .cb-cover-kicker', { y: 16, autoAlpha: 0, duration: 0.7 }, '<0.2')
        .from('.cb-mask > *', { yPercent: 112, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, '<0.15')
        .from('.cb-cover-rule', { scaleX: 0, duration: 0.8, ease: 'power3.inOut' }, '-=0.5')
        .from('.cb-cover-sub', { y: 20, autoAlpha: 0, duration: 0.8 }, '-=0.35')
        .from('.cb-cover-meta li', { y: 12, autoAlpha: 0, stagger: 0.09, duration: 0.5 }, '-=0.5')

      gsap.timeline({
        scrollTrigger: { trigger: '.cb-cover', start: 'top top', end: '+=70%', scrub: 1 },
      })
        .to('.cb-cover-inner', { y: -90, autoAlpha: 0, ease: 'none' })
        .fromTo('.cb-cover', { clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 14% 0)', ease: 'none' }, 0)

      gsap.utils.toArray<HTMLElement>('.cb-wipe').forEach((el) => {
        gsap.from(el, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.1,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      })

      gsap.utils.toArray<HTMLElement>('.cb-fade').forEach((el) => {
        gsap.from(el, {
          y: 36, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%' },
        })
      })

      gsap.from('.cb-con-rows li', {
        y: 24, autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.cb-contents', start: 'top 70%' },
      })

      gsap.from('.cb-end > *', {
        y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.cb-contact', start: 'top 72%' },
      })

      gsap.to('.cb-progress', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.4 },
      })

      ScrollTrigger.refresh()
      document.fonts.ready.then(() => ScrollTrigger.refresh())
    }, rootRef)
    return () => ctx.revert()
  }, [loaded])

  return (
    <div className="cb" ref={rootRef}>
      <Loader onDone={finish} />

      <div className="cb-grain" aria-hidden />
      <div className="cb-progress" aria-hidden><i /></div>

      <nav className="cb-nav">
        <button className="cb-nav-name" onClick={() => scrollTo('top')}>Tilak&nbsp;Khatua</button>
        <div className="cb-nav-links">
          <button onClick={() => scrollTo('origin')}>Origin</button>
          <button onClick={() => scrollTo('contents')}>Issues</button>
          <button onClick={() => scrollTo('contact')}>Contact</button>
        </div>
      </nav>

      <section className="cb-cover" id="top">
        <span className="cb-cover-halftone" aria-hidden />
        <div className="cb-cover-inner">
          <div className="cb-cover-badges">
            <div className="cb-cover-issue-box">
              <span>Issue #001</span>
              <span>First Appearance</span>
            </div>
            <div className="cb-cover-seal">
              <i>Portfolio<br/>Authority<br/>Seal</i>
            </div>
          </div>
          <span className="cb-cover-kicker">The Chronicles &middot; 2024&mdash;2026</span>
          <h1 className="cb-cover-title">
            <span className="cb-mask"><span>Tilak</span></span>
            <span className="cb-mask"><span><em>Khatua</em></span></span>
          </h1>
          <div className="cb-cover-rule"><i /></div>
          <p className="cb-cover-sub">
            Somewhere between a UI/UX sorcerer and an ML apprentice who googled
            &ldquo;what is gradient descent&rdquo; at 2am. Makes things pretty.
            Makes things think. Mostly makes things.
          </p>
          <ul className="cb-cover-meta">
            <li>Design</li><li>Machine Learning</li><li>Systems</li>
          </ul>
        </div>
      </section>

      <section className="cb-origin" id="origin">
        <span className="cb-kicker">The Origin Story</span>
        <h2 className="cb-fade">Design obsessive.<br /><em>Systems first.</em></h2>
        <RevealWords text={MANIFESTO} />
        <dl className="cb-fade cb-origin-spec">
          <div><dt>Based</dt><dd>India &rarr; everywhere the work is</dd></div>
          <div><dt>Discipline</dt><dd>Interface, inference, infrastructure</dd></div>
          <div><dt>Files</dt><dd>Six issues, 2024&mdash;2026</dd></div>
        </dl>
      </section>

      <section className="cb-contents cb-wipe" id="contents">
        <span className="cb-kicker">Contents</span>
        <h2 className="cb-fade">The Issues</h2>
        <ol className="cb-con-rows">
          {projects.map((p, i) => (
            <li key={p.slug} style={{ '--accent': ACCENT[p.accent] ?? ACCENT.hot } as React.CSSProperties}>
              <button onClick={() => scrollToProject(i)}>
                <span className="cb-con-n">#{String(i + 1).padStart(2, '0')}</span>
                <span className="cb-con-t">{p.title}</span>
                <span className="cb-con-tag">{p.tagline}</span>
                <span className="cb-con-y">{p.year} &middot; {p.role}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="cb-con-hint">Keep scrolling &mdash; the panels run sideways &rarr;</p>
      </section>

      <section className="cb-issues" ref={hSectionRef} id="issues">
        <div className="cb-track" ref={hTrackRef}>
          {projects.flatMap((p, i) => [
            <SplashPanel key={`${p.slug}-splash`} p={p} index={i} />,
            <StoryPanel key={`${p.slug}-story`} p={p} />,
          ])}
        </div>
        <div className="cb-issue-label" aria-hidden>
          <span>The Issues</span>
          <i className="cb-arrow" />
        </div>
        <div className="cb-issue-progress" aria-hidden><i /></div>
      </section>

      <section className="cb-contact" id="contact">
        <div className="cb-end">
          <span className="cb-kicker">To Be Continued&hellip;</span>
          <h2 className="cb-end-title">Say <em>something.</em></h2>
          <p className="cb-end-sub">
            The last page &mdash; not the end of the story. Leave a signal;
            I read everything that lands here.
          </p>
          <a className="cb-end-mail" href="mailto:tilakkhatua01@gmail.com">tilakkhatua01@gmail.com</a>
          <ComicForm />
          <div className="cb-end-links">
            <a href="https://github.com/Tilak-khatua" target="_blank" rel="noreferrer">GitHub &nearr;</a>
            <a href="https://www.linkedin.com/in/tilak-kumar-khatua-2b966437a" target="_blank" rel="noreferrer">LinkedIn &nearr;</a>
          </div>
        </div>
        <footer className="cb-foot">
          <span>&copy; {new Date().getFullYear()} Tilak Khatua</span>
          <span>Written, designed &amp; built by hand</span>
          <span>React &middot; TypeScript &middot; GSAP &middot; Three.js</span>
        </footer>
      </section>
    </div>
  )
}
