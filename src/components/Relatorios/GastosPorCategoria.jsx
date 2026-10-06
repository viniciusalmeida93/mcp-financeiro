import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import SelectField from '../UI/Select'
import LoadingScreen from '../UI/LoadingScreen'
import EmptyState from '../UI/EmptyState'
import { supabase } from '../../services/supabase'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { useMes } from '../../contexts/MesContext'
import { getCategoriaLabel } from '../../constants/categorias'

const COLORS = ['#00C8FF', '#22C55E', '#F5B83D', '#F25C5C', '#8B7CF6', '#FF8A4C', '#2DD4BF', '#F472B6', '#94A3B8', '#3B82F6']

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
      <SelectField
        options={[
          { value: 'todos', label: 'Tudo' },
          { value: 'empresa', label: 'Empresa' },
          { value: 'pessoal', label: 'Pessoal' },
        ]}
        value={contexto}
        onValueChange={setContexto}
      />

      {loading ? <LoadingScreen /> : categorias.length === 0 ? (
        <EmptyState icon={BarChart3} text="Sem gastos neste período" />
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribuição</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={84} paddingAngle={2} stroke="none" dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--foreground)' }} />
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
