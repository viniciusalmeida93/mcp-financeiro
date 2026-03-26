import { useState } from 'react'
import MetricasDashboard from '../components/Dashboard/MetricasDashboard'
import EvolucaoGastosCard from '../components/Dashboard/EvolucaoGastosCard'
import ProximosVencimentosCard from '../components/Dashboard/ProximosVencimentosCard'
import ClientesReceberCard from '../components/Dashboard/ClientesReceberCard'
import NovoRegistroPicker from '../components/Dashboard/NovoRegistroPicker'
import NovoCliente from '../components/Clientes/NovoCliente'
import NovaDespesaFixa from '../components/Contas/NovaDespesaFixa'
import { useDashboard } from '../hooks/useDashboard'
import { useMes } from '../contexts/MesContext'
import { Plus } from 'lucide-react'

export default function DashboardPage() {
  const { mes } = useMes()
  const dashboard = useDashboard(mes)
  const [showPicker, setShowPicker] = useState(false)
  const [showCliente, setShowCliente] = useState(false)
  const [showDespesa, setShowDespesa] = useState(false)

  return (
    <div className="space-y-4">
      {dashboard.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">Erro: {dashboard.error}</p>
        </div>
      )}

      {/* 4 metric cards */}
      <MetricasDashboard
        saldoTotal={dashboard.saldoTotal}
        totalReceitas={dashboard.totalReceitas}
        totalDespesas={dashboard.despesasPagasTotal}
        economia={dashboard.economia}
        receitaEsperada={dashboard.receitaEsperada}
        despesaEsperada={dashboard.despesaEsperada}
        loading={dashboard.loading}
      />

      {/* Próximos 7 dias — 2-col grid on larger screens */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ClientesReceberCard
          clientesAReceber={dashboard.clientesAReceber}
          loading={dashboard.loading}
          pagosClienteIds={dashboard.pagosClienteIds}
          onReceber={dashboard.marcarClienteRecebido}
          onDesreceber={dashboard.desmarcarClienteRecebido}
        />
        <ProximosVencimentosCard
          proximasContas={dashboard.proximasContas}
          loading={dashboard.loading}
          pagosNomes={dashboard.pagosNomes}
          onPagar={dashboard.marcarContaPaga}
          onDesmarcar={dashboard.desmarcarContaPaga}
        />
      </div>

      {/* Chart */}
      <EvolucaoGastosCard
        evolucaoDiaria={dashboard.evolucaoDiaria}
        totalDespesas={dashboard.totalDespesas}
        loading={dashboard.loading}
      />

      {/* FAB */}
      <button
        onClick={() => setShowPicker(true)}
        className="fixed bottom-20 right-4 md:bottom-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        title="Novo registro"
      >
        <Plus size={24} />
      </button>

      <NovoRegistroPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectReceita={() => setShowCliente(true)}
        onSelectDespesa={() => setShowDespesa(true)}
      />

      <NovoCliente
        isOpen={showCliente}
        onClose={() => setShowCliente(false)}
        onSuccess={dashboard.refresh}
      />

      <NovaDespesaFixa
        isOpen={showDespesa}
        onClose={() => setShowDespesa(false)}
        onSuccess={dashboard.refresh}
      />
    </div>
  )
}
