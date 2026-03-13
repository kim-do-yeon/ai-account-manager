'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminProvider, useAdmin } from '@/components/AdminContext';
import AdminLoginModal from '@/components/AdminLoginModal';
import SettingsModal from '@/components/SettingsModal';

function ProtectedLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAdmin, setIsAdmin } = useAdmin();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleAdminSuccess = () => {
    setIsAdmin(true);
  };

  const handleExitAdmin = async () => {
    setIsAdmin(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navLinks = [
    { href: '/', label: '계정 목록' },
    { href: '/costs', label: '비용 관리' },
    { href: '/announcements', label: '공지사항' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <nav className="bg-slate-900/80 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-white font-bold text-lg">AI Account Manager</span>
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    pathname === link.href
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">
                  Admin
                </span>
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  설정
                </button>
                <button
                  onClick={handleExitAdmin}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  관리자 해제
                </button>
              </>
            )}
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      {!isAdmin && (
        <button
          onClick={() => setShowAdminLogin(true)}
          className="fixed bottom-4 right-4 p-2 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-500 hover:text-slate-300 transition-colors z-30"
          title="관리자 모드"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {showAdminLogin && (
        <AdminLoginModal onClose={() => setShowAdminLogin(false)} onSuccess={handleAdminSuccess} />
      )}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <ProtectedLayoutInner>{children}</ProtectedLayoutInner>
    </AdminProvider>
  );
}
