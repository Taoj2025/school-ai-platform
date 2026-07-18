'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  User,
  Award,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api';
import * as XLSX from 'xlsx';

const paymentStatusMap: Record<string, { label: string; color: string; bgColor: string }> = {
  nominated: { label: '已提名', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
  pending: { label: '待發放', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
  issued: { label: '已發放', color: 'var(--good)', bgColor: 'var(--good-bg)' },
  paid: { label: '已發放', color: 'var(--good)', bgColor: 'var(--good-bg)' },
  cancelled: { label: '已取消', color: 'var(--danger)', bgColor: 'var(--danger-bg)' },
};

type Recipient = {
  id: string;
  award_id: string;
  student_id: string;
  student_name: string | null;
  class_name: string | null;
  amount: number | null;
  status: string;
  reason: string | null;
  award_name: string;
  award_type: string;
  created_at: string;
};

export default function StudentBountyPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAward, setFilterAward] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const awardsRes = await api.getAwards({ page: 1, page_size: 200 });
      const awards = (awardsRes.data?.items ?? []) as any[];
      const nameById: Record<string, { name: string; type: string }> = {};
      awards.forEach((a) => { nameById[a.id] = { name: a.name, type: a.type || 'other' }; });

      const lists = await Promise.all(
        awards.map((a) => api.getAwardRecipients(a.id).then((r: any) => r.data?.items ?? []))
      );
      const merged: Recipient[] = [];
      lists.forEach((items: any[], idx: number) => {
        const aw = awards[idx];
        items.forEach((r: any) => {
          merged.push({
            id: r.id,
            award_id: r.award_id,
            student_id: r.student_id,
            student_name: r.student_name,
            class_name: r.class_name,
            amount: r.amount,
            status: r.status,
            reason: r.reason,
            award_name: nameById[r.award_id]?.name ?? aw.name,
            award_type: nameById[r.award_id]?.type ?? aw.type ?? 'other',
            created_at: r.created_at,
          });
        });
      });
      setRecipients(merged);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = recipients.filter((a) => {
    const matchesSearch =
      (a.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.award_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAward = !filterAward || a.award_name === filterAward;
    const matchesStatus = !filterStatus || a.status === filterStatus;
    return matchesSearch && matchesAward && matchesStatus;
  });

  const stats = {
    total: recipients.length,
    totalAmount: recipients.reduce((sum, a) => sum + (a.amount || 0), 0),
    paidAmount: recipients.filter((a) => a.status === 'issued' || a.status === 'paid').reduce((sum, a) => sum + (a.amount || 0), 0),
    pendingAmount: recipients.filter((a) => a.status !== 'issued' && a.status !== 'paid').reduce((sum, a) => sum + (a.amount || 0), 0),
    studentCount: new Set(recipients.map((a) => a.student_id)).size,
  };

  const handleDelete = async (id: string, awardId: string, name: string) => {
    if (confirm(`確定要刪除「${name}」的獎項記錄嗎？`)) {
      try {
        await api.deleteAwardRecipient(awardId, id);
        load();
      } catch (e: any) {
        alert(e.message || '刪除失敗');
      }
    }
  };

  const handleExportExcel = () => {
    if (filtered.length === 0) {
      alert('沒有可導出的數據');
      return;
    }
    const wsData = [
      ['序號', '學生姓名', '班別', '獎項名稱', '獎金金額 (HKD)', '狀態', '建立日期'],
      ...filtered.map((a, idx) => [
        idx + 1,
        a.student_name || '',
        a.class_name || '',
        a.award_name,
        a.amount || 0,
        paymentStatusMap[a.status]?.label || a.status,
        (a.created_at || '').slice(0, 10),
      ]),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, '學生獎金記錄');
    const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `學生獎金記錄_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const formatCurrency = (amount: number) => `HK$ ${amount.toLocaleString('zh-HK')}`;
  const uniqueAwards = Array.from(new Set(recipients.map((a) => a.award_name)));

  if (loading) {
    return (
      <>
        <Topbar title="學生獎金管理" />
        <div className="p-6 flex items-center justify-center" style={{ minHeight: '400px' }}>
          <p style={{ color: 'var(--muted)' }}>載入中...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="學生獎金管理" />
      <div className="p-6 space-y-6">
        {error && (
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>學生獎金記錄</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              管理每位學生獲得的獎項及對應的獎金金額（香港培英中學）
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-90"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)', color: 'var(--text)' }}
            >
              <Download className="w-4 h-4" />
              導出 Excel
            </button>
            <Link
              href="/dashboard/apple/awards/students/new"
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Plus className="w-4 h-4" />
              新增獎金記錄
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>總記錄數</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}>
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>涵蓋 {stats.studentCount} 位學生</p>
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>獎金總額</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--good-bg)', color: 'var(--good)' }}>
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>所有獎項合計</p>
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>已發放</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--good)' }}>{formatCurrency(stats.paidAmount)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--good-bg)', color: 'var(--good)' }}>
                <Award className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>已支付給學生</p>
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>待發放</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--warning)' }}>{formatCurrency(stats.pendingAmount)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
                <User className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>待處理金額</p>
          </div>
        </div>

        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
              <input
                type="search"
                placeholder="搜索學生姓名 / 學號 / 獎項..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-md focus:outline-none"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}
              />
            </div>
            <select
              value={filterAward}
              onChange={(e) => setFilterAward(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}
            >
              <option value="">全部獎項</option>
              {uniqueAwards.map((award) => (
                <option key={award} value={award}>{award}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}
            >
              <option value="">全部狀態</option>
              {Object.entries(paymentStatusMap).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>學生</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>獎項</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>獎金金額</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>狀態</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>建立日期</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>操作</th>
                </tr>
              </thead>
              <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'var(--muted)' }}>暫無獎金記錄</td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}>
                            {(r.student_name || '?').charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{r.student_name || r.student_id}</div>
                            <div className="text-xs" style={{ color: 'var(--muted)' }}>{r.class_name || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{r.award_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(r.amount || 0)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: paymentStatusMap[r.status]?.bgColor, color: paymentStatusMap[r.status]?.color }}>
                          {paymentStatusMap[r.status]?.label || r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text)' }}>
                        {(r.created_at || '').slice(0, 10)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/apple/awards/students/${r.id}/edit`} className="p-2 rounded-md hover:opacity-70" style={{ color: 'var(--brand)' }}>
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(r.id, r.award_id, r.student_name || '記錄')} className="p-2 rounded-md hover:opacity-70" style={{ color: 'var(--danger)' }}>
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

        {recipients.length > 0 && (
          <div className="text-center text-sm" style={{ color: 'var(--muted)' }}>
            共 {filtered.length} 條記錄{filtered.length !== recipients.length && ` (篩選自 ${recipients.length} 條)`}
          </div>
        )}
      </div>
    </>
  );
}
