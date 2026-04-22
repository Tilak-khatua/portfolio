import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    num: '01',
    cat: 'AI · Full-Stack',
    title: 'ConverSQL',
    desc: 'Ask your database anything in plain English. AWS Bedrock + Claude turns natural language into real, executable SQL. No more syntax guessing at 2am.',
    tags: ['Next.js 15', 'AWS Bedrock', 'tRPC', 'Prisma', 'CDK'],
    mono: 'CS',
    accent: '#6366f1',
    color: 'rgba(99,102,241,0.08)',
    href: 'https://github.com/tilak-khatua',
    featured: true,
  },
  {
    num: '02',
    cat: 'UI/UX · Web Design',
    title: 'Eldridge Morgan',
    desc: 'Professional website designed & built end-to-end. Custom CMS, editorial layouts, brand-matched design system.',
    tags: ['Next.js 15', 'Payload CMS', 'TypeScript', 'Tailwind'],
    mono: 'EM',
    accent: '#ec4899',
    color: 'rgba(236,72,153,0.08)',
    href: 'https://github.com/tilak-khatua',
    featured: false,
  },
  {
    num: '03',
    cat: 'Systems · Backend',
    title: 'Write-Ahead Log',
    desc: 'Production-grade crash-safe recovery for a key-value store. CRC32 checksums, automatic checkpointing. Zero data loss.',
    tags: ['Python', 'Database Systems', 'Crash Recovery'],
    mono: 'WL',
    accent: '#10b981',
    color: 'rgba(16,185,129,0.08)',
    href: 'https://github.com/tilak-khatua',
    featured: false,
  },
  {
    num: '04',
    cat: 'Full-Stack · Web',
    title: 'Little Lemon',
    desc: 'Full-stack restaurant system — menus, bookings, REST APIs. Runs smoother than its cocktails.',
    tags: ['Django', 'REST API', 'MySQL'],
    mono: 'LL',
    accent: '#f59e0b',
    color: 'rgba(245,158,11,0.08)',
    href: 'https://github.com/tilak-khatua',
    featured: false,
  },
]

function useTilt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width  - 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5
      gsap.to(el, {
        rotateY: x * 10,
        rotateX: -y * 10,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power2.out',
      })
    }
    const onLeave = () => {
      gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [ref])
}

function ProjectCard({ p, featured = false }: { p: typeof PROJECTS[0], featured?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useTilt(ref)

  return (
    <div
      ref={ref}
      className={`proj-card${featured ? ' featured' : ''}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="proj-card-bg" style={{ background: p.color }} />
      {featured ? (
        <>
          <div>
            <div className="proj-num">{p.num}</div>
            <span className="proj-cat">{p.cat}</span>
            <h3 className="proj-title">{p.title}</h3>
            <p className="proj-desc">{p.desc}</p>
            <div className="proj-tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
            <a href={p.href} target="_blank" rel="noreferrer" className="proj-link">
              View Project <span className="btn-arrow">↗</span>
            </a>
          </div>
          <div className="proj-icon-wrap" style={{ background: p.color }}>
            <svg className="proj-svg-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="8" width="64" height="48" rx="6" stroke={p.accent} strokeWidth="4"/>
              <path d="M8 24h64" stroke={p.accent} strokeWidth="4"/>
              <circle cx="20" cy="16" r="3" fill={p.accent}/>
              <circle cx="32" cy="16" r="3" fill={p.accent}/>
              <path d="M20 40h8M20 50h16M36 40h24M44 50h16" stroke={p.accent} strokeWidth="3" strokeLinecap="round"/>
              <path d="M32 64l8 8 8-8" stroke={p.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M40 72V56" stroke={p.accent} strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        </>
      ) : (
        <>
          <div className="proj-num">{p.num}</div>
          <span className="proj-cat">{p.cat}</span>
          <h3 className="proj-title">{p.title}</h3>
          <p className="proj-desc">{p.desc}</p>
          <div className="proj-tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
          <div style={{ marginTop: '16px' }}>
            <a href={p.href} target="_blank" rel="noreferrer" className="proj-link">
              View Project <span className="btn-arrow">↗</span>
            </a>
          </div>
        </>
      )}
    </div>
  )
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const cards = sectionRef.current!.querySelectorAll<HTMLElement>('.proj-card')
    cards.forEach((card) => {
      gsap.to(card, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%' },
      })
    })

    gsap.to(sectionRef.current!.querySelectorAll<HTMLElement>('.line-inner'), {
      y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 82%' },
    })
  }, [])

  return (
    <section className="section" id="work" ref={sectionRef}>
      <span className="s-label">Selected Work</span>
      <h2 className="s-heading">
        <span className="line"><span className="line-inner">Stuff I've</span></span>
        <span className="line"><span className="line-inner"><em>shipped.</em></span></span>
      </h2>

      <div className="projects-grid">
        <ProjectCard p={PROJECTS[0]} featured />
        {PROJECTS.slice(1).map(p => <ProjectCard key={p.num} p={p} />)}
      </div>
    </section>
  )
}
