import { ToggleGroup, ToggleGroupItem } from '@/components/UI/toggle-group'
import { Building2, User, LayoutList } from 'lucide-react'
import { useContexto } from '@/contexts/ContextoContext'

// ContextToggle works in two modes:
// 1. Controlled (filter mode): pass value + onChange props — shows todos/empresa/pessoal
// 2. Context mode (theme switcher): no props — reads from ContextoContext, shows empresa/pessoal
export default function ContextToggle({ value: valueProp, onChange, compact = false }) {
  const isControlled = valueProp !== undefined && onChange !== undefined

  // Only call useContexto when not in controlled mode
  // (hook must always be called — we just conditionally use the return value)
  const ctx = useContexto()
  const value = isControlled ? valueProp : ctx.contexto
  const handleChange = isControlled
    ? (val) => val && onChange(val)
    : (val) => val && ctx.setContexto(val)

  if (isControlled) {
    // Filter mode: 3 options (todos, empresa, pessoal)
    return (
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={handleChange}
        className="w-full"
      >
        <ToggleGroupItem value="todos" className="flex-1 gap-1.5" aria-label="Todos">
          <LayoutList size={14} />
          {!compact && <span>Tudo</span>}
        </ToggleGroupItem>
        <ToggleGroupItem value="empresa" className="flex-1 gap-1.5" aria-label="Contexto Empresa">
          <Building2 size={14} />
          {!compact && <span>Empresa</span>}
        </ToggleGroupItem>
        <ToggleGroupItem value="pessoal" className="flex-1 gap-1.5" aria-label="Contexto Pessoal">
          <User size={14} />
          {!compact && <span>Pessoal</span>}
        </ToggleGroupItem>
      </ToggleGroup>
    )
  }

  // Theme mode: 2 options (empresa, pessoal)
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={handleChange}
      className="w-full"
    >
      <ToggleGroupItem value="empresa" className="flex-1 gap-1.5" aria-label="Contexto Empresa">
        <Building2 size={14} />
        {!compact && <span>Empresa</span>}
      </ToggleGroupItem>
      <ToggleGroupItem value="pessoal" className="flex-1 gap-1.5" aria-label="Contexto Pessoal">
        <User size={14} />
        {!compact && <span>Pessoal</span>}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
