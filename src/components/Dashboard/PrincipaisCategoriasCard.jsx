import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import { Skeleton } from '@/components/UI/skeleton'
import { formatCurrency } from '../../utils/formatters'

const CATEGORIA_ICONS = {
  cliente: '👤',
  projetos: '🎯',
  assinaturas: '🔄',
  time: '👥',
  educacao: '📚',
  infraestrutura: '🖥️',
  outros_empresa: '📦',
  alimentacao: '🍽️',
  supermercado: '🛒',
  combustivel: '⛽',
  transporte: '🚗',
  saude: '🏥',
  lazer: '🎮',
  moradia: '🏠',
  familia: '👨‍👩‍👧',
  divida: '💳',
  outros: '📋',
}

export default function PrincipaisCategoriasCard({ categoriasDespesas, loading }) {
  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-4 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-32 w-full" /></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">🏷️ Principais Categorias</CardTitle>
      </CardHeader>
      <CardContent>
        {categoriasDespesas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma despesa este mês</p>
        ) : (
          <div className="space-y-3">
            {categoriasDespesas.map(cat => (
              <div key={cat.categoria}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORIA_ICONS[cat.categoria] || '📋'}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(cat.total)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${Math.min(cat.percentual, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {cat.percentual.toFixed(0)}% do total
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
