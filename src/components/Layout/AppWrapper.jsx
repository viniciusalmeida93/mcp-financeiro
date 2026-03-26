import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from '../UI/BottomNav'
import { ContextoProvider } from '@/contexts/ContextoContext'

export default function AppWrapper({ children }) {
  return (
    <ContextoProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar — desktop only */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0 p-4">
            {children}
          </main>
        </div>

        {/* Bottom Nav — mobile only */}
        <BottomNav />
      </div>
    </ContextoProvider>
  )
}
