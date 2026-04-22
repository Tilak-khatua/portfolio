import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import emailjs from '@emailjs/browser'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    emailjs.init('U-r5XsJ_RAo2elvRv')

    const el = sectionRef.current!
    gsap.to(el.querySelectorAll<HTMLElement>('.line-inner'), {
      y: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%' },
    })
    gsap.fromTo(el.querySelectorAll<HTMLElement>('.contact-left, .contact-right'),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el.querySelector('.contact-layout'), start: 'top 85%' } }
    )
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const name    = (form.elements.namedItem('name')    as HTMLInputElement).value.trim()
    const email   = (form.elements.namedItem('email')   as HTMLInputElement).value.trim()
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim()
    if (!name || !email || !message) return

    setStatus('sending')
    try {
      await emailjs.send('service_oqeswp6', 'template_c8l3l9a', {
        from_name: name, from_email: email, message, to_name: 'Tilak',
      })
      setStatus('sent')
      form.reset()
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="section" id="contact" ref={sectionRef}>
      <div className="contact-layout">

        <div className="contact-left">
          <span className="s-label">Contact</span>
          <h2 className="contact-heading">
            <span className="line"><span className="line-inner">Let's build</span></span>
            <span className="line"><span className="line-inner">something <em>cool.</em></span></span>
          </h2>
          <p className="contact-blurb">
            Open to freelance, full-time, and interesting problems. If you have something worth building, let's talk.
          </p>
          <div className="contact-links">
            <a href="mailto:tilakkhatua01@gmail.com" className="ci-row">
              <span>tilakkhatua01@gmail.com</span>
              <em className="ci-arrow">↗</em>
            </a>
            <a href="https://github.com/tilak-khatua" target="_blank" rel="noreferrer" className="ci-row">
              <span>GitHub</span>
              <em className="ci-arrow">↗</em>
            </a>
            <a href="https://www.linkedin.com/in/tilak-kumar-khatua-2b966437a" target="_blank" rel="noreferrer" className="ci-row">
              <span>LinkedIn</span>
              <em className="ci-arrow">↗</em>
            </a>
          </div>
        </div>

        <div className="contact-right">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="cf-field">
              <input type="text" name="name" placeholder="Your name" required />
            </div>
            <div className="cf-field">
              <input type="email" name="email" placeholder="your@email.com" required />
            </div>
            <div className="cf-field">
              <textarea name="message" rows={5} placeholder="Tell me about the project…" required />
            </div>
            <button type="submit" className="btn-send" disabled={status === 'sending'}>
              {status === 'idle'    && <>Send it →</>}
              {status === 'sending' && <>Sending…</>}
              {status === 'sent'    && <>Sent ✓</>}
              {status === 'error'   && <>Try again</>}
            </button>
          </form>
        </div>

      </div>
    </section>
  )
}
