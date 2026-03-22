export interface Aposta {
  id: number;
  data: string;
  esporte: string;
  liga: string;
  jogo: string;
  tipo_aposta: string;
  odd: number;
  valor_apostado: number;
  resultado: 'ganhou' | 'perdeu' | 'cancelada' | 'pendente';
  lucro_prejuizo: number;
  observacoes?: string;
}

export interface Stats {
  totalApostas: number;
  lucroTotal: number;
  perdaTotal: number;
  saldoGeral: number;
  totalApostado: number;
  investimentoInicial: number;
  bancaAtual: number;
}

export interface DailyStat {
  data: string;
  lucroDiario: number;
  qtdApostas: number;
  totalApostado: number;
}
