import { Wallet, Briefcase, Home } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import { Card, CardContent } from '@/components/UI/Card'
import { Skeleton } from '@/components/UI/skeleton'
import { cn } from '@/lib/utils'

export default function SaldoCard({ saldoEmpresa, saldoPessoal, saldoTotal, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Wallet className="h-3 w-3" />
            Total
          </div>
          <div className={cn('font-bold text-sm', saldoTotal >= 0 ? 'text-green-500' : 'text-red-500')}>
            {formatCurrency(saldoTotal)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            Empresa
          </div>
          <div className={cn('font-bold text-sm', saldoEmpresa < 0 ? 'text-red-500' : '')}>
            {formatCurrency(saldoEmpresa)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Home className="h-3 w-3" />
            Pessoal
          </div>
          <div className={cn('font-bold text-sm', saldoPessoal < 0 ? 'text-red-500' : '')}>
            {formatCurrency(saldoPessoal)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
