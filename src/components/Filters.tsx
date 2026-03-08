import React from 'react';
import { Filter, Search, Calendar, Trophy, RotateCcw } from 'lucide-react';
import { SPORTS, RESULTS } from '../lib/utils';

interface FiltersProps {
  filters: {
    esporte: string;
    resultado: string;
    dataInicio: string;
    dataFim: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    esporte: string;
    resultado: string;
    dataInicio: string;
    dataFim: string;
  }>>;
  onReset: () => void;
}

export const Filters: React.FC<FiltersProps> = ({ filters, setFilters, onReset }) => {
  return (
    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-6 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[140px] space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
          <Calendar size={12} /> Início
        </label>
        <input
          type="date"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sm text-white"
          value={filters.dataInicio}
          onChange={e => setFilters({ ...filters, dataInicio: e.target.value })}
        />
      </div>

      <div className="flex-1 min-w-[140px] space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
          <Calendar size={12} /> Fim
        </label>
        <input
          type="date"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sm text-white"
          value={filters.dataFim}
          onChange={e => setFilters({ ...filters, dataFim: e.target.value })}
        />
      </div>

      <div className="flex-1 min-w-[140px] space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
          <Trophy size={12} /> Esporte
        </label>
        <select
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sm text-white"
          value={filters.esporte}
          onChange={e => setFilters({ ...filters, esporte: e.target.value })}
        >
          <option value="">Todos</option>
          {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex-1 min-w-[140px] space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
          Resultado
        </label>
        <select
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sm text-white"
          value={filters.resultado}
          onChange={e => setFilters({ ...filters, resultado: e.target.value })}
        >
          <option value="">Todos</option>
          {RESULTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      <button
        onClick={onReset}
        className="p-2.5 text-zinc-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all flex items-center gap-2 text-sm font-bold"
        title="Limpar Filtros"
      >
        <RotateCcw size={18} />
        <span className="hidden sm:inline">Limpar</span>
      </button>
    </div>
  );
};
