export default function Card({ children, contexto, className = '' }) {
  const contextClass = contexto ? ` card--${contexto}` : ''
  return (
    <div className={`card${contextClass} ${className}`.trim()}>
      {children}
    </div>
  )
}
