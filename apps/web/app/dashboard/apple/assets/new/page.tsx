'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useAIGlobal } from '@/lib/ai-context';

const categories = [
  { value: 'equipment', label: '設備' },
  { value: 'furniture', label: '傢俱' },
  { value: 'vehicle', label: '車輛' },
  { value: 'building', label: '建築物' },
  { value: 'other', label: '其他' },
];

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

export default function NewAssetPage() {
  useAIGlobal('assets', '新增資產');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'equipment',
    location: '',
    purchase_date: '',
    value: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createAsset({
        name: formData.name,
        asset_code: formData.code,
        category: formData.category,
        location: formData.location,
        purchase_date: formData.purchase_date || undefined,
        purchase_price: formData.value ? Number(formData.value) : undefined,
      });
      window.location.href = '/dashboard/apple/assets';
    } catch (err: any) {
      setError(err.message || '保存失敗');
      setSaving(false);
    }
  };

  return (
    <>
      <Topbar title="新增資產" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/apple/assets"
            className="p-2 rounded-md hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>新增資產</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>添加新的學校資產記錄</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                資產名稱 <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
                placeholder="例如：投影機 EP-01"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  資產編號 <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={inputStyle}
                  placeholder="例如：IT-2025-001"
                  required
                />
              </div>
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
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  位置 <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={inputStyle}
                  placeholder="例如：301 課室"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>購置日期</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>價值 (HKD)</label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                style={inputStyle}
                placeholder="0"
              />
            </div>

            {error && (
              <div className="rounded-md p-3 text-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6" style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
            <Link
              href="/dashboard/apple/assets"
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
