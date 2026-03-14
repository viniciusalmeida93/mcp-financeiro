import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  BarChart2,
  CreditCard,
  Users,
  Wallet,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/lancamentos', icon: ArrowLeftRight, label: 'Lançamentos' },
  { to: '/categorias', icon: Tag, label: 'Categorias' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatórios' },
  { to: '/cartoes', icon: CreditCard, label: 'Cartões' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/contas', icon: Wallet, label: 'Contas' },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 h-screen bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center h-14 px-6">
        <span className="font-bold text-lg text-sidebar-primary">VA Studio</span>
        <span className="ml-1 text-sm text-muted-foreground font-medium">Financeiro</span>
      </div>
      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <Separator />
      {/* Context Toggle placeholder — will be added in Task 19 when ContextToggle is rebuilt */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground text-center">Tema: Empresa / Pessoal</p>
      </div>
    </aside>
  )
}
