export default function Input({
  label,
  error,
  required,
  id,
  className,
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`
  const inputClassName = [className, error ? 'input--error' : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="form-group">
      {label && (
        <label
          htmlFor={inputId}
          className={`form-label${required ? ' form-label--required' : ''}`}
        >
          {label}
        </label>
      )}
      <input id={inputId} className={inputClassName} {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
