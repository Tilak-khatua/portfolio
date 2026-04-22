import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const numRef     = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = sectionRef.current!

    gsap.to(el.querySelectorAll<HTMLElement>('.line-inner'), {
      y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%' },
    })

    gsap.fromTo(el.querySelectorAll<HTMLElement>('.about-body p, .about-what'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el.querySelector('.about-body'), start: 'top 85%' } }
    )

    gsap.fromTo(el.querySelectorAll<HTMLElement>('.stat-card, .about-highlight'),
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el.querySelector('.about-right'), start: 'top 85%' } }
    )

    gsap.fromTo(el.querySelector('.about-deco'),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%' } }
    )

    const obj = { val: 0 }
    ScrollTrigger.create({
      trigger: numRef.current,
      start: 'top 88%',
      onEnter: () => {
        gsap.to(obj, {
          val: 4, duration: 1.4, ease: 'power2.out',
          onUpdate() { numRef.current!.textContent = String(Math.floor(obj.val)) },
          onComplete() { numRef.current!.textContent = '4' },
        })
      },
    })
  }, [])

  return (
    <section className="section" id="about" ref={sectionRef}>
      <div className="about-deco" aria-hidden>02</div>

      <span className="s-label">About</span>
      <h2 className="s-heading">
        <span className="line"><span className="line-inner">I make things</span></span>
        <span className="line"><span className="line-inner">that <em>work.</em></span></span>
      </h2>

      <div className="about-grid">
        <div>
          <p className="about-what">
            UI/UX designer by day, ML tinkerer by night. I design interfaces people actually enjoy using, then break databases trying to make them smarter.
          </p>
          <div className="about-body">
            <p>Good design is invisible — you only notice it when it's bad. I spend an embarrassing amount of time on spacing, and somehow that's a personality trait now.</p>
            <p>On the ML side: mostly supervised, occasionally unsupervised (like me at 3am). I've trained models, broken models, and once deleted an entire dataset. Zero regrets.</p>
          </div>
        </div>

        <div className="about-right">
          <div className="stat-card">
            <div className="stat-num"><span ref={numRef}>0</span></div>
            <div className="stat-label">Projects shipped</div>
          </div>
          <div className="about-highlight">
            <p>"ctrl+z is my bestie — <strong>gradient descent</strong> is just vibes at this point."</p>
          </div>
        </div>
      </div>
    </section>
  )
}
