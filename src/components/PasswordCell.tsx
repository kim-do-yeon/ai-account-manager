'use client';

import { useState } from 'react';
import CopyButton from './CopyButton';

export default function PasswordCell({ password }: { password: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-sm min-w-[80px]">
        {revealed ? password : '••••••••'}
      </span>
      <button
        onClick={() => setRevealed(!revealed)}
        className="p-1 text-slate-400 hover:text-white transition-colors"
        title={revealed ? '숨기기' : '확인하기'}
      >
        {revealed ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
      <CopyButton text={password} />
    </div>
  );
}
