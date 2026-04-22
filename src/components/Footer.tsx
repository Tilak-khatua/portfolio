import { useState } from 'react'
import gsap from 'gsap'

const MSGS = [
  'made with coffee & confusion',
  'fueled by noodles at 3am',
  'powered by ctrl+z and hope',
  'built while debugging life choices',
  'crafted with love & mild panic',
]

export default function Footer() {
  const [idx, setIdx] = useState(0)

  const cycle = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = e.currentTarget
    const next = (idx + 1) % MSGS.length
    gsap.to(el, {
      opacity: 0, y: -6, duration: 0.12,
      onComplete: () => {
        setIdx(next)
        gsap.to(el, { opacity: 1, y: 0, duration: 0.2 })
      },
    })
  }

  return (
    <footer className="footer">
      <span>© 2026 Tilak Kumar Khatua</span>
      <span className="footer-msg" onClick={cycle} title="click me">
        {MSGS[idx]} <span className="footer-hint">↺</span>
      </span>
      <a href="#home" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>↑ Top</a>
    </footer>
  )
}
