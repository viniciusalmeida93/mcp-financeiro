import { useState, useEffect } from 'react'
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import Button from '../UI/Button'

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
    <Modal isOpen={true} onClose={onClose} title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}>
      <form onSubmit={handleSubmit}>
        <Input
          label="Nome"
          required
          placeholder="Ex: Alimentação"
          value={nome}
          onChange={e => { setNome(e.target.value); setError('') }}
          error={error}
          autoFocus
        />

        <div className="form-group">
          <label className="form-label">Tipo</label>
          <div className="flex gap-4 mt-1">
            {[{ value: 'despesa', label: '↓ Despesa' }, { value: 'receita', label: '↑ Receita' }].map(opt => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 cursor-pointer text-sm ${tipo === opt.value ? 'font-semibold' : ''}`}
              >
                <input
                  type="radio"
                  name="tipo_cat"
                  value={opt.value}
                  checked={tipo === opt.value}
                  onChange={() => setTipo(opt.value)}
                  className="accent-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Cor</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {CORES.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCor(c)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: c,
                  border: cor === c ? '3px solid hsl(var(--foreground))' : '3px solid transparent',
                  cursor: 'pointer',
                  outline: 'none',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar' : 'Criar')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
