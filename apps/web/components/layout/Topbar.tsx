'use client';

import { Bell, Search, User } from 'lucide-react';
import ThemeSwitcher from '../ThemeSwitcher';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  return (
    <header
      className="flex items-center justify-between px-4 py-3 rounded-lg mb-4"
      style={{
        backgroundColor: 'var(--panel)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center gap-4">
        <p
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: 'var(--accent)' }}
        >
          APPLE / {title.toUpperCase()}
        </p>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--muted)' }}
          />
          <input
            type="search"
            placeholder="搜索..."
            className="w-48 pl-9 pr-4 py-2 text-sm rounded-lg border"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--panel)',
              color: 'var(--text)',
            }}
          />
        </div>

        <button
          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: 'var(--muted)' }}
        >
          <Bell className="w-5 h-5" />
        </button>

        <button
          className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: 'var(--muted)' }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}
          >
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
