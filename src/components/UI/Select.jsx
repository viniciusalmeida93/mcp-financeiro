export default function Select({
  label,
  error,
  required,
  id,
  options = [],
  placeholder,
  ...props
}) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className="form-group">
      {label && (
        <label
          htmlFor={selectId}
          className={`form-label${required ? ' form-label--required' : ''}`}
        >
          {label}
        </label>
      )}
      <select id={selectId} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
