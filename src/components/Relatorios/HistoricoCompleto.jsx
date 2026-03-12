import Card from '../UI/Card'
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
    <div>
      <Card>
        <div className="card__header">
          <span className="card__title">📈 Últimos 12 meses</span>
        </div>
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
      </Card>

      <Card>
        <div className="summary-row"><span className="summary-row__label">Média Receitas</span><span className="summary-row__value amount--positive">{formatCurrency(mediaReceitas)}</span></div>
        <div className="summary-row"><span className="summary-row__label">Média Despesas</span><span className="summary-row__value amount--negative">{formatCurrency(mediaDespesas)}</span></div>
        <div className="summary-row summary-row--total"><span className="summary-row__label">Melhor mês</span><span className="summary-row__value amount--positive">{formatMesAno(melhor.mes)}</span></div>
        <div className="summary-row"><span className="summary-row__label">Pior mês</span><span className="summary-row__value amount--negative">{formatMesAno(pior.mes)}</span></div>
      </Card>

      {historico.slice().reverse().map(h => (
        <Card key={h.mes}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{formatMesAno(h.mes)}</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                ↑ {formatCurrency(h.receitas)} · ↓ {formatCurrency(h.despesas)}
              </div>
            </div>
            <div className={`card__value ${h.saldo >= 0 ? 'card__value--positive' : 'card__value--negative'}`} style={{ fontSize: 'var(--font-size-md)' }}>
              {formatCurrency(h.saldo)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
