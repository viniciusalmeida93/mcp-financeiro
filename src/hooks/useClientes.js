import { useState, useEffect, useCallback } from 'react'
import { getClientes, createLancamento, deleteLancamento, updateLancamento } from '../services/database'
import { supabase } from '../services/supabase'
import { useMes } from '../contexts/MesContext'
import { getDaysInMonth } from 'date-fns'

function getLastDay(mes) {
  const [y, m] = mes.split('-').map(Number)
  return `${mes}-${String(getDaysInMonth(new Date(y, m - 1))).padStart(2, '0')}`
}

export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getClientes()
      setClientes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchClientes() }, [fetchClientes])

  return { clientes, loading, error, refresh: fetchClientes }
}

export function useClientesComStatus() {
  const [clientes, setClientes] = useState([])
  const [pagosIds, setPagosIds] = useState(new Set())
  const [lancamentosMap, setLancamentosMap] = useState({})
  const [lancsPorCliente, setLancsPorCliente] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { mes } = useMes()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [clientesData, { data: lancs }] = await Promise.all([
        getClientes(),
        supabase
          .from('lancamentos')
          .select('id, cliente_id, valor, contexto, data, parcela_atual, parcela_total, pago')
          .eq('tipo', 'entrada')
          .not('cliente_id', 'is', null)
          .gte('data', `${mes}-01`)
          .lte('data', getLastDay(mes))
      ])
      setClientes(clientesData)
      const ids = new Set()
      const map = {}
      const byCliente = {}
      ;(lancs || []).forEach(l => {
        // pago=true (default) ou ausente conta como pago, pago=false explicito nao conta
        const isPago = l.pago !== false
        if (isPago) ids.add(l.cliente_id)
        map[l.cliente_id] = l.id
        if (!byCliente[l.cliente_id]) byCliente[l.cliente_id] = []
        byCliente[l.cliente_id].push(l)
      })
      setPagosIds(ids)
      setLancamentosMap(map)
      setLancsPorCliente(byCliente)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [mes])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleTogglePago = useCallback(async (cliente) => {
    const lancsCliente = lancsPorCliente[cliente.id] || []
    const isPontual = cliente.tipo === 'pontual'

    // Se ja tem lancamento(s) no mes, alterna o flag pago no primeiro (parcela ou avulso ja criado)
    if (lancsCliente.length > 0) {
      const lanc = lancsCliente[0]
      const novoPago = lanc.pago === false  // pago=false -> true, pago=true/null -> false
      await updateLancamento(lanc.id, { pago: novoPago })
      setLancsPorCliente(prev => ({
        ...prev,
        [cliente.id]: prev[cliente.id].map(l => l.id === lanc.id ? { ...l, pago: novoPago } : l)
      }))
      setPagosIds(prev => {
        const s = new Set(prev)
        if (novoPago) s.add(cliente.id); else s.delete(cliente.id)
        return s
      })
      return
    }

    // Sem lancamento no mes: so faz sentido para mensal (pontual nao deveria estar visivel)
    if (isPontual) return

    const dia = cliente.dia_vencimento || 1
    const [y, m] = mes.split('-').map(Number)
    const maxDia = getDaysInMonth(new Date(y, m - 1))
    const dataLanc = `${mes}-${String(Math.min(dia, maxDia)).padStart(2, '0')}`

    const novoLanc = await createLancamento({
      tipo: 'entrada',
      valor: cliente.valor,
      descricao: cliente.nome,
      categoria: cliente.servico || 'servicos',
      forma_pagamento: 'pix',
      data: dataLanc,
      contexto: cliente.contexto,
      cliente_id: cliente.id,
      pago: true,
    })
    if (novoLanc) {
      setPagosIds(prev => new Set([...prev, cliente.id]))
      setLancamentosMap(prev => ({ ...prev, [cliente.id]: novoLanc.id }))
      setLancsPorCliente(prev => ({
        ...prev,
        [cliente.id]: [...(prev[cliente.id] || []), novoLanc],
      }))
    }
  }, [pagosIds, lancsPorCliente, mes])

  // Compute totals for a given contexto ('todos'|'empresa'|'pessoal') e tipo ('todos'|'mensal'|'pontual')
  const calcTotais = useCallback((contexto, tipoFiltro = 'todos') => {
    const ativos = clientes.filter(c => {
      if (c.status !== 'ativo') return false
      if (contexto !== 'todos' && c.contexto !== contexto) return false
      if (tipoFiltro !== 'todos' && c.tipo !== tipoFiltro) return false
      // Quando filtro é 'todos', considera só mensais (comportamento anterior)
      if (tipoFiltro === 'todos' && c.tipo !== 'mensal') return false
      return true
    })
    const total = ativos.reduce((s, c) => s + Number(c.valor), 0)
    const recebido = ativos
      .filter(c => pagosIds.has(c.id))
      .reduce((s, c) => s + Number(c.valor), 0)
    return { total, recebido, futuro: total - recebido }
  }, [clientes, pagosIds])

  return {
    clientes,
    pagosIds,
    lancamentosMap,
    lancsPorCliente,
    loading,
    error,
    refresh: fetchAll,
    handleTogglePago,
    calcTotais,
  }
}
