import { useState } from 'react'
import ListaLancamentos from '../components/Lancamentos/ListaLancamentos'
import NovoLancamento from '../components/Lancamentos/NovoLancamento'
import { useLancamentos } from '../hooks/useLancamentos'
import { Plus } from 'lucide-react'

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

      <button
        className="fixed bottom-20 right-4 md:bottom-4 z-10 w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90"
        style={{ backgroundColor: '#5ED0FF' }}
        onClick={() => setShowForm(true)}
        title="Novo lançamento"
      >
        <Plus size={20} />
      </button>

      <NovoLancamento
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </div>
  )
}
