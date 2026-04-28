import { useState, useEffect } from 'react'
import { Briefcase, Home, X } from 'lucide-react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Input from '../UI/Input'
import SelectField from '../UI/Select'
import { buildFormasPagamento } from '../../constants/formasPagamento'
import { createDespesaFixa, updateDespesaFixa, getCategoriasCustomizadas, createCategoriaCustomizada, getCartoes } from '../../services/database'
import { useMes } from '../../contexts/MesContext'

const TIPOS = [
  { value: 'pontual', label: 'Pontual' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'parcela', label: 'Parcela' },
]

const EMPTY_FORM = {
  nome: '',
  valor: '',
  data_vencimento: '',
  recorrencia: 'pontual',
  parcela_atual: '',
  parcela_total: '',
  categoria: '',
  forma_pagamento: 'pix',
  contexto: 'empresa',
}

export default function NovaDespesaFixa({ isOpen, onClose, onSuccess, despesaEdit }) {
  const { mes } = useMes()
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
        // Converter dia_vencimento (number) pra data completa usando o mês selecionado
        const diaStr = String(despesaEdit.dia_vencimento || 1).padStart(2, '0')
        const dataVenc = `${mes}-${diaStr}`
        setForm({
          nome: despesaEdit.nome,
          valor: despesaEdit.valor,
          data_vencimento: dataVenc,
          recorrencia: despesaEdit.recorrencia,
          parcela_atual: despesaEdit.parcela_atual != null ? parseInt(despesaEdit.parcela_atual) : '',
          parcela_total: despesaEdit.parcela_total != null ? parseInt(despesaEdit.parcela_total) : '',
          categoria: despesaEdit.categoria || '',
          forma_pagamento: despesaEdit.forma_pagamento,
          contexto: despesaEdit.contexto,
        })
      } else {
        setForm(EMPTY_FORM)
      }
    }
  }, [isOpen, despesaEdit, mes])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const validate = () => {
    const errs = {}
    if (!form.nome.trim() || form.nome.trim().length < 2) errs.nome = 'Nome deve ter pelo menos 2 caracteres'
    if (!form.valor || parseFloat(String(form.valor).replace(',', '.')) <= 0) errs.valor = 'Valor deve ser maior que zero'
    if (!form.data_vencimento) errs.data_vencimento = 'Informe a data'
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

      // Extrair dia e mês da data selecionada
      const [anoSel, mesSel, diaSel] = form.data_vencimento.split('-').map(Number)
      const diaVenc = diaSel
      const mesOrigem = `${anoSel}-${String(mesSel).padStart(2, '0')}`

      // Calcular mes_referencia correto para cartão
      let mesRef = mesOrigem
      if (form.recorrencia !== 'mensal' && form.forma_pagamento?.startsWith('cartao:')) {
        const cartaoId = form.forma_pagamento.replace('cartao:', '')
        const cartaoSel = cartoes.find(c => c.id === cartaoId)
        if (cartaoSel?.dia_fechamento && diaVenc > cartaoSel.dia_fechamento) {
          let y = anoSel, m = mesSel + 1
          if (m > 12) { m = 1; y += 1 }
          mesRef = `${y}-${String(m).padStart(2, '0')}`
        }
      }

      const payload = {
        nome: form.nome.trim(),
        valor: parseValor(form.valor),
        dia_vencimento: diaVenc,
        recorrencia: form.recorrencia,
        parcela_atual: form.recorrencia === 'parcela' ? parseInt(form.parcela_atual) : null,
        parcela_total: form.recorrencia === 'parcela' ? parseInt(form.parcela_total) : null,
        categoria: form.categoria || null,
        forma_pagamento: form.forma_pagamento,
        contexto: form.contexto,
        status: 'ativo',
        mes_referencia: form.recorrencia !== 'mensal' ? mesRef : null,
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
  const categoriaOptions = [
    ...categoriasDespesa.map(c => ({ value: c.nome, label: c.nome })),
    { value: '__add__', label: '+ Nova categoria' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Despesa' : 'Nova Despesa'}>
      <div className="space-y-4">
        {/* Contexto */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Despesa</label>
          <div className="flex gap-5">
            {[
              { value: 'empresa', label: 'Empresa', Icon: Briefcase },
              { value: 'pessoal', label: 'Pessoal', Icon: Home },
            ].map(({ value, label, Icon }) => (
              <label key={value} className={`flex items-center gap-2 cursor-pointer text-sm ${form.contexto === value ? 'font-semibold' : ''}`}>
                <input
                  type="radio"
                  name="contexto_despesa"
                  value={value}
                  checked={form.contexto === value}
                  onChange={() => set('contexto', value)}
                  className="accent-primary"
                />
                <Icon className="h-3.5 w-3.5" />
                {label}
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
            label="Data"
            required
            type="date"
            value={form.data_vencimento}
            onChange={e => set('data_vencimento', e.target.value)}
            error={errors.data_vencimento}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Tipo"
            options={TIPOS}
            value={form.recorrencia}
            onValueChange={v => set('recorrencia', v)}
          />
          <SelectField
            label="Forma de Pagamento"
            options={buildFormasPagamento(cartoes)}
            value={form.forma_pagamento}
            onValueChange={v => set('forma_pagamento', v)}
          />
        </div>

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

        <SelectField
          label="Categoria"
          options={categoriaOptions}
          value={form.categoria || undefined}
          placeholder="Selecione..."
          onValueChange={v => {
            if (v === '__add__') {
              setShowAddCat(true)
            } else {
              set('categoria', v)
              setShowAddCat(false)
            }
          }}
        />

        {showAddCat && (
          <div className="flex gap-2">
            <Input
              placeholder="Nome da categoria"
              value={novaCategoria}
              onChange={e => setNovaCategoria(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategoria()}
              className="flex-1"
            />
            <Button onClick={handleAddCategoria} disabled={savingCat}>
              {savingCat ? '...' : 'Salvar'}
            </Button>
            <Button variant="ghost" onClick={() => { setShowAddCat(false); setNovaCategoria('') }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {errors.submit && <div className="text-sm text-destructive">{errors.submit}</div>}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="default" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
