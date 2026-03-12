import { useState, useEffect, useCallback } from 'react'
import { getDespesasFixas } from '../services/database'

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
