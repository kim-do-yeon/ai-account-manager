'use client';

import { useState } from 'react';

interface Props {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
  const [sitePassword, setSitePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sitePassword) return;
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sitePassword }),
      });

      if (res.ok) {
        setMessage('비밀번호가 변경되었습니다.');
        setSitePassword('');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('변경에 실패했습니다.');
      }
    } catch {
      setMessage('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold text-white mb-4">사이트 설정</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-300 mb-1">사이트 입장 비밀번호 변경</label>
          <input
            type="text"
            value={sitePassword}
            onChange={(e) => setSitePassword(e.target.value)}
            placeholder="새 비밀번호"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {message && (
            <p className={`text-sm mt-2 ${message.includes('변경되었습니다') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              닫기
            </button>
            <button
              type="submit"
              disabled={loading || !sitePassword}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {loading ? '변경 중...' : '변경'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
