'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filteredAwards = awards.filter((award) => {
    const matchesSearch = award.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || award.type === filterType;
    const matchesStatus = !filterStatus || award.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    // Generate export data
    if (filteredAwards.length === 0) {
      alert('沒有可導出的數據');
      return;
    }
    
    const exportData = filteredAwards.map((award, index) => ({
      '序號': index + 1,
      '獎項名稱': award.name,
      '類型': awardTypes.find((t) => t.value === award.type)?.label || award.type,
      '學年': award.academic_year,
      '學期': award.semester,
      '獲獎人數': award.total_recipients,
      '狀態': statusMap[award.status as keyof typeof statusMap]?.label || award.status,
      '創建日期': award.created_at,
    }));

    // Helper function to escape CSV values
    const escapeCSV = (value: string | number): string => {
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    if (format === 'csv') {
      // Export as CSV
      const headers = Object.keys(exportData[0]).map(escapeCSV).join(',');
      const rows = exportData.map(row => 
        Object.values(row).map(escapeCSV).join(',')
      ).join('\n');
      const csvContent = `\uFEFF${headers}\n${rows}`; // BOM for Excel UTF-8
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `獎項列表_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } else if (format === 'excel') {
      // Export as proper XLSX using SheetJS library
      // Convert data to worksheet format
      const wsData = [
        ['序號', '獎項名稱', '類型', '學年', '學期', '獎金金額', '狀態', '創建日期'],
        ...exportData.map(row => [
          row['序號'],
          row['獎項名稱'],
          row['類型'],
          row['學年'],
          row['學期'],
          row['獲獎人數'],
          row['狀態'],
          row['創建日期'],
        ])
      ];
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Set column widths for better readability
      ws['!cols'] = [
        { wch: 6 },   // 序號
        { wch: 20 },  // 獎項名稱
        { wch: 10 },  // 類型
        { wch: 12 },  // 學年
        { wch: 10 },  // 學期
        { wch: 10 },  // 獎金金額
        { wch: 10 },  // 狀態
        { wch: 12 },  // 創建日期
      ];
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, '獎項列表');
      
      // Generate XLSX file and download
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
      // Generate actual PDF using jsPDF
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      // Set font for Chinese support (use built-in font)
      doc.setFont('helvetica');
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(139, 69, 19); // Brown color
      doc.text('獎項列表', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // School name
      doc.setFontSize(12);
      doc.setTextColor(102, 102, 102);
      doc.text('香港培英中學', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      
      // Info line
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const year = new Date().getFullYear();
      doc.text(`學年: ${year}-${year + 1}  |  導出日期: ${new Date().toLocaleDateString('zh-HK')}  |  共 ${exportData.length} 項記錄`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
      
      // Prepare table data for autotable
      const tableData = exportData.map(row => [
        row['序號'],
        row['獎項名稱'],
        row['類型'],
        row['學年'],
        row['學期'],
        row['獲獎人數'],
        row['狀態'],
      ]);
      
      // Add table using autotable
      // @ts-ignore - autotable is added via import
      doc.autoTable({
        head: [['序號', '獎項名稱', '類型', '學年', '學期', '人數', '狀態']],
        body: tableData,
        startY: 35,
        theme: 'striped',
        headStyles: {
          fillColor: [232, 232, 232],
          textColor: [51, 51, 51],
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          textColor: [51, 51, 51],
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { cellWidth: 50 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'center', cellWidth: 20 },
          5: { halign: 'center', cellWidth: 15 },
          6: { halign: 'center', cellWidth: 20 },
        },
        margin: { left: 15, right: 15 },
      });
      
      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('獎項列表導出 · 香港培英中學AI管理系統', doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
      
      // Save PDF
      doc.save(`獎項列表_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

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
            {/* Export Dropdown */}
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
                    <button
                      onClick={() => { handleExport('csv'); setShowExportMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:opacity-80 flex items-center gap-2"
                      style={{ color: 'var(--text)' }}
                    >
                      <FileSpreadsheet className="w-4 h-4" /> CSV 格式
                    </button>
                    <button
                      onClick={() => { handleExport('excel'); setShowExportMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:opacity-80 flex items-center gap-2"
                      style={{ color: 'var(--text)' }}
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Excel 格式
                    </button>
                    <button
                      onClick={() => { handleExport('pdf'); setShowExportMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:opacity-80 flex items-center gap-2"
                      style={{ color: 'var(--text)' }}
                    >
                      <FileText className="w-4 h-4" /> PDF 格式
                    </button>
                  </div>
                </div>
              )}
            </div>
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
