import { format, formatDistanceToNow, parseISO, isAfter, isBefore, addDays } from 'date-fns'
import { ko } from 'date-fns/locale'

/**
 * Format date to Korean format
 */
export const formatDate = (date, formatStr = 'yyyy년 MM월 dd일 HH:mm') => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: ko })
}

/**
 * Format relative time (e.g., "3시간 전")
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ko })
}

/**
 * Check if date is in the past
 */
export const isPast = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isBefore(dateObj, new Date())
}

/**
 * Check if date is in the future
 */
export const isFuture = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isAfter(dateObj, new Date())
}

/**
 * Add days to date
 */
export const addDaysToDate = (date, days) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return addDays(dateObj, days)
}

/**
 * Get D-day count
 */
export const getDday = (date) => {
  if (!date) return null
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dateObj.setHours(0, 0, 0, 0)

  const diffTime = dateObj.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '오늘'
  if (diffDays < 0) return `D+${Math.abs(diffDays)}`
  return `D-${diffDays}`
}
