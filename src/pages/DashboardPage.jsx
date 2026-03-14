import MetricasDashboard from '../components/Dashboard/MetricasDashboard'
import EvolucaoGastosCard from '../components/Dashboard/EvolucaoGastosCard'
import ProximosVencimentosCard from '../components/Dashboard/ProximosVencimentosCard'
import ClientesReceberCard from '../components/Dashboard/ClientesReceberCard'
import { useDashboard } from '../hooks/useDashboard'

export default function DashboardPage() {
  const dashboard = useDashboard()

  return (
    <>
      {dashboard.error && (
        <div className="card" style={{ borderColor: 'var(--color-danger)', marginBottom: 16 }}>
          <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>Erro: {dashboard.error}</p>
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

      {/* Próximos 7 dias */}
      <div className="dashboard-mid-row">
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
    </>
  )
}
