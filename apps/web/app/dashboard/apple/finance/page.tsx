'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAIGlobal } from '@/lib/ai-context';
import Topbar from '@/components/layout/Topbar';
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Camera,
} from 'lucide-react';
import UploadReceiptDialog from '@/components/modules/apple/UploadReceiptDialog';
import { api } from '@/lib/api';
import { incomeCategoryLabels, expenseCategoryLabels } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const ACADEMIC_YEAR = '2025-2026';

const incomeCategories = [
  { value: 'tuition', label: '學費' },
  { value: 'donation', label: '捐贈' },
  { value: 'event', label: '活動' },
  { value: 'other', label: '其他' },
];

const expenseCategories = [
  { value: 'salary', label: '薪資' },
  { value: 'equipment', label: '設備' },
  { value: 'maintenance', label: '維修' },
  { value: 'event', label: '活動' },
  { value: 'other', label: '其他' },
];

type FinanceRecord = {
  id: string;
  record_type: string;
  category: string;
  description: string;
  amount: number;
  transaction_date: string;
  academic_year: string;
  semester?: string | null;
  payment_method?: string | null;
  receipt_no?: string | null;
  status: string;
  source?: string;
  vendor?: string;
};

export default function FinancePage() {
  useAIGlobal('finance', '財務管理');
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'report'>('income');
  const [searchTerm, setSearchTerm] = useState('');
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showUploadReceiptDialog, setShowUploadReceiptDialog] = useState(false);
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [stats, setStats] = useState<{ total_income: number; total_expense: number; net_balance: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getIncomeRecords({ page: 1, page_size: 200, category: undefined });
      const all = [...(res.data?.items ?? [])];
      const exp = await api.getExpenseRecords({ page: 1, page_size: 200 });
      all.push(...(exp.data?.items ?? []));
      setRecords(all);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.getFinanceStats();
      const s = res.data;
      setStats({
        total_income: s?.total_income ?? 0,
        total_expense: s?.total_expense ?? 0,
        net_balance: s?.net_balance ?? 0,
      });
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    loadRecords();
    loadStats();
  }, [loadRecords, loadStats]);

  const incomeList = records.filter((r) => r.record_type === 'income');
  const expenseList = records.filter((r) => r.record_type === 'expense');

  const filteredIncome = incomeList.filter((item) =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredExpense = expenseList.filter((item) =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = stats?.total_income ?? incomeList.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = stats?.total_expense ?? expenseList.reduce((sum, i) => sum + Number(i.amount), 0);
  const balance = stats?.net_balance ?? totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = async (record: FinanceRecord) => {
    if (!confirm(`確定刪除「${record.description}」？`)) return;
    try {
      await api.deleteFinanceRecord(record.id);
      await loadRecords();
      await loadStats();
    } catch (e: any) {
      alert(e.message || '刪除失敗');
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/apple/finance?academic_year=${ACADEMIC_YEAR}&page_size=200`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const json = await res.json();
      const items = json?.data?.items ?? [];
      const csv = [
        ['日期', '類型', '描述', '類別', '金額', '狀態'],
        ...items.map((r: any) => [
          r.transaction_date,
          r.record_type === 'income' ? '收入' : '支出',
          r.description,
          r.record_type === 'income'
            ? incomeCategoryLabels[r.category] || r.category
            : expenseCategoryLabels[r.category] || r.category,
          r.amount,
          r.status,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance_${ACADEMIC_YEAR}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || '匯出失敗');
    }
  };

  return (
    <>
      <Topbar title="財務管理" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>財務概覽</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>管理收入、支出和財務統計</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)', color: 'var(--text)' }}>
              <Download className="w-4 h-4" />
              匯出報表
            </button>
            {activeTab === 'income' && (
              <button
                onClick={() => setShowUploadReceiptDialog(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)', color: 'var(--text)' }}
              >
                <Camera className="w-4 h-4" />
                OCR 識別
              </button>
            )}
            {activeTab === 'income' ? (
              <button
                onClick={() => setShowIncomeDialog(true)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                <Plus className="w-4 h-4" />
                記錄收入
              </button>
            ) : activeTab === 'expense' ? (
              <button
                onClick={() => setShowExpenseDialog(true)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                <Plus className="w-4 h-4" />
                記錄支出
              </button>
            ) : null}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--good-bg)' }}>
                <TrendingUp className="w-6 h-6" style={{ color: 'var(--good)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>總收入</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--danger-bg)' }}>
                <TrendingDown className="w-6 h-6" style={{ color: 'var(--danger)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>總支出</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(totalExpense)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--info-bg)' }}>
                <FileText className="w-6 h-6" style={{ color: 'var(--info)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>結餘</p>
                <p className="text-2xl font-bold"
                  style={{ color: balance >= 0 ? 'var(--good)' : 'var(--danger)' }}>
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="rounded-lg" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('income')}
                className="px-6 py-3 text-sm font-medium border-b-2"
                style={{
                  borderColor: activeTab === 'income' ? 'var(--brand)' : 'transparent',
                  color: activeTab === 'income' ? 'var(--brand)' : 'var(--muted)',
                }}
              >
                收入記錄 ({incomeList.length})
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className="px-6 py-3 text-sm font-medium border-b-2"
                style={{
                  borderColor: activeTab === 'expense' ? 'var(--brand)' : 'transparent',
                  color: activeTab === 'expense' ? 'var(--brand)' : 'var(--muted)',
                }}
              >
                支出記錄 ({expenseList.length})
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className="px-6 py-3 text-sm font-medium border-b-2"
                style={{
                  borderColor: activeTab === 'report' ? 'var(--brand)' : 'transparent',
                  color: activeTab === 'report' ? 'var(--brand)' : 'var(--muted)',
                }}
              >
                統計報表
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>載入中...</div>
            )}

            {!loading && activeTab !== 'report' && (
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <input
                    type="search"
                    placeholder={`搜索${activeTab === 'income' ? '收入' : '支出'}記錄...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-md"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}
                  />
                </div>
              </div>
            )}

            {!loading && activeTab === 'income' && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>描述</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>類別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>來源</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>金額</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                    {filteredIncome.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center" style={{ color: 'var(--muted)' }}>
                          暫無收入記錄
                        </td>
                      </tr>
                    ) : (
                      filteredIncome.map((item) => (
                        <tr key={item.id} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>{item.transaction_date}</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>{item.description}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>
                            {incomeCategoryLabels[item.category] || item.category}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{item.source || item.receipt_no || '-'}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--good)' }}>
                            +{formatCurrency(Number(item.amount))}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--danger)' }}
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
            )}

            {!loading && activeTab === 'expense' && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>描述</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>類別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>付款方式</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>金額</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                    {filteredExpense.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center" style={{ color: 'var(--muted)' }}>
                          暫無支出記錄
                        </td>
                      </tr>
                    ) : (
                      filteredExpense.map((item) => (
                        <tr key={item.id} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>{item.transaction_date}</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>{item.description}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>
                            {expenseCategoryLabels[item.category] || item.category}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{item.payment_method || item.receipt_no || '-'}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--danger)' }}>
                            -{formatCurrency(Number(item.amount))}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--danger)' }}
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
            )}

            {!loading && activeTab === 'report' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel-soft)' }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>收入分佈</h3>
                    <div className="space-y-3">
                      {incomeCategories.map((cat) => {
                        const catTotal = incomeList
                          .filter((i) => i.category === cat.value)
                          .reduce((sum, i) => sum + Number(i.amount), 0);
                        const percentage = totalIncome > 0 ? (catTotal / totalIncome) * 100 : 0;
                        return (
                          <div key={cat.value}>
                            <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text)' }}>
                              <span>{cat.label}</span>
                              <span>{formatCurrency(catTotal)} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${percentage}%`, backgroundColor: 'var(--good)' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel-soft)' }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>支出分佈</h3>
                    <div className="space-y-3">
                      {expenseCategories.map((cat) => {
                        const catTotal = expenseList
                          .filter((i) => i.category === cat.value)
                          .reduce((sum, i) => sum + Number(i.amount), 0);
                        const percentage = totalExpense > 0 ? (catTotal / totalExpense) * 100 : 0;
                        return (
                          <div key={cat.value}>
                            <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text)' }}>
                              <span>{cat.label}</span>
                              <span>{formatCurrency(catTotal)} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${percentage}%`, backgroundColor: 'var(--danger)' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Income Dialog */}
      {showIncomeDialog && (
        <RecordDialog
          type="income"
          onClose={() => setShowIncomeDialog(false)}
          onSaved={() => { setShowIncomeDialog(false); loadRecords(); loadStats(); }}
        />
      )}

      {/* Expense Dialog */}
      {showExpenseDialog && (
        <RecordDialog
          type="expense"
          onClose={() => setShowExpenseDialog(false)}
          onSaved={() => { setShowExpenseDialog(false); loadRecords(); loadStats(); }}
        />
      )}

      {/* Upload Receipt Dialog */}
      <UploadReceiptDialog
        isOpen={showUploadReceiptDialog}
        onClose={() => setShowUploadReceiptDialog(false)}
        onSubmit={(data) => {
          alert(`已識別：金額 HK$${data.amount}，日期 ${data.date}，付款人 ${data.payer}，用途 ${data.purpose}`);
          setShowUploadReceiptDialog(false);
        }}
      />
    </>
  );
}

function RecordDialog({
  type,
  onClose,
  onSaved,
}: {
  type: 'income' | 'expense';
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: type === 'income' ? 'tuition' : 'salary',
    source: '',
    vendor: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        record_type: type,
        category: formData.category,
        description: formData.description,
        amount: Number(formData.amount),
        transaction_date: formData.date,
        academic_year: ACADEMIC_YEAR,
        payment_method: type === 'expense' ? formData.vendor || undefined : undefined,
        receipt_no: type === 'income' ? formData.source || undefined : undefined,
      };
      if (type === 'income') {
        await api.createIncome(payload);
      } else {
        await api.createExpense(payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || '保存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--panel)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
          {type === 'income' ? '記錄收入' : '記錄支出'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>日期</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>描述</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>金額 (HKD)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>類別</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={inputStyle}
              >
                {type === 'income'
                  ? incomeCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))
                  : expenseCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
              </select>
            </div>
          </div>

          {type === 'income' ? (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>來源 / 收據編號</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                style={inputStyle}
                placeholder="例如：家長會捐贈 / RCP-001"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>付款方式 / 供應商</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                style={inputStyle}
                placeholder="例如：銀行轉賬 / 文儀批发"
              />
            </div>
          )}

          {error && (
            <div className="rounded-md p-3" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border rounded-md hover:opacity-80 disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
