'use client';

import { useState, useEffect, useCallback } from 'react';
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
  FileSpreadsheet,
  DollarSign,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { api } from '@/lib/api';
import { awardTypeLabel, awardStatusLabel, awardStatusLabels } from '@/lib/utils';

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

const statusStyle: Record<string, { bg: string; color: string }> = {
  draft: { bg: 'var(--panel-soft)', color: 'var(--muted)' },
  pending: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  pending_approval: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  approved: { bg: 'var(--brand-light)', color: 'var(--brand-text)' },
  published: { bg: 'var(--good-bg)', color: 'var(--good)' },
  archived: { bg: 'var(--muted-bg)', color: 'var(--muted)' },
};

const awardTypes = [
  { value: 'academic', label: '學業獎' },
  { value: 'conduct', label: '品行獎' },
  { value: 'service', label: '服務獎' },
  { value: 'sports', label: '體育獎' },
  { value: 'art', label: '藝術獎' },
  { value: 'other', label: '其他獎' },
];

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAwards({ page: 1, page_size: 100 });
      setAwards((res.data?.items as Award[]) || []);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredAwards = awards.filter((award) => {
    const matchesSearch = award.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || award.award_type === filterType;
    const matchesStatus = !filterStatus || award.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (filteredAwards.length === 0) {
      alert('沒有可導出的數據');
      return;
    }

    const exportData = filteredAwards.map((award, index) => ({
      '序號': index + 1,
      '獎項名稱': award.name,
      '類型': awardTypeLabel(award.award_type),
      '學年': award.academic_year,
      '學期': award.semester || '-',
      '獎金金額': award.amount ?? 0,
      '狀態': awardStatusLabel(award.status),
      '創建日期': (award.created_at || '').slice(0, 10),
    }));

    const escapeCSV = (value: string | number): string => {
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    if (format === 'csv') {
      const headers = Object.keys(exportData[0]).map(escapeCSV).join(',');
      const rows = exportData.map((row) =>
        Object.values(row).map(escapeCSV).join(',')
      ).join('\n');
      const csvContent = `\uFEFF${headers}\n${rows}`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `獎項列表_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } else if (format === 'excel') {
      const wsData = [
        ['序號', '獎項名稱', '類型', '學年', '學期', '獎金金額', '狀態', '創建日期'],
        ...exportData.map((row) => [
          row['序號'],
          row['獎項名稱'],
          row['類型'],
          row['學年'],
          row['學期'],
          row['獎金金額'],
          row['狀態'],
          row['創建日期'],
        ]),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [
        { wch: 6 }, { wch: 20 }, { wch: 10 }, { wch: 12 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, '獎項列表');
      const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `獎項列表_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } else if (format === 'pdf') {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '20px';
      container.style.width = '1100px';
      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8b4513; font-size: 24px; margin: 0;">獎項列表</h1>
          <p style="color: #666; font-size: 10px;">香港培英中學 | 共 ${exportData.length} 項記錄</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background-color: #e8e8e8;">
              <th style="border: 1px solid #ddd; padding: 8px;">序號</th>
              <th style="border: 1px solid #ddd; padding: 8px;">獎項名稱</th>
              <th style="border: 1px solid #ddd; padding: 8px;">類型</th>
              <th style="border: 1px solid #ddd; padding: 8px;">學年</th>
              <th style="border: 1px solid #ddd; padding: 8px;">學期</th>
              <th style="border: 1px solid #ddd; padding: 8px;">人數</th>
              <th style="border: 1px solid #ddd; padding: 8px;">狀態</th>
            </tr>
          </thead>
          <tbody>
            ${exportData.map((row, idx) => `
              <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row['序號']}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${row['獎項名稱']}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row['類型']}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row['學年']}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row['學期']}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row['獎金金額']}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row['狀態']}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
      document.body.appendChild(container);
      import('html2canvas').then((html2canvas) => {
        html2canvas.default(container, { scale: 2, useCORS: true }).then((canvas) => {
          document.body.removeChild(container);
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height + 40] });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`獎項列表_${new Date().toISOString().split('T')[0]}.pdf`);
        }).catch(() => {
          document.body.removeChild(container);
          alert('PDF 生成失敗，請稍後再試');
        });
      }).catch(() => {
        document.body.removeChild(container);
        alert('PDF 庫加載失敗，請稍後再試');
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個獎項嗎？')) return;
    try {
      await api.deleteAward(id);
      setAwards(awards.filter((a) => a.id !== id));
    } catch (e: any) {
      alert(e.message || '刪除失敗');
    }
  };

  return (
    <>
      <Topbar title="獎項管理" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>獎項列表</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>管理所有獎項和獎學金</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-90"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)', color: 'var(--text)' }}
              >
                <Download className="w-4 h-4" />
                導出報表
              </button>
              {showExportMenu && (
                <div
                  className="absolute right-0 mt-2 w-40 rounded-md shadow-lg z-10"
                  style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}
                >
                  <div className="py-1">
                    <button onClick={() => { handleExport('csv'); setShowExportMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:opacity-80 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                      <FileSpreadsheet className="w-4 h-4" /> CSV 格式
                    </button>
                    <button onClick={() => { handleExport('excel'); setShowExportMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:opacity-80 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                      <FileSpreadsheet className="w-4 h-4" /> Excel 格式
                    </button>
                    <button onClick={() => { handleExport('pdf'); setShowExportMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:opacity-80 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                      <FileText className="w-4 h-4" /> PDF 格式
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link href="/dashboard/apple/awards/generate" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-90" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)', color: 'var(--text)' }}>
              <FileText className="w-4 h-4" />
              批量生成
            </Link>
            <Link href="/dashboard/apple/awards/students" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-90" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)', color: 'var(--text)' }}>
              <DollarSign className="w-4 h-4" />
              學生獎金
            </Link>
            <button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: 'var(--brand)' }}>
              <Plus className="w-4 h-4" />
              新增獎項
            </button>
          </div>
        </div>

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
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}>
              <option value="">全部類型</option>
              {awardTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}>
              <option value="">全部狀態</option>
              {Object.entries(awardStatusLabels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
            </select>
          </div>
        </div>

        {error && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>{error}</div>}

        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>獎項名稱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>類型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>年度/學期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>獎金</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>狀態</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>操作</th>
                </tr>
              </thead>
              <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'var(--muted)' }}>載入中...</td></tr>
                ) : filteredAwards.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'var(--muted)' }}>暫無獎項記錄</td></tr>
                ) : (
                  filteredAwards.map((award) => (
                    <tr key={award.id} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{award.name}</div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>創建於 {(award.created_at || '').slice(0, 10)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text)' }}>{awardTypeLabel(award.award_type)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: 'var(--text)' }}>{award.academic_year}</div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>{award.semester || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text)' }}>{award.amount != null ? `HK$ ${award.amount}` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={statusStyle[award.status] || statusStyle.draft}>
                          {awardStatusLabel(award.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/apple/awards/${award.id}`} className="p-2 rounded-md hover:opacity-70" style={{ color: 'var(--brand)' }}><Eye className="w-4 h-4" /></Link>
                          <button onClick={() => setEditingAward(award)} className="p-2 rounded-md hover:opacity-70" style={{ color: 'var(--brand)' }}><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(award.id)} className="p-2 rounded-md hover:opacity-70" style={{ color: 'var(--danger)' }}><Trash2 className="w-4 h-4" /></button>
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

      {(showCreateDialog || editingAward) && (
        <AwardDialog
          award={editingAward}
          onClose={() => { setShowCreateDialog(false); setEditingAward(null); }}
          onSaved={() => { setShowCreateDialog(false); setEditingAward(null); load(); }}
        />
      )}
    </>
  );
}

function AwardDialog({
  award,
  onClose,
  onSaved,
}: {
  award: Award | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState({
    name: award?.name || '',
    award_type: award?.award_type || 'academic',
    academic_year: award?.academic_year || '2025-2026',
    semester: award?.semester || '上學期',
    status: award?.status || 'draft',
    description: award?.description || '',
    amount: award?.amount != null ? String(award.amount) : '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: formData.name,
      award_type: formData.award_type,
      academic_year: formData.academic_year,
      semester: formData.semester,
      description: formData.description,
      status: formData.status,
      amount: formData.amount ? Number(formData.amount) : null,
    };
    try {
      if (award) {
        await api.updateAward(award.id, payload);
      } else {
        await api.createAward(payload);
      }
      onSaved();
    } catch (e: any) {
      alert(e.message || '保存失敗');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderWidth: '1px', borderStyle: 'solid',
    borderColor: 'var(--border)', borderRadius: '6px', backgroundColor: 'var(--panel)', color: 'var(--text)', outline: 'none',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--panel)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>{award ? '編輯獎項' : '新增獎項'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>獎項名稱 *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={inputStyle} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>獎項類型 *</label>
            <select value={formData.award_type} onChange={(e) => setFormData({ ...formData, award_type: e.target.value })} style={inputStyle}>
              {awardTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>學年 *</label>
              <select value={formData.academic_year} onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })} style={inputStyle}>
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>學期 *</label>
              <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} style={inputStyle}>
                <option value="上學期">上學期</option>
                <option value="下學期">下學期</option>
                <option value="全學年">全學年</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>獎金金額 (HKD)</label>
              <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} style={inputStyle} placeholder="選填" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>狀態 *</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={inputStyle}>
                {Object.entries(awardStatusLabels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>備註</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:opacity-80" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>取消</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--brand)' }}>{saving ? '保存中...' : '保存'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
