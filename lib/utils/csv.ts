import { UserProfile } from '@/lib/models'

export interface UserCSVRow {
  email: string
  name: string
  role: string
  department?: string
  phone?: string
}

export function parseUserCSV(csvContent: string): UserCSVRow[] {
  const lines = csvContent.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const users: UserCSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    if (values.length < 3) continue

    const emailIndex = headers.indexOf('email')
    const nameIndex = headers.indexOf('name')
    const roleIndex = headers.indexOf('role')
    const departmentIndex = headers.indexOf('department')
    const phoneIndex = headers.indexOf('phone')

    if (emailIndex === -1 || nameIndex === -1 || roleIndex === -1) {
      console.warn('CSV must have email, name, and role columns')
      continue
    }

    users.push({
      email: values[emailIndex],
      name: values[nameIndex],
      role: values[roleIndex],
      department: departmentIndex !== -1 ? values[departmentIndex] : undefined,
      phone: phoneIndex !== -1 ? values[phoneIndex] : undefined,
    })
  }

  return users
}

export function validateUserCSVRow(row: UserCSVRow): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push(`Invalid email: ${row.email}`)
  }

  if (!row.name || row.name.trim().length === 0) {
    errors.push('Name is required')
  }

  const validRoles = ['SUPERADMIN', 'MANAGER', 'EMPLOYEE']
  if (!row.role || !validRoles.includes(row.role.toUpperCase())) {
    errors.push(`Invalid role: ${row.role}. Must be one of: ${validRoles.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}

export function downloadCSVTemplate() {
  const template = `email,name,role,department,phone
john.doe@example.com,John Doe,MANAGER,Engineering,555-0001
jane.smith@example.com,Jane Smith,EMPLOYEE,Engineering,555-0002
bob.wilson@example.com,Bob Wilson,EMPLOYEE,Design,555-0003`

  const element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/csv;charset=utf-8,' + encodeURIComponent(template)
  )
  element.setAttribute('download', 'users-template.csv')
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
