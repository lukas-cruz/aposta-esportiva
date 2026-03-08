-- RPC: get_bet_stats
-- Description: Calculates overall statistics for the dashboard

CREATE OR REPLACE FUNCTION get_bet_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalApostas', COUNT(*),
    'lucroTotal', COALESCE(SUM(CASE WHEN resultado = 'ganhou' THEN lucro_prejuizo ELSE 0 END), 0),
    'perdaTotal', COALESCE(SUM(CASE WHEN resultado = 'perdeu' THEN ABS(lucro_prejuizo) ELSE 0 END), 0),
    'saldoGeral', COALESCE(SUM(lucro_prejuizo), 0),
    'totalApostado', COALESCE(SUM(valor_apostado), 0)
  ) INTO result
  FROM apostas;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RPC: get_daily_bet_stats
-- Description: Aggregates stats by day for charts

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
