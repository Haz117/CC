import SortIcon from './SortIcon'

export default function SortTh({ col, label, sortKey, sortDir, onSort, className = '' }) {
  return (
    <th
      className={`cursor-pointer select-none${className ? ' ' + className : ''}`}
      onClick={() => onSort(col)}
    >
      {label}<SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
    </th>
  )
}
