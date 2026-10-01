import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'

const EMAILJS = {
  key: 'U-r5XsJ_RAo2elvRv',
  service: 'service_oqeswp6',
  template: 'template_c8l3l9a',
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

/** Contact, as ruled lines rather than boxed inputs. */
export default function Contact() {
  const initialised = useRef(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true
    emailjs.init(EMAILJS.key)
  }, [])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error')
      setError('All three, please.')
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
      setError('That did not send. Mail me at tilakkhatua01@gmail.com.')
    }
  }

  const locked = status === 'sending' || status === 'sent'

  return (
    <form className="wire" onSubmit={send}>
      <a className="wire-mail" href="mailto:tilakkhatua01@gmail.com">
        tilakkhatua01@gmail.com
      </a>

      <label className="wire-row">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} disabled={locked} autoComplete="name" />
      </label>
      <label className="wire-row">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={locked} autoComplete="email" />
      </label>
      <label className="wire-row">
        <span>Message</span>
        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} disabled={locked} />
      </label>

      {status === 'error' && (
        <p className="wire-note is-error" role="alert">
          {error}
        </p>
      )}
      {status === 'sent' && (
        <p className="wire-note" role="status">
          Sent. I&rsquo;ll reply soon.
        </p>
      )}

      <button className="wire-send" type="submit" disabled={locked}>
        {status === 'sending' ? 'sending' : status === 'sent' ? 'sent' : 'send'}
      </button>
    </form>
  )
}
