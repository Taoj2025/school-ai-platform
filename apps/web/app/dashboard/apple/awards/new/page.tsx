'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useAIGlobal } from '@/lib/ai-context';

const awardTypes = [
  { value: 'academic', label: '學業獎' },
  { value: 'conduct', label: '品行獎' },
  { value: 'service', label: '服務獎' },
  { value: 'sports', label: '體育獎' },
  { value: 'art', label: '藝術獎' },
  { value: 'other', label: '其他獎' },
];

export default function NewAwardPage() {
  const router = useRouter();
  useAIGlobal('awards', '新增獎項');
  const [formData, setFormData] = useState({
    name: '',
    award_type: 'academic',
    academic_year: '2025-2026',
    semester: '上學期',
    amount: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAward({
        name: formData.name,
        award_type: formData.award_type,
        academic_year: formData.academic_year,
        semester: formData.semester,
        amount: formData.amount ? Number(formData.amount) : null,
        description: formData.description,
      });
      router.push('/dashboard/apple/awards');
    } catch (err: any) {
      alert(err.message || '創建失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Topbar title="新增獎項" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/apple/awards"
            className="p-2 rounded-md hover:opacity-70 text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">新增獎項</h2>
            <p className="text-sm mt-1 text-gray-500">創建新的獎項或獎學金記錄</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-lg p-6 bg-white border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                獎項名稱 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="例如：學業優異獎"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  獎項類型 <span className="text-red-600">*</span>
                </label>
                <select
                  name="award_type"
                  value={formData.award_type}
                  onChange={(e) => setFormData({ ...formData, award_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {awardTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  學年 <span className="text-red-600">*</span>
                </label>
                <select
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  學期 <span className="text-red-600">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="上學期">上學期</option>
                  <option value="下學期">下學期</option>
                  <option value="全學年">全學年</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  獎金金額 (HKD)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="選填"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                備註
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                placeholder="輸入獎項的詳細說明..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <Link
              href="/dashboard/apple/awards"
              className="px-4 py-2 border rounded-md hover:opacity-80 border-gray-200 text-gray-900"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50 bg-primary-600"
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
