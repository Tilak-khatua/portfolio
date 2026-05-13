import { useEffect, useState } from 'react'
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
  const [bootVisible, setBootVisible] = useState(true)
  const [revealed, setRevealed] = useState(false)

  useLenis()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
    if (revealed || reduced) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [revealed, reduced])

  const handleBreak = () => {
    window.scrollTo(0, 0)
    setRevealed(true)
  }
  const handleBootDone = () => setBootVisible(false)

  return (
    <>
      <div className="scanlines" aria-hidden />
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />

      {bootVisible && !reduced && (
        <BootSequence onBreak={handleBreak} onDone={handleBootDone} />
      )}

      <div style={{ opacity: revealed || reduced ? 1 : 0, transition: 'opacity 250ms ease' }}>
        <Nav />
        <main>
          <Hero booted={revealed || reduced} />
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
