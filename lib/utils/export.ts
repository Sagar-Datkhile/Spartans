export interface ExportOptions {
  filename: string
  format: 'csv' | 'json' | 'pdf'
}

export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csv = [headers.join(',')]

  data.forEach((item) => {
    const values = headers.map((header) => {
      const value = item[header]
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csv.push(values.join(','))
  })

  return csv.join('\n')
}

export function downloadCSV(data: any[], filename: string = 'export.csv'): void {
  const csv = convertToCSV(data)
  const blob = new Blob([csv], { type: 'text/csv' })
  downloadFile(blob, filename)
}

export function downloadJSON(data: any, filename: string = 'export.json'): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadFile(blob, filename)
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const element = document.createElement('a')
  element.setAttribute('href', url)
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  window.URL.revokeObjectURL(url)
}

export function exportTableToCSV(tableId: string, filename: string = 'table-export.csv'): void {
  const table = document.getElementById(tableId)
  if (!table) {
    console.error(`Table with id ${tableId} not found`)
    return
  }

  const rows = table.querySelectorAll('tr')
  const csv: string[] = []

  rows.forEach((row) => {
    const cells = row.querySelectorAll('td, th')
    const values = Array.from(cells).map((cell) => {
      const text = cell.textContent?.trim() || ''
      return text.includes(',') ? `"${text}"` : text
    })
    csv.push(values.join(','))
  })

  const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
  downloadFile(blob, filename)
}
