import Header from '../components/Layout/Header'
import SaldoCard from '../components/Dashboard/SaldoCard'
import LimiteDiarioCard from '../components/Dashboard/LimiteDiarioCard'
import ProximosVencimentosCard from '../components/Dashboard/ProximosVencimentosCard'
import ClientesReceberCard from '../components/Dashboard/ClientesReceberCard'
import { useDashboard } from '../hooks/useDashboard'

export default function DashboardPage() {
  const dashboard = useDashboard()

  return (
    <>
      <Header
        title="VA Studio Financeiro"
        rightAction={
          <button className="btn btn--ghost btn--sm" onClick={dashboard.refresh} title="Atualizar">
            🔄
          </button>
        }
      />

      <SaldoCard
        saldoEmpresa={dashboard.saldoEmpresa}
        saldoPessoal={dashboard.saldoPessoal}
        saldoTotal={dashboard.saldoTotal}
        loading={dashboard.loading}
      />

      <LimiteDiarioCard
        receitasEmpresa={dashboard.receitasEmpresa}
        despesasFixasEmpresa={dashboard.despesasFixasEmpresa}
        receitasPessoal={dashboard.receitasPessoal}
        despesasFixasPessoal={dashboard.despesasFixasPessoal}
        diasRestantes={dashboard.diasRestantes}
        loading={dashboard.loading}
      />

      <ProximosVencimentosCard
        proximasContas={dashboard.proximasContas}
        loading={dashboard.loading}
      />

      <ClientesReceberCard
        clientesAReceber={dashboard.clientesAReceber}
        loading={dashboard.loading}
      />
    </>
  )
}
