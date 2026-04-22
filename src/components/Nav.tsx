import { useEffect, useState } from 'react'

const SECTIONS = ['home', 'work', 'about', 'contact']

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive]     = useState('home')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)

      let current = 'home'
      SECTIONS.forEach((id) => {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) current = id
      })
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <a href="#" className="nav-logo" onClick={e => { e.preventDefault(); scrollTo('home') }}>TK<span>.</span></a>
      <div className="nav-links">
        {(['work', 'about'] as const).map((id) => (
          <button
            key={id}
            className={`nav-link${active === id ? ' active' : ''}`}
            onClick={() => scrollTo(id)}
          >
            {active === id && <span className="nav-dot" />}
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
        <button className="nav-cta" onClick={() => scrollTo('contact')}>Let's talk</button>
      </div>
    </nav>
  )
}
