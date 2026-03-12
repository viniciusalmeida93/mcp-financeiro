export default function ContextToggle({ value, onChange }) {
  const options = [
    { key: 'todos', label: 'Tudo' },
    { key: 'empresa', label: '💼 Empresa' },
    { key: 'pessoal', label: '🏠 Pessoal' },
  ]
  return (
    <div className="context-toggle">
      {options.map(opt => (
        <button
          key={opt.key}
          className={`context-toggle__btn${value === opt.key ? ` active--${opt.key}` : ''}`}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
