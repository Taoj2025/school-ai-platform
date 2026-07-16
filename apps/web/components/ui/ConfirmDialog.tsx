'use client';

import { ReactNode, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'danger' | 'warning';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確認',
  cancelText = '取消',
  type = 'default',
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const buttonColor =
    type === 'danger'
      ? 'var(--danger)'
      : type === 'warning'
      ? 'var(--warning)'
      : 'var(--brand)';

  const Icon = type === 'danger' ? AlertTriangle : undefined;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-xl w-full max-w-md"
        style={{
          backgroundColor: 'var(--panel)',
          margin: '1rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5" style={{ color: buttonColor }} />}
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {typeof message === 'string' ? (
            <p style={{ color: 'var(--text)' }}>{message}</p>
          ) : (
            message
          )}
        </div>

        <div
          className="flex justify-end gap-3 p-4"
          style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md"
            style={{
              borderWidth: '1px',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: buttonColor }}
            disabled={loading}
          >
            {loading ? '處理中...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
