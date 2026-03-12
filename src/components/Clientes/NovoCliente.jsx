import { useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Input from '../UI/Input'
import Select from '../UI/Select'
import { createCliente, updateCliente } from '../../services/database'

const TIPOS = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'pontual', label: 'Pontual' },
]

const STATUS_OPTS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
]

export default function NovoCliente({ isOpen, onClose, onSuccess, clienteEdit }) {
  const isEditing = !!clienteEdit
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(clienteEdit ?? {
    nome: '',
    email_cobranca: '',
    valor: '',
    dia_vencimento: '',
    tipo: 'mensal',
    status: 'ativo',
    servico: '',
    precisa_nf: false,
    aliquota_imposto: 5,
  })
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const validate = () => {
    const errs = {}
    if (!form.nome.trim()) errs.nome = 'Nome obrigatório'
    if (!form.valor || Number(form.valor) <= 0) errs.valor = 'Valor obrigatório'
    if (!form.dia_vencimento || Number(form.dia_vencimento) < 1 || Number(form.dia_vencimento) > 31) {
      errs.dia_vencimento = 'Dia deve ser entre 1 e 31'
    }
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        nome: form.nome.trim(),
        email_cobranca: form.email_cobranca || null,
        valor: Number(form.valor),
        dia_vencimento: Number(form.dia_vencimento),
        tipo: form.tipo,
        status: form.status,
        servico: form.servico || null,
        precisa_nf: form.precisa_nf,
        aliquota_imposto: Number(form.aliquota_imposto) || 5,
      }

      if (isEditing) {
        await updateCliente(clienteEdit.id, payload)
      } else {
        await createCliente(payload)
      }

      setErrors({})
      onSuccess?.()
      onClose()
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}>
      <Input
        label="Nome"
        required
        placeholder="Nome do cliente"
        value={form.nome}
        onChange={e => set('nome', e.target.value)}
        error={errors.nome}
      />

      <Input
        label="Email de Cobrança"
        type="email"
        placeholder="email@cliente.com"
        value={form.email_cobranca || ''}
        onChange={e => set('email_cobranca', e.target.value)}
        error={errors.email_cobranca}
      />

      <div className="form-row">
        <Input
          label="Valor Mensal (R$)"
          required
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
          value={form.valor}
          onChange={e => set('valor', e.target.value)}
          error={errors.valor}
        />
        <Input
          label="Dia Vencimento"
          required
          type="number"
          min="1"
          max="31"
          placeholder="1-31"
          value={form.dia_vencimento}
          onChange={e => set('dia_vencimento', e.target.value)}
          error={errors.dia_vencimento}
        />
      </div>

      <div className="form-row">
        <Select
          label="Tipo"
          options={TIPOS}
          value={form.tipo}
          onChange={e => set('tipo', e.target.value)}
        />
        <Select
          label="Status"
          options={STATUS_OPTS}
          value={form.status}
          onChange={e => set('status', e.target.value)}
        />
      </div>

      <Input
        label="Serviço"
        placeholder="Ex: Social Media, Sites..."
        value={form.servico || ''}
        onChange={e => set('servico', e.target.value)}
      />

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="precisa_nf"
          checked={form.precisa_nf}
          onChange={e => set('precisa_nf', e.target.checked)}
        />
        <label htmlFor="precisa_nf">Precisa de Nota Fiscal</label>
      </div>

      {form.precisa_nf && (
        <Input
          label="Alíquota Imposto (%)"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={form.aliquota_imposto}
          onChange={e => set('aliquota_imposto', e.target.value)}
        />
      )}

      {errors.submit && <div className="form-error" style={{ marginBottom: 8 }}>{errors.submit}</div>}

      <div className="form-actions">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </Modal>
  )
}
