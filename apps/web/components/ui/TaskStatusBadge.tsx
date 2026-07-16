'use client';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  label?: string;
}

const statusConfig: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  pending: {
    bg: 'var(--warning-bg)',
    text: 'var(--warning)',
    label: '待處理',
  },
  in_progress: {
    bg: 'var(--info-bg)',
    text: 'var(--info)',
    label: '進行中',
  },
  completed: {
    bg: 'var(--good-bg)',
    text: 'var(--good)',
    label: '已完成',
  },
  failed: {
    bg: 'var(--danger-bg)',
    text: 'var(--danger)',
    label: '失敗',
  },
};

export default function TaskStatusBadge({ status, label }: TaskStatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label ?? config.label;

  return (
    <span
      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {displayLabel}
    </span>
  );
}
