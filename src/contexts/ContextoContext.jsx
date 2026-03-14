import { createContext, useContext, useState, useEffect } from 'react'

const ContextoContext = createContext(null)

export function ContextoProvider({ children }) {
  const [contexto, setContexto] = useState(
    () => localStorage.getItem('va-contexto') || 'empresa'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', contexto)
    localStorage.setItem('va-contexto', contexto)
  }, [contexto])

  return (
    <ContextoContext.Provider value={{ contexto, setContexto }}>
      {children}
    </ContextoContext.Provider>
  )
}

export function useContexto() {
  const ctx = useContext(ContextoContext)
  if (!ctx) throw new Error('useContexto must be used within ContextoProvider')
  return ctx
}
