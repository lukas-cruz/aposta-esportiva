import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const SPORTS = [
  'Futebol',
  'Basquete',
  'Tênis',
  'Vôlei',
  'MMA/Boxe',
  'eSports',
  'Corrida',
  'Outros'
];

export const RESULTS = [
  { value: 'pendente', label: 'Pendente', color: 'bg-zinc-800 text-zinc-400 border border-zinc-700' },
  { value: 'ganhou', label: 'Ganhou', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  { value: 'perdeu', label: 'Perdeu', color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' },
];
