import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingScreen() {
  return (
    <div className="p-4 space-y-4" role="status" aria-label="Carregando...">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
