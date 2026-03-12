import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppWrapper from './components/Layout/AppWrapper'
import DashboardPage from './pages/DashboardPage'
import LancamentosPage from './pages/LancamentosPage'
import ClientesPage from './pages/ClientesPage'
import ContasPage from './pages/ContasPage'
import RelatoriosPage from './pages/RelatoriosPage'

function App() {
  return (
    <BrowserRouter>
      <AppWrapper>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/lancamentos" element={<LancamentosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/contas" element={<ContasPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppWrapper>
    </BrowserRouter>
  )
}

export default App
