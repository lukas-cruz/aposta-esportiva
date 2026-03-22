-- ==========================================
-- MASTER MIGRATION: BetManager Database
-- ==========================================

-- 1. SCHEMA
CREATE TABLE IF NOT EXISTS apostas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    data DATE NOT NULL,
    esporte TEXT NOT NULL,
    liga TEXT NOT NULL,
    jogo TEXT NOT NULL,
    tipo_aposta TEXT NOT NULL,
    odd REAL NOT NULL,
    valor_apostado REAL NOT NULL,
    resultado TEXT NOT NULL,
    lucro_prejuizo REAL NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configuracoes (
    id INT PRIMARY KEY DEFAULT 1,
    investimento_inicial REAL DEFAULT 0,
    CHECK (id = 1)
);

-- Ensure we have a default config row
INSERT INTO configuracoes (id, investimento_inicial) 
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_apostas_data ON apostas(data);
CREATE INDEX IF NOT EXISTS idx_apostas_esporte ON apostas(esporte);
CREATE INDEX IF NOT EXISTS idx_apostas_resultado ON apostas(resultado);

-- Disable RLS for simplicity (or add permissive policies)
ALTER TABLE apostas DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;

-- 2. FUNCTIONS (RPC)
CREATE OR REPLACE FUNCTION get_bet_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  v_investimento_inicial REAL;
BEGIN
  SELECT investimento_inicial INTO v_investimento_inicial FROM configuracoes WHERE id = 1;
  IF v_investimento_inicial IS NULL THEN
    v_investimento_inicial := 0;
  END IF;

  SELECT json_build_object(
    'totalApostas', COUNT(*),
    'lucroTotal', COALESCE(SUM(CASE WHEN resultado = 'ganhou' THEN lucro_prejuizo ELSE 0 END), 0),
    'perdaTotal', COALESCE(SUM(CASE WHEN resultado = 'perdeu' THEN ABS(lucro_prejuizo) ELSE 0 END), 0),
    'saldoGeral', COALESCE(SUM(lucro_prejuizo), 0),
    'totalApostado', COALESCE(SUM(valor_apostado), 0),
    'investimentoInicial', v_investimento_inicial,
    'bancaAtual', v_investimento_inicial + COALESCE(SUM(lucro_prejuizo), 0)
  ) INTO result
  FROM apostas;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_daily_bet_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT 
      data,
      SUM(lucro_prejuizo) as "lucroDiario",
      COUNT(*) as "qtdApostas",
      SUM(valor_apostado) as "totalApostado"
    FROM apostas
    GROUP BY data
    ORDER BY data ASC
  ) t;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. SEED DATA (Optional example data)
-- INSERT INTO apostas (data, esporte, liga, jogo, tipo_aposta, odd, valor_apostado, resultado, lucro_prejuizo)
-- VALUES ('2024-03-01', 'Futebol', 'Champions', 'Real vs City', 'Vencedor 1', 2.1, 100, 'ganhou', 110);
