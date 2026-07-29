import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import gsap from 'gsap'
import SplitType from 'split-type'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePixelHover } from '../../hooks/usePixelHover'
import './contact.css'

const EMAILJS = {
  key: 'U-r5XsJ_RAo2elvRv',
  service: 'service_oqeswp6',
  template: 'template_c8l3l9a',
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Contact() {
  const reduced = useReducedMotion()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const initRef = useRef(false)
  const rootRef = useRef<HTMLElement>(null)
  const sendRef = usePixelHover<HTMLButtonElement>()

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    emailjs.init(EMAILJS.key)
  }, [])

  useEffect(() => {
    if (reduced || !rootRef.current) return

    // The address is the headline here, so it gets the character reveal.
    const mail = rootRef.current.querySelector<HTMLElement>('.contact-mail-text')
    const split = mail ? new SplitType(mail, { types: 'chars' }) : null

    const ctx = gsap.context(() => {
      if (split) {
        gsap.from((split.chars ?? []) as HTMLElement[], {
          yPercent: 100,
          opacity: 0,
          duration: 0.7,
          ease: 'expo.out',
          stagger: 0.018,
          scrollTrigger: { trigger: mail, start: 'top 90%', once: true },
        })
      }

      gsap.from('.contact-sub, .contact-facts > div, .contact-field, .contact-foot', {
        opacity: 0,
        y: 20,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: '.contact-grid', start: 'top 84%', once: true },
      })
    }, rootRef)

    return () => {
      ctx.revert()
      split?.revert()
    }
  }, [reduced])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error')
      setError('All three fields, please.')
      return
    }

    setStatus('sending')
    setError('')

    try {
      await emailjs.send(EMAILJS.service, EMAILJS.template, {
        from_name: name,
        from_email: email,
        message,
      })
      setStatus('sent')
    } catch {
      setStatus('error')
      setError('That did not send. Email me directly at tilakkhatua01@gmail.com.')
    }
  }

  const reset = () => {
    setName('')
    setEmail('')
    setMessage('')
    setStatus('idle')
    setError('')
  }

  const locked = status === 'sending' || status === 'sent'

  return (
    <section id="contact" ref={rootRef} className="section contact">
      <div className="container">
        <div className="eyebrow contact-eyebrow" data-field-safe="10">
          Contact / 03
        </div>

        {/* The address itself is the display type — the loudest thing here. */}
        <a className="contact-mail" href="mailto:tilakkhatua01@gmail.com">
          <span className="contact-mail-text display">tilakkhatua01@gmail.com</span>
          <span className="contact-mail-arrow" aria-hidden>↗</span>
        </a>

        <div className="contact-grid">
          <div className="contact-lead">
            <p className="contact-sub">
              Hiring, collaboration, or internet-stranger things. I read everything and reply when
              I'm done procrastinating.
            </p>

            <dl className="contact-facts mono">
              <div>
                <dt>Response</dt>
                <dd>Usually within a day</dd>
              </div>
              <div>
                <dt>Timezone</dt>
                <dd>IST · UTC+5:30</dd>
              </div>
              <div>
                <dt>Elsewhere</dt>
                <dd>
                  <a href="https://github.com/Tilak-khatua" target="_blank" rel="noreferrer">GitHub</a>
                  {' · '}
                  <a
                    href="https://www.linkedin.com/in/tilak-kumar-khatua-2b966437a"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <form className="contact-form" onSubmit={send}>
            {status === 'sent' ? (
              <div className="contact-done">
                <span className="contact-star" aria-hidden>✦</span>
                <p className="contact-done-msg">
                  Got it. I'll reply when I'm done procrastinating.
                </p>
                <button type="button" className="btn btn-ghost" onClick={reset}>
                  Send another
                </button>
              </div>
            ) : (
              <>
                <Field n="01" label="Name" htmlFor="c-name">
                  <input
                    id="c-name"
                    className="contact-input"
                    placeholder="Who are you?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={locked}
                  />
                </Field>

                <Field n="02" label="Email" htmlFor="c-email">
                  <input
                    id="c-email"
                    type="email"
                    className="contact-input"
                    placeholder="So I can reply"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={locked}
                  />
                </Field>

                <Field n="03" label="Message" htmlFor="c-msg">
                  <textarea
                    id="c-msg"
                    className="contact-input contact-textarea"
                    placeholder="Keep it interesting"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={locked}
                  />
                  <span className="contact-count mono" aria-hidden>
                    {message.length}
                  </span>
                </Field>

                <div className="contact-foot">
                  {/* The label is wrapped here rather than left as a bare text
                      node: usePixelHover re-parents children, and React would
                      fight it when this string changes between states. */}
                  <button ref={sendRef} type="submit" className="btn" disabled={status === 'sending'}>
                    <span>{status === 'sending' ? 'Sending…' : 'Send message'}</span>
                  </button>
                  {error && (
                    <span className="contact-error mono" role="alert">
                      {error}
                    </span>
                  )}
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

function Field({
  n,
  label,
  htmlFor,
  children,
}: {
  n: string
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="contact-field">
      <label className="contact-label mono" htmlFor={htmlFor}>
        <span className="contact-label-n">{n}</span>
        {label}
      </label>
      {children}
    </div>
  )
}
