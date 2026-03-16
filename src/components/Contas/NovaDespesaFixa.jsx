import { useState, useEffect } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Input from '../UI/Input'
import Select from '../UI/Select'
import { buildFormasPagamento } from '../../constants/formasPagamento'
import { createDespesaFixa, updateDespesaFixa, getCategoriasCustomizadas, createCategoriaCustomizada, getCartoes } from '../../services/database'

const TIPOS = [
  { value: 'pontual', label: 'Pontual' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'parcela', label: 'Parcela' },
]

const EMPTY_FORM = {
  nome: '',
  valor: '',
  dia_vencimento: '',
  recorrencia: 'pontual',
  parcela_atual: '',
  parcela_total: '',
  categoria: '',
  forma_pagamento: 'pix',
  contexto: 'empresa',
}

export default function NovaDespesaFixa({ isOpen, onClose, onSuccess, despesaEdit }) {
  const isEditing = !!despesaEdit
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const [categorias, setCategorias] = useState([])
  const [showAddCat, setShowAddCat] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [savingCat, setSavingCat] = useState(false)
  const [cartoes, setCartoes] = useState([])

  useEffect(() => {
    getCategoriasCustomizadas().then(data => setCategorias(data)).catch(() => {})
    getCartoes({}).then(data => setCartoes(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (isOpen) {
      setErrors({})
      if (despesaEdit) {
        setForm({
          nome: despesaEdit.nome,
          valor: despesaEdit.valor,
          dia_vencimento: despesaEdit.dia_vencimento,
          recorrencia: despesaEdit.recorrencia,
          parcela_atual: despesaEdit.parcela_atual != null ? parseInt(despesaEdit.parcela_atual) : '',
          parcela_total: despesaEdit.parcela_total != null ? parseInt(despesaEdit.parcela_total) : '',
          categoria: despesaEdit.categoria,
          forma_pagamento: despesaEdit.forma_pagamento,
          contexto: despesaEdit.contexto,
        })
      } else {
        setForm(EMPTY_FORM)
      }
    }
  }, [isOpen, despesaEdit])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const validate = () => {
    const errs = {}
    if (!form.nome.trim() || form.nome.trim().length < 2) errs.nome = 'Nome deve ter pelo menos 2 caracteres'
    if (!form.valor || parseFloat(String(form.valor).replace(',', '.')) <= 0) errs.valor = 'Valor deve ser maior que zero'
    if (form.dia_vencimento && (Number(form.dia_vencimento) < 1 || Number(form.dia_vencimento) > 31)) {
      errs.dia_vencimento = 'Dia deve ser entre 1 e 31'
    }
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
      const parseValor = (v) => parseFloat(String(v).replace(',', '.'))

      const payload = {
        nome: form.nome.trim(),
        valor: parseValor(form.valor),
        dia_vencimento: Number(form.dia_vencimento) || new Date().getDate(),
        recorrencia: form.recorrencia,
        parcela_atual: form.recorrencia === 'parcela' ? parseInt(form.parcela_atual) : null,
        parcela_total: form.recorrencia === 'parcela' ? parseInt(form.parcela_total) : null,
        categoria: form.categoria || null,
        forma_pagamento: form.forma_pagamento,
        contexto: form.contexto,
        status: 'ativo',
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

  const handleAddCategoria = async () => {
    if (!novaCategoria.trim()) return
    setSavingCat(true)
    try {
      const criada = await createCategoriaCustomizada({ nome: novaCategoria.trim(), tipo: 'despesa', cor: '#1f507a' })
      const data = await getCategoriasCustomizadas()
      setCategorias(data)
      set('categoria', criada.nome)
      setNovaCategoria('')
      setShowAddCat(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingCat(false)
    }
  }

  const categoriasDespesa = categorias.filter(c => c.tipo === 'despesa')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Despesa' : 'Nova Despesa'}>

      {/* Contexto */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Tipo de Despesa</label>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 4 }}>
          {[{ value: 'empresa', label: '💼 Empresa' }, { value: 'pessoal', label: '🏠 Pessoal' }].map(opt => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: form.contexto === opt.value ? 600 : 400 }}>
              <input
                type="radio"
                name="contexto_despesa"
                value={opt.value}
                checked={form.contexto === opt.value}
                onChange={() => set('contexto', opt.value)}
                style={{ accentColor: 'var(--color-empresa-primary)' }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <Input
        label="Nome"
        required
        placeholder="Ex: Netflix, Aluguel..."
        value={form.nome}
        onChange={e => set('nome', e.target.value)}
        error={errors.nome}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Valor (R$)"
          required
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={form.valor}
          onChange={e => set('valor', e.target.value.replace(/[^0-9,.]/, ''))}
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
        label="Tipo"
        options={TIPOS}
        value={form.recorrencia}
        onChange={e => set('recorrencia', e.target.value)}
      />

      {form.recorrencia === 'parcela' && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Parcela Atual"
            type="number"
            min="1"
            placeholder="Ex: 2"
            value={form.parcela_atual}
            onChange={e => set('parcela_atual', e.target.value)}
            error={errors.parcelas}
          />
          <Input
            label="Total de Parcelas"
            type="number"
            min="1"
            placeholder="Ex: 12"
            value={form.parcela_total}
            onChange={e => set('parcela_total', e.target.value)}
            error={errors.parcelas}
          />
        </div>
      )}

      {/* Categoria — somente despesas */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Categoria</label>
        <select
          className="select"
          value={form.categoria || ''}
          onChange={e => {
            if (e.target.value === '__add__') {
              setShowAddCat(true)
            } else {
              set('categoria', e.target.value)
              setShowAddCat(false)
            }
          }}
        >
          <option value="">Selecione uma categoria...</option>
          {categoriasDespesa.map(c => (
            <option key={c.id} value={c.nome}>{c.nome}</option>
          ))}
          <option value="__add__">+ Adicionar nova categoria</option>
        </select>

        {showAddCat && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              className="input"
              placeholder="Nome da categoria"
              value={novaCategoria}
              onChange={e => setNovaCategoria(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategoria()}
              autoFocus
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              onClick={handleAddCategoria}
              disabled={savingCat}
              style={{ flexShrink: 0 }}
            >
              {savingCat ? '...' : 'Salvar'}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 hover:bg-accent hover:text-accent-foreground"
              onClick={() => { setShowAddCat(false); setNovaCategoria('') }}
              style={{ flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <Select
        label="Forma de Pagamento"
        options={buildFormasPagamento(cartoes)}
        value={form.forma_pagamento}
        onChange={e => set('forma_pagamento', e.target.value)}
      />


      {errors.submit && <div className="form-error" style={{ marginBottom: 8 }}>{errors.submit}</div>}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="default" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </Modal>
  )
}
