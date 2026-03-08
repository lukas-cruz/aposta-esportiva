import React, { useState, useEffect } from 'react';
import { Aposta } from '../types';
import { SPORTS, RESULTS } from '../lib/utils';
import { X } from 'lucide-react';

interface BetFormProps {
  onClose: () => void;
  onSave: () => void;
  initialData?: Aposta | null;
}

export const BetForm: React.FC<BetFormProps> = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    esporte: 'Futebol',
    liga: '',
    jogo: '',
    tipo_aposta: '',
    odd: 1.01,
    valor_apostado: 1.0,
    resultado: 'pendente',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        data: initialData.data,
        esporte: initialData.esporte,
        liga: initialData.liga,
        jogo: initialData.jogo,
        tipo_aposta: initialData.tipo_aposta,
        odd: initialData.odd,
        valor_apostado: initialData.valor_apostado,
        resultado: initialData.resultado,
        observacoes: initialData.observacoes || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = initialData ? `/api/apostas/${initialData.id}` : '/api/apostas';
    const method = initialData ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Erro ao salvar: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar aposta:', error);
      alert('Erro de conexão ao salvar aposta. Verifique se o Supabase está configurado corretamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-lg overflow-hidden border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 shrink-0">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Editar Aposta' : 'Nova Aposta'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-zinc-900">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Data</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                  value={formData.data}
                  onChange={e => setFormData({ ...formData, data: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Esporte</label>
                <select
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                  value={formData.esporte}
                  onChange={e => setFormData({ ...formData, esporte: e.target.value })}
                >
                  {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Campeonato / Liga</label>
              <input
                type="text"
                required
                placeholder="Ex: Premier League"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                value={formData.liga}
                onChange={e => setFormData({ ...formData, liga: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Jogo / Evento</label>
              <input
                type="text"
                required
                placeholder="Ex: Arsenal vs Liverpool"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                value={formData.jogo}
                onChange={e => setFormData({ ...formData, jogo: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tipo de Aposta</label>
              <input
                type="text"
                required
                placeholder="Ex: Vitória Arsenal"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                value={formData.tipo_aposta}
                onChange={e => setFormData({ ...formData, tipo_aposta: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Odd</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                  value={formData.odd}
                  onChange={e => setFormData({ ...formData, odd: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                  value={formData.valor_apostado}
                  onChange={e => setFormData({ ...formData, valor_apostado: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Resultado</label>
              <select
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                value={formData.resultado}
                onChange={e => setFormData({ ...formData, resultado: e.target.value as any })}
              >
                {RESULTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Observações</label>
              <textarea
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                rows={2}
                value={formData.observacoes}
                onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>
          </div>

          <div className="p-6 border-t border-zinc-800 flex gap-3 bg-zinc-900 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                initialData ? 'Salvar' : 'Registrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
