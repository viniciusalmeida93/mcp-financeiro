import { format, getDaysInMonth, differenceInDays, parseISO, isWithinInterval } from 'date-fns'

/**
 * Get the number of days remaining in the current month from today
 */
export const getDiasRestantesNoMes = () => {
  const today = new Date()
  const lastDay = getDaysInMonth(today)
  return lastDay - today.getDate()
}

/**
 * Get days until a given day-of-month target (in current or next month)
 */
export const getDiasAteDia = (dia) => {
  const today = new Date()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dia)
  if (thisMonth >= today) {
    return differenceInDays(thisMonth, today)
  }
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dia)
  return differenceInDays(nextMonth, today)
}

/**
 * Get the next due date for a given day-of-month
 * Returns a Date object (this month if not yet passed, next month otherwise)
 */
export const getProximoVencimento = (dia) => {
  const today = new Date()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dia)
  if (thisMonth >= today) return thisMonth
  return new Date(today.getFullYear(), today.getMonth() + 1, dia)
}

/**
 * Check if a date is within the next N days (inclusive)
 */
export const isWithinNextDays = (date, days) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(today)
  target.setDate(target.getDate() + days)
  const d = typeof date === 'string' ? parseISO(date) : date
  return isWithinInterval(d, { start: today, end: target })
}

/**
 * Get YYYY-MM from a Date object
 */
export const toMesString = (date = new Date()) => {
  return format(date, 'yyyy-MM')
}

/**
 * Get YYYY-MM-DD from a Date object
 */
export const toDateString = (date = new Date()) => {
  return format(date, 'yyyy-MM-dd')
}
