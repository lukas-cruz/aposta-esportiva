import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Hash, Activity } from 'lucide-react';
import { Stats } from '../types';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

interface DashboardProps {
  stats: Stats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Saldo Geral',
      value: formatCurrency(stats.saldoGeral),
      icon: Wallet,
      color: stats.saldoGeral >= 0 ? 'text-emerald-400' : 'text-rose-400',
      bg: 'bg-zinc-800',
    },
    {
      label: 'Lucro Total',
      value: formatCurrency(stats.lucroTotal),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-zinc-800',
    },
    {
      label: 'Perda Total',
      value: formatCurrency(stats.perdaTotal),
      icon: TrendingDown,
      color: 'text-rose-400',
      bg: 'bg-zinc-800',
    },
    {
      label: 'Total Apostado',
      value: formatCurrency(stats.totalApostado),
      icon: Activity,
      color: 'text-yellow-400',
      bg: 'bg-zinc-800',
    },
    {
      label: 'Total de Apostas',
      value: stats.totalApostas,
      icon: Hash,
      color: 'text-yellow-400',
      bg: 'bg-zinc-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{card.label}</span>
            <div className={`p-2 rounded-xl ${card.bg}`}>
              <card.icon size={20} className={card.color} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${card.color}`}>
            {card.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
