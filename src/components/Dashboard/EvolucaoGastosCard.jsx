import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Card from '../UI/Card'
import { formatCurrency } from '../../utils/formatters'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card" style={{ padding: '8px 12px', fontSize: 'var(--font-size-sm)', minWidth: 140 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Dia {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span>{p.dataKey === 'receitas' ? '↑ Receitas' : '↓ Despesas'}</span>
          <span>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function EvolucaoGastosCard({ evolucaoDiaria, totalDespesas, loading }) {
  return (
    <Card>
      <div className="card__header">
        <span className="card__title">📈 Evolução de Gastos</span>
        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-danger)' }}>
          {formatCurrency(totalDespesas)}
        </span>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : evolucaoDiaria.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ fontSize: 32 }}>📊</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 8 }}>
            Nenhum lançamento este mês
          </div>
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
    </Card>
  )
}
