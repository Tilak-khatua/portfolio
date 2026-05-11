import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { AnimatePresence, motion } from 'framer-motion'
import './contact.css'

const EMAILJS = {
  key: 'U-r5XsJ_RAo2elvRv',
  service: 'service_oqeswp6',
  template: 'template_c8l3l9a',
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
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
      setStatus('error')
      return
    }
    setStatus('sending')
    setProgress(0)

    const start = performance.now()
    const DURATION = 1400
    const tick = (now: number) => {
      const p = Math.min(0.95, (now - start) / DURATION)
      setProgress(p)
      if (p < 0.95 && status !== 'sent' && status !== 'error') requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    try {
      await emailjs.send(EMAILJS.service, EMAILJS.template, {
        from_name: name,
        from_email: email,
        message,
      })
      setProgress(1)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const reset = () => {
    setName(''); setEmail(''); setMessage('')
    setStatus('idle'); setProgress(0)
  }

  return (
    <section id="contact" className="contact">
      <div className="contact-intro mono">
        <div className="contact-label">[ CONTACT / chat.exe ]</div>
        <h2 className="contact-heading display">say hi.</h2>
        <div className="contact-sub">
          hiring, collab, or just internet stranger things. i read everything.{' '}
          <span style={{ opacity: 0.55 }}>i reply when i'm done procrastinating.</span>
        </div>
      </div>

      <form className="contact-chat win" onSubmit={send}>
        <div className="win-bar">
          <div className="win-dots">
            <span className="win-dot red" />
            <span className="win-dot yellow" />
            <span className="win-dot green" />
          </div>
          <div className="win-title">chat.exe — tilak@localhost</div>
          <div className="win-actions">
            <span className="win-action">_</span>
            <span className="win-action">□</span>
            <span className="win-action">×</span>
          </div>
        </div>

        <div className="contact-transcript">
          <Bubble who="tilak">hey — you're at the bottom of the page. that takes dedication.</Bubble>
          <Bubble who="tilak">tell me who you are and what you want. i don't bite.</Bubble>

          <div className="contact-row">
            <span className="contact-prompt mono">you ▸</span>
            <input
              className="contact-input mono"
              placeholder="your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === 'sending' || status === 'sent'}
            />
          </div>
          <div className="contact-row">
            <span className="contact-prompt mono">you ▸</span>
            <input
              className="contact-input mono"
              placeholder="email (so i can reply)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'sending' || status === 'sent'}
            />
          </div>
          <div className="contact-row contact-row-msg">
            <span className="contact-prompt mono">you ▸</span>
            <textarea
              className="contact-input contact-textarea mono"
              placeholder="what's up? (keep it interesting)"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={status === 'sending' || status === 'sent'}
            />
          </div>

          <AnimatePresence>
            {status === 'sending' && (
              <motion.div className="contact-bubble contact-bubble-sys" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <div className="contact-bubble-who mono">system ▸</div>
                <div>
                  sending…
                  <div className="contact-progress">
                    <div className="contact-progress-fill" style={{ width: `${progress * 100}%` }} />
                  </div>
                </div>
              </motion.div>
            )}
            {status === 'sent' && (
              <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Bubble who="tilak">got it. i'll reply when i'm done procrastinating. ✦</Bubble>
                <div className="contact-row" style={{ marginTop: 8 }}>
                  <button type="button" className="chrome-btn" onClick={reset}>send another</button>
                </div>
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Bubble who="tilak">
                  hmm, something broke. either a required field is empty or the network's being shy —
                  try again, or email me directly: <em>tilakkhatua01@gmail.com</em>
                </Bubble>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="contact-foot">
          {status !== 'sent' && (
            <button type="submit" className="chrome-btn" disabled={status === 'sending'}>
              {status === 'sending' ? 'sending…' : 'send ▸'}
            </button>
          )}
          <span className="mono contact-status">
            <span className="contact-status-dot" />
            online · replies in ~24h
          </span>
        </div>
      </form>
    </section>
  )
}

function Bubble({ who, children }: { who: 'tilak' | 'you'; children: React.ReactNode }) {
  return (
    <div className={`contact-bubble contact-bubble-${who}`}>
      <div className="contact-bubble-who mono">{who} ▸</div>
      <div>{children}</div>
    </div>
  )
}
