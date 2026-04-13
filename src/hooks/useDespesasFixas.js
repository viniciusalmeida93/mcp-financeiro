import { useState, useEffect, useCallback } from 'react'
import { getDespesasFixas, getCartoes, createLancamento, deleteLancamento } from '../services/database'
import { supabase } from '../services/supabase'
import { useMes } from '../contexts/MesContext'
import { getDaysInMonth } from 'date-fns'
import { calcParcelaNoMes, getDataRealDaDespesa } from '../utils/cicloFatura'

function getLastDay(mes) {
  const [y, m] = mes.split('-').map(Number)
  return `${mes}-${String(getDaysInMonth(new Date(y, m - 1))).padStart(2, '0')}`
}

/**
 * Retorna o "YYYY-MM" em que uma despesa pontual deve aparecer,
 * considerando o ciclo de fechamento do cartão.
 */
function getMesDaPontual(despesa, cartoes) {
  if (!despesa.created_at) return null
  const created = new Date(despesa.created_at)
  const createdYear = created.getFullYear()
  const createdMonth = created.getMonth() + 1
  const createdDay = created.getDate()

  let mesAno = `${createdYear}-${String(createdMonth).padStart(2, '0')}`

  // Se é cartão, verificar se passou do fechamento → mês seguinte
  if (despesa.forma_pagamento?.startsWith('cartao:')) {
    const cartaoId = despesa.forma_pagamento.replace('cartao:', '')
    const cartao = cartoes.find(c => c.id === cartaoId)
    if (cartao?.dia_fechamento && createdDay > cartao.dia_fechamento) {
      // Cai no mês seguinte
      let nextMonth = createdMonth + 1
      let nextYear = createdYear
      if (nextMonth > 12) { nextMonth = 1; nextYear++ }
      mesAno = `${nextYear}-${String(nextMonth).padStart(2, '0')}`
    }
  }
  return mesAno
}

/**
 * Filtra despesas que devem aparecer no mês selecionado.
 * - Mensal: sempre aparece (recorrente)
 * - Pontual: só aparece no mês em que foi criada (respeitando ciclo do cartão)
 * - Parcela: só aparece se a parcela calculada está no range
 */
function filtrarDespesasPorMes(despesas, mesSelecionado, cartoes) {
  return despesas.filter(d => {
    // Parcelas: verificar se existe parcela para este mês
    if (d.recorrencia === 'parcela') {
      const p = calcParcelaNoMes(d, mesSelecionado, cartoes)
      return p !== null
    }
    // Pontual: só aparece no mês em que foi criada
    if (d.recorrencia === 'pontual') {
      const mesDaPontual = getMesDaPontual(d, cartoes)
      return mesDaPontual === mesSelecionado
    }
    // Mensal: aparece todo mês
    return true
  })
}

export function useDespesasFixas() {
  const [despesas, setDespesas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contextoFilter, setContextoFilter] = useState('todos')

  const fetchDespesas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDespesasFixas({ status: 'ativo' })
      setDespesas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDespesas() }, [fetchDespesas])

  const filtered = contextoFilter === 'todos'
    ? despesas
    : despesas.filter(d => d.contexto === contextoFilter)

  return {
    despesas: filtered,
    allDespesas: despesas,
    loading,
    error,
    contextoFilter,
    setContextoFilter,
    refresh: fetchDespesas,
  }
}

