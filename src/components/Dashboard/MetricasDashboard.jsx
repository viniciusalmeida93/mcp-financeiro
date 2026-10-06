import { TrendingUp, TrendingDown, Check, Wallet, Percent } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import StatCard from '@/components/UI/StatCard'

export default function MetricasDashboard({ saldoTotal, totalReceitas, totalDespesas, economia, receitaEsperada, despesaEsperada, loading }) {
  const cards = [
    { label: 'Receita Total', order: 'lg:order-1', value: formatCurrency(receitaEsperada ?? 0), tone: 'success', Icon: TrendingUp },
    { label: 'Recebido', order: 'lg:order-4', value: formatCurrency(totalReceitas), tone: 'success', Icon: Check },
    { label: 'Despesas Total', order: 'lg:order-2', value: formatCurrency(despesaEsperada ?? 0), tone: 'destructive', Icon: TrendingDown },
    { label: 'Pago', order: 'lg:order-5', value: formatCurrency(totalDespesas), tone: 'destructive', Icon: Check },
    { label: 'Saldo', order: 'lg:order-3', value: formatCurrency(saldoTotal), tone: saldoTotal >= 0 ? 'success' : 'destructive', Icon: Wallet },
    { label: 'Economia', order: 'lg:order-6', value: `${economia}%`, tone: economia >= 0 ? 'success' : 'destructive', Icon: Percent },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
      {cards.map(({ label, value, tone, Icon, order }) => (
        <StatCard key={label} className={order} label={label} value={value} tone={tone} icon={Icon} loading={loading} />
      ))}
    </div>
  )
}
