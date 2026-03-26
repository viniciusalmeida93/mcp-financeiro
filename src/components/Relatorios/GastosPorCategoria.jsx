import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import ContextToggle from '../UI/ContextToggle'
import LoadingScreen from '../UI/LoadingScreen'
import EmptyState from '../UI/EmptyState'
import { supabase } from '../../services/supabase'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { useMes } from '../../contexts/MesContext'
import { getCategoriaLabel } from '../../constants/categorias'

const COLORS = ['#00D9FF', '#FF6B35', '#70AD47', '#C00000', '#FFD700', '#9B59B6', '#E67E22', '#1ABC9C', '#E74C3C', '#3498DB']

export default function GastosPorCategoria() {
  const { mes } = useMes()
  const [contexto, setContexto] = useState('todos')
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

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
    <div className="space-y-4 mt-2">
      <ContextToggle value={contexto} onChange={setContexto} />

      {loading ? <LoadingScreen /> : categorias.length === 0 ? (
        <EmptyState icon="📊" text="Sem gastos neste período" />
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribuição</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categorias.map((c, i) => (
                <div key={c.cat} className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                    {getCategoriaLabel(c.cat)}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(c.valor)}{' '}
                    <span className="text-muted-foreground font-normal text-xs">({formatPercent(c.pct)})</span>
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
