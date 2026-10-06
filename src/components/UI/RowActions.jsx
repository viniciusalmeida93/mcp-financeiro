import { useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover'
import { cn } from '@/lib/utils'

// Acoes de uma linha de lista. Desktop: icones inline. Celular: menu "⋮",
// para a linha nao perder metade da largura para os icones.
// actions: [{ icon, label, onClick, destructive }] -- itens falsy sao ignorados.
export default function RowActions({ actions }) {
  const [open, setOpen] = useState(false)
  const lista = actions.filter(Boolean)
  if (lista.length === 0) return null

  return (
    <>
      <div className="hidden sm:flex items-center gap-0.5 shrink-0">
        {lista.map(({ icon: Icon, label, onClick, destructive }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            className={cn(
              'flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent',
              destructive ? 'hover:text-destructive' : 'hover:text-foreground'
            )}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label="Ações"
          className="sm:hidden flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[popup-open]:bg-accent data-[popup-open]:text-foreground"
        >
          <MoreVertical size={18} />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-52 gap-0 p-1">
          {lista.map(({ icon: Icon, label, onClick, destructive }) => (
            <button
              key={label}
              type="button"
              onClick={() => { setOpen(false); onClick() }}
              className={cn(
                'flex h-11 w-full cursor-pointer items-center gap-3 rounded-sm px-3 text-left text-sm transition-colors hover:bg-accent',
                destructive ? 'text-destructive' : 'text-foreground'
              )}
            >
              <Icon size={16} className={destructive ? '' : 'text-muted-foreground'} />
              {label}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </>
  )
}
