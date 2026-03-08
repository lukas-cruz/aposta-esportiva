import React from 'react';
import { Aposta } from '../types';
import { formatCurrency, RESULTS, cn } from '../lib/utils';
import { Edit2, Trash2, Calendar, Trophy, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BetTableProps {
  apostas: Aposta[];
  onEdit: (aposta: Aposta) => void;
  onDelete: (id: number) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

export const BetTable: React.FC<BetTableProps> = ({ apostas, onEdit, onDelete, pagination }) => {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800/50 border-b border-zinc-800">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Data</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Evento / Jogo</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest hidden md:table-cell">Esporte / Liga</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Odd</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest hidden sm:table-cell">Valor</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Resultado</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">P&L</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {apostas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                  Nenhuma aposta encontrada.
                </td>
              </tr>
            ) : (
              apostas.map((aposta) => {
                const resultConfig = RESULTS.find(r => r.value === aposta.resultado);
                return (
                  <tr key={aposta.id} className="hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-500" />
                        <span className="text-sm text-zinc-400">
                          {format(parseISO(aposta.data), 'dd MMM', { locale: ptBR })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{aposta.jogo}</span>
                        <span className="text-xs text-zinc-500">{aposta.tipo_aposta}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm text-zinc-300">{aposta.esporte}</span>
                        <span className="text-xs text-zinc-500">{aposta.liga}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-bold text-yellow-400">
                        {aposta.odd.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-zinc-300">
                        {formatCurrency(aposta.valor_apostado)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        resultConfig?.color || "bg-zinc-800 text-zinc-400"
                      )}>
                        {resultConfig?.label || aposta.resultado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-sm font-bold",
                        aposta.lucro_prejuizo > 0 ? "text-emerald-400" : aposta.lucro_prejuizo < 0 ? "text-rose-400" : "text-zinc-500"
                      )}>
                        {aposta.lucro_prejuizo > 0 ? '+' : ''}{formatCurrency(aposta.lucro_prejuizo)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(aposta)}
                          className="p-2 text-zinc-500 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir esta aposta?')) {
                              onDelete(aposta.id);
                            }
                          }}
                          className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 bg-zinc-800/30 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-zinc-500 order-2 sm:order-1">
            Mostrando <span className="font-bold text-white">{apostas.length}</span> de <span className="font-bold text-white">{pagination.totalItems}</span> apostas
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-2 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                // Simple pagination logic to show current page and surrounding pages
                let pageNum = pagination.currentPage;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else {
                  if (pagination.currentPage <= 3) pageNum = i + 1;
                  else if (pagination.currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                  else pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={cn(
                      "w-8 h-8 text-sm font-bold rounded-lg transition-all",
                      pagination.currentPage === pageNum
                        ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                        : "text-zinc-500 hover:text-yellow-400 hover:bg-zinc-800"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
