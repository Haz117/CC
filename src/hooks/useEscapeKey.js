import { useEffect, useRef, useLayoutEffect } from 'react'

export function useEscapeKey(onEscape) {
  const ref = useRef(onEscape)
  useLayoutEffect(() => { ref.current = onEscape })
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') ref.current() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
