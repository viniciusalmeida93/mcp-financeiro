import Card from '../UI/Card'
import { formatCurrency } from '../../utils/formatters'
import { calcularLimiteDiario } from '../../services/calculations'

export default function LimiteDiarioCard({ receitasEmpresa, despesasFixasEmpresa, receitasPessoal, despesasFixasPessoal, diasRestantes, loading }) {
  const limiteEmpresa = calcularLimiteDiario(receitasEmpresa, despesasFixasEmpresa, diasRestantes)
  const limitePessoal = calcularLimiteDiario(receitasPessoal, despesasFixasPessoal, diasRestantes)

  return (
    <Card>
      <div className="card__header">
        <span className="card__title">💸 Pode Gastar Hoje</span>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div className="card card--empresa" style={{ margin: 0, padding: 'var(--spacing-sm) var(--spacing-md)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-empresa-primary)', fontWeight: 600, marginBottom: 4 }}>
              💼 EMPRESA
            </div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: limiteEmpresa >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {formatCurrency(limiteEmpresa)}/dia
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {diasRestantes} dias restantes
            </div>
          </div>

          <div className="card card--pessoal" style={{ margin: 0, padding: 'var(--spacing-sm) var(--spacing-md)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-pessoal-primary)', fontWeight: 600, marginBottom: 4 }}>
              🏠 PESSOAL
            </div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: limitePessoal >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {formatCurrency(limitePessoal)}/dia
            </div>
            {limitePessoal < 0 && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>
                ⚠️ Negativo — despesas superam receitas
              </div>
            )}
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {diasRestantes} dias restantes
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
