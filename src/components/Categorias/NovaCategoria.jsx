import { useState, useEffect } from 'react'

const CORES = [
  '#1f507a', '#70AD47', '#FF6B35', '#C00000', '#7030A0',
  '#FF9900', '#00B0F0', '#00B050', '#FFC000', '#808080',
]

export default function NovaCategoria({ onSave, onClose, categoriaEdit }) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('despesa')
  const [cor, setCor] = useState(CORES[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (categoriaEdit) {
      setNome(categoriaEdit.nome || '')
      setTipo(categoriaEdit.tipo || 'despesa')
      setCor(categoriaEdit.cor || CORES[0])
    } else {
      setNome('')
      setTipo('despesa')
      setCor(CORES[0])
    }
  }, [categoriaEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nome.trim()) { setError('Nome é obrigatório'); return }
    setSaving(true)
    try {
      await onSave({ nome: nome.trim(), tipo, cor })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const isEditing = !!categoriaEdit

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__handle" />
        <div className="modal__header">
          <h2 className="modal__title">{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <button className="modal__close btn btn--ghost" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label--required">Nome</label>
            <input
              value={nome}
              onChange={e => { setNome(e.target.value); setError('') }}
              placeholder="Ex: Alimentação"
              autoFocus
            />
            {error && <span className="form-error">{error}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label--required">Tipo</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 4 }}>
              {[{ value: 'despesa', label: '↓ Despesa' }, { value: 'receita', label: '↑ Receita' }].map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: tipo === opt.value ? 600 : 400 }}>
                  <input
                    type="radio"
                    name="tipo_cat"
                    value={opt.value}
                    checked={tipo === opt.value}
                    onChange={() => setTipo(opt.value)}
                    style={{ accentColor: 'var(--color-empresa-primary)' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cor</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {CORES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: c,
                    border: cor === c ? '3px solid var(--color-text)' : '3px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
