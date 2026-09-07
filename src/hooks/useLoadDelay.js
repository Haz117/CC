import { useState, useEffect } from 'react'

export function useLoadDelay(ms = 350) {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), ms)
    return () => clearTimeout(t)
  }, [ms])
  return loaded
}
