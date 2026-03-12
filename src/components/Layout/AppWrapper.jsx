import BottomNav from '../UI/BottomNav'

export default function AppWrapper({ children }) {
  return (
    <div className="app-wrapper">
      <main className="app-content">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
