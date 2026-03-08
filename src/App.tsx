import React, { useState, useEffect, useCallback } from 'react';
import { Plus, LayoutDashboard, History, PieChart as ChartIcon, LogOut, Menu, X } from 'lucide-react';
import { Aposta, Stats, DailyStat } from './types';
import { Dashboard } from './components/Dashboard';
import { BetTable } from './components/BetTable';
import { BetForm } from './components/BetForm';
import { Charts } from './components/Charts';
import { Filters } from './components/Filters';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from './lib/utils';
import { format } from 'date-fns';

export default function App() {
  const [apostas, setApostas] = useState<Aposta[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalApostas: 0,
    lucroTotal: 0,
    perdaTotal: 0,
    saldoGeral: 0,
    totalApostado: 0
  });
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBet, setEditingBet] = useState<Aposta | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'charts'>('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    esporte: '',
    resultado: '',
    dataInicio: '',
    dataFim: ''
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...filters,
        page: currentPage.toString(),
        limit: '10'
      });
      const queryParams = params.toString();
      const [apostasRes, statsRes] = await Promise.all([
        fetch(`/api/apostas?${queryParams}`),
        fetch('/api/stats')
      ]);

      if (apostasRes.ok && statsRes.ok) {
        const apostasData = await apostasRes.json();
        const { stats: statsData, dailyStats: dailyData } = await statsRes.json();
        
        setApostas(apostasData.data);
        setTotalPages(apostasData.totalPages);
        setTotalItems(apostasData.total);
        setStats(statsData || {
          totalApostas: 0,
          lucroTotal: 0,
          perdaTotal: 0,
          saldoGeral: 0,
          totalApostado: 0
        });
        setDailyStats(dailyData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, activeTab]);

  const handleDelete = async (id: number) => {
    console.log('Tentando excluir aposta ID:', id);
    try {
      const response = await fetch(`/api/apostas/${id}`, { method: 'DELETE' });
      if (response.ok) {
        console.log('Aposta excluída com sucesso');
        fetchData();
      } else {
        const err = await response.json();
        console.error('Erro ao excluir aposta:', err);
        alert('Erro ao excluir aposta: ' + (err.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao excluir aposta:', error);
      alert('Erro de conexão ao excluir aposta.');
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayStats = dailyStats.find(s => s.data === today) || {
    lucroDiario: 0,
    qtdApostas: 0,
    totalApostado: 0
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-black">
            <Trophy size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">BetManager</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-yellow-400 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar / Navigation */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black shadow-lg shadow-yellow-400/20">
              <Trophy size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">BetManager</h1>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'dashboard' ? 'bg-yellow-400 text-black font-bold' : 'text-zinc-400 hover:bg-zinc-800 hover:text-yellow-400'
              }`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'history' ? 'bg-yellow-400 text-black font-bold' : 'text-zinc-400 hover:bg-zinc-800 hover:text-yellow-400'
              }`}
            >
              <History size={20} /> Histórico
            </button>
            <button
              onClick={() => { setActiveTab('charts'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'charts' ? 'bg-yellow-400 text-black font-bold' : 'text-zinc-400 hover:bg-zinc-800 hover:text-yellow-400'
              }`}
            >
              <ChartIcon size={20} /> Gráficos
            </button>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-zinc-800">
          <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700">
            <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Relatório Hoje</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Resultado:</span>
                <span className={`font-bold ${todayStats.lucroDiario >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(todayStats.lucroDiario)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Total:</span>
                <span className="font-bold text-white">{formatCurrency(todayStats.totalApostado)}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-8 lg:p-12 min-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white">
              {activeTab === 'dashboard' && 'Visão Geral'}
              {activeTab === 'history' && 'Histórico de Apostas'}
              {activeTab === 'charts' && 'Análise de Desempenho'}
            </h2>
            <p className="text-zinc-500 mt-1">Bem-vindo de volta ao seu painel de gestão.</p>
          </div>

          <button
            onClick={() => {
              setEditingBet(null);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-2xl hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-400/10 font-bold"
          >
            <Plus size={20} /> Nova Aposta
          </button>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <>
                <Dashboard stats={stats} />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">Apostas Recentes</h3>
                      <button 
                        onClick={() => setActiveTab('history')}
                        className="text-sm font-bold text-yellow-400 hover:text-yellow-500"
                      >
                        Ver todas
                      </button>
                    </div>
                    <BetTable 
                      apostas={apostas.slice(0, 5)} 
                      onEdit={(b) => { setEditingBet(b); setIsFormOpen(true); }}
                      onDelete={handleDelete}
                    />
                  </div>
                  <div className="space-y-8">
                    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                      <h3 className="text-lg font-bold text-white mb-4">Destaque do Dia</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                              <Trophy size={18} />
                            </div>
                            <span className="text-sm font-medium text-emerald-100">Lucro Diário</span>
                          </div>
                          <span className="font-bold text-emerald-400">{formatCurrency(todayStats.lucroDiario)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-400/20 rounded-lg text-yellow-400">
                              <History size={18} />
                            </div>
                            <span className="text-sm font-medium text-yellow-100">Volume</span>
                          </div>
                          <span className="font-bold text-yellow-400">{todayStats.qtdApostas} bets</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'history' && (
              <>
                <Filters 
                  filters={filters} 
                  setFilters={setFilters} 
                  onReset={() => setFilters({ esporte: '', resultado: '', dataInicio: '', dataFim: '' })} 
                />
                <BetTable 
                  apostas={apostas} 
                  onEdit={(b) => { setEditingBet(b); setIsFormOpen(true); }}
                  onDelete={handleDelete}
                  pagination={{
                    currentPage,
                    totalPages,
                    totalItems,
                    onPageChange: setCurrentPage
                  }}
                />
              </>
            )}

            {activeTab === 'charts' && (
              <Charts dailyStats={dailyStats} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-6 py-4 flex justify-around items-center z-40">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}>
          <LayoutDashboard size={24} />
        </button>
        <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}>
          <History size={24} />
        </button>
        <button onClick={() => setActiveTab('charts')} className={activeTab === 'charts' ? 'text-indigo-600' : 'text-slate-400'}>
          <ChartIcon size={24} />
        </button>
      </div>

      {isFormOpen && (
        <BetForm 
          onClose={() => { setIsFormOpen(false); setEditingBet(null); }} 
          onSave={fetchData}
          initialData={editingBet}
        />
      )}
    </div>
  );
}

const Trophy = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
