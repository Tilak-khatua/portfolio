import { useCallback, useLayoutEffect, useRef, useState } from 'react'

type PortfolioLocation =
  | { type: 'home'; anchor?: string }
  | { type: 'project'; slug: string }

type Origin = { scrollY: number; focusId: string } | null

function readLocation(): PortfolioLocation {
  const match = window.location.hash.match(/^#\/project\/([^/?#]+)$/)
  if (match) {
    try {
      return { type: 'project', slug: decodeURIComponent(match[1]) }
    } catch {
      return { type: 'home' }
    }
  }
  const anchor = window.location.hash.match(/^#([a-z][a-z0-9-]*)$/i)?.[1]
  if (!anchor) return { type: 'home' }
  try {
    return { type: 'home', anchor: decodeURIComponent(anchor) }
  } catch {
    return { type: 'home' }
  }
}

export function usePortfolioLocation(contentReady = true) {
  const [location, setLocation] = useState<PortfolioLocation>(readLocation)
  const origin = useRef<Origin>(null)

  useLayoutEffect(() => {
    const sync = () => setLocation(readLocation())
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  useLayoutEffect(() => {
    if (!contentReady || location.type !== 'home') return
    const savedOrigin = origin.current
    if (!savedOrigin && location.anchor) {
      const frame = window.requestAnimationFrame(() => {
        document.getElementById(location.anchor!)?.scrollIntoView({ block: 'start' })
      })
      return () => window.cancelAnimationFrame(frame)
    }
    if (!savedOrigin) return
    const frame = window.requestAnimationFrame(() => {
      if (origin.current !== savedOrigin) return
      window.scrollTo({ top: savedOrigin.scrollY, behavior: 'instant' })
      window.requestAnimationFrame(() => {
        document.getElementById(savedOrigin.focusId)?.focus({ preventScroll: true })
      })
      origin.current = null
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location, contentReady])

  const openProject = useCallback((slug: string, focusId?: string) => {
    if (location.type === 'home') {
      origin.current = { scrollY: window.scrollY, focusId: focusId ?? `project-link-${slug}` }
    }
    window.history.pushState(null, '', `#/project/${encodeURIComponent(slug)}`)
    setLocation({ type: 'project', slug })
    window.scrollTo(0, 0)
  }, [location.type])

  const goHome = useCallback(() => {
    window.history.pushState(null, '', '#experiments')
    setLocation({ type: 'home', anchor: 'experiments' })
  }, [])

  return { location, openProject, goHome }
}
