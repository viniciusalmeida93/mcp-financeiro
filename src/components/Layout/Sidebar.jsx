import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Início', exact: true },
  { path: '/lancamentos', icon: '📝', label: 'Lançamentos' },
  { path: '/clientes', icon: '👥', label: 'Receitas' },
  { path: '/contas', icon: '📋', label: 'Despesas' },
  { path: '/cartoes', icon: '💳', label: 'Cartões' },
  { path: '/categorias', icon: '🏷️', label: 'Categorias' },
  { path: '/relatorios', icon: '📊', label: 'Relatórios' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">💰</span>
        <span className="sidebar__title">VA Studio</span>
      </div>
      <nav className="sidebar__nav" aria-label="Navegação principal">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `sidebar__item${isActive ? ' active' : ''}`
            }
          >
            <span className="sidebar__icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
