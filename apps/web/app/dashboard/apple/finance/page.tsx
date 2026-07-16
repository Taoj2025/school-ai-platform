'use client';

import { useState } from 'react';
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

// Mock data
const mockIncome = [
  { id: '1', date: '2025-09-15', description: '學費收入', amount: 125000, category: 'tuition', source: '2025-2026 第一期學費' },
  { id: '2', date: '2025-09-20', description: '獎學金捐贈', amount: 5000, category: 'donation', source: '校友獎學金' },
  { id: '3', date: '2025-09-25', description: '活動報名費', amount: 3500, category: 'activity', source: '暑期活動' },
];

const mockExpense = [
  { id: '1', date: '2025-09-10', description: '辦公用品', amount: 2500, category: 'supplies', vendor: '文儀批发' },
  { id: '2', date: '2025-09-15', description: '設備維修', amount: 8000, category: 'maintenance', vendor: '機電工程' },
  { id: '3', date: '2025-09-20', description: '活動支出', amount: 12000, category: 'activity', vendor: '活動統籌' },
];

const incomeCategories = [
  { value: 'tuition', label: '學費' },
  { value: 'donation', label: '捐贈' },
  { value: 'activity', label: '活動' },
  { value: 'other', label: '其他' },
];

const expenseCategories = [
  { value: 'supplies', label: '辦公用品' },
  { value: 'maintenance', label: '設備維修' },
  { value: 'activity', label: '活動支出' },
  { value: 'salary', label: '人員薪酬' },
  { value: 'other', label: '其他' },
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'report'>('income');
  const [searchTerm, setSearchTerm] = useState('');
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showUploadReceiptDialog, setShowUploadReceiptDialog] = useState(false);

  const filteredIncome = mockIncome.filter((item) =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpense = mockExpense.filter((item) =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = mockIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = mockExpense.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
    }).format(amount);
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
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
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
                收入記錄
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className="px-6 py-3 text-sm font-medium border-b-2"
                style={{
                  borderColor: activeTab === 'expense' ? 'var(--brand)' : 'transparent',
                  color: activeTab === 'expense' ? 'var(--brand)' : 'var(--muted)',
                }}
              >
                支出記錄
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
            {activeTab !== 'report' && (
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

            {activeTab === 'income' && (
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
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>{item.date}</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>{item.description}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>
                            {incomeCategories.find((c) => c.value === item.category)?.label}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{item.source}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--good)' }}>
                            +{formatCurrency(item.amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--brand)' }}>
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--brand)' }}>
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--danger)' }}>
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

            {activeTab === 'expense' && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>描述</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>類別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>供應商</th>
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
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>{item.date}</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>{item.description}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>
                            {expenseCategories.find((c) => c.value === item.category)?.label}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{item.vendor}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--danger)' }}>
                            -{formatCurrency(item.amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--brand)' }}>
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--brand)' }}>
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--danger)' }}>
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

            {activeTab === 'report' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel-soft)' }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>收入分佈</h3>
                    <div className="space-y-3">
                      {incomeCategories.map((cat) => {
                        const catTotal = mockIncome
                          .filter((i) => i.category === cat.value)
                          .reduce((sum, i) => sum + i.amount, 0);
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
                        const catTotal = mockExpense
                          .filter((i) => i.category === cat.value)
                          .reduce((sum, i) => sum + i.amount, 0);
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
        />
      )}

      {/* Expense Dialog */}
      {showExpenseDialog && (
        <RecordDialog
          type="expense"
          onClose={() => setShowExpenseDialog(false)}
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
}: {
  type: 'income' | 'expense';
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: type === 'income' ? 'tuition' : 'supplies',
    source: '',
    vendor: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`${type === 'income' ? '收入' : '支出'}記錄已保存`);
    onClose();
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
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>來源</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                style={inputStyle}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>供應商</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                style={inputStyle}
              />
            </div>
          )}

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
