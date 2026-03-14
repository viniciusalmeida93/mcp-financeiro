import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Input from '../UI/Input'
import { Input as RawInput } from '@/components/UI/input'
import Select from '../UI/Select'
import ContextToggle from '../UI/ContextToggle'
import DatePicker from '../UI/DatePicker'
import { Label } from '@/components/UI/label'
import { buildFormasPagamento } from '../../constants/formasPagamento'
import { getCategoriasByContexto } from '../../constants/categorias'
import { createLancamento, createLancamentosParcelados, getCartoes } from '../../services/database'
import { toDateString } from '../../utils/dateHelpers'

const TIPOS = [
  { value: 'saida', label: '💸 Saída' },
  { value: 'entrada', label: '💰 Entrada' },
]

const FORM_INICIAL = {
  contexto: 'empresa',
  tipo: 'saida',
  valor: '',
  descricao: '',
  categoria: '',
  forma_pagamento: 'pix',
  data: toDateString(new Date()),
  parcelado: false,
  numeroParcelas: 2,
}

export default function NovoLancamento({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [errors, setErrors] = useState({})
  const [cartoes, setCartoes] = useState([])

  useEffect(() => {
    getCartoes({}).then(data => setCartoes(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (isOpen) {
      setErrors({})
      setForm({ ...FORM_INICIAL, data: toDateString(new Date()) })
    }
  }, [isOpen])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const validate = () => {
    const errs = {}
    if (!form.valor || Number(form.valor) <= 0) errs.valor = 'Valor deve ser maior que zero'
    if (!form.descricao.trim() || form.descricao.trim().length < 2) errs.descricao = 'Descrição deve ter pelo menos 2 caracteres'
    if (!form.categoria) errs.categoria = 'Categoria obrigatória'
    if (!form.data) errs.data = 'Data obrigatória'
    if (!form.contexto || form.contexto === 'todos') errs.contexto = 'Selecione empresa ou pessoal'
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
      toast.success('Lançamento salvo!')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error('Erro ao salvar.')
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  // Convert string date (YYYY-MM-DD) to Date object for DatePicker
  const dateValue = form.data ? new Date(form.data + 'T12:00:00') : undefined

  const categorias = getCategoriasByContexto(form.contexto)
  const valorParcela = form.parcelado && form.valor && form.numeroParcelas >= 2
    ? (Number(form.valor) / Number(form.numeroParcelas)).toFixed(2)
    : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Lançamento">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Contexto</Label>
          <ContextToggle
            value={form.contexto}
            onChange={v => { if (v !== 'todos') { set('contexto', v); set('categoria', '') } }}
          />
        </div>

        <div className="flex gap-2">
          {TIPOS.map(t => (
            <button
              key={t.value}
              type="button"
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${
                form.tipo === t.value
                  ? t.value === 'saida'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-green-500/20 border-green-500 text-green-400'
                  : 'border-input bg-background hover:bg-accent'
              }`}
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
          options={buildFormasPagamento(cartoes)}
          value={form.forma_pagamento}
          onChange={e => set('forma_pagamento', e.target.value)}
        />

        <DatePicker
          label="Data"
          value={dateValue}
          onChange={(date) => date && set('data', toDateString(date))}
        />
        {errors.data && <p className="text-xs text-destructive -mt-3">{errors.data}</p>}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="parcelado"
            checked={form.parcelado}
            onChange={e => set('parcelado', e.target.checked)}
            className="rounded border-input"
          />
          <Label htmlFor="parcelado" className="cursor-pointer">Parcelado</Label>
        </div>

        {form.parcelado && (
          <div className="flex gap-3">
            <Input
              label="Nº de Parcelas"
              type="number"
              min="2"
              max="48"
              value={form.numeroParcelas}
              onChange={e => set('numeroParcelas', e.target.value)}
            />
            {valorParcela && (
              <div className="space-y-1.5 flex-1">
                <Label>Valor por Parcela</Label>
                <RawInput readOnly value={`R$ ${valorParcela}`} className="text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        {errors.submit && (
          <p className="text-xs text-destructive">{errors.submit}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="default" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
