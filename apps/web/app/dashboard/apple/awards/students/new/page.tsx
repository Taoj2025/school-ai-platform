'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Save, DollarSign, Award } from 'lucide-react';
import { getStudents, type Student } from '@/lib/studentStore';
import { addAssignment } from '@/lib/awardAssignmentStore';

const availableAwards = [
  { id: '1', name: '學業優異獎', type: 'academic' },
  { id: '2', name: '品行優良獎', type: 'conduct' },
  { id: '3', name: '服務精神獎', type: 'service' },
  { id: '4', name: '體育傑出獎', type: 'sports' },
  { id: '5', name: '藝術成就獎', type: 'art' },
  { id: '6', name: '學業進步獎', type: 'academic' },
  { id: '7', name: '最佳出席獎', type: 'conduct' },
  { id: '8', name: '傑出領袖獎', type: 'service' },
];

const suggestedAmounts: Record<string, number[]> = {
  academic: [1000, 1500, 2000, 3000],
  conduct: [300, 500, 800],
  service: [400, 600, 1000],
  sports: [500, 1000, 1500],
  art: [500, 1000, 1500],
};

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

export default function NewStudentAwardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    student_id: '',
    student_no: '',
    student_name: '',
    student_class: '',
    award_id: '',
    award_name: '',
    award_type: '',
    academic_year: '2025-2026',
    semester: '上學期',
    bounty_amount: '' as string | number,
    currency: 'HKD' as 'HKD',
    payment_status: 'pending' as 'pending' | 'paid' | 'cancelled',
    issue_date: new Date().toISOString().split('T')[0],
    payment_date: '',
    remark: '',
  });

  useEffect(() => {
    const data = getStudents();
    setStudents(data);
    setLoading(false);
  }, []);

  // When student is selected, auto-fill info
  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setFormData((prev) => ({
        ...prev,
        student_id: student.id,
        student_no: student.student_no,
        student_name: student.name,
        student_class: student.class,
      }));
    }
  };

  // When award is selected, auto-fill info and suggest amount
  const handleAwardChange = (awardId: string) => {
    const award = availableAwards.find((a) => a.id === awardId);
    if (award) {
      setFormData((prev) => ({
        ...prev,
        award_id: award.id,
        award_name: award.name,
        award_type: award.type,
        // Auto-suggest first amount if not yet specified
        bounty_amount: prev.bounty_amount === '' ? suggestedAmounts[award.type][0] : prev.bounty_amount,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountSelect = (amount: number) => {
    setFormData((prev) => ({ ...prev, bounty_amount: amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_id) {
      alert('請選擇學生');
      return;
    }
    if (!formData.award_id) {
      alert('請選擇獎項');
      return;
    }
    if (!formData.bounty_amount || Number(formData.bounty_amount) <= 0) {
      alert('請輸入有效的獎金金額');
      return;
    }

    setSaving(true);
    try {
      const newAssignment = addAssignment({
        student_id: formData.student_id,
        student_no: formData.student_no,
        student_name: formData.student_name,
        student_class: formData.student_class,
        award_id: formData.award_id,
        award_name: formData.award_name,
        award_type: formData.award_type,
        academic_year: formData.academic_year,
        semester: formData.semester,
        bounty_amount: Number(formData.bounty_amount),
        currency: formData.currency,
        payment_status: formData.payment_status,
        issue_date: formData.issue_date,
        payment_date: formData.payment_date || undefined,
        remark: formData.remark || undefined,
      });

      alert(`獎金記錄已新增！\n學生：${newAssignment.student_name}\n獎項：${newAssignment.award_name}\n金額：HK$ ${newAssignment.bounty_amount.toLocaleString('zh-HK')}`);
      router.push('/dashboard/apple/awards/students');
    } catch (error) {
      console.error('Failed to create assignment:', error);
      alert('新增失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="新增學生獎金" />
        <div className="p-6 flex items-center justify-center" style={{ minHeight: '400px' }}>
          <p style={{ color: 'var(--muted)' }}>載入中...</p>
        </div>
      </>
    );
  }

  const selectedAward = availableAwards.find((a) => a.id === formData.award_id);
  const suggestedList = selectedAward ? suggestedAmounts[selectedAward.type] : [];

  return (
    <>
      <Topbar title="新增學生獎金" />
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
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>新增學生獎金記錄</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              為香港培英中學的學生分配獎項及獎金
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>選擇學生</h3>
            </div>

            <div>
              <label style={labelStyle}>
                學生 *
              </label>
              <select
                value={formData.student_id}
                onChange={(e) => handleStudentChange(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">請選擇學生</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.student_no} - {student.name} ({student.class})
                  </option>
                ))}
              </select>
            </div>

            {formData.student_id && (
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--panel-soft)', borderWidth: '1px', borderColor: 'var(--border)' }}>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p style={{ color: 'var(--muted)' }}>學號</p>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{formData.student_no}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--muted)' }}>姓名</p>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{formData.student_name}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--muted)' }}>班別</p>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{formData.student_class}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Award Selection */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>選擇獎項</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>獎項名稱 *</label>
                <select
                  value={formData.award_id}
                  onChange={(e) => handleAwardChange(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">請選擇獎項</option>
                  {availableAwards.map((award) => (
                    <option key={award.id} value={award.id}>
                      {award.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>學年 *</label>
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
                  <label style={labelStyle}>學期 *</label>
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
                <label style={labelStyle}>
                  獎金金額 (HKD) *
                </label>
                <input
                  type="number"
                  name="bounty_amount"
                  value={formData.bounty_amount}
                  onChange={handleChange}
                  min="0"
                  step="50"
                  placeholder="例如：1000"
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

            {suggestedList.length > 0 && (
              <div className="mt-3">
                <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>建議金額（{selectedAward?.name}）：</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedList.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAmountSelect(amount)}
                      className="px-3 py-1 border rounded-full text-sm hover:opacity-80"
                      style={{
                        borderColor: Number(formData.bounty_amount) === amount ? 'var(--brand)' : 'var(--border)',
                        backgroundColor: Number(formData.bounty_amount) === amount ? 'var(--brand-light)' : 'var(--panel-soft)',
                        color: Number(formData.bounty_amount) === amount ? 'var(--brand)' : 'var(--text)',
                      }}
                    >
                      HK$ {amount.toLocaleString('zh-HK')}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                <label style={labelStyle}>發放日期（已發放時填寫）</label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="mt-4">
              <label style={labelStyle}>備註</label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows={3}
                placeholder="例如：全年級第一名、家長已簽收..."
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
