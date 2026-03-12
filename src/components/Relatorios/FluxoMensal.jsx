import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Card from '../UI/Card'
import LoadingScreen from '../UI/LoadingScreen'
import { formatCurrency, formatPercent, getLastNMeses, formatMesAno, getCurrentMes } from '../../utils/formatters'
import { useFluxoMensal } from '../../hooks/useRelatorios'

export default function FluxoMensal() {
  const [mes, setMes] = useState(getCurrentMes())
  const meses = getLastNMeses(13)
  const { data, loading, error } = useFluxoMensal(mes)

  // Build chart data from last 6 months for trend
  const chartMeses = getLastNMeses(6).reverse()

  return (
    <div>
      <div className="month-selector" style={{ marginBottom: 'var(--spacing-md)' }}>
        <select value={mes} onChange={e => setMes(e.target.value)} style={{ flex: 1 }}>
          {meses.map(m => <option key={m} value={m}>{formatMesAno(m)}</option>)}
        </select>
      </div>

      {loading ? <LoadingScreen /> : error ? (
        <p style={{ color: 'var(--color-danger)' }}>{error}</p>
      ) : data && (
        <>
          {/* Empresa block */}
          <Card contexto="empresa">
            <div className="card__header">
              <span className="card__title">💼 Empresa</span>
            </div>
            <div className="summary-row">
              <span className="summary-row__label">Receitas</span>
              <span className="summary-row__value amount--positive">{formatCurrency(data.receitasEmpresa)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-row__label">Despesas</span>
              <span className="summary-row__value amount--negative">-{formatCurrency(data.despesasEmpresa)}</span>
            </div>
            <div className="summary-row summary-row--total">
              <span className="summary-row__label">Saldo</span>
              <span className={`summary-row__value ${data.receitasEmpresa - data.despesasEmpresa >= 0 ? 'amount--positive' : 'amount--negative'}`}>
                {formatCurrency(data.receitasEmpresa - data.despesasEmpresa)}
              </span>
            </div>
          </Card>

          {/* Pessoal block */}
          <Card contexto="pessoal">
            <div className="card__header">
              <span className="card__title">🏠 Pessoal</span>
            </div>
            <div className="summary-row">
              <span className="summary-row__label">Receitas</span>
              <span className="summary-row__value amount--positive">{formatCurrency(data.receitasPessoal)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-row__label">Despesas</span>
              <span className="summary-row__value amount--negative">-{formatCurrency(data.despesasPessoal)}</span>
            </div>
            <div className="summary-row summary-row--total">
              <span className="summary-row__label">Saldo</span>
              <span className={`summary-row__value ${data.receitasPessoal - data.despesasPessoal >= 0 ? 'amount--positive' : 'amount--negative'}`}>
                {formatCurrency(data.receitasPessoal - data.despesasPessoal)}
              </span>
            </div>
          </Card>

          {/* Consolidated */}
          <Card>
            <div className="card__header">
              <span className="card__title">📊 Consolidado</span>
            </div>
            <div className="summary-row">
              <span className="summary-row__label">Total Receitas</span>
              <span className="summary-row__value amount--positive">{formatCurrency(data.totalReceitas)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-row__label">Total Despesas</span>
              <span className="summary-row__value amount--negative">-{formatCurrency(data.totalDespesas)}</span>
            </div>
            <div className="summary-row summary-row--total">
              <span className="summary-row__label">Saldo Final</span>
              <span className={`summary-row__value ${data.saldoFinal >= 0 ? 'amount--positive' : 'amount--negative'}`}>
                {formatCurrency(data.saldoFinal)}
              </span>
            </div>
            <div style={{ marginTop: 'var(--spacing-sm)', textAlign: 'center', color: data.margemLucro >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>
              Margem: {formatPercent(data.margemLucro)}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
