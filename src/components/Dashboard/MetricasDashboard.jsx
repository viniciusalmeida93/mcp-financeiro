import { formatCurrency } from '../../utils/formatters'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent } from '@/components/UI/Card'
import { Skeleton } from '@/components/UI/skeleton'
import { cn } from '@/lib/utils'

export default function MetricasDashboard({ saldoTotal, totalReceitas, totalDespesas, economia, loading }) {
  const hoje = new Date()
  const periodo = format(hoje, "'01/'MM'/'yyyy - 'dd/MM/yyyy", { locale: ptBR })

  const cards = [
    {
      label: 'Saldo',
      sublabel: periodo,
      value: formatCurrency(saldoTotal),
      positive: saldoTotal >= 0,
      icon: '💰',
    },
    {
      label: 'Receitas',
      sublabel: 'Este mês',
      value: formatCurrency(totalReceitas),
      positive: true,
      icon: '↑',
    },
    {
      label: 'Despesas',
      sublabel: 'Este mês',
      value: formatCurrency(totalDespesas),
      positive: false,
      icon: '↓',
    },
    {
      label: 'Economia',
      sublabel: 'do que recebeu',
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
            <div className="text-xs text-muted-foreground mt-0.5">{card.sublabel}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
