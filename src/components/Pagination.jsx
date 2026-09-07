import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ total, page, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const start = (page - 1) * perPage + 1
  const end   = Math.min(page * perPage, total)

  // Build compact page range: 1 … prev cur next … last
  const range = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      range.push(i)
    } else if (range[range.length - 1] !== '…') {
      range.push('…')
    }
  }

  const btnBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 10,
    border: '1px solid #E2EAF2', background: 'transparent',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
  }

  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={{ borderTop: '1px solid #E2EAF2', background: '#FAFCFF' }}
    >
      <p className="text-xs font-medium" style={{ color: '#8FA1B2' }}>
        {start}–{end}{' '}
        <span style={{ color: '#D4DDE6' }}>de</span>{' '}
        <strong style={{ color: '#627080' }}>{total}</strong>
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          style={{ ...btnBase, opacity: page === 1 ? .35 : 1, color: '#627080' }}
          onMouseEnter={e => { if (page > 1) { e.currentTarget.style.background = '#EBF5FF'; e.currentTarget.style.color = '#2F8CEB'; e.currentTarget.style.borderColor = '#C8DCE9' } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#627080'; e.currentTarget.style.borderColor = '#E2EAF2' }}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Pages */}
        {range.map((p, i) =>
          p === '…'
            ? <span key={`ellipsis-${i}`} style={{ width: 28, textAlign: 'center', fontSize: '.7rem', color: '#D4DDE6' }}>…</span>
            : <button
                key={p}
                onClick={() => onChange(p)}
                style={{
                  ...btnBase,
                  fontSize: '.75rem', fontWeight: p === page ? 800 : 500,
                  ...(p === page
                    ? { background: '#2F8CEB', color: '#fff', borderColor: '#2F8CEB', boxShadow: '0 2px 8px rgba(47,140,235,.28)' }
                    : { color: '#627080' }
                  ),
                }}
                onMouseEnter={e => { if (p !== page) { e.currentTarget.style.background = '#EBF5FF'; e.currentTarget.style.color = '#2F8CEB'; e.currentTarget.style.borderColor = '#C8DCE9' } }}
                onMouseLeave={e => { if (p !== page) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#627080'; e.currentTarget.style.borderColor = '#E2EAF2' } }}
              >
                {p}
              </button>
        )}

        {/* Next */}
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          style={{ ...btnBase, opacity: page === totalPages ? .35 : 1, color: '#627080' }}
          onMouseEnter={e => { if (page < totalPages) { e.currentTarget.style.background = '#EBF5FF'; e.currentTarget.style.color = '#2F8CEB'; e.currentTarget.style.borderColor = '#C8DCE9' } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#627080'; e.currentTarget.style.borderColor = '#E2EAF2' }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
