import { useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Input from '../UI/Input'
import Select from '../UI/Select'
import ContextToggle from '../UI/ContextToggle'
import { FORMAS_PAGAMENTO } from '../../constants/formasPagamento'
import { getCategoriasByContexto } from '../../constants/categorias'
import { createLancamento, createLancamentosParcelados } from '../../services/database'
import { toDateString } from '../../utils/dateHelpers'

const TIPOS = [
  { value: 'saida', label: '💸 Saída' },
  { value: 'entrada', label: '💰 Entrada' },
]

export default function NovoLancamento({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    contexto: 'empresa',
    tipo: 'saida',
    valor: '',
    descricao: '',
    categoria: '',
    forma_pagamento: 'pix',
    data: toDateString(new Date()),
    parcelado: false,
    numeroParcelas: 2,
  })
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const validate = () => {
    const errs = {}
    if (!form.valor || Number(form.valor) <= 0) errs.valor = 'Valor obrigatório'
    if (!form.descricao.trim()) errs.descricao = 'Descrição obrigatória'
    if (!form.categoria) errs.categoria = 'Categoria obrigatória'
    if (!form.data) errs.data = 'Data obrigatória'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const base = {
        tipo: form.tipo,
        valor: Number(form.valor),
        descricao: form.descricao.trim(),
        categoria: form.categoria,
        forma_pagamento: form.forma_pagamento,
        data: form.data,
        contexto: form.contexto,
        parcelado: false,
      }

      if (form.parcelado && form.numeroParcelas >= 2) {
        await createLancamentosParcelados(base, Number(form.numeroParcelas))
      } else {
        await createLancamento(base)
      }

      // Reset form
      setForm({
        contexto: 'empresa',
        tipo: 'saida',
        valor: '',
        descricao: '',
        categoria: '',
        forma_pagamento: 'pix',
        data: toDateString(new Date()),
        parcelado: false,
        numeroParcelas: 2,
      })
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
  const valorParcela = form.parcelado && form.valor && form.numeroParcelas >= 2
    ? (Number(form.valor) / Number(form.numeroParcelas)).toFixed(2)
    : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Lançamento">
      <div className="form-group">
        <label className="form-label">Contexto</label>
        <ContextToggle
          value={form.contexto}
          onChange={v => { if (v !== 'todos') { set('contexto', v); set('categoria', '') } }}
        />
      </div>

      <div className="type-toggle">
        {TIPOS.map(t => (
          <button
            key={t.value}
            className={`type-toggle__btn${form.tipo === t.value ? ` active--${t.value}` : ''}`}
            onClick={() => set('tipo', t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

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
        label="Descrição"
        required
        placeholder="Ex: Netflix, Mercado, Cliente X"
        value={form.descricao}
        onChange={e => set('descricao', e.target.value)}
        error={errors.descricao}
      />

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

      <Input
        label="Data"
        required
        type="date"
        value={form.data}
        onChange={e => set('data', e.target.value)}
        error={errors.data}
      />

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="parcelado"
          checked={form.parcelado}
          onChange={e => set('parcelado', e.target.checked)}
        />
        <label htmlFor="parcelado">Parcelado</label>
      </div>

      {form.parcelado && (
        <div className="form-row">
          <Input
            label="Nº de Parcelas"
            type="number"
            min="2"
            max="48"
            value={form.numeroParcelas}
            onChange={e => set('numeroParcelas', e.target.value)}
          />
          {valorParcela && (
            <div className="form-group">
              <label className="form-label">Valor por Parcela</label>
              <input readOnly value={`R$ ${valorParcela}`} style={{ color: 'var(--color-text-muted)' }} />
            </div>
          )}
        </div>
      )}

      {errors.submit && <div className="form-error" style={{ marginBottom: 8 }}>{errors.submit}</div>}

      <div className="form-actions">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </Modal>
  )
}
