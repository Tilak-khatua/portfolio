import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const LINES = [
  'assembled at 2am, tested at 3',
  'no cookies, no tracking, no drama',
  'shipped on a wednesday, as nature intended',
  'zero frameworks were harmed in the making',
  'powered by caffeine + mild procrastination',
  'if you see a bug, pretend it\'s a feature',
  'designed in figma, debugged in devtools',
  'lovingly handcrafted, mildly overengineered',
  'may contain traces of lenis and gsap',
  'more tested than my sleep schedule',
  'ctrl + s is my love language',
  'semver? i barely know her',
  'works on my machine — probably yours too',
]

export default function RotatingTag() {
  const [i, setI] = useState(0)
  const [spinning, setSpinning] = useState(false)

  const next = () => {
    setI((n) => (n + 1) % LINES.length)
    setSpinning(true)
    setTimeout(() => setSpinning(false), 500)
  }

  return (
    <button
      type="button"
      className="footer-tag"
      onClick={next}
      aria-label="show another line"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="footer-tag-text"
        >
          {LINES[i]}
        </motion.span>
      </AnimatePresence>
      <span className={`footer-tag-refresh ${spinning ? 'spin' : ''}`} aria-hidden>↻</span>
    </button>
  )
}
