import Header from '../components/Layout/Header'
import ListaDespesasFixas from '../components/Contas/ListaDespesasFixas'
import NovaDespesaFixa from '../components/Contas/NovaDespesaFixa'
import Button from '../components/UI/Button'
import { useDespesasFixas } from '../hooks/useDespesasFixas'
import { useState } from 'react'

export default function ContasPage() {
  const [showForm, setShowForm] = useState(false)
  const { despesas, allDespesas, loading, error, contextoFilter, setContextoFilter, refresh } = useDespesasFixas()

  return (
    <>
      <Header
        title="Despesas Fixas"
        rightAction={
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            + Nova
          </Button>
        }
      />

      {error && (
        <div className="card" style={{ borderColor: 'var(--color-danger)', marginBottom: 16 }}>
          <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>Erro: {error}</p>
        </div>
      )}

      <ListaDespesasFixas
        despesas={despesas}
        allDespesas={allDespesas}
        loading={loading}
        contextoFilter={contextoFilter}
        setContextoFilter={setContextoFilter}
        refresh={refresh}
      />

      <button className="fab" onClick={() => setShowForm(true)} title="Nova despesa">+</button>

      <NovaDespesaFixa
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </>
  )
}
