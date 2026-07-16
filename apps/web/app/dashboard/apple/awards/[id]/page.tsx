'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Edit, FileText, Download, User, Check, List } from 'lucide-react';
import AwardsScriptDialog from '@/components/modules/apple/AwardsScriptDialog';

// Mock award data - in production this would come from API
const mockAwardDetails: Record<string, typeof mockAward> = {
  '1': {
    id: '1',
    name: '學業優異獎',
    type: 'academic',
    academic_year: '2025-2026',
    semester: '上學期',
    total_recipients: 45,
    status: 'published',
    created_at: '2025-09-01',
    description: '表彰學期內學業成績優異的學生',
  },
  '2': {
    id: '2',
    name: '體育表現獎',
    type: 'sports',
    academic_year: '2025-2026',
    semester: '上學期',
    total_recipients: 20,
    status: 'draft',
    created_at: '2025-10-01',
    description: '表彰在體育方面表現出色的學生',
  },
  '3': {
    id: '3',
    name: '服務獎',
    type: 'service',
    academic_year: '2025-2026',
    semester: '上學期',
    total_recipients: 15,
    status: 'published',
    created_at: '2025-08-15',
    description: '表彰積極參與學校服務的學生',
  },
};

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

export default function AwardDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [award, setAward] = useState(mockAward);
  const [recipients, setRecipients] = useState(mockRecipients);
  const [generating, setGenerating] = useState(false);
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [showScriptDialog, setShowScriptDialog] = useState(false);

  // Load award data based on ID
  useEffect(() => {
    if (id && mockAwardDetails[id]) {
      setAward(mockAwardDetails[id]);
    } else if (id) {
      // For other IDs, use default mock data with adjusted ID
      setAward({ ...mockAward, id });
    }
  }, [id]);

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

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return '已發布';
      case 'draft': return '草稿';
      case 'archived': return '已歸檔';
      default: return status;
    }
  };

  // Get status color
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'published':
        return { backgroundColor: 'var(--good-bg)', color: 'var(--good)' };
      case 'draft':
        return { backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' };
      case 'archived':
        return { backgroundColor: 'var(--muted-bg)', color: 'var(--muted)' };
      default:
        return { backgroundColor: 'var(--panel-soft)', color: 'var(--text)' };
    }
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
              className="p-2 rounded-md hover:opacity-70"
              style={{ color: 'var(--muted)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{award.name}</h2>
                <span className="px-2 py-1 text-xs font-medium rounded-full"
                  style={getStatusStyle(award.status)}>
                  {getStatusLabel(award.status)}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                {award.academic_year} · {award.semester}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowScriptDialog(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <List className="w-4 h-4" />
              制作讀稿
            </button>
            <Link
              href={`/dashboard/apple/awards/${award.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <Edit className="w-4 h-4" />
              編輯
            </Link>
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Download className="w-4 h-4" />
              下載全部
            </button>
          </div>
        </div>

        {/* Award Info */}
        <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>獎項信息</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>獎項類型</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {award.type === 'academic' ? '學業獎' :
                 award.type === 'conduct' ? '品行獎' :
                 award.type === 'service' ? '服務獎' :
                 award.type === 'sports' ? '體育獎' : '藝術獎'}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>學年</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{award.academic_year}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>學期</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{award.semester}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>獲獎人數</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{award.total_recipients} 人</p>
            </div>
          </div>
          {award.description && (
            <div className="mt-4 pt-4" style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>備註</p>
              <p className="text-sm" style={{ color: 'var(--text)' }}>{award.description}</p>
            </div>
          )}
        </div>

        {/* Recipients */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="p-4 flex items-center justify-between" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>獲獎學生列表</h3>
            <button
              onClick={() => handleGenerateCertificates(recipients.map((r) => r.id))}
              disabled={generating || generatedIds.length === recipients.length}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <FileText className="w-4 h-4" />
              {generating ? '生成中...' : '生成獎狀'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    學號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    班別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    成績
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                {recipients.map((recipient) => (
                  <tr key={recipient.id} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono" style={{ color: 'var(--text)' }}>
                      {recipient.student_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}>
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{recipient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                      {recipient.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                      {recipient.score} 分
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {generatedIds.includes(recipient.id) ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--good)' }}>
                            <Check className="w-4 h-4" />
                            已生成
                          </span>
                          <button
                            onClick={() => handleDownload(recipient.id)}
                            className="p-2 rounded-md hover:opacity-70"
                            style={{ color: 'var(--brand)' }}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateCertificates([recipient.id])}
                          disabled={generating}
                          className="p-2 rounded-md hover:opacity-70 disabled:opacity-50"
                          style={{ color: 'var(--brand)' }}
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

        {/* Awards Script Dialog */}
        <AwardsScriptDialog
          isOpen={showScriptDialog}
          onClose={() => setShowScriptDialog(false)}
          awardName={award.name}
          recipients={recipients.map((r) => ({ name: r.name, class: r.class, student_no: r.student_no }))}
        />
      </div>
    </>
  );
}
