import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppWrapper from './components/Layout/AppWrapper'
import { Toaster } from '@/components/ui/sonner'
import DashboardPage from './pages/DashboardPage'
import LancamentosPage from './pages/LancamentosPage'
import ClientesPage from './pages/ClientesPage'
import ContasPage from './pages/ContasPage'
import RelatoriosPage from './pages/RelatoriosPage'
import CartoesPage from './pages/CartoesPage'
import CategoriasPage from './pages/CategoriasPage'

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
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
    </BrowserRouter>
  )
}

export default App
