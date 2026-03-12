export default function ContextBadge({ contexto }) {
  const config = {
    empresa: { icon: '💼', label: 'Empresa' },
    pessoal: { icon: '🏠', label: 'Pessoal' },
  }
  const { icon, label } = config[contexto] ?? { icon: '?', label: contexto }
  return (
    <span className={`badge badge--${contexto}`}>
      {icon} {label}
    </span>
  )
}
