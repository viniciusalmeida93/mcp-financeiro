import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  CreditCard,
  BarChart2,
  Tag,
  ArrowLeftRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/clientes', icon: TrendingUp, label: 'Receitas' },
  { to: '/contas', icon: TrendingDown, label: 'Despesas' },
  { to: '/cartoes', icon: CreditCard, label: 'Cartões' },
  { to: '/lancamentos', icon: ArrowLeftRight, label: 'Lançamentos' },
  { to: '/categorias', icon: Tag, label: 'Categorias' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatórios' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-card border-t border-border z-50">
      <div className="flex h-full overflow-x-scroll scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors shrink-0 px-4',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="whitespace-nowrap">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
