import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function ContextBadge({ contexto, className }) {
  return (
    <Badge variant="secondary" className={cn(className)}>
      {contexto === 'empresa' ? '💼 Empresa' : '🏠 Pessoal'}
    </Badge>
  )
}
