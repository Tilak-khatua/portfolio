import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import emailjs from '@emailjs/browser'
import { projects } from '../../data/projects'
import './systems.css'

gsap.registerPlugin(ScrollTrigger)

const EMAILJS = {
  key: 'U-r5XsJ_RAo2elvRv',
  service: 'service_oqeswp6',
  template: 'template_c8l3l9a',
}

const MANIFESTO =
  'I don\u2019t ship templates. I build the thing a problem actually deserves \u2014 a synthetic electorate that votes, a threat graph that explains itself, a review loop that learns from its own uncertainty. Six case files. 2024 to 2026. Design obsessive. Systems first. Occasionally unhinged.'

/* ================================================================== LOADER */

function Loader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let cancelled = false
    const tl = gsap.timeline()
    tl.from('.l-rule', { scaleX: 0, duration: 1, ease: 'power3.inOut' }, 0.4)
      .from('.l-name-mask', { yPercent: 100, duration: 1, ease: 'power4.out' }, 0.2)
      .from('.l-sub', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.8)
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1800))])
      .then(() => new Promise(r => setTimeout(r, 500)))
      .then(() => {
        if (cancelled) return
        gsap.timeline({ onComplete: onDone })
          .to('.l-inner', { yPercent: -50, autoAlpha: 0, duration: 0.5, ease: 'power2.in' })
          .to(ref.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.15')
      })
    return () => { cancelled = true; tl.kill() }
  }, [onDone])
  return (
    <div className="l" ref={ref}>
      <div className="l-inner">
        <span className="l-sub">Systems &middot; Design &middot; ML</span>
        <div className="l-name-mask"><span className="l-name">Tilak Khatua</span></div>
        <div className="l-rule" />
      </div>
    </div>
  )
}

/* ================================================================== ROOT */

