import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { sendContactMessage } from './sendContactMessage'

type Status = 'idle' | 'sending' | 'sent' | 'error'
type Field = 'name' | 'email' | 'message'

export default function ContactForm() {
  const id = useId()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [invalidField, setInvalidField] = useState<Field | null>(null)
  const form = useRef<HTMLFormElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const confirmation = useRef<HTMLHeadingElement>(null)
  const busy = useRef(false)
  const mounted = useRef(true)
  const sending = status === 'sending'

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    if (status === 'sent') confirmation.current?.focus({ preventScroll: true })
  }, [status])

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy.current || status === 'sent') return
    const values = { name: name.trim(), email: email.trim(), message: message.trim() }
    const emptyField = (Object.keys(values) as Field[]).find(field => !values[field])
    if (emptyField) {
      setStatus('error')
      setInvalidField(emptyField)
      setError('Please fill in your name, email, and message.')
      form.current?.querySelector<HTMLElement>(`[name="${emptyField}"]`)?.focus()
      return
    }
    busy.current = true
    setStatus('sending')
    setInvalidField(null)
    setError('')
    try {
      await sendContactMessage(values)
      if (mounted.current) setStatus('sent')
    } catch {
      if (mounted.current) {
        setStatus('error')
        setError('That did not send. Try again, or email me directly at tilakkhatua01@gmail.com. Your message is still here.')
      }
    } finally {
      busy.current = false
    }
  }

  const reset = () => {
    setName(''); setEmail(''); setMessage('')
    setStatus('idle'); setError(''); setInvalidField(null)
    window.requestAnimationFrame(() => nameInput.current?.focus())
  }

  return <form className="workshop-contact-form" ref={form} onSubmit={send} aria-label="Send Tilak a message" aria-busy={sending}>
    {status === 'sent' ? <div className="message-confirmation">
      <span className="message-stamp" aria-hidden="true">SENT ✓</span>
      <h3 ref={confirmation} tabIndex={-1}>Your note is on its way.</h3>
      <p>Thanks for writing. I’ll reply by email.</p>
      <button type="button" className="quiet-button" onClick={reset}>Send another ↗</button>
    </div> : <>
      <div className="message-field" data-contact-field>
        <label htmlFor={`${id}-name`}><span aria-hidden="true">01 /</span> Name</label>
        <input ref={nameInput} id={`${id}-name`} name="name" autoComplete="name" placeholder="Who are you?" value={name} onChange={event => { setName(event.target.value); if (invalidField === 'name') setInvalidField(null) }} required maxLength={120} disabled={sending} aria-invalid={invalidField === 'name' || undefined} aria-describedby={invalidField === 'name' ? `${id}-error` : undefined} />
      </div>
      <div className="message-field" data-contact-field>
        <label htmlFor={`${id}-email`}><span aria-hidden="true">02 /</span> Email</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="So I can reply" value={email} onChange={event => { setEmail(event.target.value); if (invalidField === 'email') setInvalidField(null) }} required maxLength={254} disabled={sending} aria-invalid={invalidField === 'email' || undefined} aria-describedby={invalidField === 'email' ? `${id}-error` : undefined} />
      </div>
      <div className="message-field message-field--body" data-contact-field>
        <label htmlFor={`${id}-message`}><span aria-hidden="true">03 /</span> Message</label>
        <textarea id={`${id}-message`} name="message" rows={4} placeholder="What’s on your mind?" value={message} onChange={event => { setMessage(event.target.value); if (invalidField === 'message') setInvalidField(null) }} required maxLength={5000} disabled={sending} aria-invalid={invalidField === 'message' || undefined} aria-describedby={invalidField === 'message' ? `${id}-error` : undefined} />
        <span className="message-count" aria-hidden="true">{message.length} / 5000</span>
      </div>
      <div className="message-actions" data-contact-field>
        <button className="message-send" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send message'}<span aria-hidden="true">{sending ? '···' : '↗'}</span></button>
        <p className="message-status" role="status">{sending ? 'Sending your note…' : ''}</p>
      </div>
      {error && <p className="message-error" id={`${id}-error`} role="alert">{error}</p>}
    </>}
  </form>
}
