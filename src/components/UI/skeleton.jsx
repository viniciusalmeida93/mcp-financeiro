import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-[rgba(16,93,148,0.18)]", className)}
      {...props} />
  );
}

export { Skeleton }
