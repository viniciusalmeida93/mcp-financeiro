import { useState, useEffect, useCallback } from 'react'
import { getLancamentos } from '../services/database'
import { useMes } from '../contexts/MesContext'

export function useLancamentos() {
  const { mes: mesSelecionado } = useMes()
  const [lancamentos, setLancamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    mes: mesSelecionado,
    contexto: 'todos',
    tipo: 'todos',
    categoria: '',
    search: '',
  })

  // Sync month filter when global month changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, mes: mesSelecionado }))
  }, [mesSelecionado])

  const fetchLancamentos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLancamentos(filters)
      setLancamentos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchLancamentos() }, [fetchLancamentos])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return {
    lancamentos,
    loading,
    error,
    filters,
    updateFilter,
    refresh: fetchLancamentos,
  }
}
