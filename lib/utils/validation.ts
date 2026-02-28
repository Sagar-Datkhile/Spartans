export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export const validators = {
  email: (email: string): ValidationResult => {
    const errors: string[] = []
    if (!email) {
      errors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format')
    }
    return { valid: errors.length === 0, errors }
  },

  password: (password: string): ValidationResult => {
    const errors: string[] = []
    if (!password) {
      errors.push('Password is required')
    } else if (password.length < 8) {
      errors.push('Password must be at least 8 characters')
    } else if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    } else if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    return { valid: errors.length === 0, errors }
  },

  name: (name: string): ValidationResult => {
    const errors: string[] = []
    if (!name || name.trim().length === 0) {
      errors.push('Name is required')
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters')
    } else if (name.trim().length > 100) {
      errors.push('Name must not exceed 100 characters')
    }
    return { valid: errors.length === 0, errors }
  },

  phone: (phone: string): ValidationResult => {
    const errors: string[] = []
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\D/g, ''))) {
      errors.push('Invalid phone number format')
    }
    return { valid: errors.length === 0, errors }
  },

  date: (date: string): ValidationResult => {
    const errors: string[] = []
    if (!date) {
      errors.push('Date is required')
    } else if (isNaN(Date.parse(date))) {
      errors.push('Invalid date format')
    }
    return { valid: errors.length === 0, errors }
  },

  number: (value: any, min?: number, max?: number): ValidationResult => {
    const errors: string[] = []
    const num = parseFloat(value)
    
    if (isNaN(num)) {
      errors.push('Must be a valid number')
    } else if (min !== undefined && num < min) {
      errors.push(`Must be at least ${min}`)
    } else if (max !== undefined && num > max) {
      errors.push(`Must not exceed ${max}`)
    }
    return { valid: errors.length === 0, errors }
  },

  url: (url: string): ValidationResult => {
    const errors: string[] = []
    try {
      new URL(url)
    } catch {
      errors.push('Invalid URL format')
    }
    return { valid: errors.length === 0, errors }
  },
}

export function validateForm(data: Record<string, any>, schema: Record<string, (val: any) => ValidationResult>) {
  const errors: Record<string, string[]> = {}

  for (const [key, validator] of Object.entries(schema)) {
    const result = validator(data[key])
    if (!result.valid) {
      errors[key] = result.errors
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
