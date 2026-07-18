'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useAIGlobal } from '@/lib/ai-context';

const incomeCategories = [
  { value: 'tuition', label: '學費' },
  { value: 'donation', label: '捐贈' },
  { value: 'event', label: '活動' },
  { value: 'other', label: '其他' },
];

const ACADEMIC_YEAR = '2025-2026';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--border)',
  borderRadius: '6px',
  backgroundColor: 'var(--panel)',
  color: 'var(--text)',
  outline: 'none',
};

export default function NewIncomePage() {
  useAIGlobal('finance', '記錄收入');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'tuition',
    source: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createIncome({
        record_type: 'income',
        category: formData.category,
        description: formData.description,
        amount: Number(formData.amount),
        transaction_date: formData.date,
        academic_year: ACADEMIC_YEAR,
        receipt_no: formData.source || undefined,
      });
      window.location.href = '/dashboard/apple/finance';
    } catch (err: any) {
      setError(err.message || '保存失敗');
      setSaving(false);
    }
  };

  return (
    <>
      <Topbar title="記錄收入" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/apple/finance"
            className="p-2 rounded-md hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>記錄收入</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>新增收入記錄</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  日期 <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  金額 (HKD) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                描述 <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  類別 <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={inputStyle}
                >
                  {incomeCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>來源 / 收據編號</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  style={inputStyle}
                  placeholder="例如：家長會捐贈 / RCP-001"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md p-3 text-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6" style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
            <Link
              href="/dashboard/apple/finance"
              className="px-4 py-2 border rounded-md hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
