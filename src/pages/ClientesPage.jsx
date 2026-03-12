import { useState } from 'react'
import Header from '../components/Layout/Header'
import ListaClientes from '../components/Clientes/ListaClientes'
import GestaoNF from '../components/Clientes/GestaoNF'
import NovoCliente from '../components/Clientes/NovoCliente'
import Button from '../components/UI/Button'
import { useClientes } from '../hooks/useClientes'

const TABS = [
  { key: 'clientes', label: '👥 Clientes' },
  { key: 'nf', label: '📋 Notas Fiscais' },
]

export default function ClientesPage() {
  const [tab, setTab] = useState('clientes')
  const [showForm, setShowForm] = useState(false)
  const { clientes, loading, error, refresh } = useClientes()

  return (
    <>
      <Header
        title="Clientes"
        rightAction={
          tab === 'clientes'
            ? <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>+ Novo</Button>
            : null
        }
      />

      {/* Tabs */}
      <div className="context-toggle" style={{ marginBottom: 'var(--spacing-md)' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`context-toggle__btn${tab === t.key ? ' active--todos' : ''}`}
            onClick={() => setTab(t.key)}
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

      {tab === 'clientes' ? (
        <>
          <ListaClientes clientes={clientes} loading={loading} refresh={refresh} />
          <button className="fab" onClick={() => setShowForm(true)} title="Novo cliente">+</button>
          <NovoCliente
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSuccess={refresh}
          />
        </>
      ) : (
        <GestaoNF clientes={clientes} />
      )}
    </>
  )
}
