'use client';

import { useState, useEffect, useCallback } from 'react';
import { Account } from '@/lib/types';
import PasswordCell from './PasswordCell';
import CopyButton from './CopyButton';
import AccountFormModal from './AccountFormModal';

interface Props {
  isAdmin: boolean;
}

export default function AccountTable({ isAdmin }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Fetch accounts error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDelete = async (id: string) => {
    if (!confirm('이 계정을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      Claude: 'bg-orange-500/20 text-orange-300',
      Gemini: 'bg-blue-500/20 text-blue-300',
      ChatGPT: 'bg-green-500/20 text-green-300',
      Copilot: 'bg-purple-500/20 text-purple-300',
      Perplexity: 'bg-cyan-500/20 text-cyan-300',
      Midjourney: 'bg-indigo-500/20 text-indigo-300',
    };
    return colors[platform] || 'bg-slate-500/20 text-slate-300';
  };

  if (loading) {
    return <div className="text-slate-400 text-center py-8">로딩 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">계정 목록</h2>
        {isAdmin && (
          <button
            onClick={() => { setEditAccount(null); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + 계정 추가
          </button>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="text-slate-400 text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
          등록된 계정이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">플랫폼</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">아이디</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">비밀번호</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">비고</th>
                {isAdmin && <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">관리</th>}
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPlatformColor(account.platform)}`}>
                      {account.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm text-white">{account.accountId}</span>
                      <CopyButton text={account.accountId} />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <PasswordCell password={account.password} />
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300 max-w-[200px] truncate">
                    {account.notes || '-'}
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditAccount(account); setShowForm(true); }}
                          className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                          title="수정"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                          title="삭제"
                        >
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
        <AccountFormModal
          account={editAccount}
          onClose={() => setShowForm(false)}
          onSaved={fetchAccounts}
        />
      )}
    </div>
  );
}
