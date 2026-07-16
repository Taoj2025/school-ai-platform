'use client';

import { User, FileText, Edit, Trash2, Check } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
  type: 'create' | 'update' | 'delete' | 'approve';
}

interface AuditTimelineProps {
  entries: AuditEntry[];
}

const typeConfig = {
  create: { icon: FileText, color: 'var(--good)' },
  update: { icon: Edit, color: 'var(--info)' },
  delete: { icon: Trash2, color: 'var(--danger)' },
  approve: { icon: Check, color: 'var(--brand)' },
};

export default function AuditTimeline({ entries }: AuditTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--muted)' }}>
        暫無操作記錄
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const config = typeConfig[entry.type];
        const Icon = config.icon;

        return (
          <div key={entry.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: config.color }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              {index < entries.length - 1 && (
                <div
                  className="w-0.5 flex-1 my-1"
                  style={{ backgroundColor: 'var(--border)' }}
                />
              )}
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {entry.action}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {entry.timestamp}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <User className="w-3 h-3" style={{ color: 'var(--muted)' }} />
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {entry.user}
                </span>
              </div>
              {entry.details && (
                <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                  {entry.details}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
