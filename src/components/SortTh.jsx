import SortIcon from './SortIcon'

// Encabezado que ordena la tabla. El botón lo hace alcanzable con Tab y `aria-sort` anuncia el orden actual.
export default function SortTh({ col, label, sortKey, sortDir, onSort, className = '' }) {
  const orden = sortKey !== col ? 'none' : sortDir === 'asc' ? 'ascending' : 'descending'
  return (
    <th className={className || undefined} aria-sort={orden}>
      <button type="button" className="th-orden" onClick={() => onSort(col)}>
        {label}<SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </button>
    </th>
  )
}
