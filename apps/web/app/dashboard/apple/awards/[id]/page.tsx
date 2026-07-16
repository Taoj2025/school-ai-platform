'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Edit, FileText, Download, User, Check } from 'lucide-react';

// Mock award data
const mockAward = {
  id: '1',
  name: '學業優異獎',
  type: 'academic',
  academic_year: '2025-2026',
  semester: '上學期',
  total_recipients: 45,
  status: 'published',
  created_at: '2025-09-01',
  description: '表彰學期內學業成績優異的學生',
};

const mockRecipients = [
  { id: '1', name: '陳小明', class: '1A', student_no: '2025001', score: 95 },
  { id: '2', name: '李美美', class: '1A', student_no: '2025002', score: 94 },
  { id: '3', name: '張大文', class: '1B', student_no: '2025003', score: 93 },
  { id: '4', name: '王小红', class: '1B', student_no: '2025004', score: 92 },
  { id: '5', name: '劉志偉', class: '2A', student_no: '2024001', score: 91 },
];

const statusMap = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700' },
  pending: { label: '待審批', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已審批', color: 'bg-blue-100 text-blue-700' },
  published: { label: '已發布', color: 'bg-green-100 text-green-700' },
};

export default function AwardDetailPage({ params }: { params: { id: string } }) {
  const [award, setAward] = useState(mockAward);
  const [recipients] = useState(mockRecipients);
  const [generating, setGenerating] = useState(false);
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);

  const handleGenerateCertificates = (studentIds: string[]) => {
    setGenerating(true);
    setTimeout(() => {
      setGeneratedIds(studentIds);
      setGenerating(false);
    }, 1500);
  };

  const handleDownload = (studentId: string) => {
    alert(`下載獎狀: ${studentId}`);
  };

  const handleDownloadAll = () => {
    alert('下載全部獎狀');
  };

  return (
    <>
      <Topbar title="獎項詳情" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/apple/awards"
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{award.name}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[award.status as keyof typeof statusMap].color}`}>
                  {statusMap[award.status as keyof typeof statusMap].label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {award.academic_year} · {award.semester}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/apple/awards/${award.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
              編輯
            </Link>
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Download className="w-4 h-4" />
              下載全部
            </button>
          </div>
        </div>

        {/* Award Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">獎項信息</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">獎項類型</p>
              <p className="text-sm font-medium text-gray-900">
                {award.type === 'academic' ? '學業獎' :
                 award.type === 'conduct' ? '品行獎' :
                 award.type === 'service' ? '服務獎' :
                 award.type === 'sports' ? '體育獎' : '藝術獎'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">學年</p>
              <p className="text-sm font-medium text-gray-900">{award.academic_year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">學期</p>
              <p className="text-sm font-medium text-gray-900">{award.semester}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">獲獎人數</p>
              <p className="text-sm font-medium text-gray-900">{award.total_recipients} 人</p>
            </div>
          </div>
          {award.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">備註</p>
              <p className="text-sm text-gray-900">{award.description}</p>
            </div>
          )}
        </div>

        {/* Recipients */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold">獲獎學生列表</h3>
            <button
              onClick={() => handleGenerateCertificates(recipients.map((r) => r.id))}
              disabled={generating || generatedIds.length === recipients.length}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              {generating ? '生成中...' : '生成獎狀'}
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  學號
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  姓名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  班別
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  成績
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recipients.map((recipient) => (
                <tr key={recipient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recipient.student_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{recipient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {recipient.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {recipient.score} 分
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {generatedIds.includes(recipient.id) ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <Check className="w-4 h-4" />
                          已生成
                        </span>
                        <button
                          onClick={() => handleDownload(recipient.id)}
                          className="p-2 text-gray-500 hover:text-primary-600 rounded-md hover:bg-gray-100"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerateCertificates([recipient.id])}
                        disabled={generating}
                        className="p-2 text-gray-500 hover:text-primary-600 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
