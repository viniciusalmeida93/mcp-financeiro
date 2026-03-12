import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Card from '../UI/Card'
import ContextToggle from '../UI/ContextToggle'
import LoadingScreen from '../UI/LoadingScreen'
import EmptyState from '../UI/EmptyState'
import { supabase } from '../../services/supabase'
import { formatCurrency, formatPercent, getLastNMeses, formatMesAno, getCurrentMes } from '../../utils/formatters'
import { getCategoriaLabel } from '../../constants/categorias'

const COLORS = ['#00D9FF', '#FF6B35', '#70AD47', '#C00000', '#FFD700', '#9B59B6', '#E67E22', '#1ABC9C', '#E74C3C', '#3498DB']

export default function GastosPorCategoria() {
  const [mes, setMes] = useState(getCurrentMes())
  const [contexto, setContexto] = useState('todos')
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const meses = getLastNMeses(13)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('lancamentos')
        .select('valor, categoria, contexto')
        .eq('tipo', 'saida')
        .gte('data', `${mes}-01`)
        .lte('data', `${mes}-31`)

      if (data) {
        const filtered = contexto === 'todos' ? data : data.filter(l => l.contexto === contexto)
        const grouped = {}
        for (const l of filtered) {
          grouped[l.categoria] = (grouped[l.categoria] || 0) + Number(l.valor)
        }
        const total = Object.values(grouped).reduce((s, v) => s + v, 0)
        const sorted = Object.entries(grouped)
          .map(([cat, valor]) => ({ cat, valor, pct: total > 0 ? (valor / total) * 100 : 0 }))
          .sort((a, b) => b.valor - a.valor)
        setCategorias(sorted)
      }
      setLoading(false)
    }
    fetch()
  }, [mes, contexto])

  const total = categorias.reduce((s, c) => s + c.valor, 0)
  const pieData = categorias.map(c => ({ name: getCategoriaLabel(c.cat), value: c.valor }))

  return (
    <div>
      <div className="month-selector" style={{ marginBottom: 'var(--spacing-sm)' }}>
        <select value={mes} onChange={e => setMes(e.target.value)} style={{ flex: 1 }}>
          {meses.map(m => <option key={m} value={m}>{formatMesAno(m)}</option>)}
        </select>
      </div>

      <ContextToggle value={contexto} onChange={setContexto} />
      <div style={{ height: 'var(--spacing-md)' }} />

      {loading ? <LoadingScreen /> : categorias.length === 0 ? (
        <EmptyState icon="📊" text="Sem gastos neste período" />
      ) : (
        <>
          <Card>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            {categorias.map((c, i) => (
              <div key={c.cat} className="summary-row">
                <span className="summary-row__label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                  {getCategoriaLabel(c.cat)}
                </span>
                <span className="summary-row__value">{formatCurrency(c.valor)} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: 'var(--font-size-xs)' }}>({formatPercent(c.pct)})</span></span>
              </div>
            ))}
            <div className="summary-row summary-row--total">
              <span className="summary-row__label">Total</span>
              <span className="summary-row__value">{formatCurrency(total)}</span>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
