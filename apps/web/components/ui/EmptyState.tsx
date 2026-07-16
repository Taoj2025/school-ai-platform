'use client';

import { ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      style={{
        backgroundColor: 'var(--panel-soft)',
        borderWidth: '1px',
        borderColor: 'var(--border)',
        borderStyle: 'dashed',
        borderRadius: '0.5rem',
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--brand-light)' }}
      >
        {icon ? (
          <div style={{ color: 'var(--brand)' }}>{icon}</div>
        ) : (
          <FileQuestion className="w-8 h-8" style={{ color: 'var(--brand)' }} />
        )}
      </div>
      <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm mb-4 max-w-md" style={{ color: 'var(--muted)' }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
