import * as React from "react"
import { Label } from "@/components/UI/label"
import { cn } from "@/lib/utils"

// Shadcn Input primitive — also exported for direct use
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-field px-3 py-2 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[var(--ds-faint)] hover:border-primary/30 focus-visible:outline-none focus-visible:border-primary/70 focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }

// Default export: wrapper with label + error — matches old Input.jsx props interface
export default function InputField({ label, error, required, id, className, ...props }) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={inputId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Input
        id={inputId}
        className={cn(error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20', className)}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
