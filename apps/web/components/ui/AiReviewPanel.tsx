'use client';

import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

type Confidence = 'high' | 'medium' | 'low';

interface AiReviewPanelProps {
  label: string;
  confidence: Confidence;
  originalValue?: string;
  extractedValue?: string;
  onConfirm?: () => void;
  onEdit?: () => void;
}

const confidenceConfig: Record<Confidence, { bg: string; text: string; icon: typeof CheckCircle; label: string }> = {
  high: {
    bg: 'var(--good-bg)',
    text: 'var(--good)',
    icon: CheckCircle,
    label: '高置信度',
  },
  medium: {
    bg: 'var(--warning-bg)',
    text: 'var(--warning)',
    icon: AlertCircle,
    label: '中等置信度',
  },
  low: {
    bg: 'var(--danger-bg)',
    text: 'var(--danger)',
    icon: Sparkles,
    label: '低置信度',
  },
};

export default function AiReviewPanel({
  label,
  confidence,
  originalValue,
  extractedValue,
  onConfirm,
  onEdit,
}: AiReviewPanelProps) {
  const config = confidenceConfig[confidence];
  const Icon = config.icon;

  return (
    <div
      className="rounded-lg p-4"
      style={{
        backgroundColor: 'var(--panel-soft)',
        borderWidth: '1px',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            AI 識別結果
          </span>
        </div>
        <span
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
          style={{ backgroundColor: config.bg, color: config.text }}
        >
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {label}
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            {extractedValue ?? '-'}
          </p>
        </div>

        {originalValue && (
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              原始值
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {originalValue}
            </p>
          </div>
        )}
      </div>

      {(onConfirm || onEdit) && (
        <div className="flex gap-2 mt-4 pt-4" style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm rounded-md"
              style={{
                borderWidth: '1px',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              編輯
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-3 py-1 text-sm text-white rounded-md hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              確認
            </button>
          )}
        </div>
      )}
    </div>
  );
}
