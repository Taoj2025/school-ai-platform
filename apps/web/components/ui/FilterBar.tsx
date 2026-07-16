'use client';

import { Search } from 'lucide-react';

interface FilterBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  filters?: React.ReactNode;
}

export default function FilterBar({
  placeholder = '搜索...',
  value,
  onChange,
  filters,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'var(--muted)' }}
        />
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-md"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--panel-soft)',
            color: 'var(--text)',
          }}
        />
      </div>
      {filters && <div className="flex items-center gap-2">{filters}</div>}
    </div>
  );
}
