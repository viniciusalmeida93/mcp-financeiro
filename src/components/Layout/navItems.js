import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Tag,
  BarChart2,
} from 'lucide-react'

// Fonte unica das rotas do menu: sidebar (desktop), bottom nav (celular) e titulo do header.
export const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/clientes', icon: TrendingUp, label: 'Receitas' },
  { to: '/contas', icon: TrendingDown, label: 'Despesas' },
  { to: '/cartoes', icon: CreditCard, label: 'Cartões' },
  { to: '/lancamentos', icon: ArrowLeftRight, label: 'Lançamentos' },
  { to: '/categorias', icon: Tag, label: 'Categorias' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatórios' },
]
