/**
 * Verifica se a despesa "encerrou" antes ou no mês selecionado.
 * Despesa com data_termino = '2026-04-15' não aparece em mes >= '2026-04'.
 */
export function despesaEncerrada(despesa, mesSelecionado) {
  if (!despesa.data_termino) return false
  const terminoMes = String(despesa.data_termino).slice(0, 7) // 'YYYY-MM'
  return mesSelecionado >= terminoMes
}

/**
 * Fallback para despesas pontuais sem mes_referencia (legacy).
 * Deriva o mês a partir do created_at, ajustando ciclo do cartão.
 */
export function getMesDaPontual(despesa, cartoes = []) {
  if (!despesa.created_at) return null
  const created = new Date(despesa.created_at)
  const createdYear = created.getFullYear()
  const createdMonth = created.getMonth() + 1
  const createdDay = created.getDate()

  let mesAno = `${createdYear}-${String(createdMonth).padStart(2, '0')}`

  if (despesa.forma_pagamento?.startsWith('cartao:')) {
    const cartaoId = despesa.forma_pagamento.replace('cartao:', '')
    const cartao = cartoes.find(c => c.id === cartaoId)
    if (cartao?.dia_fechamento && createdDay > cartao.dia_fechamento) {
      let nextMonth = createdMonth + 1
      let nextYear = createdYear
      if (nextMonth > 12) { nextMonth = 1; nextYear++ }
      mesAno = `${nextYear}-${String(nextMonth).padStart(2, '0')}`
    }
  }
  return mesAno
}

/**
 * Verdade única: a despesa aparece no mês selecionado?
 * - Encerrada: não aparece a partir do mês de término
 * - Mensal: sempre aparece
 * - Parcela: só se a parcela calculada cabe no range
 * - Pontual: usa mes_referencia (escolha do usuário) ou created_at como fallback
 */
export function despesaAparecemNoMes(despesa, mesSelecionado, cartoes = []) {
  if (despesaEncerrada(despesa, mesSelecionado)) return false
  if (despesa.recorrencia === 'parcela') {
    return calcParcelaNoMes(despesa, mesSelecionado, cartoes) !== null
  }
  if (despesa.recorrencia === 'pontual') {
    if (despesa.mes_referencia) return despesa.mes_referencia === mesSelecionado
    return getMesDaPontual(despesa, cartoes) === mesSelecionado
  }
  return true // mensal
}

/**
 * Calcula em qual mês de fatura uma despesa cai, considerando:
 * - Despesas não-cartão (PIX, boleto, etc): cai no mês do dia_vencimento
 * - Despesas no cartão: cai baseado no dia_fechamento do cartão
 *   Se dia_vencimento <= dia_fechamento → mesmo mês
 *   Se dia_vencimento > dia_fechamento → mês seguinte
 *
 * @param {object} despesa - { dia_vencimento, forma_pagamento }
 * @param {array} cartoes - lista de cartões com { id, dia_fechamento }
 * @returns {number} offset em meses (0 = mesmo mês, 1 = mês seguinte)
 */
export function getMesOffset(despesa, cartoes = []) {
  if (!despesa.forma_pagamento?.startsWith('cartao:')) return 0

  const cartaoId = despesa.forma_pagamento.replace('cartao:', '')
  const cartao = cartoes.find(c => c.id === cartaoId)
  if (!cartao || !cartao.dia_fechamento) return 0

  const diaVenc = Number(despesa.dia_vencimento) || 1
  const diaFech = Number(cartao.dia_fechamento)

  // Se o dia da despesa é depois do fechamento, cai no mês seguinte
  return diaVenc > diaFech ? 1 : 0
}

/**
 * Dado um mês selecionado (ex: "2026-04"), retorna o mês em que a despesa
 * realmente "aparece" na fatura.
 * Usado para filtrar: a despesa aparece no mesSelecionado se
 * mesOriginal + offset === mesSelecionado
 *
 * Ou seja, para saber se uma despesa aparece em abril:
 * - PIX com dia 15: offset=0 → aparece em abril (dia 15 de abril)
 * - Cartão fecha dia 21, despesa dia 25: offset=1 → a despesa de março aparece em abril
 * - Cartão fecha dia 21, despesa dia 10: offset=0 → a despesa de abril aparece em abril
 */
export function despesaPertenceAoMes(despesa, mesSelecionado, cartoes = []) {
  // Não-cartão: sempre pertence ao mês selecionado (são fixas mensais)
  if (!despesa.forma_pagamento?.startsWith('cartao:')) return true

  const cartaoId = despesa.forma_pagamento.replace('cartao:', '')
  const cartao = cartoes.find(c => c.id === cartaoId)
  if (!cartao || !cartao.dia_fechamento) return true

  // Cartão: a despesa sempre aparece, mas a data exibida muda
  // Despesas fixas são recorrentes, então elas aparecem todo mês
  return true
}

