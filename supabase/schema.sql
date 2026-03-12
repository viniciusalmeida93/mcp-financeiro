-- ================================================================
-- VA Studio Financeiro — Database Schema
-- PostgreSQL / Supabase
--
-- How to apply:
--   1. Open your Supabase project > SQL Editor
--   2. Paste this entire file and click Run
--   OR use the Supabase CLI:
--      supabase db push
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- CLIENTES
-- ================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT,
  valor DECIMAL(10,2) NOT NULL,
  dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
  tipo TEXT NOT NULL CHECK (tipo IN ('mensal', 'pontual')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  servico TEXT,
  precisa_nf BOOLEAN DEFAULT false,
  aliquota_imposto DECIMAL(5,2) DEFAULT 5.00,
  email_cobranca TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- GRUPOS DE PARCELAS
-- ================================
CREATE TABLE IF NOT EXISTS grupos_parcelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  descricao TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  valor_parcela DECIMAL(10,2) NOT NULL,
  total_parcelas INTEGER NOT NULL,
  parcelas_pagas INTEGER DEFAULT 0,
  forma_pagamento TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  contexto TEXT NOT NULL CHECK (contexto IN ('empresa', 'pessoal')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- LANCAMENTOS
-- ================================
CREATE TABLE IF NOT EXISTS lancamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  forma_pagamento TEXT NOT NULL,
  data DATE NOT NULL,
  contexto TEXT NOT NULL CHECK (contexto IN ('empresa', 'pessoal')),
  tags TEXT[],
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  parcelado BOOLEAN DEFAULT false,
  parcela_atual INTEGER,
  parcela_total INTEGER,
  valor_parcela DECIMAL(10,2),
  grupo_parcela_id UUID REFERENCES grupos_parcelas(id) ON DELETE SET NULL,
  CONSTRAINT chk_parcela_lancamentos CHECK (
    (parcelado = false AND parcela_atual IS NULL AND parcela_total IS NULL)
    OR
    (parcelado = true AND parcela_atual > 0 AND parcela_total > 0 AND parcela_atual <= parcela_total)
  ),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- DESPESAS FIXAS
-- ================================
CREATE TABLE IF NOT EXISTS despesas_fixas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
  recorrencia TEXT NOT NULL CHECK (recorrencia IN ('mensal', 'parcela')),
  parcela_atual INTEGER,
  parcela_total INTEGER,
  CONSTRAINT chk_parcela_despesas CHECK (
    (recorrencia = 'mensal' AND parcela_atual IS NULL AND parcela_total IS NULL)
    OR
    (recorrencia = 'parcela' AND parcela_atual > 0 AND parcela_total > 0 AND parcela_atual <= parcela_total)
  ),
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  forma_pagamento TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  contexto TEXT NOT NULL CHECK (contexto IN ('empresa', 'pessoal')),
  data_termino DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- NOTAS FISCAIS
-- ================================
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  mes_referencia TEXT NOT NULL,
  valor_bruto DECIMAL(10,2) NOT NULL,
  aliquota_imposto DECIMAL(5,2) NOT NULL,
  valor_imposto DECIMAL(10,2) NOT NULL,
  valor_liquido DECIMAL(10,2) NOT NULL,
  numero_nf TEXT,
  data_emissao DATE,
  data_vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'emitida', 'pago')),
  alerta_enviado BOOLEAN DEFAULT false,
  data_alerta TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- EMAILS ENVIADOS
-- ================================
CREATE TABLE IF NOT EXISTS emails_enviados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('cobranca', 'lembrete_nf', 'recibo')),
  destinatario TEXT NOT NULL,
  assunto TEXT NOT NULL,
  corpo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enviado' CHECK (status IN ('enviado', 'aberto', 'erro')),
  resend_id TEXT,
  enviado_em TIMESTAMP DEFAULT NOW(),
  aberto_em TIMESTAMP
);

-- ================================
-- HISTORICO MENSAL
-- ================================
CREATE TABLE IF NOT EXISTS historico_mensal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mes TEXT NOT NULL UNIQUE CHECK (mes ~ '^\d{4}-\d{2}$'), -- Format: YYYY-MM
  receitas_clientes DECIMAL(10,2) DEFAULT 0,
  receitas_projetos DECIMAL(10,2) DEFAULT 0,
  receitas_total DECIMAL(10,2) DEFAULT 0,
  despesas_fixas_empresa DECIMAL(10,2) DEFAULT 0,
  despesas_fixas_pessoal DECIMAL(10,2) DEFAULT 0,
  despesas_variaveis_empresa DECIMAL(10,2) DEFAULT 0,
  despesas_variaveis_pessoal DECIMAL(10,2) DEFAULT 0,
  despesas_total DECIMAL(10,2) DEFAULT 0,
  saldo_final DECIMAL(10,2) DEFAULT 0,
  margem_lucro DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- INDICES
-- ================================
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data);
CREATE INDEX IF NOT EXISTS idx_lancamentos_contexto ON lancamentos(contexto);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cliente ON lancamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_grupo_parcela ON lancamentos(grupo_parcela_id);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_cliente ON notas_fiscais(cliente_id);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_mes ON notas_fiscais(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_emails_cliente ON emails_enviados(cliente_id);
CREATE INDEX IF NOT EXISTS idx_historico_mes ON historico_mensal(mes);
CREATE INDEX IF NOT EXISTS idx_despesas_fixas_contexto ON despesas_fixas(contexto);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);

-- ================================
-- DISABLE RLS (private app, no auth)
-- ================================
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE grupos_parcelas DISABLE ROW LEVEL SECURITY;
ALTER TABLE despesas_fixas DISABLE ROW LEVEL SECURITY;
ALTER TABLE notas_fiscais DISABLE ROW LEVEL SECURITY;
ALTER TABLE emails_enviados DISABLE ROW LEVEL SECURITY;
ALTER TABLE historico_mensal DISABLE ROW LEVEL SECURITY;
