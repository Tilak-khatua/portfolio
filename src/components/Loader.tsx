import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props { onDone: () => void }

const WORD = 'BONJOUR'

export default function Loader({ onDone }: Props) {
  const ref      = useRef<HTMLDivElement>(null)
  const barRef   = useRef<HTMLDivElement>(null)
  const numRef   = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const letters = ref.current!.querySelectorAll<HTMLElement>('.loader-letter')

    gsap.to(letters, {
      y: 0, opacity: 1,
      stagger: 0.07,
      duration: 0.55,
      ease: 'back.out(1.4)',
      delay: 0.2,
    })

    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 13 + 4
      if (p >= 100) { p = 100; clearInterval(iv) }
      barRef.current!.style.width = `${p}%`
      numRef.current!.textContent = `${Math.floor(p)}%`

      if (p >= 100) {
        setTimeout(() => {
          gsap.to(letters, {
            y: -90, opacity: 0, stagger: 0.04,
            duration: 0.35, ease: 'power3.in',
          })
          gsap.to(ref.current, {
            yPercent: -100,
            duration: 0.9, delay: 0.4,
            ease: 'power4.inOut',
            onComplete: onDone,
          })
        }, 350)
      }
    }, 55)
  }, [onDone])

  return (
    <div id="loader" ref={ref}>
      <div className="loader-word">
        {WORD.split('').map((ch, i) => (
          <span className="loader-letter" key={i}>{ch}</span>
        ))}
      </div>
      <div className="loader-bar-wrap">
        <div className="loader-bar" ref={barRef} />
      </div>
      <span className="loader-num" ref={numRef}>0%</span>
    </div>
  )
}
