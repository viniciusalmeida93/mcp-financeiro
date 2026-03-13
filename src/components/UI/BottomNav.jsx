import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Início', exact: true },
  { path: '/lancamentos', icon: '📝', label: 'Lançamentos' },
  { path: '/clientes', icon: '👥', label: 'Receitas' },
  { path: '/contas', icon: '📋', label: 'Despesas' },
  { path: '/cartoes', icon: '💳', label: 'Cartões' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navegação principal">
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          className={({ isActive }) =>
            `bottom-nav__item${isActive ? ' active' : ''}`
          }
        >
          <span className="bottom-nav__icon" aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