/**
 * Calcula o mês real em que a despesa do cartão será cobrada.
 * Para uma despesa com dia_vencimento e um cartão com dia_fechamento,
 * dado que estamos vendo o mês X:
 * - Se dia_vencimento > dia_fechamento: a despesa do mês X aparece no mês X+1
 *   Ou seja, no mês X a gente vê a despesa que "veio" do mês X-1
 *
 * @param {string} mesSelecionado - "YYYY-MM"
 * @param {object} despesa
 * @param {array} cartoes
 * @returns {string} mês em formato "YYYY-MM" onde a despesa é exibida
 */
export function getMesExibicao(mesSelecionado, despesa, cartoes = []) {
  const offset = getMesOffset(despesa, cartoes)
  if (offset === 0) return mesSelecionado

  // Se offset=1, essa despesa no mês selecionado na verdade vai pro próximo mês.
  // Então no mês selecionado, mostramos a despesa que veio do mês anterior.
  return mesSelecionado
}

/**
 * Para parcelas no cartão, calcula qual parcela aparece em qual mês.
 *
 * @param {object} despesa - { parcela_atual, parcela_total, dia_vencimento, forma_pagamento, created_at }
 * @param {string} mesSelecionado - "YYYY-MM"
 * @param {array} cartoes
 * @returns {object|null} { atual, total } ou null se não é parcela ou não cabe no mês
 */
export function calcParcelaNoMes(despesa, mesSelecionado, cartoes = []) {
  if (despesa.recorrencia !== 'parcela' || !despesa.parcela_atual || !despesa.parcela_total) return null
  if (!mesSelecionado) return { atual: despesa.parcela_atual, total: despesa.parcela_total }

  const [selYear, selMonth] = mesSelecionado.split('-').map(Number)

  // Determinar o mês de referência (quando parcela_atual foi definida)
  let refYear, refMonth
  if (despesa.mes_referencia) {
    // Usa mes_referencia salvo na criação (ex: "2026-03")
    ;[refYear, refMonth] = despesa.mes_referencia.split('-').map(Number)
  } else if (despesa.created_at) {
    // Fallback: usa created_at
    const created = new Date(despesa.created_at)
    refYear = created.getFullYear()
    refMonth = created.getMonth() + 1
  } else {
    return { atual: despesa.parcela_atual, total: despesa.parcela_total }
  }

  // Meses desde o mês de referência
  const diffMonths = (selYear - refYear) * 12 + (selMonth - refMonth)

  const atual = despesa.parcela_atual + diffMonths
  if (atual < 1 || atual > despesa.parcela_total) return null
  return { atual, total: despesa.parcela_total }
}

/**
 * Formata a data de vencimento no mês selecionado, considerando offset do cartão.
 *
 * @param {number} dia - dia do vencimento
 * @param {string} mesSelecionado - "YYYY-MM"
 * @param {object} despesa - para checar forma_pagamento
 * @param {array} cartoes
 * @returns {string} "dd/mm/aa"
 */
export function formatDataVencimento(dia, mesSelecionado, despesa, cartoes = []) {
  if (!dia || !mesSelecionado) return ''
  const d = String(dia).padStart(2, '0')
  let [year, month] = mesSelecionado.split('-').map(Number)

  // Se é cartão e o dia da despesa é DEPOIS do fechamento,
  // a despesa que aparece neste mês na verdade foi feita no mês anterior
  if (despesa?.forma_pagamento?.startsWith('cartao:')) {
    const cartaoId = despesa.forma_pagamento.replace('cartao:', '')
    const cartao = cartoes.find(c => c.id === cartaoId)
    if (cartao?.dia_fechamento && dia > cartao.dia_fechamento) {
      month -= 1
      if (month < 1) { month = 12; year -= 1 }
    }
  }

  const mm = String(month).padStart(2, '0')
  const yy = String(year).slice(2)
  return `${d}/${mm}/${yy}`
}

/**
 * Retorna uma data numérica (YYYYMMDD) para ordenação.
 * Calcula a data real da despesa considerando o ciclo do cartão.
 */
export function getDataRealDaDespesa(despesa, mesSelecionado, cartoes = []) {
  const dia = Number(despesa.dia_vencimento) || 1
  let [year, month] = mesSelecionado.split('-').map(Number)

  if (despesa.forma_pagamento?.startsWith('cartao:')) {
    const cartaoId = despesa.forma_pagamento.replace('cartao:', '')
    const cartao = cartoes.find(c => c.id === cartaoId)
    if (cartao?.dia_fechamento && dia > cartao.dia_fechamento) {
      month -= 1
      if (month < 1) { month = 12; year -= 1 }
    }
  }

  return year * 10000 + month * 100 + dia
}
