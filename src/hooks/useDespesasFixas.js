import { useState, useEffect, useCallback } from 'react'
import { getDespesasFixas, createLancamento, deleteLancamento } from '../services/database'
import { supabase } from '../services/supabase'
import { useMes } from '../contexts/MesContext'
import { getDaysInMonth } from 'date-fns'

function getLastDay(mes) {
  const [y, m] = mes.split('-').map(Number)
  return `${mes}-${String(getDaysInMonth(new Date(y, m - 1))).padStart(2, '0')}`
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
  const [pagosNomes, setPagosNomes] = useState(new Set())
  const [lancamentosMap, setLancamentosMap] = useState({})
  const [contextoFilter, setContextoFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { mes } = useMes()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [despData, { data: lancs }] = await Promise.all([
        getDespesasFixas({ status: 'ativo' }),
        supabase
          .from('lancamentos')
          .select('id, descricao, valor, contexto')
          .eq('tipo', 'saida')
          .gte('data', `${mes}-01`)
          .lte('data', getLastDay(mes))
      ])

      const existingNomes = new Set((lancs || []).map(l => l.descricao))
      const map = {}
      ;(lancs || []).forEach(l => { map[l.descricao] = l.id })

      // Auto-pay credit card expenses where dia_vencimento <= today
      const today = new Date().getDate()
      const candidates = despData.filter(d =>
        d.forma_pagamento?.startsWith('cartao:') &&
        d.dia_vencimento <= today &&
        !existingNomes.has(d.nome)
      )
      for (const d of candidates) {
        try {
          const novoLanc = await createLancamento({
            tipo: 'saida',
            valor: d.valor,
            descricao: d.nome,
            categoria: d.categoria,
            forma_pagamento: d.forma_pagamento,
            data: new Date().toISOString().split('T')[0],
            contexto: d.contexto,
          })
          if (novoLanc) {
            existingNomes.add(d.nome)
            map[d.nome] = novoLanc.id
          }
        } catch (err) {
          console.error('Auto-pay error for', d.nome, err)
        }
      }

      setAllDespesas(despData)
      setPagosNomes(new Set(existingNomes))
      setLancamentosMap(map)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [mes])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleTogglePago = useCallback(async (conta) => {
    if (pagosNomes.has(conta.nome)) {
      const lancId = lancamentosMap[conta.nome]
      if (lancId) await deleteLancamento(lancId)
      setPagosNomes(prev => { const s = new Set(prev); s.delete(conta.nome); return s })
      setLancamentosMap(prev => { const m = { ...prev }; delete m[conta.nome]; return m })
    } else {
      const novoLanc = await createLancamento({
        tipo: 'saida',
        valor: conta.valor,
        descricao: conta.nome,
        categoria: conta.categoria,
        forma_pagamento: conta.forma_pagamento,
        data: new Date().toISOString().split('T')[0],
        contexto: conta.contexto,
      })
      if (novoLanc) {
        setPagosNomes(prev => new Set([...prev, conta.nome]))
        setLancamentosMap(prev => ({ ...prev, [conta.nome]: novoLanc.id }))
      }
    }
  }, [pagosNomes, lancamentosMap])

  // Compute totals for a given contexto ('todos'|'empresa'|'pessoal')
  const calcTotais = useCallback((contexto) => {
    const filtradas = contexto === 'todos'
      ? allDespesas
      : allDespesas.filter(d => d.contexto === contexto)
    const total = filtradas.reduce((s, d) => s + Number(d.valor), 0)
    const pago = filtradas
      .filter(d => pagosNomes.has(d.nome))
      .reduce((s, d) => s + Number(d.valor), 0)
    return { total, pago, futuro: total - pago }
  }, [allDespesas, pagosNomes])

  const despesas = contextoFilter === 'todos'
    ? allDespesas
    : allDespesas.filter(d => d.contexto === contextoFilter)

  return {
    despesas,
    allDespesas,
    pagosNomes,
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
