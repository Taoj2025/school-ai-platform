'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  Download,
} from 'lucide-react';

// Mock data for awards
const mockAwards = [
  {
    id: '1',
    name: '學業優異獎',
    type: 'academic',
    academic_year: '2025-2026',
    semester: '上學期',
    total_recipients: 45,
    status: 'published',
    created_at: '2025-09-01',
  },
  {
    id: '2',
    name: '品行優良獎',
    type: 'conduct',
    academic_year: '2025-2026',
    semester: '上學期',
    total_recipients: 30,
    status: 'draft',
    created_at: '2025-09-05',
  },
  {
    id: '3',
    name: '服務精神獎',
    type: 'service',
    academic_year: '2025-2026',
    semester: '全學年',
    total_recipients: 20,
    status: 'pending',
    created_at: '2025-09-10',
  },
];

const awardTypes = [
  { value: 'academic', label: '學業獎' },
  { value: 'conduct', label: '品行獎' },
  { value: 'service', label: '服務獎' },
  { value: 'sports', label: '體育獎' },
  { value: 'art', label: '藝術獎' },
];

const statusMap = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700' },
  pending: { label: '待審批', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已審批', color: 'bg-blue-100 text-blue-700' },
  published: { label: '已發布', color: 'bg-green-100 text-green-700' },
};

export default function AwardsPage() {
  const [awards, setAwards] = useState(mockAwards);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAward, setEditingAward] = useState<typeof mockAwards[0] | null>(null);

  const filteredAwards = awards.filter((award) => {
    const matchesSearch = award.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || award.type === filterType;
    const matchesStatus = !filterStatus || award.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這個獎項嗎？')) {
      setAwards(awards.filter((a) => a.id !== id));
    }
  };

  return (
    <>
      <Topbar title="獎項管理" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">獎項列表</h2>
            <p className="text-sm text-gray-500 mt-1">管理所有獎項和獎學金</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/apple/awards/generate"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FileText className="w-4 h-4" />
              批量生成
            </Link>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              新增獎項
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="搜索獎項名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部類型</option>
              {awardTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部狀態</option>
              {Object.entries(statusMap).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Awards Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  獎項名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  年度/學期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  獲獎人數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAwards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    暫無獎項記錄
                  </td>
                </tr>
              ) : (
                filteredAwards.map((award) => (
                  <tr key={award.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{award.name}</div>
                      <div className="text-xs text-gray-500">創建於 {award.created_at}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {awardTypes.find((t) => t.value === award.type)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{award.academic_year}</div>
                      <div className="text-xs text-gray-500">{award.semester}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {award.total_recipients} 人
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[award.status as keyof typeof statusMap].color}`}>
                        {statusMap[award.status as keyof typeof statusMap].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/apple/awards/${award.id}`}
                          className="p-2 text-gray-500 hover:text-primary-600 rounded-md hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setEditingAward(award)}
                          className="p-2 text-gray-500 hover:text-primary-600 rounded-md hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(award.id)}
                          className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {(showCreateDialog || editingAward) && (
        <AwardDialog
          award={editingAward}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingAward(null);
          }}
          onSave={(award) => {
            if (editingAward) {
              setAwards(awards.map((a) => (a.id === award.id ? award : a)));
            } else {
              setAwards([...awards, { ...award, id: String(Date.now()) }]);
            }
            setShowCreateDialog(false);
            setEditingAward(null);
          }}
        />
      )}
    </>
  );
}

function AwardDialog({
  award,
  onClose,
  onSave,
}: {
  award: typeof mockAwards[0] | null;
  onClose: () => void;
  onSave: (award: typeof mockAwards[0]) => void;
}) {
  const [formData, setFormData] = useState({
    name: award?.name || '',
    type: award?.type || 'academic',
    academic_year: award?.academic_year || '2025-2026',
    semester: award?.semester || '上學期',
    status: award?.status || 'draft',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...award!,
      ...formData,
      created_at: award?.created_at || new Date().toISOString().split('T')[0],
      total_recipients: award?.total_recipients || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {award ? '編輯獎項' : '新增獎項'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              獎項名稱
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              獎項類型
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                學年
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                學期
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              狀態
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(statusMap).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
