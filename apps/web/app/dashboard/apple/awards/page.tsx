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
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>獎項列表</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>管理所有獎項和獎學金</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/apple/awards/generate"
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-90"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)', color: 'var(--text)' }}
            >
              <FileText className="w-4 h-4" />
              批量生成
            </Link>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Plus className="w-4 h-4" />
              新增獎項
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
              <input
                type="search"
                placeholder="搜索獎項名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}
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
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}
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
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    獎項名稱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    類型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    年度/學期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    獲獎人數
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    狀態
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                {filteredAwards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'var(--muted)' }}>
                      暫無獎項記錄
                    </td>
                  </tr>
                ) : (
                  filteredAwards.map((award) => (
                    <tr key={award.id} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{award.name}</div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>創建於 {award.created_at}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm" style={{ color: 'var(--text)' }}>
                          {awardTypes.find((t) => t.value === award.type)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: 'var(--text)' }}>{award.academic_year}</div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>{award.semester}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text)' }}>
                        {award.total_recipients} 人
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}>
                          {statusMap[award.status as keyof typeof statusMap].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/apple/awards/${award.id}`}
                            className="p-2 rounded-md hover:opacity-70"
                            style={{ color: 'var(--brand)' }}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setEditingAward(award)}
                            className="p-2 rounded-md hover:opacity-70"
                            style={{ color: 'var(--brand)' }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(award.id)}
                            className="p-2 rounded-md hover:opacity-70"
                            style={{ color: 'var(--danger)' }}
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--panel)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
          {award ? '編輯獎項' : '新增獎項'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              獎項名稱
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              獎項類型
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={inputStyle}
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
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                學年
              </label>
              <select
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                style={inputStyle}
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                學期
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                style={inputStyle}
              >
                <option value="上學期">上學期</option>
                <option value="下學期">下學期</option>
                <option value="全學年">全學年</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              狀態
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={inputStyle}
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
              className="px-4 py-2 border rounded-md hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-md hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
