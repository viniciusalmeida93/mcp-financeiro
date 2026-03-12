/**
 * Calculate daily spending limit for a given context
 * @param {number} receitas - total income for context
 * @param {number} despesasFixas - total fixed expenses for context
 * @param {number} diasRestantes - days remaining in month
 * @returns {number}
 */
export function calcularLimiteDiario(receitas, despesasFixas, diasRestantes) {
  if (diasRestantes <= 0) return 0
  return (receitas - despesasFixas) / diasRestantes
}

/**
 * Calculate profit margin as percentage
 * @param {number} receitas
 * @param {number} despesas
 * @returns {number} percentage (e.g. 83.2)
 */
export function calcularMargemLucro(receitas, despesas) {
  if (receitas <= 0) return 0
  return ((receitas - despesas) / receitas) * 100
}

/**
 * Calculate NF (Nota Fiscal) values
 * @param {number} valorBruto
 * @param {number} aliquota - percentage (default 5)
 * @returns {{ bruto: number, imposto: number, liquido: number }}
 */
export function calcularNF(valorBruto, aliquota = 5) {
  const imposto = (valorBruto * aliquota) / 100
  const liquido = valorBruto - imposto
  return { bruto: valorBruto, imposto, liquido }
}

/**
 * Create individual parcel entries for a purchase
 * @param {number} valorTotal
 * @param {number} numeroParcelas
 * @param {Date|string} dataInicio - date of first parcel
 * @returns {Array<{ numero: number, total: number, valor: number, data: Date }>}
 */
export function criarParcelas(valorTotal, numeroParcelas, dataInicio) {
  const valorParcela = valorTotal / numeroParcelas
  const inicio = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio
  const parcelas = []

  for (let i = 0; i < numeroParcelas; i++) {
    const data = new Date(inicio.getFullYear(), inicio.getMonth() + i, inicio.getDate())
    parcelas.push({
      numero: i + 1,
      total: numeroParcelas,
      valor: valorParcela,
      data,
    })
  }

  return parcelas
}

/**
 * Sum values from an array of objects by a key
 */
export function sumBy(arr, key) {
  return arr.reduce((acc, item) => acc + (Number(item[key]) || 0), 0)
}

/**
 * Filter items by context
 */
export function byContexto(arr, contexto) {
  if (!contexto || contexto === 'todos') return arr
  return arr.filter(item => item.contexto === contexto)
}
