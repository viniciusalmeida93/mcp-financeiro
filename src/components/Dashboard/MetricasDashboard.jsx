import { formatCurrency } from '../../utils/formatters'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent } from '@/components/UI/Card'
import { Skeleton } from '@/components/UI/skeleton'
import { cn } from '@/lib/utils'

export default function MetricasDashboard({ saldoTotal, totalReceitas, economia, receitaEsperada, despesaEsperada, despesasPagasCount, loading }) {
  const hoje = new Date()
  const periodo = format(hoje, "'01/'MM'/'yyyy - 'dd/MM/yyyy", { locale: ptBR })

  const cards = [
    {
      label: 'Receita Total',
      sublabel: 'esperada este mês',
      value: formatCurrency(receitaEsperada ?? 0),
      positive: true,
      icon: '↑',
    },
    {
      label: 'Receita Recebida',
      sublabel: 'confirmada este mês',
      value: formatCurrency(totalReceitas),
      positive: true,
      icon: '✓',
    },
    {
      label: 'Despesas Totais',
      sublabel: 'esperadas este mês',
      value: formatCurrency(despesaEsperada ?? 0),
      positive: false,
      icon: '↓',
    },
    {
      label: 'Despesas Pagas',
      sublabel: 'confirmadas este mês',
      value: `${despesasPagasCount ?? 0} paga${(despesasPagasCount ?? 0) !== 1 ? 's' : ''}`,
      positive: false,
      icon: '✓',
    },
    {
      label: 'Saldo',
      sublabel: periodo,
      value: formatCurrency(saldoTotal),
      positive: saldoTotal >= 0,
      icon: '💰',
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
