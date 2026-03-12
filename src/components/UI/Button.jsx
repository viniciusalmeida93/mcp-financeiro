export default function Button({
  children,
  variant = 'primary',
  size,
  full,
  disabled,
  onClick,
  type = 'button',
  className = '',
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size ? `btn--${size}` : '',
    full ? 'btn--full' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
