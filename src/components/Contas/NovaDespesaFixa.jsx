import { useState, useEffect } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Input from '../UI/Input'
import Select from '../UI/Select'
import ContextToggle from '../UI/ContextToggle'
import { FORMAS_PAGAMENTO } from '../../constants/formasPagamento'
import { getCategoriasByContexto } from '../../constants/categorias'
import { createDespesaFixa, updateDespesaFixa } from '../../services/database'

const RECORRENCIAS = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'parcela', label: 'Parcela' },
]

export default function NovaDespesaFixa({ isOpen, onClose, onSuccess, despesaEdit }) {
  const isEditing = !!despesaEdit
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    valor: '',
    dia_vencimento: '',
    recorrencia: 'mensal',
    parcela_atual: '',
    parcela_total: '',
    categoria: '',
    forma_pagamento: 'pix',
    contexto: 'empresa',
    data_termino: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (despesaEdit) {
      setForm({
        nome: despesaEdit.nome,
        valor: despesaEdit.valor,
        dia_vencimento: despesaEdit.dia_vencimento,
        recorrencia: despesaEdit.recorrencia,
        parcela_atual: despesaEdit.parcela_atual ?? '',
        parcela_total: despesaEdit.parcela_total ?? '',
        categoria: despesaEdit.categoria,
        forma_pagamento: despesaEdit.forma_pagamento,
        contexto: despesaEdit.contexto,
        data_termino: despesaEdit.data_termino ?? '',
      })
    }
  }, [despesaEdit])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const validate = () => {
    const errs = {}
    if (!form.nome.trim()) errs.nome = 'Nome obrigatório'
    if (!form.valor || Number(form.valor) <= 0) errs.valor = 'Valor obrigatório'
    if (!form.dia_vencimento || Number(form.dia_vencimento) < 1 || Number(form.dia_vencimento) > 31) {
      errs.dia_vencimento = 'Dia deve ser entre 1 e 31'
    }
    if (!form.categoria) errs.categoria = 'Categoria obrigatória'
    if (form.recorrencia === 'parcela') {
      if (!form.parcela_atual || !form.parcela_total) errs.parcelas = 'Informe parcela atual e total'
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
        valor: Number(form.valor),
        dia_vencimento: Number(form.dia_vencimento),
        recorrencia: form.recorrencia,
        parcela_atual: form.recorrencia === 'parcela' ? Number(form.parcela_atual) : null,
        parcela_total: form.recorrencia === 'parcela' ? Number(form.parcela_total) : null,
        categoria: form.categoria,
        forma_pagamento: form.forma_pagamento,
        contexto: form.contexto,
        status: 'ativo',
        data_termino: form.data_termino || null,
      }

      if (isEditing) {
        await updateDespesaFixa(despesaEdit.id, payload)
      } else {
        await createDespesaFixa(payload)
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

  const categorias = getCategoriasByContexto(form.contexto)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Despesa' : 'Nova Despesa Fixa'}>
      <div className="form-group">
        <label className="form-label">Contexto</label>
        <ContextToggle
          value={form.contexto}
          onChange={v => { if (v !== 'todos') { set('contexto', v); set('categoria', '') } }}
        />
      </div>

      <Input
        label="Nome"
        required
        placeholder="Ex: Netflix, Aluguel..."
        value={form.nome}
        onChange={e => set('nome', e.target.value)}
        error={errors.nome}
      />

      <div className="form-row">
        <Input
          label="Valor (R$)"
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

      <Select
        label="Recorrência"
        options={RECORRENCIAS}
        value={form.recorrencia}
        onChange={e => set('recorrencia', e.target.value)}
      />

      {form.recorrencia === 'parcela' && (
        <div className="form-row">
          <Input
            label="Parcela Atual"
            type="number"
            min="1"
            placeholder="Ex: 2"
            value={form.parcela_atual}
            onChange={e => set('parcela_atual', e.target.value)}
          />
          <Input
            label="Total de Parcelas"
            type="number"
            min="1"
            placeholder="Ex: 12"
            value={form.parcela_total}
            onChange={e => set('parcela_total', e.target.value)}
          />
        </div>
      )}

      <Select
        label="Categoria"
        required
        placeholder="Selecione..."
        options={categorias}
        value={form.categoria}
        onChange={e => set('categoria', e.target.value)}
        error={errors.categoria}
      />

      <Select
        label="Forma de Pagamento"
        options={FORMAS_PAGAMENTO}
        value={form.forma_pagamento}
        onChange={e => set('forma_pagamento', e.target.value)}
      />

      {form.recorrencia === 'parcela' && (
        <Input
          label="Data de Término"
          type="date"
          value={form.data_termino}
          onChange={e => set('data_termino', e.target.value)}
        />
      )}

      {errors.parcelas && <div className="form-error">{errors.parcelas}</div>}
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
