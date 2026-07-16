'use client';

import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
}

export default function FormSection({
  title,
  description,
  children,
  collapsible = false,
}: FormSectionProps) {
  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: 'var(--panel)',
        borderWidth: '1px',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
          {title}
        </h3>
        {description && (
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
