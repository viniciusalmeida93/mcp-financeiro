export default function Input({
  label,
  error,
  required,
  id,
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`
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
      <input id={inputId} {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
