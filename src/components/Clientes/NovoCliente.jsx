import { useState, useEffect } from 'react'
import { Briefcase, Home, X } from 'lucide-react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Input from '../UI/Input'
import SelectField from '../UI/Select'
import { createCliente, updateCliente, createLancamento, createCategoriaCustomizada, getCategoriasCustomizadas } from '../../services/database'
import { formatCurrency } from '../../utils/formatters'

const TIPOS = [
  { value: 'mensal', label: 'Recorrente (Mensal)' },
  { value: 'pontual', label: 'Pontual (Projeto)' },
]

const EMPTY_FORM = {
  nome: '',
  email_cobranca: '',
  valor: '',
  data_vencimento: '',
  tipo: 'mensal',
  status: 'ativo',
  servico: '',
  precisa_nf: false,
  aliquota_imposto: 5,
  valor_entrada: '',
  qtd_parcelas: 1,
  contexto: 'empresa',
}

function calcParcelaValor(index, total, entrada, qtd) {
  const t = Number(total) || 0
  const e = Number(entrada) || 0
  const q = Number(qtd) || 1
  if (e > 0 && q > 1) {
    if (index === 0) return e
    return (t - e) / (q - 1)
  }
  return t / q
}

export default function NovoCliente({ isOpen, onClose, onSuccess, clienteEdit }) {
  const isEditing = !!clienteEdit
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(clienteEdit ?? EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [parcelas, setParcelas] = useState([{ data: '' }])

  const [categorias, setCategorias] = useState([])
  const [showAddCat, setShowAddCat] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [savingCat, setSavingCat] = useState(false)

  useEffect(() => {
    getCategoriasCustomizadas().then(data => setCategorias(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (isOpen) {
      setErrors({})
      if (clienteEdit) {
        setForm({
          nome: clienteEdit.nome || '',
          email_cobranca: clienteEdit.email_cobranca || '',
          valor: clienteEdit.valor || '',
          data_vencimento: '',
          tipo: clienteEdit.tipo || 'mensal',
          status: clienteEdit.status || 'ativo',
          servico: clienteEdit.servico || '',
          precisa_nf: clienteEdit.precisa_nf || false,
          aliquota_imposto: clienteEdit.aliquota_imposto || 5,
          valor_entrada: '',
          qtd_parcelas: 1,
          contexto: clienteEdit.contexto || 'empresa',
        })
      } else {
        setForm(EMPTY_FORM)
        setParcelas([{ data: '' }])
      }
    }
  }, [isOpen, clienteEdit])

  useEffect(() => {
    const qtd = Number(form.qtd_parcelas) || 1
    setParcelas(prev => {
      const arr = [...prev]
      while (arr.length < qtd) arr.push({ data: '' })
      return arr.slice(0, qtd)
    })
  }, [form.qtd_parcelas])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const setParcelaData = (i, data) => {
    setParcelas(prev => prev.map((p, idx) => idx === i ? { ...p, data } : p))
  }

  const validate = () => {
    const errs = {}
    if (!form.nome.trim() || form.nome.trim().length < 2) errs.nome = 'Nome deve ter pelo menos 2 caracteres'
    if (form.email_cobranca && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_cobranca)) {
      errs.email_cobranca = 'Email inválido'
    }
    if (!form.valor || Number(form.valor) <= 0) errs.valor = 'Valor deve ser maior que zero'
    if (form.tipo === 'mensal') {
      if (!form.data_vencimento) errs.data_vencimento = 'Informe a data'
    } else {
      parcelas.forEach((p, i) => {
        if (!p.data) errs[`parcela_${i}`] = 'Informe a data'
      })
    }
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      // Extrair dia da data selecionada
      const diaVenc = form.tipo === 'mensal' && form.data_vencimento
        ? Number(form.data_vencimento.split('-')[2])
        : 1

      const payload = {
        nome: form.nome.trim(),
        email_cobranca: form.email_cobranca || null,
        valor: Number(form.valor),
        dia_vencimento: diaVenc,
        tipo: form.tipo,
        status: form.status,
        servico: form.servico || null,
        precisa_nf: form.precisa_nf,
        aliquota_imposto: Number(form.aliquota_imposto) || 5,
        contexto: form.contexto,
      }

      if (isEditing) {
        await updateCliente(clienteEdit.id, payload)
      } else {
        const novoCliente = await createCliente(payload)
        if (form.tipo === 'pontual') {
          const qtd = Number(form.qtd_parcelas) || 1
          for (let i = 0; i < parcelas.length; i++) {
            const valor = calcParcelaValor(i, form.valor, form.valor_entrada, qtd)
            await createLancamento({
              tipo: 'entrada',
              valor,
              descricao: form.nome,
              categoria: form.servico || 'receita_servico',
              forma_pagamento: 'transferencia',
              data: parcelas[i].data,
              contexto: form.contexto,
              cliente_id: novoCliente.id,
            })
          }
        }
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
      const criada = await createCategoriaCustomizada({ nome: novaCategoria.trim(), tipo: 'receita', cor: '#1f507a' })
      const data = await getCategoriasCustomizadas()
      setCategorias(data)
      set('servico', criada.nome)
      setNovaCategoria('')
      setShowAddCat(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingCat(false)
    }
  }

  const isPontual = form.tipo === 'pontual'
  const qtd = Number(form.qtd_parcelas) || 1
  const categoriasReceita = categorias.filter(c => c.tipo === 'receita')
  const categoriaOptions = [
    ...categoriasReceita.map(c => ({ value: c.nome, label: c.nome })),
    { value: '__add__', label: '+ Nova categoria' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Receita' : 'Nova Receita'}>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Contexto</label>
          <div className="flex gap-5">
            {[
              { value: 'empresa', label: 'Empresa', Icon: Briefcase },
              { value: 'pessoal', label: 'Pessoal', Icon: Home },
            ].map(({ value, label, Icon }) => (
              <label key={value} className={`flex items-center gap-2 cursor-pointer text-sm ${form.contexto === value ? 'font-semibold' : ''}`}>
                <input
                  type="radio"
                  name="contexto_cliente"
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

        <SelectField
          label="Tipo"
          options={TIPOS}
          value={form.tipo}
          onValueChange={v => set('tipo', v)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={isPontual ? 'Valor Total (R$)' : 'Valor Mensal (R$)'}
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={form.valor}
            onChange={e => set('valor', e.target.value)}
            error={errors.valor}
          />
          {!isPontual && (
            <Input
              label="Data"
              required
              type="date"
              value={form.data_vencimento}
              onChange={e => set('data_vencimento', e.target.value)}
              error={errors.data_vencimento}
            />
          )}
        </div>

        {isPontual && (
          <div className="rounded-lg border bg-accent/30 p-3 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Parcelamento
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Valor de Entrada (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="Opcional"
                value={form.valor_entrada || ''}
                onChange={e => set('valor_entrada', e.target.value)}
              />
              <Input
                label="Nº de Parcelas"
                type="number"
                min="1"
                max="24"
                placeholder="1"
                value={form.qtd_parcelas}
                onChange={e => set('qtd_parcelas', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              {parcelas.map((p, i) => {
                const valor = calcParcelaValor(i, form.valor, form.valor_entrada, qtd)
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <Input
                      type="date"
                      value={p.data}
                      onChange={e => setParcelaData(i, e.target.value)}
                      error={errors[`parcela_${i}`]}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold shrink-0 min-w-[80px] text-right">
                      {Number(form.valor) > 0 ? formatCurrency(valor) : 'R$ -'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <SelectField
          label="Categoria"
          options={categoriaOptions}
          value={form.servico || undefined}
          placeholder="Selecione..."
          onValueChange={v => {
            if (v === '__add__') {
              setShowAddCat(true)
            } else {
              set('servico', v)
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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="precisa_nf"
            checked={form.precisa_nf}
            onChange={e => set('precisa_nf', e.target.checked)}
            className="accent-primary"
          />
          <label htmlFor="precisa_nf" className="text-sm cursor-pointer">Precisa de Nota Fiscal</label>
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
