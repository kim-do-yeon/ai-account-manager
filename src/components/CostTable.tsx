'use client';

import { useState, useEffect, useCallback } from 'react';
import { CostEntry } from '@/lib/types';

interface Props {
  isAdmin: boolean;
}

export default function CostTable({ isAdmin }: Props) {
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCost, setEditCost] = useState<CostEntry | null>(null);
  const [form, setForm] = useState({ platform: '', period: '', amount: '', notes: '' });

  const fetchCosts = useCallback(async () => {
    try {
      const res = await fetch('/api/costs');
      if (res.ok) {
        setCosts(await res.json());
      }
    } catch (error) {
      console.error('Fetch costs error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  const openForm = (cost?: CostEntry) => {
    if (cost) {
      setEditCost(cost);
      setForm({ platform: cost.platform, period: cost.period, amount: cost.amount, notes: cost.notes });
    } else {
      setEditCost(null);
      setForm({ platform: '', period: '', amount: '', notes: '' });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editCost ? `/api/costs/${editCost.id}` : '/api/costs';
    const method = editCost ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowForm(false);
      fetchCosts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    const res = await fetch(`/api/costs/${id}`, { method: 'DELETE' });
    if (res.ok) fetchCosts();
  };

  if (loading) {
    return <div className="text-slate-400 text-center py-8">로딩 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">비용 관리</h2>
        {isAdmin && (
          <button
            onClick={() => openForm()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + 비용 추가
          </button>
        )}
      </div>

      {costs.length === 0 ? (
        <div className="text-slate-400 text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
          등록된 비용 정보가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">플랫폼</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">기간</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">비용</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">비고</th>
                {isAdmin && <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">관리</th>}
              </tr>
            </thead>
            <tbody>
              {costs.map((cost) => (
                <tr key={cost.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-white font-medium">{cost.platform}</td>
                  <td className="py-3 px-4 text-slate-300">{cost.period}</td>
                  <td className="py-3 px-4 text-emerald-400 font-mono">{cost.amount}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">{cost.notes || '-'}</td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openForm(cost)} className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors" title="수정">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(cost.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors" title="삭제">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">{editCost ? '비용 수정' : '비용 추가'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">플랫폼</label>
                <input type="text" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">기간</label>
                <input type="text" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="예: 2025-03, 2025 Q1" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">비용</label>
                <input type="text" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="예: $45.00" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">비고</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors">취소</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
