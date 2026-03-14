import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'  // shadcn + Tailwind — deve vir primeiro
import './styles/main.css'     // legado — removido ao final da Camada 4
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
