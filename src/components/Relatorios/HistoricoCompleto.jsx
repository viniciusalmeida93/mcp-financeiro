import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import LoadingScreen from '../UI/LoadingScreen'
import EmptyState from '../UI/EmptyState'
import { formatCurrency, formatMesAno, formatPercent } from '../../utils/formatters'
import { useHistoricoMensal } from '../../hooks/useRelatorios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function HistoricoCompleto() {
  const { historico, loading } = useHistoricoMensal()

  if (loading) return <LoadingScreen />
  if (!historico.length) return <EmptyState icon="📊" text="Sem histórico ainda" />

  const chartData = historico.map(h => ({
    mes: h.mes.slice(5), // MM
    Receitas: h.receitas,
    Despesas: h.despesas,
  }))

  const totalReceitas = historico.reduce((s, h) => s + h.receitas, 0)
  const totalDespesas = historico.reduce((s, h) => s + h.despesas, 0)
  const mediaReceitas = totalReceitas / historico.length
  const mediaDespesas = totalDespesas / historico.length

  const melhor = [...historico].sort((a, b) => b.saldo - a.saldo)[0]
  const pior = [...historico].sort((a, b) => a.saldo - b.saldo)[0]

  return (
    <div className="space-y-4 mt-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="mes" tick={{ fill: '#888', fontSize: 11 }} />
              <YAxis tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: 8 }}
                labelStyle={{ color: '#ccc' }}
                formatter={(v) => formatCurrency(v)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Receitas" fill="#70AD47" radius={[3,3,0,0]} />
              <Bar dataKey="Despesas" fill="#C00000" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-4">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Média Receitas</span><span className="font-semibold text-green-500">{formatCurrency(mediaReceitas)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Média Despesas</span><span className="font-semibold text-red-500">{formatCurrency(mediaDespesas)}</span></div>
          <div className="flex justify-between text-sm font-semibold border-t pt-2"><span>Melhor mês</span><span className="text-green-500">{formatMesAno(melhor.mes)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pior mês</span><span className="text-red-500">{formatMesAno(pior.mes)}</span></div>
        </CardContent>
      </Card>

      {historico.slice().reverse().map(h => (
        <Card key={h.mes}>
          <CardContent className="py-3 flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">{formatMesAno(h.mes)}</div>
              <div className="text-xs text-muted-foreground">
                ↑ {formatCurrency(h.receitas)} · ↓ {formatCurrency(h.despesas)}
              </div>
            </div>
            <div className={`font-bold text-sm ${h.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(h.saldo)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
