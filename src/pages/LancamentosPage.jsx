import { useState } from 'react'
import ListaLancamentos from '../components/Lancamentos/ListaLancamentos'
import NovoLancamento from '../components/Lancamentos/NovoLancamento'
import { useLancamentos } from '../hooks/useLancamentos'

export default function LancamentosPage() {
  const [showForm, setShowForm] = useState(false)
  const { lancamentos, loading, error, filters, updateFilter, refresh } = useLancamentos()

  return (
    <>
      {error && (
        <div className="card" style={{ borderColor: 'var(--color-danger)', marginBottom: 16 }}>
          <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>Erro: {error}</p>
        </div>
      )}

      <ListaLancamentos
        lancamentos={lancamentos}
        loading={loading}
        filters={filters}
        updateFilter={updateFilter}
        refresh={refresh}
      />

      <button className="fab" onClick={() => setShowForm(true)} title="Novo lançamento">
        +
      </button>

      <NovoLancamento
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </>
  )
}
