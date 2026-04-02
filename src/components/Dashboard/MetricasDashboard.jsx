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
      icon: '↑',
    },
    {
      label: 'Recebido',
      value: formatCurrency(totalReceitas),
      positive: true,
      icon: '✓',
    },
    {
      label: 'Despesas Total',
      value: formatCurrency(despesaEsperada ?? 0),
      positive: false,
      icon: '↓',
    },
    {
      label: 'Pago',
      value: formatCurrency(totalDespesas),
      positive: false,
      icon: '✓',
    },
    {
      label: 'Saldo',
      value: formatCurrency(saldoTotal),
      positive: saldoTotal >= 0,
      icon: '💰',
    },
    {
      label: 'Economia',
      value: `${economia}%`,
      positive: economia >= 0,
      icon: '%',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(card => (
        <Card key={card.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
              <span className="text-base">{card.icon}</span>
            </div>
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <div className={cn(
                'text-lg font-bold',
                card.positive ? 'text-green-500' : 'text-red-500'
              )}>
                {card.value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
