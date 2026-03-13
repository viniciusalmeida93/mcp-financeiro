import Card from '../UI/Card'
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
  return (
    <Card>
      <div className="card__header">
        <span className="card__title">🏷️ Principais Categorias</span>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : categoriasDespesas.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--spacing-md)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Nenhuma despesa este mês
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {categoriasDespesas.map(cat => (
            <div key={cat.categoria}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{CATEGORIA_ICONS[cat.categoria] || '📋'}</span>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
                    {cat.label}
                  </span>
                </div>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                  {formatCurrency(cat.total)}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar__fill progress-bar__fill--empresa"
                  style={{ width: `${Math.min(cat.percentual, 100)}%` }}
                />
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {cat.percentual.toFixed(0)}% do total
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
