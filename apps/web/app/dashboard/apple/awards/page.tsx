'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate, awardTypeLabels, awardStatusLabels } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
} from 'lucide-react';

interface Award {
  id: string;
  title: string;
  award_type: string;
  academic_year: string;
  semester: number;
  status: string;
  total_recipients: number;
  ceremony_date?: string;
}

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filteredAwards = awards.filter((award) => {
    const matchesSearch = award.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || award.award_type === filterType;
    const matchesStatus = !filterStatus || award.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      <Topbar 
        title="獎項管理"
        breadcrumbs={[
          { name: 'Apple 子系統', href: '/dashboard/apple' },
          { name: '獎項管理' },
        ]}
      />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">獎項列表</h2>
            <p className="text-sm text-gray-500 mt-1">管理所有獎項和獎學金</p>
          </div>
          <Link
            href="/dashboard/apple/awards/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            新增獎項
          </Link>
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
              <option value="academic">學業獎</option>
              <option value="conduct">品行獎</option>
              <option value="service">服務獎</option>
              <option value="sports">體育獎</option>
              <option value="art">藝術獎</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部狀態</option>
              <option value="draft">草稿</option>
              <option value="pending">待審批</option>
              <option value="approved">已審批</option>
              <option value="published">已發布</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  頒獎日期
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAwards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {loading ? '加載中...' : '暫無獎項記錄'}
                  </td>
                </tr>
              ) : (
                filteredAwards.map((award) => (
                  <tr key={award.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/apple/awards/${award.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {award.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                        {awardTypeLabels[award.award_type] || award.award_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {award.academic_year} 第{award.semester}學期
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {award.total_recipients || 0} 人
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        award.status === 'published' ? 'bg-green-100 text-green-700' :
                        award.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        award.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {awardStatusLabels[award.status] || award.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {award.ceremony_date ? formatDate(award.ceremony_date) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/apple/awards/${award.id}`}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/apple/awards/${award.id}/edit`}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="編輯"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="刪除"
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
    </>
  );
}
