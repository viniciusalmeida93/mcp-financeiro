import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { navItems } from './navItems'

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const email = user?.email || ''

  return (
    <aside className="ds-vidro hidden md:flex flex-col w-64 h-dvh border-r shrink-0">
      {/* Logo */}
      <div className="flex items-center h-16 px-6">
        <img src="/logo.png" alt="VA Studio" className="h-8 w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="px-3 pb-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[var(--ds-faint)]">
          Financeiro
        </div>
        <div className="space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Conta + sair */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold uppercase text-primary">
            {email.slice(0, 1) || 'V'}
          </div>
          <div className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={email}>
            {email}
          </div>
          <button
            onClick={signOut}
            title="Sair"
            aria-label="Sair"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
