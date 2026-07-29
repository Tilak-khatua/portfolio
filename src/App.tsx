import { useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis, getLenis } from './hooks/useLenis'
import { getField, suspendFieldSync } from './hooks/usePixelField'
import { useFieldBurst } from './hooks/useFieldBurst'
import PixelField from './components/field/PixelField'
import Loader from './components/loader/Loader'
import Hero from './components/hero/Hero'
import WorkList from './components/work/WorkList'
import CaseStudy from './components/work/CaseStudy'
import Rotation from './components/rotation/Rotation'
import About from './components/about/About'
import Contact from './components/contact/Contact'
import RotatingTag from './components/layout/RotatingTag'

export default function App() {
  // `booted` releases the hero as the loader lifts; `loading` keeps the loader
  // mounted until its lift finishes, so it never cuts its own animation short.
  const [loading, setLoading] = useState(true)
  const [booted, setBooted] = useState(false)
  const [openCase, setOpenCase] = useState<string | null>(null)

  useLenis()
  useFieldBurst()

  // scrollRestoration is disabled in main.tsx (before paint). This is a belt-and-
  // braces reset for the case where a layout shift nudges the page after mount.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Lock scrolling until the loader lifts away.
  useEffect(() => {
    if (booted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [booted])

  const onReveal = useCallback(() => setBooted(true), [])
  const onDone = useCallback(() => setLoading(false), [])

  // The pinned work gallery measures itself while the body is still scroll-locked,
  // so its start/end have to be recomputed once the loader releases. The refresh
  // can restore a scroll offset of its own, so force the top afterwards — and
  // reset Lenis too, since it tracks position independently of the window.
  useEffect(() => {
    if (loading) return
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh()
      getLenis()?.scrollTo(0, { immediate: true })
      window.scrollTo(0, 0)
    }, 120)
    return () => window.clearTimeout(id)
  }, [loading])

  // The field is fully covered while a case is open; keeping its loop running
  // repaints thousands of cells per frame and makes the dialog scroll stutter.
  useEffect(() => {
    const open = openCase !== null
    getField()?.setPaused(open)
    suspendFieldSync(open)
  }, [openCase])

  return (
    <>
      <PixelField />
      {loading && <Loader onReveal={onReveal} onDone={onDone} />}
      <main>
        <Hero booted={booted} />
        <WorkList onOpen={setOpenCase} />
        <About />
        <Rotation />
        <Contact />
        <footer className="site-footer">
          <div className="site-footer-inner">
            <span>© {new Date().getFullYear()} Tilak Khatua</span>
            <RotatingTag />
            <span>Built with too much care</span>
          </div>
        </footer>
      </main>
      <CaseStudy slug={openCase} onClose={() => setOpenCase(null)} />
    </>
  )
}
