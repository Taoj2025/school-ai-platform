'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

const awardTypes = [
  { value: 'academic', label: '學業獎' },
  { value: 'conduct', label: '品行獎' },
  { value: 'service', label: '服務獎' },
  { value: 'sports', label: '體育獎' },
  { value: 'art', label: '藝術獎' },
];

export default function NewAwardPage() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'academic',
    academic_year: '2025-2026',
    semester: '上學期',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('獎項已創建');
  };

  return (
    <>
      <Topbar title="新增獎項" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/apple/awards"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">新增獎項</h2>
            <p className="text-sm text-gray-500 mt-1">創建新的獎項或獎學金記錄</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                獎項名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="例如：學業優異獎"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  獎項類型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  學年 <span className="text-red-500">*</span>
                </label>
                <select
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                學期 <span className="text-red-500">*</span>
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備註
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="輸入獎項的詳細說明..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <Link
              href="/dashboard/apple/awards"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
