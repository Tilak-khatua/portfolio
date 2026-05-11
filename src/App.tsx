import { useState } from 'react'
import { useLenis } from './hooks/useLenis'
import { useReducedMotion } from './hooks/useReducedMotion'
import BootSequence from './components/boot/BootSequence'
import Nav from './components/layout/Nav'
import Hero from './components/hero/Hero'
import WorkGallery from './components/work/WorkGallery'
import Rotation from './components/rotation/Rotation'
import About from './components/about/About'
import Contact from './components/contact/Contact'
import RotatingTag from './components/layout/RotatingTag'

export default function App() {
  const reduced = useReducedMotion()
  const [booted, setBooted] = useState(false)

  useLenis()

  const handleBootDone = () => setBooted(true)

  return (
    <>
      <div className="scanlines" aria-hidden />
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />

      {!booted && !reduced && <BootSequence onDone={handleBootDone} />}

      <div style={{ opacity: booted ? 1 : 0, transition: 'opacity 300ms ease' }}>
        <Nav />
        <main>
          <Hero />
          <WorkGallery />
          <Rotation />
          <About />
          <Contact />
          <footer className="site-footer mono">
            <div className="site-footer-inner">
              <span>© {new Date().getFullYear()} tilak khatua</span>
              <RotatingTag />
              <span>v2.0.tilak.os</span>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}
