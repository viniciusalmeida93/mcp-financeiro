import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, BarChart3, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import { Skeleton } from '@/components/UI/skeleton'
import { formatCurrency } from '../../utils/formatters'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card p-2 text-xs shadow-md min-w-[140px]">
      <div className="font-semibold mb-1">Dia {label}</div>
      {payload.map(p => {
        const Arrow = p.dataKey === 'receitas' ? ArrowUp : ArrowDown
        return (
          <div key={p.dataKey} style={{ color: p.color }} className="flex justify-between gap-3 items-center">
            <span className="flex items-center gap-1">
              <Arrow className="h-3 w-3" />
              {p.dataKey === 'receitas' ? 'Receitas' : 'Despesas'}
            </span>
            <span>{formatCurrency(p.value)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function EvolucaoGastosCard({ evolucaoDiaria, totalDespesas, loading }) {
  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-4 w-36" /></CardHeader>
        <CardContent><Skeleton className="h-48 w-full" /></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Evolução de Gastos
          </CardTitle>
          <span className="text-lg font-bold text-red-500">{formatCurrency(totalDespesas)}</span>
        </div>
      </CardHeader>
      <CardContent>
        {evolucaoDiaria.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
            <BarChart3 className="h-8 w-8" strokeWidth={1.5} />
            <div className="text-sm">Nenhum lançamento este mês</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={evolucaoDiaria} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-empresa-primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-empresa-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="receitas" stroke="var(--color-success)" fill="url(#gradReceitas)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="despesas" stroke="var(--color-empresa-primary)" fill="url(#gradDespesas)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
