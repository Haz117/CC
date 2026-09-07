import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    const onScroll = () => setVisible(main.scrollTop > 300)
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [])

  const scrollUp = () => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null
  return (
    <button className="scroll-top-btn" onClick={scrollUp} title="Volver arriba">
      <ArrowUp className="w-4 h-4" />
    </button>
  )
}
