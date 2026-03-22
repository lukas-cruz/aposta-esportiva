import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Hash, Activity, PiggyBank, Edit2, Check, X } from 'lucide-react';
import { Stats } from '../types';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

interface DashboardProps {
  stats: Stats;
  onUpdateInvestment: (valor: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, onUpdateInvestment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempInvestment, setTempInvestment] = useState((stats?.investimentoInicial ?? 0).toString());

  // Sync tempInvestment when stats change and we are not editing
  React.useEffect(() => {
    if (!isEditing) {
      setTempInvestment((stats?.investimentoInicial ?? 0).toString());
    }
  }, [stats?.investimentoInicial, isEditing]);

  const handleSave = () => {
    const sanitizedValue = tempInvestment.replace(',', '.');
    const valor = parseFloat(sanitizedValue);
    if (!isNaN(valor)) {
      onUpdateInvestment(valor);
      setIsEditing(false);
    }
  };

  const cards = [
    {
      label: 'Banca Atual',
      value: formatCurrency(stats?.bancaAtual ?? 0),
      icon: PiggyBank,
      color: (stats?.bancaAtual ?? 0) >= (stats?.investimentoInicial ?? 0) ? 'text-emerald-400' : 'text-rose-400',
      bg: 'bg-zinc-800',
    },
    {
      label: 'Saldo Geral',
      value: formatCurrency(stats?.saldoGeral ?? 0),
      icon: Wallet,
      color: (stats?.saldoGeral ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400',
      bg: 'bg-zinc-800',
    },
    {
      label: 'Lucro Total',
      value: formatCurrency(stats?.lucroTotal ?? 0),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-zinc-800',
    },
    {
      label: 'Perda Total',
      value: formatCurrency(stats?.perdaTotal ?? 0),
      icon: TrendingDown,
      color: 'text-rose-400',
      bg: 'bg-zinc-800',
    },
    {
      label: 'Total Apostado',
      value: formatCurrency(stats?.totalApostado ?? 0),
      icon: Activity,
      color: 'text-yellow-400',
      bg: 'bg-zinc-800',
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-800 rounded-2xl text-yellow-400">
            <PiggyBank size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Investimento Inicial</p>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.01"
                  className="bg-zinc-800 border border-zinc-700 text-white px-3 py-1 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 w-32"
                  value={tempInvestment}
                  onChange={(e) => setTempInvestment(e.target.value)}
                  autoFocus
                />
                <button 
                  onClick={handleSave}
                  className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
                >
                  <Check size={16} />
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setTempInvestment((stats?.investimentoInicial ?? 0).toString());
                  }}
                  className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-white">{formatCurrency(stats?.investimentoInicial ?? 0)}</span>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-zinc-500 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-8 pr-4">
          <div className="text-center sm:text-right">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Retorno sobre Investimento</p>
            <p className={`text-xl font-bold mt-1 ${(stats?.saldoGeral ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(stats?.investimentoInicial ?? 0) > 0 
                ? `${(((stats?.saldoGeral ?? 0) / (stats?.investimentoInicial ?? 1)) * 100).toFixed(2)}%`
                : '0.00%'}
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total de Apostas</p>
            <p className="text-xl font-bold text-white mt-1">{stats?.totalApostas ?? 0}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
