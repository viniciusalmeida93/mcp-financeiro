import { useState, useEffect } from 'react'
import BottomNav from '../UI/BottomNav'
import Sidebar from './Sidebar'

export default function AppWrapper({ children }) {
  const [contexto, setContexto] = useState(
    () => localStorage.getItem('va-contexto') || 'empresa'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', contexto)
    localStorage.setItem('va-contexto', contexto)
  }, [contexto])

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="app-content">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