export function useDespesasComStatus() {
  const [allDespesas, setAllDespesas] = useState([])
  const [cartoes, setCartoes] = useState([])
  const [pagosIds, setPagosIds] = useState(new Set())
  const [lancamentosMap, setLancamentosMap] = useState({})
  const [contextoFilter, setContextoFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { mes } = useMes()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [despData, cartoesData, { data: lancs }] = await Promise.all([
        getDespesasFixas({ status: 'ativo' }),
        getCartoes(),
        supabase
          .from('lancamentos')
          .select('id, descricao, valor, contexto, despesa_id')
          .eq('tipo', 'saida')
          .gte('data', `${mes}-01`)
          .lte('data', getLastDay(mes))
      ])

      setCartoes(cartoesData || [])

      // Mapear por despesa_id (novo) e por descricao (fallback para dados antigos)
      const pagoSet = new Set()
      const map = {}
      ;(lancs || []).forEach(l => {
        if (l.despesa_id) {
          pagoSet.add(l.despesa_id)
          map[l.despesa_id] = l.id
        } else {
          // Fallback: match por nome para lançamentos antigos
          const desp = despData.find(d => d.nome === l.descricao)
          if (desp) {
            pagoSet.add(desp.id)
            map[desp.id] = l.id
          }
        }
      })

      setAllDespesas(despData)
      setPagosIds(new Set(pagoSet))
      setLancamentosMap(map)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [mes])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleTogglePago = useCallback(async (conta) => {
    if (pagosIds.has(conta.id)) {
      // DESMARCAR: buscar lançamento de várias formas
      let lancId = lancamentosMap[conta.id]

      if (!lancId) {
        // Buscar por despesa_id
        const { data: rows1 } = await supabase
          .from('lancamentos')
          .select('id')
          .eq('tipo', 'saida')
          .eq('despesa_id', conta.id)
          .gte('data', `${mes}-01`)
          .lte('data', getLastDay(mes))
          .limit(1)
        lancId = rows1?.[0]?.id
      }

      if (!lancId) {
        // Fallback: buscar por nome
        const { data: rows2 } = await supabase
          .from('lancamentos')
          .select('id')
          .eq('tipo', 'saida')
          .eq('descricao', conta.nome)
          .gte('data', `${mes}-01`)
          .lte('data', getLastDay(mes))
          .limit(1)
        lancId = rows2?.[0]?.id
      }

      if (lancId) {
        await deleteLancamento(lancId)
      }
      setPagosIds(prev => { const s = new Set(prev); s.delete(conta.id); return s })
      setLancamentosMap(prev => { const m = { ...prev }; delete m[conta.id]; return m })
    } else {
      // MARCAR como pago — data dentro do mês selecionado
      const dia = conta.dia_vencimento || 1
      const [y, m] = mes.split('-').map(Number)
      const maxDia = getDaysInMonth(new Date(y, m - 1))
      const dataLanc = `${mes}-${String(Math.min(dia, maxDia)).padStart(2, '0')}`

      const novoLanc = await createLancamento({
        tipo: 'saida',
        valor: conta.valor,
        descricao: conta.nome,
        categoria: conta.categoria,
        forma_pagamento: conta.forma_pagamento,
        data: dataLanc,
        contexto: conta.contexto,
        despesa_id: conta.id,
      })
      if (novoLanc) {
        setPagosIds(prev => new Set([...prev, conta.id]))
        setLancamentosMap(prev => ({ ...prev, [conta.id]: novoLanc.id }))
      }
    }
  }, [pagosIds, lancamentosMap, mes])

  // Compute totals for a given contexto ('todos'|'empresa'|'pessoal') e categoria
  const calcTotais = useCallback((contexto, categoria = 'todos') => {
    let filtradas = filtrarDespesasPorMes(allDespesas, mes, cartoes)
    if (contexto !== 'todos') {
      filtradas = filtradas.filter(d => d.contexto === contexto)
    }
    if (categoria !== 'todos') {
      filtradas = filtradas.filter(d => d.categoria === categoria)
    }
    const total = filtradas.reduce((s, d) => s + Number(d.valor), 0)
    const pago = filtradas
      .filter(d => pagosIds.has(d.id))
      .reduce((s, d) => s + Number(d.valor), 0)
    return { total, pago, futuro: total - pago }
  }, [allDespesas, pagosIds, mes, cartoes])

  // Filtrar despesas visíveis no mês selecionado e ordenar por data real (mais antigo primeiro)
  const despesasNoMes = filtrarDespesasPorMes(allDespesas, mes, cartoes)
    .sort((a, b) => getDataRealDaDespesa(a, mes, cartoes) - getDataRealDaDespesa(b, mes, cartoes))
  const despesas = contextoFilter === 'todos'
    ? despesasNoMes
    : despesasNoMes.filter(d => d.contexto === contextoFilter)

  return {
    despesas,
    allDespesas,
    cartoes,
    pagosIds,
    lancamentosMap,
    contextoFilter,
    setContextoFilter,
    loading,
    error,
    refresh: fetchAll,
    handleTogglePago,
    calcTotais,
  }
}
