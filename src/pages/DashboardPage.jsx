import MetricasDashboard from '../components/Dashboard/MetricasDashboard'
import EvolucaoGastosCard from '../components/Dashboard/EvolucaoGastosCard'
import ProximosVencimentosCard from '../components/Dashboard/ProximosVencimentosCard'
import ClientesReceberCard from '../components/Dashboard/ClientesReceberCard'
import { useDashboard } from '../hooks/useDashboard'

export default function DashboardPage() {
  const dashboard = useDashboard()

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
        totalDespesas={dashboard.totalDespesas}
        economia={dashboard.economia}
        loading={dashboard.loading}
      />

      {/* Próximos 7 dias — 2-col grid on larger screens */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ClientesReceberCard
          clientesAReceber={dashboard.clientesAReceber}
          loading={dashboard.loading}
          pagosClienteIds={dashboard.pagosClienteIds}
          onReceber={dashboard.marcarClienteRecebido}
        />
        <ProximosVencimentosCard
          proximasContas={dashboard.proximasContas}
          loading={dashboard.loading}
          pagosNomes={dashboard.pagosNomes}
          onPagar={dashboard.marcarContaPaga}
        />
      </div>

      {/* Chart */}
      <EvolucaoGastosCard
        evolucaoDiaria={dashboard.evolucaoDiaria}
        totalDespesas={dashboard.totalDespesas}
        loading={dashboard.loading}
      />
    </div>
  )
}
