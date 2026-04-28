import { useState } from 'react'
import ListaLancamentos from '../components/Lancamentos/ListaLancamentos'
import NovoLancamento from '../components/Lancamentos/NovoLancamento'
import FAB from '../components/UI/FAB'
import { useLancamentos } from '../hooks/useLancamentos'

export default function LancamentosPage() {
  const [showForm, setShowForm] = useState(false)
  const { lancamentos, loading, error, filters, updateFilter, refresh } = useLancamentos()

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">Erro: {error}</p>
        </div>
      )}

      <ListaLancamentos
        lancamentos={lancamentos}
        loading={loading}
        filters={filters}
        updateFilter={updateFilter}
        refresh={refresh}
      />

      <FAB onClick={() => setShowForm(true)} title="Novo lançamento" />

      <NovoLancamento
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </div>
  )
}
