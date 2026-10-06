import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from '../UI/BottomNav'
import { ContextoProvider } from '@/contexts/ContextoContext'

export default function AppWrapper({ children }) {
  return (
    <ContextoProvider>
      <div className="flex h-dvh overflow-hidden">
        {/* Sidebar — desktop only */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:px-8 md:pt-6 md:pb-10">
            <div className="mx-auto w-full max-w-6xl">
              {children}
            </div>
          </main>
        </div>

        {/* Bottom Nav — mobile only */}
        <BottomNav />
      </div>
    </ContextoProvider>
  )
}
