'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

const incomeCategories = [
  { value: 'tuition', label: '學費' },
  { value: 'donation', label: '捐贈' },
  { value: 'activity', label: '活動' },
  { value: 'other', label: '其他' },
];

export default function NewIncomePage() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'tuition',
    source: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('收入記錄已保存');
  };

  return (
    <>
      <Topbar title="記錄收入" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/apple/finance"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">記錄收入</h2>
            <p className="text-sm text-gray-500 mt-1">新增收入記錄</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  金額 (HKD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  類別 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {incomeCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">來源</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：家長會捐贈"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <Link
              href="/dashboard/apple/finance"
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
