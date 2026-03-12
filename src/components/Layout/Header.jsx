export default function Header({ title, rightAction }) {
  return (
    <header className="app-header">
      <h1>{title}</h1>
      {rightAction && <div>{rightAction}</div>}
    </header>
  )
}
