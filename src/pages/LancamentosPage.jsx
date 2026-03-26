import { useState } from 'react'
import ListaLancamentos from '../components/Lancamentos/ListaLancamentos'
import NovoLancamento from '../components/Lancamentos/NovoLancamento'
import { useLancamentos } from '../hooks/useLancamentos'
import { Button } from '@/components/UI/Button'
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

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lançamentos</h1>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Novo
        </Button>
      </div>

      <ListaLancamentos
        lancamentos={lancamentos}
        loading={loading}
        filters={filters}
        updateFilter={updateFilter}
        refresh={refresh}
      />

      <NovoLancamento
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </div>
  )
}
