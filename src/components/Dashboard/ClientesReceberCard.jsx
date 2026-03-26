import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import { Skeleton } from '@/components/UI/skeleton'
import Badge from '../UI/Badge'
import { formatCurrency, formatDateShort } from '../../utils/formatters'
import EmptyState from '../UI/EmptyState'
import { cn } from '@/lib/utils'

export default function ClientesReceberCard({ clientesAReceber, loading, pagosClienteIds = new Set(), onReceber, onDesreceber }) {
  const total = clientesAReceber.reduce((s, c) => s + Number(c.valor), 0)

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-4 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-8 w-full" /></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">💰 Clientes a Receber (7 dias)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {clientesAReceber.length === 0 ? (
          <EmptyState icon="💸" text="Nenhum recebimento nos próximos 7 dias" />
        ) : (
          <>
            {clientesAReceber.map(cliente => {
              const recebido = pagosClienteIds.has(cliente.id)
              return (
                <div
                  key={cliente.id}
                  className={cn(
                    'flex items-center gap-3 py-2 border-b last:border-b-0',
                    recebido && 'opacity-60'
                  )}
                >
                  <button
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 transition-colors',
                      recebido
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-muted-foreground hover:border-green-500'
                    )}
                    onClick={() => recebido ? onDesreceber?.(cliente) : onReceber?.(cliente)}
                    title={recebido ? 'Clique para desmarcar' : 'Marcar como recebido'}
                  >
                    {recebido ? '✓' : ''}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{cliente.nome}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {formatDateShort(cliente.proximoVencimento)}
                      {cliente.precisa_nf && (
                        <Badge variant="warning" className="ml-1">📋 NF</Badge>
                      )}
                    </div>
                  </div>
                  <div className={cn('text-sm font-semibold', recebido ? 'text-green-500' : '')}>
                    {formatCurrency(cliente.valor)}
                  </div>
                </div>
              )
            })}

            <div className="flex justify-between text-sm font-semibold pt-2">
              <span>Total 7 dias</span>
              <span className="text-green-500">{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
