/**
 * Downloads an array of objects as a CSV file.
 * @param {Object[]} rows  - Array of plain objects (all same keys)
 * @param {string}   filename - Desired file name (without extension)
 */
export function downloadCSV(rows, filename = 'export') {
  if (!rows || rows.length === 0) return

  // Collect headers from the first row
  const headers = Object.keys(rows[0])

  // Escape a single cell value: wrap in quotes if it contains a comma,
  // double-quote, or newline; double any existing double-quotes.
  const escape = (val) => {
    const str = val == null ? '' : String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ]

  const csvContent = lines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
