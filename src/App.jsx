import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { MesProvider } from './contexts/MesContext'
import AppWrapper from './components/Layout/AppWrapper'
import { Toaster } from '@/components/UI/sonner'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LancamentosPage from './pages/LancamentosPage'
import ClientesPage from './pages/ClientesPage'
import ContasPage from './pages/ContasPage'
import RelatoriosPage from './pages/RelatoriosPage'
import CartoesPage from './pages/CartoesPage'
import CategoriasPage from './pages/CategoriasPage'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <AppWrapper>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/lancamentos" element={<LancamentosPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/contas" element={<ContasPage />} />
        <Route path="/cartoes" element={<CartoesPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/relatorios" element={<RelatoriosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppWrapper>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <AuthProvider>
        <MesProvider>
          <AppRoutes />
        </MesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
