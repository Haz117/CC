import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

export default function SortIcon({ col, sortKey, sortDir }) {
  const cls = 'inline-block w-3.5 h-3.5 ml-1 align-middle'
  if (sortKey !== col) return <ArrowUpDown className={cls} style={{ color: '#D4DDE6' }} />
  return sortDir === 'asc'
    ? <ArrowUp className={cls} style={{ color: '#2F8CEB' }} />
    : <ArrowDown className={cls} style={{ color: '#2F8CEB' }} />
}
