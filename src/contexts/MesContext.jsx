import { createContext, useContext, useState } from 'react'
import { getCurrentMes } from '../utils/formatters'

const MesContext = createContext(null)

export function MesProvider({ children }) {
  const [mes, setMes] = useState(getCurrentMes)

  return (
    <MesContext.Provider value={{ mes, setMes }}>
      {children}
    </MesContext.Provider>
  )
}

export function useMes() {
  const ctx = useContext(MesContext)
  if (!ctx) throw new Error('useMes must be used within MesProvider')
  return ctx
}
