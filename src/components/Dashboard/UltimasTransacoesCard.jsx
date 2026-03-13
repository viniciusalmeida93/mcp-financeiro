import Card from '../UI/Card'
import { formatCurrency } from '../../utils/formatters'
import { getCategoriaLabel } from '../../constants/categorias'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

  return (
    <Card>
      <div className="card__header">
        <span className="card__title">📋 Últimas Transações</span>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : ultimasTransacoes.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--spacing-md)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Nenhuma transação este mês
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([data, transacoes]) => (
          <div key={data} style={{ marginBottom: 'var(--spacing-sm)' }}>
            <div style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: 'var(--spacing-xs) 0',
              marginBottom: 4,
            }}>
              {formatDataGrupo(data)}
            </div>
            {transacoes.map(t => (
              <div key={t.id} className="list-item" style={{ minHeight: 52 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: t.tipo === 'entrada' ? 'rgba(112,173,71,0.12)' : 'rgba(31,80,122,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>
                  {TIPO_ICONS[t.categoria] || (t.tipo === 'entrada' ? '↑' : '↓')}
                </div>
                <div className="list-item__body">
                  <div className="list-item__title" style={{ fontSize: 'var(--font-size-sm)' }}>
                    {t.clientes?.nome || t.descricao}
                  </div>
                  <div className="list-item__subtitle" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      background: t.contexto === 'empresa' ? 'rgba(31,80,122,0.1)' : 'rgba(255,107,53,0.1)',
                      color: t.contexto === 'empresa' ? 'var(--color-empresa-primary)' : 'var(--color-pessoal-primary)',
                      padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    }}>
                      {getCategoriaLabel(t.categoria)}
                    </span>
                    {t.forma_pagamento && (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                        {t.forma_pagamento}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`list-item__value ${t.tipo === 'entrada' ? 'list-item__value--positive' : 'list-item__value--negative'}`}
                  style={{ fontSize: 'var(--font-size-sm)' }}
                >
                  {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </Card>
  )
}
