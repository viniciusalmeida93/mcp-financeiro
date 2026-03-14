import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  BarChart2,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/lancamentos', icon: ArrowLeftRight, label: 'Lançamentos' },
  { to: '/categorias', icon: Tag, label: 'Categorias' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatórios' },
  { to: '/cartoes', icon: CreditCard, label: 'Cartões' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-card border-t border-border z-50">
      {/* overflow-hidden prevents horizontal scroll bug */}
      <div className="flex h-full overflow-hidden">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="truncate w-full text-center px-1">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
