import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import { Skeleton } from '@/components/UI/skeleton'
import { formatCurrency } from '../../utils/formatters'
import { getCategoriaLabel } from '../../constants/categorias'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

function formatDataGrupo(dateStr) {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Hoje'
  if (isYesterday(date)) return 'Ontem'
  return format(date, "d 'de' MMM, yyyy", { locale: ptBR })
}

const TIPO_ICONS = {
  cliente: '👤',
  projetos: '🎯',
  assinaturas: '🔄',
  time: '👥',
  educacao: '📚',
  infraestrutura: '🖥️',
  outros_empresa: '📋',
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

export default function UltimasTransacoesCard({ ultimasTransacoes, loading }) {
  // Group by date
  const grouped = ultimasTransacoes.reduce((acc, t) => {
    const key = t.data
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

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
        <CardTitle className="text-base">📋 Últimas Transações</CardTitle>
      </CardHeader>
      <CardContent>
        {ultimasTransacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma transação este mês</p>
        ) : (
          Object.entries(grouped).map(([data, transacoes]) => (
            <div key={data} className="mb-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide py-1 mb-1">
                {formatDataGrupo(data)}
              </div>
              {transacoes.map(t => (
                <div key={t.id} className="flex items-center gap-3 py-2 border-b last:border-b-0 min-h-[52px]">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0',
                    t.tipo === 'entrada' ? 'bg-green-500/10' : 'bg-blue-500/10'
                  )}>
                    {TIPO_ICONS[t.categoria] || (t.tipo === 'entrada' ? '↑' : '↓')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {t.clientes?.nome || t.descricao}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className={cn(
                        'text-xs font-semibold px-1.5 py-0.5 rounded',
                        t.contexto === 'empresa'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-orange-500/10 text-orange-400'
                      )}>
                        {getCategoriaLabel(t.categoria)}
                      </span>
                      {t.forma_pagamento && (
                        <span className="text-xs text-muted-foreground">{t.forma_pagamento}</span>
                      )}
                    </div>
                  </div>
                  <div className={cn(
                    'text-sm font-semibold tabular-nums',
                    t.tipo === 'entrada' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
