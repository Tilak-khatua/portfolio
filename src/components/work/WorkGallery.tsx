import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { projects } from '../../data/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import WorkCard from './WorkCard'
import FileOpenDialog from './FileOpenDialog'
import './work.css'

export default function WorkGallery() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [opening, setOpening] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? !window.matchMedia('(min-width: 900px)').matches : false
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    const onChange = (e: MediaQueryListEvent) => setIsMobile(!e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reduced) return
    const track = trackRef.current
    const root = rootRef.current
    if (!track || !root) return

    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 96)

      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.width = `${self.progress * 100}%`
            }
          },
        },
      })
    })

    return () => mm.revert()
  }, [reduced])

  const stacked = isMobile || reduced

  return (
    <section id="work" ref={rootRef} className={`work ${stacked ? 'work-stacked' : ''}`}>
      <div ref={trackRef} className="work-track">
        <div className="work-intro-slide mono">
          <div className="work-label">[ WORK / 0{projects.length} cases ]</div>
          <h2 className="work-heading display">selected work</h2>
          <div className="work-sub">
            projects i actually finished. {stacked ? 'scroll down' : 'scroll sideways'} — cards are
            windows, click to open the file.
          </div>
          {!stacked && <div className="work-intro-arrow">▶▶▶</div>}
        </div>

        {projects.map((p, i) => (
          <motion.div
            key={p.slug}
            className="work-card-wrap"
            style={{ ['--accent' as never]: `var(--${p.accent})` }}
          >
            <WorkCard project={p} index={i} onOpen={() => setOpening(p.slug)} />
          </motion.div>
        ))}

        <div className="work-end mono">
          <div>-- end of directory --</div>
          <div style={{ opacity: 0.6, marginTop: 6 }}>more coming when i finish them</div>
        </div>
      </div>

      {!stacked && (
        <div className="work-progress">
          <div ref={progressRef} className="work-progress-fill" />
        </div>
      )}

      <FileOpenDialog slug={opening} onClose={() => setOpening(null)} />
    </section>
  )
}
