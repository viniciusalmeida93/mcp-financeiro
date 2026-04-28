import { supabase } from './supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getProximoVencimento } from '../utils/dateHelpers'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`

/**
 * Send an email via the Supabase Edge Function
 * The Resend API key stays secure on the server side
 */
async function callSendEmail({ to, subject, html, tipo, cliente_id }) {
  const { data: { session } } = await supabase.auth.getSession()
  // For a public app without auth, use the anon key directly
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ to, subject, html, tipo, cliente_id }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Email sending failed')
  return data
}

/**
 * Send a payment reminder to a client
 */
export async function enviarCobranca(cliente) {
  const dataVenc = getProximoVencimento(cliente.dia_vencimento)
  const dataFormatada = format(dataVenc, 'dd/MM/yyyy', { locale: ptBR })

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Lembrete de Pagamento</h2>
      <p>Olá <strong>${cliente.nome}</strong>,</p>
      <p>Segue lembrete de pagamento:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Valor</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">
            R$ ${Number(cliente.valor).toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; color: #666;">Vencimento</td>
          <td style="padding: 8px; font-weight: bold;">${dataFormatada}</td>
        </tr>
      </table>
      <p>Por favor, efetue o pagamento até a data de vencimento.</p>
      <p style="color: #666; font-size: 14px;">Atenciosamente,<br><strong>Vinícius – VA Studio</strong></p>
    </div>
  `

  return callSendEmail({
    to: cliente.email_cobranca,
    subject: `Lembrete de Pagamento – Vencimento dia ${cliente.dia_vencimento}`,
    html,
    tipo: 'cobranca',
    cliente_id: cliente.id,
  })
}

/**
 * Manually trigger NF alert for a specific NF
 */
export async function enviarLembreteNF(nf, clienteNome) {
  const dataVenc = new Date(nf.data_vencimento).toLocaleDateString('pt-BR')
  const viniciusEmail = import.meta.env.VITE_EMAIL_VINICIUS

  if (!viniciusEmail) {
    throw new Error('VITE_EMAIL_VINICIUS not configured')
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e65c00;">Emitir Nota Fiscal</h2>
      <p>Lembrete: É necessário emitir a nota fiscal para:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Cliente</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${clienteNome}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Valor Bruto</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">R$ ${Number(nf.valor_bruto).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Imposto (${nf.aliquota_imposto}%)</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; color: #c00;">
            R$ ${Number(nf.valor_imposto).toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; color: #666;">Valor Líquido</td>
          <td style="padding: 8px; font-weight: bold; color: #2e7d32;">R$ ${Number(nf.valor_liquido).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; color: #666;">Vencimento</td>
          <td style="padding: 8px; font-weight: bold;">${dataVenc}</td>
        </tr>
      </table>
      <p style="color: #666; font-size: 12px;">Sistema VA Studio Financeiro</p>
    </div>
  `

  return callSendEmail({
    to: viniciusEmail,
    subject: `Emitir NF – ${clienteNome} – Vencimento ${dataVenc}`,
    html,
    tipo: 'lembrete_nf',
    cliente_id: nf.cliente_id,
  })
}

/**
 * Get email log
 */
export async function getEmailsEnviados({ clienteId, limit = 20 } = {}) {
  let query = supabase
    .from('emails_enviados')
    .select('*, clientes(nome)')
    .order('enviado_em', { ascending: false })
    .limit(limit)

  if (clienteId) query = query.eq('cliente_id', clienteId)

  const { data, error } = await query
  if (error) throw error
  return data
}
