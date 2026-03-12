import { useState, useEffect, useCallback } from 'react'
import { getClientes } from '../services/database'

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
