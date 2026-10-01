import { useEffect, useState } from 'react'

/**
 * True when the field view isn't viable: too narrow, too short, or no fine
 * pointer. The plates are a fixed 560x360 in world units, so below roughly a
 * tablet a plate cannot be read without zooming.
 */
const QUERY = '(max-width: 1024px), (max-height: 620px), (pointer: coarse)'

export function useCompact() {
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = () => setCompact(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return compact
}
