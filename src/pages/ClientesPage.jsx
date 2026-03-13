import { useState } from 'react'
import Header from '../components/Layout/Header'
import ListaClientes from '../components/Clientes/ListaClientes'
import NovoCliente from '../components/Clientes/NovoCliente'
import { useClientes } from '../hooks/useClientes'
import { formatCurrency } from '../utils/formatters'

export default function ClientesPage() {
  const [contexto, setContexto] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const { clientes, loading, error, refresh } = useClientes()

  const ativos = clientes.filter(c => c.status === 'ativo')
  const mensais = ativos.filter(c => c.tipo === 'mensal')
  const totalReceitas = mensais.reduce((s, c) => s + Number(c.valor), 0)
  const projecaoAnual = totalReceitas * 12
  const totalClientes = ativos.length

  const filtered = contexto === 'todos'
    ? clientes
    : clientes.filter(c => (c.contexto || 'empresa') === contexto)

  return (
    <>
      <Header title="Receitas" />

      {/* Metric cards */}
      <div className="metricas-grid" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="metrica-card">
          <div className="metrica-card__label">💰 Receita Mensal</div>
          <div className="metrica-card__value amount--positive">
            {loading ? '...' : formatCurrency(totalReceitas)}
          </div>
        </div>
        <div className="metrica-card">
          <div className="metrica-card__label">📈 Projeção Anual</div>
          <div className="metrica-card__value amount--positive">
            {loading ? '...' : formatCurrency(projecaoAnual)}
          </div>
        </div>
        <div className="metrica-card">
          <div className="metrica-card__label">👥 Clientes Ativos</div>
          <div className="metrica-card__value" style={{ color: 'var(--color-text)' }}>
            {loading ? '...' : totalClientes}
          </div>
        </div>
      </div>

      {/* Filtro contexto */}
      <div className="context-toggle" style={{ marginBottom: 'var(--spacing-md)' }}>
        {[
          { key: 'todos', label: 'Tudo' },
          { key: 'empresa', label: '💼 Empresa' },
          { key: 'pessoal', label: '🏠 Pessoal' },
        ].map(t => (
          <button
            key={t.key}
            className={`context-toggle__btn ${contexto === t.key ? `active--${t.key}` : ''}`}
            onClick={() => setContexto(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--color-danger)', marginBottom: 16 }}>
          <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>Erro: {error}</p>
        </div>
      )}

      <ListaClientes clientes={filtered} loading={loading} refresh={refresh} />

      <button className="fab" onClick={() => setShowForm(true)} title="Novo cliente">+</button>
      <NovoCliente
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </>
  )
}
