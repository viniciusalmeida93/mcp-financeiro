import { Briefcase, Home } from 'lucide-react'
import { Badge } from '@/components/UI/Badge'
import { cn } from '@/lib/utils'

export default function ContextBadge({ contexto, className }) {
  const Icon = contexto === 'empresa' ? Briefcase : Home
  const label = contexto === 'empresa' ? 'Empresa' : 'Pessoal'
  return (
    <Badge variant="secondary" className={cn('gap-1', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
