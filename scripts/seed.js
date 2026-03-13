/**
 * VA Studio Financeiro — Database Seed Script
 *
 * Populates the Supabase database with initial clients, fixed expenses,
 * and sample March 2026 transactions.
 *
 * HOW TO RUN:
 *   1. Export your Supabase credentials as environment variables:
 *
 *        export SUPABASE_URL="https://your-project-id.supabase.co"
 *        export SUPABASE_ANON_KEY="your-anon-key-here"
 *
 *      On Windows (PowerShell):
 *        $env:SUPABASE_URL="https://your-project-id.supabase.co"
 *        $env:SUPABASE_ANON_KEY="your-anon-key-here"
 *
 *   2. Run:
 *        node src/seed.js
 *
 * NOTE: This script uses Node.js process.env (not import.meta.env),
 * since it runs outside of Vite. It is safe to run multiple times —
 * it checks for existing data before inserting (idempotent).
 */

import { createClient } from '@supabase/supabase-js'

// ----------------------------------------------------------------
// Supabase client — reads from Node.js env vars (no VITE_ prefix)
// ----------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set.')
  console.error('See instructions at the top of this file.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ----------------------------------------------------------------
// Seed data
// ----------------------------------------------------------------

const clientes = [
  { nome: 'Labor', valor: 1000, dia_vencimento: 10, precisa_nf: true, email_cobranca: 'financeiro@labor.com.br', tipo: 'mensal', status: 'ativo' },
  { nome: 'Kelly Comin', valor: 1500, dia_vencimento: 20, precisa_nf: false, tipo: 'mensal', status: 'ativo' },
  { nome: '67 Concursos', valor: 1700, dia_vencimento: 17, precisa_nf: true, email_cobranca: 'adm@67concursos.com.br', tipo: 'mensal', status: 'ativo' },
  { nome: 'Gustavo Pratas', valor: 600, dia_vencimento: 5, precisa_nf: false, tipo: 'mensal', status: 'ativo' },
  { nome: 'BSB Express', valor: 300, dia_vencimento: 5, precisa_nf: false, tipo: 'mensal', status: 'ativo' },
  { nome: 'Lukas Fernandes', valor: 600, dia_vencimento: 5, precisa_nf: false, tipo: 'mensal', status: 'ativo' },
  { nome: 'Renatho', valor: 300, dia_vencimento: 10, precisa_nf: false, tipo: 'mensal', status: 'ativo' },
  { nome: 'Ramires', valor: 250, dia_vencimento: 10, precisa_nf: false, tipo: 'mensal', status: 'ativo' },
  { nome: 'Alba Alimentos', valor: 120, dia_vencimento: 10, precisa_nf: true, email_cobranca: 'alba@alimentos.com.br', tipo: 'mensal', status: 'ativo' },
  { nome: 'Bertoli Engenharia', valor: 150, dia_vencimento: 15, precisa_nf: false, tipo: 'mensal', status: 'ativo' },
  { nome: 'Jalapao Trips', valor: 200, dia_vencimento: 20, precisa_nf: false, tipo: 'mensal', status: 'ativo' },
  { nome: 'Dizim', valor: 60, dia_vencimento: 25, precisa_nf: false, tipo: 'mensal', status: 'ativo' },
]

const despesasEmpresa = [
  { nome: 'Adriane (Gestora)', valor: 200, dia_vencimento: 15, forma_pagamento: 'pix', categoria: 'time', recorrencia: 'mensal', contexto: 'empresa', status: 'ativo' },
  { nome: 'Energia Eletrica', valor: 282.99, dia_vencimento: 26, forma_pagamento: 'pix', categoria: 'infraestrutura', recorrencia: 'mensal', contexto: 'empresa', status: 'ativo' },
  { nome: 'Google YouTube Premium', valor: 53.90, dia_vencimento: 13, forma_pagamento: 'master', categoria: 'assinaturas', recorrencia: 'mensal', contexto: 'empresa', status: 'ativo' },
  { nome: 'Google Canva AI', valor: 34.90, dia_vencimento: 13, forma_pagamento: 'master', categoria: 'assinaturas', recorrencia: 'mensal', contexto: 'empresa', status: 'ativo' },
  { nome: 'Adobe Creative Cloud', valor: 80.00, dia_vencimento: 13, forma_pagamento: 'master', categoria: 'assinaturas', recorrencia: 'mensal', contexto: 'empresa', status: 'ativo' },
  { nome: 'Claude AI', valor: 117.33, dia_vencimento: 28, forma_pagamento: 'passai', categoria: 'assinaturas', recorrencia: 'mensal', contexto: 'empresa', status: 'ativo' },
  { nome: 'Stape', valor: 111.00, dia_vencimento: 28, forma_pagamento: 'passai', categoria: 'assinaturas', recorrencia: 'mensal', contexto: 'empresa', status: 'ativo' },
  { nome: 'Freepik Premium', valor: 193.07, dia_vencimento: 28, forma_pagamento: 'passai', categoria: 'assinaturas', recorrencia: 'mensal', contexto: 'empresa', status: 'ativo' },
]

const despesasPessoal = [
  { nome: 'Pedim', valor: 80, dia_vencimento: 7, forma_pagamento: 'pix', categoria: 'alimentacao', recorrencia: 'mensal', contexto: 'pessoal', status: 'ativo' },
  { nome: 'Planilha Hercules', valor: 26.70, dia_vencimento: 10, forma_pagamento: 'pix', categoria: 'outros', recorrencia: 'mensal', contexto: 'pessoal', status: 'ativo' },
  { nome: 'Seguro Carro', valor: 105, dia_vencimento: 10, forma_pagamento: 'boleto', categoria: 'transporte', recorrencia: 'mensal', contexto: 'pessoal', status: 'ativo' },
  { nome: 'Cartao BB Mae', valor: 215, dia_vencimento: 15, forma_pagamento: 'pix', categoria: 'familia', recorrencia: 'mensal', contexto: 'pessoal', status: 'ativo' },
  { nome: 'Nathan', valor: 30, dia_vencimento: 24, forma_pagamento: 'pix', categoria: 'outros', recorrencia: 'mensal', contexto: 'pessoal', status: 'ativo' },
  { nome: 'Pedim fixo', valor: 60, dia_vencimento: 28, forma_pagamento: 'pix', categoria: 'alimentacao', recorrencia: 'mensal', contexto: 'pessoal', status: 'ativo' },
  { nome: 'TV a Cabo', valor: 24.99, dia_vencimento: 28, forma_pagamento: 'pix', categoria: 'lazer', recorrencia: 'mensal', contexto: 'pessoal', status: 'ativo' },
  { nome: 'Pedim Parcela', valor: 400, dia_vencimento: 28, forma_pagamento: 'pix', categoria: 'divida', recorrencia: 'parcela', parcela_atual: 2, parcela_total: 3, contexto: 'pessoal', status: 'ativo' },
  { nome: 'Moveis', valor: 450, dia_vencimento: 28, forma_pagamento: 'pix', categoria: 'moradia', recorrencia: 'mensal', contexto: 'pessoal', status: 'ativo' },
]

// March 2026 sample transactions
const lancamentos = [
  // Receitas empresa
  { tipo: 'entrada', valor: 600, descricao: 'Lukas Fernandes', data: '2026-03-05', contexto: 'empresa', forma_pagamento: 'pix', categoria: 'cliente' },
  { tipo: 'entrada', valor: 250, descricao: 'Ramires', data: '2026-03-05', contexto: 'empresa', forma_pagamento: 'pix', categoria: 'cliente' },
  { tipo: 'entrada', valor: 1700, descricao: '67 Concursos', data: '2026-03-05', contexto: 'empresa', forma_pagamento: 'pix', categoria: 'cliente' },
  { tipo: 'entrada', valor: 150, descricao: 'Luiz Velt (pontual)', data: '2026-03-05', contexto: 'empresa', forma_pagamento: 'pix', categoria: 'projetos' },
  { tipo: 'entrada', valor: 300, descricao: 'BSB Express', data: '2026-03-05', contexto: 'empresa', forma_pagamento: 'pix', categoria: 'cliente' },
  // Despesas pessoal
  { tipo: 'saida', valor: 255.63, descricao: 'Assai - Compras', data: '2026-03-03', contexto: 'pessoal', forma_pagamento: 'passai', categoria: 'supermercado' },
  { tipo: 'saida', valor: 219, descricao: 'Sushi (aniversario)', data: '2026-03-02', contexto: 'pessoal', forma_pagamento: 'passai', categoria: 'alimentacao' },
  { tipo: 'saida', valor: 53.50, descricao: 'Latinha', data: '2026-03-03', contexto: 'pessoal', forma_pagamento: 'passai', categoria: 'outros' },
  { tipo: 'saida', valor: 49.48, descricao: 'Lanche', data: '2026-03-05', contexto: 'pessoal', forma_pagamento: 'pix', categoria: 'alimentacao' },
]

// ----------------------------------------------------------------
// Helper: generic idempotent insert
// Checks if any rows exist in the table; skips if already seeded.
// ----------------------------------------------------------------
async function seedTable(tableName, rows, label) {
  console.log(`\n[${label}] Checking for existing data...`)

  const { count, error: countError } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error(`  ERROR counting rows in ${tableName}:`, countError.message)
    return false
  }

  if (count > 0) {
    console.log(`  SKIPPED — ${count} row(s) already exist in ${tableName}.`)
    return true
  }

  console.log(`  Inserting ${rows.length} row(s) into ${tableName}...`)
  const { error: insertError } = await supabase.from(tableName).insert(rows)

  if (insertError) {
    console.error(`  ERROR inserting into ${tableName}:`, insertError.message)
    return false
  }

  console.log(`  OK — ${rows.length} row(s) inserted.`)
  return true
}

// ----------------------------------------------------------------
// Main
// ----------------------------------------------------------------
async function main() {
  console.log('=================================================')
  console.log(' VA Studio Financeiro — Seed Script')
  console.log('=================================================')
  console.log(`Supabase URL: ${SUPABASE_URL}`)

  let allOk = true

  // 1. Clientes — must be seeded before lancamentos (FK dependency)
  const ok1 = await seedTable('clientes', clientes, 'CLIENTES')
  allOk = allOk && ok1

  // 2. Despesas fixas — empresa + pessoal (no FK dependencies)
  const ok2 = await seedTable(
    'despesas_fixas',
    [...despesasEmpresa, ...despesasPessoal],
    'DESPESAS FIXAS'
  )
  allOk = allOk && ok2

  // 3. Lançamentos — no cliente_id linked here (descriptions only),
  //    but table has FK to clientes so clientes must exist first.
  const ok3 = await seedTable('lancamentos', lancamentos, 'LANCAMENTOS')
  allOk = allOk && ok3

  console.log('\n=================================================')
  if (allOk) {
    console.log(' Seed completed successfully.')
  } else {
    console.log(' Seed completed WITH ERRORS — check output above.')
    process.exit(1)
  }
  console.log('=================================================\n')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
