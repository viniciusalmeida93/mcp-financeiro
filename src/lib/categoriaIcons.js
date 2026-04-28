import {
  User, Target, RefreshCw, Users, BookOpen, Monitor, Package, Briefcase,
  Utensils, ShoppingCart, Fuel, Car, HeartPulse, Gamepad2, Home, Users2,
  CreditCard, MoreHorizontal,
} from 'lucide-react'

export const CATEGORIA_ICONS = {
  cliente: User,
  projetos: Target,
  assinaturas: RefreshCw,
  time: Users,
  educacao: BookOpen,
  infraestrutura: Monitor,
  outros_empresa: Package,
  receita_servico: Briefcase,
  alimentacao: Utensils,
  supermercado: ShoppingCart,
  combustivel: Fuel,
  transporte: Car,
  saude: HeartPulse,
  lazer: Gamepad2,
  moradia: Home,
  familia: Users2,
  divida: CreditCard,
  outros: MoreHorizontal,
}

export const getCategoriaIcon = (categoria) => CATEGORIA_ICONS[categoria] || MoreHorizontal
