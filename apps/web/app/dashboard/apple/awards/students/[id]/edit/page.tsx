'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Save, DollarSign, Award } from 'lucide-react';
import { getAssignmentById, updateAssignment, type StudentAwardAssignment } from '@/lib/awardAssignmentStore';

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

export default function EditStudentAwardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StudentAwardAssignment | null>(null);

  useEffect(() => {
    if (id) {
      const data = getAssignmentById(id);
      if (data) {
        setFormData(data);
      }
      setLoading(false);
    }
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
    try {
      const updated = updateAssignment(id, {
        ...formData,
        bounty_amount: Number(formData.bounty_amount),
      });
      if (updated) {
        alert('獎金記錄已更新');
        router.push('/dashboard/apple/awards/students');
      } else {
        alert('更新失敗，找不到記錄');
      }
    } catch (error) {
      console.error('Failed to update assignment:', error);
      alert('更新失敗，請稍後再試');
    } finally {
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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/apple/awards/students"
            className="p-2 rounded-md hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>編輯獎金記錄</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              {formData.student_name} - {formData.award_name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Info (read-only) */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>學生信息</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>學號</label>
                <input type="text" value={formData.student_no} disabled style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>姓名</label>
                <input type="text" value={formData.student_name} disabled style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>班別</label>
                <input type="text" value={formData.student_class} disabled style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Award Info */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>獎項信息</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>獎項名稱</label>
                <input
                  type="text"
                  name="award_name"
                  value={formData.award_name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>學年</label>
                  <select
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>學期</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="上學期">上學期</option>
                    <option value="下學期">下學期</option>
                    <option value="全學年">全學年</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bounty Amount */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>獎金金額</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>獎金金額 (HKD) *</label>
                <input
                  type="number"
                  name="bounty_amount"
                  value={formData.bounty_amount}
                  onChange={handleChange}
                  min="0"
                  step="50"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>狀態 *</label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="pending">待發放</option>
                  <option value="paid">已發放</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dates & Remark */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>日期及備註</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>頒發日期 *</label>
                <input
                  type="date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>發放日期</label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date || ''}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="mt-4">
              <label style={labelStyle}>備註</label>
              <textarea
                name="remark"
                value={formData.remark || ''}
                onChange={handleChange}
                rows={3}
                placeholder="備註..."
                className="resize-none"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/dashboard/apple/awards/students"
              className="px-6 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
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
