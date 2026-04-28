import { TrendingUp, TrendingDown, Check, Wallet, Percent } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import { Card, CardContent } from '@/components/UI/Card'
import { Skeleton } from '@/components/UI/skeleton'
import { cn } from '@/lib/utils'

export default function MetricasDashboard({ saldoTotal, totalReceitas, totalDespesas, economia, receitaEsperada, despesaEsperada, loading }) {
  const cards = [
    {
      label: 'Receita Total',
      value: formatCurrency(receitaEsperada ?? 0),
      positive: true,
      Icon: TrendingUp,
    },
    {
      label: 'Recebido',
      value: formatCurrency(totalReceitas),
      positive: true,
      Icon: Check,
    },
    {
      label: 'Despesas Total',
      value: formatCurrency(despesaEsperada ?? 0),
      positive: false,
      Icon: TrendingDown,
    },
    {
      label: 'Pago',
      value: formatCurrency(totalDespesas),
      positive: false,
      Icon: Check,
    },
    {
      label: 'Saldo',
      value: formatCurrency(saldoTotal),
      positive: saldoTotal >= 0,
      Icon: Wallet,
    },
    {
      label: 'Economia',
      value: `${economia}%`,
      positive: economia >= 0,
      Icon: Percent,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ label, value, positive, Icon }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <div className={cn(
                'text-lg font-bold',
                positive ? 'text-green-500' : 'text-red-500'
              )}>
                {value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
