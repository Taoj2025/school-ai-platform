'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Edit, FileText, Download, User, Check, List } from 'lucide-react';
import { api } from '@/lib/api';
import { useAIGlobal } from '@/lib/ai-context';
import { awardTypeLabel, awardStatusLabel } from '@/lib/utils';
import AwardsScriptDialog from '@/components/modules/apple/AwardsScriptDialog';

interface Award {
  id: string;
  name: string;
  award_type: string;
  academic_year: string;
  semester?: string;
  amount?: number | null;
  status: string;
  description?: string;
  created_at: string;
}

interface Recipient {
  id: string;
  student_id: string;
  student_name: string;
  class_name?: string;
  reason?: string;
  amount?: number | null;
  status: string;
}

export default function AwardDetailPage() {
  const params = useParams();
  const id = params.id as string;
  useAIGlobal('awards', '獎項詳情');
  const [award, setAward] = useState<Award | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [showScriptDialog, setShowScriptDialog] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [awardRes, recRes] = await Promise.all([
        api.getAward(id),
        api.getAwardRecipients(id),
      ]);
      setAward((awardRes.data as Award) || null);
      setRecipients((recRes.data?.items as Recipient[]) || []);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleGenerateCertificates = async (studentIds: string[]) => {
    setGenerating(true);
    try {
      await api.generateCertificates(id, studentIds);
      setGeneratedIds((prev) => Array.from(new Set([...prev, ...studentIds])));
    } catch (e: any) {
      alert(e.message || '生成失敗');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (studentId: string) => {
    alert(`下載獎狀: ${studentId}`);
  };

  const handleDownloadAll = () => {
    alert('下載全部獎狀');
  };

  if (loading) {
    return (<><Topbar title="獎項詳情" /><div className="p-6 flex items-center justify-center min-h-[400px]"><p className="text-gray-500">載入中...</p></div></>);
  }

  if (!award) {
    return (<><Topbar title="獎項詳情" /><div className="p-6"><p className="text-red-600">{error || '找不到獎項'}</p><Link href="/dashboard/apple/awards" className="text-sm text-primary-600">返回列表</Link></div></>);
  }

  return (
    <>
      <Topbar title="獎項詳情" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/apple/awards" className="p-2 rounded-md hover:opacity-70 text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{award.name}</h2>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-700">
                  {awardStatusLabel(award.status)}
                </span>
              </div>
              <p className="text-sm mt-1 text-gray-500">{award.academic_year} · {award.semester || '-'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowScriptDialog(true)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80 border-gray-200 text-gray-900">
              <List className="w-4 h-4" /> 制作讀稿
            </button>
            <Link href={`/dashboard/apple/awards/${award.id}/edit`} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80 border-gray-200 text-gray-900">
              <Edit className="w-4 h-4" /> 編輯
            </Link>
            <button onClick={handleDownloadAll} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 bg-primary-600">
              <Download className="w-4 h-4" /> 下載全部
            </button>
          </div>
        </div>

        <div className="rounded-lg p-6 bg-white border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">獎項信息</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">獎項類型</p>
              <p className="text-sm font-medium text-gray-900">{awardTypeLabel(award.award_type)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">學年</p>
              <p className="text-sm font-medium text-gray-900">{award.academic_year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">學期</p>
              <p className="text-sm font-medium text-gray-900">{award.semester || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">獎金</p>
              <p className="text-sm font-medium text-gray-900">{award.amount != null ? `HK$ ${award.amount}` : '-'}</p>
            </div>
          </div>
          {award.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">備註</p>
              <p className="text-sm text-gray-900">{award.description}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg overflow-hidden bg-white border border-gray-200">
          <div className="p-4 flex items-center justify-between border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">獲獎學生列表 ({recipients.length})</h3>
            <button
              onClick={() => handleGenerateCertificates(recipients.map((r) => r.id))}
              disabled={generating || recipients.length === 0 || generatedIds.length === recipients.length}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 bg-primary-600"
            >
              <FileText className="w-4 h-4" />
              {generating ? '生成中...' : '生成獎狀'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">班別</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">理由</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">狀態</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="border-t border-gray-200">
                {recipients.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">暫無獲獎學生</td></tr>
                ) : (
                  recipients.map((recipient) => (
                    <tr key={recipient.id} className="hover:opacity-80 border-b border-gray-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-50 text-primary-600"><User className="w-4 h-4" /></div>
                          <span className="text-sm font-medium text-gray-900">{recipient.student_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recipient.class_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{recipient.reason || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recipient.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {generatedIds.includes(recipient.id) ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="flex items-center gap-1 text-sm text-green-600"><Check className="w-4 h-4" /> 已生成</span>
                            <button onClick={() => handleDownload(recipient.id)} className="p-2 rounded-md hover:opacity-70 text-primary-600"><Download className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => handleGenerateCertificates([recipient.id])} disabled={generating} className="p-2 rounded-md hover:opacity-70 disabled:opacity-50 text-primary-600"><FileText className="w-4 h-4" /></button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AwardsScriptDialog
          isOpen={showScriptDialog}
          onClose={() => setShowScriptDialog(false)}
          awardName={award.name}
          recipients={recipients.map((r) => ({ name: r.student_name, class: r.class_name || '', student_no: '' }))}
        />
      </div>
    </>
  );
}
