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
} from 'lucide-react';

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
            <h2 className="text-2xl font-bold text-gray-900">財務概覽</h2>
            <p className="text-sm text-gray-500 mt-1">管理收入、支出和財務統計</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              匯出報表
            </button>
            {activeTab === 'income' ? (
              <button
                onClick={() => setShowIncomeDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
                記錄收入
              </button>
            ) : activeTab === 'expense' ? (
              <button
                onClick={() => setShowExpenseDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
                記錄支出
              </button>
            ) : null}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-50">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">總收入</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-50">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">總支出</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpense)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-50">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">結餘</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('income')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'income'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                收入記錄
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'expense'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                支出記錄
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'report'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder={`搜索${activeTab === 'income' ? '收入' : '支出'}記錄...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'income' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">類別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">來源</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">金額</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredIncome.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                          暫無收入記錄
                        </td>
                      </tr>
                    ) : (
                      filteredIncome.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {incomeCategories.find((c) => c.value === item.category)?.label}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.source}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                            +{formatCurrency(item.amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100">
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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">類別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">供應商</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">金額</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredExpense.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                          暫無支出記錄
                        </td>
                      </tr>
                    ) : (
                      filteredExpense.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {expenseCategories.find((c) => c.value === item.category)?.label}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.vendor}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                            -{formatCurrency(item.amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100">
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
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">收入分佈</h3>
                    <div className="space-y-3">
                      {incomeCategories.map((cat) => {
                        const catTotal = mockIncome
                          .filter((i) => i.category === cat.value)
                          .reduce((sum, i) => sum + i.amount, 0);
                        const percentage = totalIncome > 0 ? (catTotal / totalIncome) * 100 : 0;
                        return (
                          <div key={cat.value}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{cat.label}</span>
                              <span>{formatCurrency(catTotal)} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">支出分佈</h3>
                    <div className="space-y-3">
                      {expenseCategories.map((cat) => {
                        const catTotal = mockExpense
                          .filter((i) => i.category === cat.value)
                          .reduce((sum, i) => sum + i.amount, 0);
                        const percentage = totalExpense > 0 ? (catTotal / totalExpense) * 100 : 0;
                        return (
                          <div key={cat.value}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{cat.label}</span>
                              <span>{formatCurrency(catTotal)} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500 rounded-full"
                                style={{ width: `${percentage}%` }}
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`${type === 'income' ? '收入' : '支出'}記錄已保存`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {type === 'income' ? '記錄收入' : '記錄支出'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">金額 (HKD)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">類別</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">來源</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">供應商</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
