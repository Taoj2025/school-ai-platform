'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const colorStyles = {
  default: { bg: 'var(--panel-soft)', text: 'var(--text)' },
  success: { bg: 'var(--good-bg)', text: 'var(--good)' },
  warning: { bg: 'var(--warning-bg)', text: 'var(--warning)' },
  danger: { bg: 'var(--danger-bg)', text: 'var(--danger)' },
  info: { bg: 'var(--info-bg)', text: 'var(--info)' },
};

export default function StatsCard({ title, value, icon, trend, color = 'default' }: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: 'var(--panel)',
        borderWidth: '1px',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: styles.bg }}
          >
            <div style={{ color: styles.text }}>{icon}</div>
          </div>
        )}
        <div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {title}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {value}
          </p>
        </div>
      </div>
      {trend && (
        <p
          className="text-sm mt-2"
          style={{ color: trend.isPositive ? 'var(--good)' : 'var(--danger)' }}
        >
          {trend.isPositive ? '+' : '-'}{trend.value}%
        </p>
      )}
    </div>
  );
}
