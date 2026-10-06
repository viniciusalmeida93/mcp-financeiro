import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { navItems } from '../Layout/navItems'

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-[rgba(3,16,27,0.82)] backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="grid h-16 grid-flow-col auto-cols-[minmax(4.5rem,1fr)] overflow-x-auto scrollbar-none">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center justify-center gap-1 px-2 text-[0.68rem] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-b-full bg-primary transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="whitespace-nowrap">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
