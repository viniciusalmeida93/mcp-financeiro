import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import { Skeleton } from '@/components/UI/skeleton'
import { formatCurrency, formatDateShort } from '../../utils/formatters'
import { toDateString } from '../../utils/dateHelpers'
import EmptyState from '../UI/EmptyState'
import { cn } from '@/lib/utils'

export default function ProximosVencimentosCard({ proximasContas, loading, pagosNomes = new Set(), onPagar }) {
  const empresa = proximasContas.filter(c => c.contexto === 'empresa')
  const pessoal = proximasContas.filter(c => c.contexto === 'pessoal')
  const total = proximasContas.reduce((s, c) => s + Number(c.valor), 0)

  const hoje = toDateString(new Date())

  const renderConta = (conta, contexto) => {
    const venc = toDateString(conta.proximoVencimento)
    const atrasado = venc < hoje
    const pago = pagosNomes.has(conta.nome)

    return (
      <div
        key={conta.id}
        className={cn(
          'flex items-center gap-3 py-2 border-b last:border-b-0',
          pago && 'opacity-60'
        )}
      >
        <button
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 transition-colors',
            pago
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-muted-foreground hover:border-green-500'
          )}
          onClick={() => !pago && onPagar && onPagar(conta)}
          title={pago ? 'Já pago' : 'Marcar como pago'}
        >
          {pago ? '✓' : ''}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{conta.nome}</div>
          <div className="text-xs text-muted-foreground">{formatDateShort(conta.proximoVencimento)}</div>
        </div>
        <div className={cn(
          'text-sm font-semibold',
          atrasado && !pago ? 'text-red-500' : ''
        )}>
          {formatCurrency(conta.valor)}
          {atrasado && !pago && ' ⚠️'}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-4 w-44" /></CardHeader>
        <CardContent><Skeleton className="h-8 w-full" /></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">📅 Próximas Contas (7 dias)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {proximasContas.length === 0 ? (
          <EmptyState icon="✅" text="Nenhuma conta nos próximos 7 dias" />
        ) : (
          <>
            {empresa.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-semibold text-blue-400 mb-1">💼 EMPRESA</div>
                {empresa.map(conta => renderConta(conta, 'empresa'))}
              </div>
            )}

            {pessoal.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-orange-400 mb-1">🏠 PESSOAL</div>
                {pessoal.map(conta => renderConta(conta, 'pessoal'))}
              </div>
            )}

            <div className="flex justify-between text-sm font-semibold pt-2 border-t">
              <span>Total 7 dias</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
