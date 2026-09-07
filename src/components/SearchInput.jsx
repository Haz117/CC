import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchInput({ value, onChange, placeholder = 'Buscar...', resultCount, className = '' }) {
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className={`relative flex-1 ${className}`}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: '#8FA1B2' }}
      />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="filter-input w-full"
        style={{ paddingLeft: '2.25rem', paddingRight: value ? '5rem' : '1rem' }}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {value && resultCount !== undefined && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap animate-scale-in"
            style={{ background: '#EBF4FC', color: '#0F4FA3' }}
          >
            {resultCount}
          </span>
        )}
        {value && (
          <button
            onClick={() => onChange('')}
            className="w-5 h-5 flex items-center justify-center rounded-md transition-all"
            style={{ color: '#8FA1B2' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#627080'; e.currentTarget.style.background = '#E2EAF2' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8FA1B2'; e.currentTarget.style.background = 'transparent' }}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}
