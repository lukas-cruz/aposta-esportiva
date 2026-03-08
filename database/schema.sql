-- Table: apostas
-- Description: Stores all betting records

CREATE TABLE IF NOT EXISTS apostas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    data DATE NOT NULL,
    esporte TEXT NOT NULL,
    liga TEXT NOT NULL,
    jogo TEXT NOT NULL,
    tipo_aposta TEXT NOT NULL,
    odd REAL NOT NULL,
    valor_apostado REAL NOT NULL,
    resultado TEXT NOT NULL, -- 'ganhou', 'perdeu', 'cancelada'
    lucro_prejuizo REAL NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_apostas_data ON apostas(data);
CREATE INDEX IF NOT EXISTS idx_apostas_esporte ON apostas(esporte);
CREATE INDEX IF NOT EXISTS idx_apostas_resultado ON apostas(resultado);