export default function Systems() {
  const rootRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const [ready, setReady] = useState(false)
  const finish = useCallback(() => setReady(true), [])

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(raf); lenis.destroy() }
  }, [])

  useEffect(() => {
    if (!ready) return
    const el = rootRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      /* --- cover entrance --- */
      const cv = gsap.timeline({ delay: 0.15 })
      cv.from('.s-cover-name > span', { yPercent: 100, duration: 1, stagger: 0.12, ease: 'power4.out' })
        .from('.s-cover-rule', { scaleX: 0, duration: 0.8, ease: 'power3.inOut' }, '-=0.5')
        .from('.s-cover-sub', { y: 20, autoAlpha: 0, duration: 0.7 }, '-=0.3')
        .from('.s-cover-tags span', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.4 }, '-=0.3')
        .from('.s-cue', { autoAlpha: 0, duration: 0.6 }, '-=0.2')

      /* --- cover exit --- */
      gsap.to('.s-cover-inner', {
        y: -80, autoAlpha: 0, ease: 'none',
        scrollTrigger: { trigger: '.s-cover', start: 'top top', end: '+=50%', scrub: true },
      })

      /* --- manifesto word reveal --- */
      const mWords = el.querySelectorAll('.s-mani-text .w')
      if (mWords.length) {
        gsap.set(mWords, { opacity: 0.12 })
        gsap.to(mWords, {
          opacity: 1, stagger: 0.45, ease: 'none',
          scrollTrigger: { trigger: '.s-mani-text', start: 'top 80%', end: 'bottom 40%', scrub: 0.5 },
        })
      }

      /* --- fade ins --- */
      gsap.utils.toArray<HTMLElement>('.s-fade').forEach(e => {
        gsap.from(e, { y: 30, autoAlpha: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: e, start: 'top 85%' } })
      })

      /* --- project sections --- */
      gsap.utils.toArray<HTMLElement>('.s-proj').forEach(sec => {
        // text reveals
        const reveals = sec.querySelectorAll('.s-r')
        gsap.set(reveals, { y: 40, autoAlpha: 0 })
        gsap.to(reveals, {
          y: 0, autoAlpha: 1, stagger: 0.12, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: sec, start: 'top 65%', toggleActions: 'play none none reverse' },
        })

        // word-by-word story
        const sWords = sec.querySelectorAll('.s-story .w')
        if (sWords.length) {
          gsap.set(sWords, { opacity: 0.1 })
          gsap.to(sWords, {
            opacity: 1, stagger: 0.35, ease: 'none',
            scrollTrigger: { trigger: sec.querySelector('.s-story'), start: 'top 80%', end: 'bottom 30%', scrub: 0.4 },
          })
        }

        // parallax on the background tint
        const bg = sec.querySelector('.s-proj-bg') as HTMLElement
        if (bg) {
          gsap.fromTo(bg, { y: 60 }, {
            y: -60, ease: 'none',
            scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 },
          })
        }
      })

      /* --- contact --- */
      gsap.from('.s-end > *', {
        y: 25, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.s-contact', start: 'top 75%' },
      })

      /* --- progress bar --- */
      gsap.to('.s-bar', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } })

      ScrollTrigger.refresh()
      document.fonts.ready.then(() => ScrollTrigger.refresh())
    }, rootRef)
    return () => ctx.revert()
  }, [ready])

  const go = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el && lenisRef.current) lenisRef.current.scrollTo(el, { offset: 0, duration: 1.4 })
  }, [])

  return (
    <div className="s" ref={rootRef}>
      {!ready && <Loader onDone={finish} />}
      <div className="s-bar"><i /></div>

      <nav className="s-nav">
        <button onClick={() => go('top')}>Tilak Khatua</button>
        <div>
          <button onClick={() => go('about')}>About</button>
          <button onClick={() => go('contact')}>Contact</button>
        </div>
      </nav>

      {/* ---- COVER ---- */}
      <section className="s-cover" id="top">
        <div className="s-cover-inner">
          <h1 className="s-cover-name">
            <span>Tilak</span>
            <span><em>Khatua</em></span>
          </h1>
          <div className="s-cover-rule" />
          <p className="s-cover-sub">
            Somewhere between a UI/UX sorcerer and an ML apprentice who googled
            &ldquo;what is gradient descent&rdquo; at 2am.
          </p>
          <div className="s-cover-tags">
            <span>Design</span>
            <span>Machine Learning</span>
            <span>Systems</span>
          </div>
        </div>
        <div className="s-cue"><span>Scroll</span></div>
      </section>

      {/* ---- ABOUT ---- */}
      <section className="s-about" id="about">
        <span className="s-label">The Premise</span>
        <h2 className="s-about-head s-fade">I build systems<br />that think.</h2>
        <p className="s-mani-text">
          {MANIFESTO.split(' ').map((w, i) => <span className="w" key={i}>{w} </span>)}
        </p>
        <dl className="s-about-spec s-fade">
          <div><dt>Based</dt><dd>India</dd></div>
          <div><dt>Focus</dt><dd>Interface, inference, infrastructure</dd></div>
          <div><dt>Files</dt><dd>Six systems, 2024&mdash;2026</dd></div>
        </dl>
      </section>

      {/* ---- PROJECTS ---- */}
      {projects.map((p, i) => (
        <section className="s-proj" key={p.slug} id={p.slug}>
          <div className="s-proj-bg" style={{ '--accent': `var(--c-${p.accent})` } as React.CSSProperties} />
          <div className="s-proj-inner">
            <span className="s-proj-num s-r">{String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
            <h2 className="s-proj-title s-r">{p.title}</h2>
            <p className="s-proj-tag s-r">{p.tagline}</p>
            <div className="s-proj-rule s-r" />
            <div className="s-story">
              {p.problem.split('. ').map((sent, j) => (
                <p key={j} className="s-story-s">
                  {sent.split(' ').map((w, k) => <span className="w" key={k}>{w} </span>)}
                  {j < p.problem.split('. ').length - 1 ? '.' : ''}
                </p>
              ))}
            </div>
            <div className="s-proj-foot s-r">
              <div className="s-proj-stack">
                {p.stack.map(s => <span key={s}>{s}</span>)}
              </div>
              <div className="s-proj-meta">
                <span>{p.year}</span>
                <span>{p.role}</span>
              </div>
              {p.links?.map(l => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="s-proj-link">{l.label} &nearr;</a>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ---- CONTACT ---- */}
      <section className="s-contact" id="contact">
        <div className="s-end">
          <span className="s-label s-label--light">Fin</span>
          <h2 className="s-end-title">Say <em>something.</em></h2>
          <p className="s-end-sub">The last page &mdash; not the end of the story.</p>
          <a className="s-end-mail" href="mailto:tilakkhatua01@gmail.com">tilakkhatua01@gmail.com</a>
          <ContactForm />
          <div className="s-end-links">
            <a href="https://github.com/Tilak-khatua" target="_blank" rel="noreferrer">GitHub &nearr;</a>
            <a href="https://www.linkedin.com/in/tilak-kumar-khatua-2b966437a" target="_blank" rel="noreferrer">LinkedIn &nearr;</a>
          </div>
        </div>
        <footer className="s-foot">
          <span>&copy; {new Date().getFullYear()} Tilak Khatua</span>
          <span>React &middot; TypeScript &middot; GSAP</span>
        </footer>
      </section>
    </div>
  )
}

/* ================================================================== FORM */

type FS = 'idle' | 'sending' | 'sent' | 'error'

function ContactForm() {
  const [n, setN] = useState(''); const [e, setE] = useState(''); const [m, setM] = useState('')
  const [s, setS] = useState<FS>('idle'); const [err, setErr] = useState('')
  const init = useRef(false)
  useEffect(() => { if (!init.current) { init.current = true; emailjs.init(EMAILJS.key) } }, [])
  const send = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (s === 'sending') return
    if (!n.trim() || !e.trim() || !m.trim()) { setS('error'); setErr('All three, please.'); return }
    setS('sending'); setErr('')
    try { await emailjs.send(EMAILJS.service, EMAILJS.template, { from_name: n, from_email: e, message: m }); setS('sent') }
    catch { setS('error'); setErr('Did not send. tilakkhatua01@gmail.com') }
  }
  const lock = s === 'sending' || s === 'sent'
  return (
    <form className="s-form" onSubmit={send}>
      <label><span>Name</span><input value={n} onChange={ev => setN(ev.target.value)} disabled={lock} /></label>
      <label><span>Email</span><input type="email" value={e} onChange={ev => setE(ev.target.value)} disabled={lock} /></label>
      <label><span>Message</span><textarea rows={3} value={m} onChange={ev => setM(ev.target.value)} disabled={lock} /></label>
      {s === 'error' && <p className="s-form-err">{err}</p>}
      {s === 'sent' && <p className="s-form-ok">Sent. I&rsquo;ll reply soon.</p>}
      <button type="submit" disabled={lock}>{s === 'sending' ? 'sending\u2026' : s === 'sent' ? 'sent \u2713' : 'send \u2192'}</button>
    </form>
  )
}
