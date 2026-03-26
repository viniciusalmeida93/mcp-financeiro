import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import { Skeleton } from '@/components/UI/skeleton'
import { formatCurrency } from '../../utils/formatters'
import { calcularLimiteDiario } from '../../services/calculations'
import { cn } from '@/lib/utils'

export default function LimiteDiarioCard({ receitasEmpresa, despesasFixasEmpresa, receitasPessoal, despesasFixasPessoal, diasRestantes, loading }) {
  const limiteEmpresa = calcularLimiteDiario(receitasEmpresa, despesasFixasEmpresa, diasRestantes)
  const limitePessoal = calcularLimiteDiario(receitasPessoal, despesasFixasPessoal, diasRestantes)

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-4 w-36" /></CardHeader>
        <CardContent><Skeleton className="h-20 w-full" /></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">💸 Pode Gastar Hoje</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border p-3">
          <div className="text-xs font-semibold text-blue-400 mb-1">💼 EMPRESA</div>
          <div className={cn('text-xl font-bold', limiteEmpresa >= 0 ? 'text-green-500' : 'text-red-500')}>
            {formatCurrency(limiteEmpresa)}/dia
          </div>
          <div className="text-xs text-muted-foreground">{diasRestantes} dias restantes</div>
        </div>

        <div className="rounded-md border p-3">
          <div className="text-xs font-semibold text-orange-400 mb-1">🏠 PESSOAL</div>
          <div className={cn('text-xl font-bold', limitePessoal >= 0 ? 'text-green-500' : 'text-red-500')}>
            {formatCurrency(limitePessoal)}/dia
          </div>
          {limitePessoal < 0 && (
            <div className="text-xs text-destructive">⚠️ Negativo — despesas superam receitas</div>
          )}
          <div className="text-xs text-muted-foreground">{diasRestantes} dias restantes</div>
        </div>
      </CardContent>
    </Card>
  )
}
