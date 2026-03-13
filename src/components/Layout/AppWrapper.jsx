import BottomNav from '../UI/BottomNav'
import Sidebar from './Sidebar'

export default function AppWrapper({ children }) {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="app-content">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
