import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Find NFs due in 5 days that haven't been alerted yet
  const alertDate = new Date()
  alertDate.setDate(alertDate.getDate() + 5)
  const alertDateStr = alertDate.toISOString().split('T')[0]

  const { data: nfs, error } = await supabase
    .from('notas_fiscais')
    .select('*, clientes(nome, email_cobranca)')
    .eq('status', 'pendente')
    .eq('alerta_enviado', false)
    .lte('data_vencimento', alertDateStr)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const alertsSent = []
  const viniciusEmail = Deno.env.get('EMAIL_VINICIUS') || 'vinicius@vastudio.com.br'
  const supabaseServiceUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

  for (const nf of nfs ?? []) {
    const clienteNome = nf.clientes?.nome ?? 'Cliente'
    const dataVenc = new Date(nf.data_vencimento).toLocaleDateString('pt-BR')

    const html = `
      <h2>⚠️ Lembrete: Emitir Nota Fiscal</h2>
      <p>É necessário emitir a nota fiscal para:</p>
      <ul>
        <li><strong>Cliente:</strong> ${clienteNome}</li>
        <li><strong>Valor Bruto:</strong> R$ ${Number(nf.valor_bruto).toFixed(2)}</li>
        <li><strong>Imposto (${nf.aliquota_imposto}%):</strong> R$ ${Number(nf.valor_imposto).toFixed(2)}</li>
        <li><strong>Valor Líquido:</strong> R$ ${Number(nf.valor_liquido).toFixed(2)}</li>
        <li><strong>Vencimento:</strong> ${dataVenc}</li>
      </ul>
      <p><em>Sistema VA Studio Financeiro</em></p>
    `

    // Call send-email function
    const sendRes = await fetch(`${supabaseServiceUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: viniciusEmail,
        subject: `⚠️ Emitir NF - ${clienteNome} - Vence em 5 dias`,
        html,
        tipo: 'lembrete_nf',
        cliente_id: nf.cliente_id,
      }),
    })

    if (sendRes.ok) {
      await supabase
        .from('notas_fiscais')
        .update({ alerta_enviado: true, data_alerta: new Date().toISOString() })
        .eq('id', nf.id)
      alertsSent.push(nf.id)
    }
  }

  return new Response(
    JSON.stringify({ processed: nfs?.length ?? 0, alertsSent }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
