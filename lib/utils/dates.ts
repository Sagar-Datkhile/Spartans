import { formatDistanceToNow, format, parse, isPast, isFuture, differenceInDays } from 'date-fns'

export const dateUtils = {
  formatRelative: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return formatDistanceToNow(d, { addSuffix: true })
  },

  formatDate: (date: Date | string, formatStr: string = 'MMM dd, yyyy'): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return format(d, formatStr)
  },

  formatDateTime: (date: Date | string, formatStr: string = 'MMM dd, yyyy hh:mm a'): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return format(d, formatStr)
  },

  parseDate: (dateStr: string, formatStr: string = 'yyyy-MM-dd'): Date => {
    return parse(dateStr, formatStr, new Date())
  },

  isOverdue: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date
    return isPast(d) && d < new Date()
  },

  isUpcoming: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date
    return isFuture(d)
  },

  daysUntil: (date: Date | string): number => {
    const d = typeof date === 'string' ? new Date(date) : date
    return differenceInDays(d, new Date())
  },

  daysAgo: (date: Date | string): number => {
    const d = typeof date === 'string' ? new Date(date) : date
    return differenceInDays(new Date(), d)
  },

  getQuarter: (date: Date = new Date()): number => {
    return Math.floor(date.getMonth() / 3) + 1
  },

  getWeekNumber: (date: Date = new Date()): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  },
}

export function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  return { start, end }
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end
}
