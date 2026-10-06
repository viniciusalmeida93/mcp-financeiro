import { Skeleton } from '@/components/UI/skeleton'
import { cn } from '@/lib/utils'

const TONS = {
  success: { valor: 'text-success', icone: 'bg-success/12 text-success border-success/25' },
  destructive: { valor: 'text-destructive', icone: 'bg-destructive/12 text-destructive border-destructive/25' },
  warning: { valor: 'text-warning', icone: 'bg-warning/12 text-warning border-warning/25' },
  primary: { valor: 'text-primary', icone: 'bg-primary/12 text-primary border-primary/25' },
  neutral: { valor: 'text-foreground', icone: 'bg-muted text-muted-foreground border-border' },
}

// Card de metrica: rotulo, icone com o tom e o valor em numeros tabulares.
// `destaque` deixa o card mais alto e o valor maior (o numero principal da tela).
export default function StatCard({ label, value, icon: Icon, tone = 'neutral', loading, hint, destaque, className }) {
  const t = TONS[tone] || TONS.neutral
  return (
    <div className={cn('ds-vidro min-w-0 rounded-xl border p-3.5 sm:p-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[0.7rem] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-xs">
          {label}
        </span>
        {Icon && (
          <span className={cn('hidden size-7 shrink-0 items-center justify-center rounded-md border sm:flex', t.icone)}>
            <Icon className="size-3.5" />
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className={cn('mt-2.5 w-3/4', destaque ? 'h-8' : 'h-6')} />
      ) : (
        <div
          className={cn(
            'num mt-1.5 truncate font-semibold tracking-tight sm:mt-2',
            destaque ? 'text-2xl sm:text-3xl' : 'text-base sm:text-lg lg:text-xl',
            t.valor
          )}
          title={typeof value === 'string' ? value : undefined}
        >
          {value}
        </div>
      )}
      {hint && !loading && <div className="mt-1 truncate text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}
