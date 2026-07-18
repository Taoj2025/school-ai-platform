'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Save, DollarSign, Award } from 'lucide-react';
import { api } from '@/lib/api';

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  marginBottom: '0.5rem',
  color: 'var(--text)',
};

type Recipient = {
  id: string;
  award_id: string;
  student_id: string;
  student_name: string | null;
  class_name: string | null;
  amount: number | null;
  status: string;
  reason: string | null;
  award_name: string;
};

async function loadRecipient(id: string): Promise<Recipient | null> {
  const awardsRes = await api.getAwards({ page: 1, page_size: 200 });
  const awards = (awardsRes.data?.items ?? []) as any[];
  const nameById: Record<string, string> = {};
  awards.forEach((a) => { nameById[a.id] = a.name; });
  const lists = await Promise.all(
    awards.map((a) => api.getAwardRecipients(a.id).then((r: any) => r.data?.items ?? []))
  );
  for (const items of lists) {
    const found = (items as any[]).find((r) => r.id === id);
    if (found) {
      return {
        id: found.id,
        award_id: found.award_id,
        student_id: found.student_id,
        student_name: found.student_name,
        class_name: found.class_name,
        amount: found.amount,
        status: found.status,
        reason: found.reason,
        award_name: nameById[found.award_id] || '',
      };
    }
  }
  return null;
}

export default function EditStudentAwardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Recipient | null>(null);

  useEffect(() => {
    if (!id) return;
    loadRecipient(id)
      .then((data) => setFormData(data))
      .catch((e: any) => setError(e.message || '載入失敗'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setSaving(true);
    setError(null);
    try {
      await api.updateAwardRecipient(formData.award_id, formData.id, {
        student_name: formData.student_name,
        class_name: formData.class_name,
        amount: formData.amount != null ? Number(formData.amount) : null,
        status: formData.status,
        reason: formData.reason,
      });
      alert('獎金記錄已更新');
      router.push('/dashboard/apple/awards/students');
    } catch (e: any) {
      setError(e.message || '更新失敗，請稍後再試');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="編輯學生獎金" />
        <div className="p-6 flex items-center justify-center" style={{ minHeight: '400px' }}>
          <p style={{ color: 'var(--muted)' }}>載入中...</p>
        </div>
      </>
    );
  }

  if (!formData) {
    return (
      <>
        <Topbar title="編輯學生獎金" />
        <div className="p-6 flex items-center justify-center" style={{ minHeight: '400px' }}>
          <p style={{ color: 'var(--muted)' }}>找不到該記錄</p>
          <Link href="/dashboard/apple/awards/students" className="ml-4 underline" style={{ color: 'var(--brand)' }}>
            返回列表
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="編輯學生獎金" />
      <div className="p-6 space-y-6">
        {error && (
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Link href="/dashboard/apple/awards/students" className="p-2 rounded-md hover:opacity-70" style={{ color: 'var(--muted)' }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>編輯獎金記錄</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              {formData.student_name || formData.student_id} - {formData.award_name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>學生信息</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>姓名</label>
                <input type="text" name="student_name" value={formData.student_name || ''} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>班別</label>
                <input type="text" name="class_name" value={formData.class_name || ''} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>學號 (只讀)</label>
                <input type="text" value={formData.student_id} disabled style={inputStyle} />
              </div>
            </div>
          </div>

          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>獎金金額</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>獎金金額 (HKD) *</label>
                <input type="number" name="amount" value={formData.amount ?? 0} onChange={handleChange} min="0" step="50" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>狀態 *</label>
                <select name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
                  <option value="nominated">已提名</option>
                  <option value="pending">待發放</option>
                  <option value="issued">已發放</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label style={labelStyle}>備註</label>
              <textarea name="reason" value={formData.reason || ''} onChange={handleChange} rows={3} placeholder="備註..." className="resize-none" style={inputStyle} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href="/dashboard/apple/awards/students" className="px-6 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
              取消
            </Link>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--brand)' }}>
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
