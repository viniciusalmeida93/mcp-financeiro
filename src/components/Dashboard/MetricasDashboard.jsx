import { formatCurrency } from '../../utils/formatters'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function MetricasDashboard({ saldoTotal, totalReceitas, totalDespesas, economia, loading }) {
  const hoje = new Date()
  const periodo = format(hoje, "'01/'MM'/'yyyy - 'dd/MM/yyyy", { locale: ptBR })

  const cards = [
    {
      label: `Saldo`,
      sublabel: periodo,
      value: formatCurrency(saldoTotal),
      valueClass: saldoTotal >= 0 ? 'amount--positive' : 'amount--negative',
      icon: '💰',
    },
    {
      label: 'Receitas',
      sublabel: 'Este mês',
      value: formatCurrency(totalReceitas),
      valueClass: 'amount--positive',
      icon: '↑',
      iconStyle: { color: 'var(--color-success)', fontWeight: 700, fontSize: 18 },
    },
    {
      label: 'Despesas',
      sublabel: 'Este mês',
      value: formatCurrency(totalDespesas),
      valueClass: 'amount--negative',
      icon: '↓',
      iconStyle: { color: 'var(--color-danger)', fontWeight: 700, fontSize: 18 },
    },
    {
      label: 'Economia',
      sublabel: 'do que recebeu',
      value: `${economia}%`,
      valueClass: economia >= 0 ? 'amount--positive' : 'amount--negative',
      icon: '%',
      iconStyle: { color: 'var(--color-success)', fontWeight: 700, fontSize: 14 },
    },
  ]

  return (
    <div className="metricas-grid">
      {cards.map(card => (
        <div key={card.label} className="metrica-card card">
          <div className="metrica-card__header">
            <span className="metrica-card__label">{card.label}</span>
            <span className="metrica-card__icon" style={card.iconStyle}>{card.icon}</span>
          </div>
          {loading ? (
            <div className="skeleton skeleton-amount" style={{ marginTop: 8 }} />
          ) : (
            <div className={`metrica-card__value ${card.valueClass}`}>{card.value}</div>
          )}
          <div className="metrica-card__sublabel">{card.sublabel}</div>
        </div>
      ))}
    </div>
  )
}
