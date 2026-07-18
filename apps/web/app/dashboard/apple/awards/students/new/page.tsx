'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Save, DollarSign, Award } from 'lucide-react';
import { api } from '@/lib/api';
import { normalizeStudent, type Student } from '@/lib/studentStore';

type AwardOption = { id: string; name: string; type: string };

const suggestedAmounts: Record<string, number[]> = {
  academic: [1000, 1500, 2000, 3000],
  conduct: [300, 500, 800],
  service: [400, 600, 1000],
  sports: [500, 1000, 1500],
  art: [500, 1000, 1500],
  other: [500, 1000],
};

export default function NewStudentAwardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [awards, setAwards] = useState<AwardOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    (async () => {
      setLoading(true);
      try {
        const [studentsRes, awardsRes] = await Promise.all([
          api.getStudents({ page: 1, page_size: 200 }),
          api.getAwards({ page: 1, page_size: 200 }),
        ]);
        setStudents((studentsRes.data?.items ?? []).map(normalizeStudent));
        setAwards(
          (awardsRes.data?.items ?? []).map((a: any) => ({
            id: a.id,
            name: a.name,
            type: a.type || 'other',
          }))
        );
      } catch (e: any) {
        setError(e.message || '載入失敗');
      } finally {
        setLoading(false);
      }
    })();
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
    const award = awards.find((a) => a.id === awardId);
    if (award) {
      setFormData((prev) => ({
        ...prev,
        award_id: award.id,
        award_name: award.name,
        award_type: award.type,
        // Auto-suggest first amount if not yet specified
        bounty_amount: prev.bounty_amount === '' ? (suggestedAmounts[award.type]?.[0] ?? 1000) : prev.bounty_amount,
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
    setError(null);
    try {
      await api.createAwardRecipient(formData.award_id, {
        student_id: formData.student_id,
        student_name: formData.student_name,
        class_name: formData.student_class,
        amount: Number(formData.bounty_amount),
        status: formData.payment_status === 'paid' ? 'issued' : 'pending',
      });
      alert(`獎金記錄已新增！\n學生：${formData.student_name}\n獎項：${formData.award_name}\n金額：HK$ ${Number(formData.bounty_amount).toLocaleString('zh-HK')}`);
      router.push('/dashboard/apple/awards/students');
    } catch (err: any) {
      setError(err.message || '新增失敗，請稍後再試');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="新增學生獎金" />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">載入中...</p>
        </div>
      </>
    );
  }

  const selectedAward = awards.find((a) => a.id === formData.award_id);
  const suggestedList = selectedAward ? (suggestedAmounts[selectedAward.type] ?? []) : [];

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <>
      <Topbar title="新增學生獎金" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/apple/awards/students"
            className="p-2 rounded-md hover:opacity-70 text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">新增學生獎金記錄</h2>
            <p className="text-sm mt-1 text-gray-500">
              為香港培英中學的學生分配獎項及獎金
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg p-4 bg-red-50 text-red-600">
              {error}
            </div>
          )}
          {/* Student Selection */}
          <div className="rounded-lg p-6 bg-white border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">選擇學生</h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                學生 *
              </label>
              <select
                value={formData.student_id}
                onChange={(e) => handleStudentChange(e.target.value)}
                className={inputClass}
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
              <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">學號</p>
                    <p className="font-medium text-gray-900">{formData.student_no}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">姓名</p>
                    <p className="font-medium text-gray-900">{formData.student_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">班別</p>
                    <p className="font-medium text-gray-900">{formData.student_class}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Award Selection */}
          <div className="rounded-lg p-6 bg-white border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">選擇獎項</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">獎項名稱 *</label>
                <select
                  value={formData.award_id}
                  onChange={(e) => handleAwardChange(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">請選擇獎項</option>
                  {awards.map((award) => (
                    <option key={award.id} value={award.id}>
                      {award.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">學年 *</label>
                  <select
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">學期 *</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className={inputClass}
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
          <div className="rounded-lg p-6 bg-white border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">獎金金額</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
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
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">狀態 *</label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="pending">待發放</option>
                  <option value="paid">已發放</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>

            {suggestedList.length > 0 && (
              <div className="mt-3">
                <p className="text-sm mb-2 text-gray-500">建議金額（{selectedAward?.name}）：</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedList.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAmountSelect(amount)}
                      className={`px-3 py-1 border rounded-full text-sm hover:opacity-80 ${
                        Number(formData.bounty_amount) === amount
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-gray-200 bg-gray-50 text-gray-900'
                      }`}
                    >
                      HK$ {amount.toLocaleString('zh-HK')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dates & Remark */}
          <div className="rounded-lg p-6 bg-white border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">日期及備註</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">頒發日期 *</label>
                <input
                  type="date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">發放日期（已發放時填寫）</label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 text-gray-900">備註</label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows={3}
                placeholder="例如：全年級第一名、家長已簽收..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/dashboard/apple/awards/students"
              className="px-6 py-2 border rounded-lg hover:opacity-80 border-gray-200 text-gray-900"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 bg-primary-600"
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
