'use client';

import { useContext } from 'react';
import { ThemeContext, type Theme } from './ThemeProvider';

const themes = [
  { id: 'light' as Theme, name: '淺色', color: '#f6f7f9' },
  { id: 'dark' as Theme, name: '深色', color: '#1a1a2e' },
  { id: 'blue' as Theme, name: '藍色', color: '#f0f4f8' },
  { id: 'green' as Theme, name: '綠色', color: '#f3f6f3' },
];

export default function ThemeSwitcher() {
  const context = useContext(ThemeContext);
  const theme: Theme = context?.theme || 'light';
  const setTheme = context?.setTheme || (() => {});

  return (
    <div className="flex items-center gap-2">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.name}
          className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            backgroundColor: t.color,
            borderColor: theme === t.id ? 'var(--brand)' : 'var(--border)',
          }}
        />
      ))}
    </div>
  );
}
