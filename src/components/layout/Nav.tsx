import { useEffect, useState } from 'react'
import { getLenis } from '../../hooks/useLenis'
import './nav.css'

const ITEMS = [
  { id: 'home', label: 'home' },
  { id: 'work', label: 'work' },
  { id: 'play', label: 'play' },
  { id: 'about', label: 'about' },
  { id: 'contact', label: 'contact' },
]

export default function Nav() {
  const [time, setTime] = useState(() => fmt(new Date()))
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setTime(fmt(new Date())), 30_000)
    return () => clearInterval(id)
  }, [])

  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el, { offset: -12 })
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="nav-brand mono">
          <span className="nav-dot" />
          <span>tilak.os</span>
          <span className="nav-sep">/</span>
          <span className="nav-path">c:\home</span>
        </div>
        <nav className={`nav-items mono ${open ? 'open' : ''}`}>
          {ITEMS.map((it) => (
            <button key={it.id} className="nav-item" onClick={() => go(it.id)}>
              {it.label}
            </button>
          ))}
        </nav>
        <div className="nav-meta mono">
          <span className="nav-status">
            <span className="nav-status-dot" /> online
          </span>
          <span className="nav-clock">{time}</span>
        </div>
        <button
          className="nav-burger mono"
          aria-label="menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '×' : '≡'}
        </button>
      </div>
    </header>
  )
}

function fmt(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}
