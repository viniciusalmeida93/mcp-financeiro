import { useState, useEffect, useCallback } from 'react'
import { getClientes, createLancamento, deleteLancamento } from '../services/database'
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
          .select('id, cliente_id, valor, contexto')
          .eq('tipo', 'entrada')
          .not('cliente_id', 'is', null)
          .gte('data', `${mes}-01`)
          .lte('data', getLastDay(mes))
      ])
      setClientes(clientesData)
      const ids = new Set()
      const map = {}
      ;(lancs || []).forEach(l => {
        ids.add(l.cliente_id)
        map[l.cliente_id] = l.id
      })
      setPagosIds(ids)
      setLancamentosMap(map)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [mes])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleTogglePago = useCallback(async (cliente) => {
    if (pagosIds.has(cliente.id)) {
      const lancId = lancamentosMap[cliente.id]
      if (lancId) await deleteLancamento(lancId)
      setPagosIds(prev => { const s = new Set(prev); s.delete(cliente.id); return s })
      setLancamentosMap(prev => { const m = { ...prev }; delete m[cliente.id]; return m })
    } else {
      const novoLanc = await createLancamento({
        tipo: 'entrada',
        valor: cliente.valor,
        descricao: cliente.nome,
        categoria: cliente.servico || 'servicos',
        forma_pagamento: 'pix',
        data: new Date().toISOString().split('T')[0],
        contexto: cliente.contexto,
        cliente_id: cliente.id,
      })
      if (novoLanc) {
        setPagosIds(prev => new Set([...prev, cliente.id]))
        setLancamentosMap(prev => ({ ...prev, [cliente.id]: novoLanc.id }))
      }
    }
  }, [pagosIds, lancamentosMap])

  // Compute totals for a given contexto ('todos'|'empresa'|'pessoal')
  const calcTotais = useCallback((contexto) => {
    const ativos = clientes.filter(c =>
      c.status === 'ativo' && c.tipo === 'mensal' &&
      (contexto === 'todos' || c.contexto === contexto)
    )
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
    loading,
    error,
    refresh: fetchAll,
    handleTogglePago,
    calcTotais,
  }
}
