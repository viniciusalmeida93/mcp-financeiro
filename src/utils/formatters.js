import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Format a number as Brazilian Real currency
 * @param {number} value
 * @param {boolean} [showSign=false] - show + for positive values
 */
export const formatCurrency = (value, showSign = false) => {
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(abs)

  if (showSign && value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}

/**
 * Format a date as dd/MM/yyyy
 */
export const formatDate = (date) => {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'dd/MM/yyyy')
  } catch {
    return ''
  }
}

/**
 * Format a date as dd/MM
 */
export const formatDateShort = (date) => {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'dd/MM')
  } catch {
    return ''
  }
}

/**
 * Format a month string (YYYY-MM) as "Mês Ano" in Portuguese
 */
export const formatMesAno = (mes) => {
  if (!mes) return ''
  try {
    const d = parseISO(`${mes}-01`)
    return format(d, 'MMMM yyyy', { locale: ptBR })
      .replace(/^\w/, c => c.toUpperCase())
  } catch {
    return mes
  }
}

/**
 * Format a percentage
 */
export const formatPercent = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Get current month in YYYY-MM format
 */
export const getCurrentMes = () => {
  return format(new Date(), 'yyyy-MM')
}

/**
 * Get last N months including current, most recent first
 */
export const getLastNMeses = (n = 12) => {
  const meses = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    meses.push(format(d, 'yyyy-MM'))
  }
  return meses
}

/**
 * Get all months from startMes to endMes (YYYY-MM), most recent first.
 * If endMes is in the past, uses current month instead.
 */
export const getMesesFrom = (startMes, endMes) => {
  const meses = []
  const [sy, sm] = startMes.split('-').map(Number)
  const start = new Date(sy, sm - 1, 1)
  const now = new Date()

  let end
  if (endMes) {
    const [ey, em] = endMes.split('-').map(Number)
    const endFixed = new Date(ey, em - 1, 1)
    end = endFixed > now ? endFixed : new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    end = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  let cursor = new Date(end)
  while (cursor >= start) {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, '0')
    meses.push(`${y}-${m}`)
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
  }
  return meses
}
