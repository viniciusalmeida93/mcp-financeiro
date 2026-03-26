import FluxoMensal from '../components/Relatorios/FluxoMensal'
import HistoricoCompleto from '../components/Relatorios/HistoricoCompleto'
import GastosPorCategoria from '../components/Relatorios/GastosPorCategoria'
import RelatorioNF from '../components/Relatorios/RelatorioNF'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/UI/tabs'

export default function RelatoriosPage() {
  return (
    <Tabs defaultValue="fluxo">
      <TabsList className="w-full">
        <TabsTrigger value="fluxo" className="flex-1">📈 Fluxo</TabsTrigger>
        <TabsTrigger value="categorias" className="flex-1">🏷️ Categorias</TabsTrigger>
        <TabsTrigger value="historico" className="flex-1">🗓️ Histórico</TabsTrigger>
        <TabsTrigger value="nf" className="flex-1">📋 NFs</TabsTrigger>
      </TabsList>
      <TabsContent value="fluxo"><FluxoMensal /></TabsContent>
      <TabsContent value="categorias"><GastosPorCategoria /></TabsContent>
      <TabsContent value="historico"><HistoricoCompleto /></TabsContent>
      <TabsContent value="nf"><RelatorioNF /></TabsContent>
    </Tabs>
  )
}
