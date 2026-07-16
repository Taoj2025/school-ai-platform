'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { formatDate, incomeCategoryLabels, expenseCategoryLabels, formatCurrency } from '@/lib/utils';
import {
  Plus,
  Search,
  Tabs,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Upload,
} from 'lucide-react';

interface FinanceStats {
  total_income: number;
  total_expense: number;
  net_balance: number;
  currency: string;
}

interface IncomeRecord {
  id: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  payer?: string;
  description?: string;
  receipt_no?: string;
}

interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  vendor?: string;
  description?: string;
  payment_status: string;
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - in production, fetch from API
  const stats: FinanceStats = {
    total_income: 125000,
    total_expense: 68500,
    net_balance: 56500,
    currency: 'HKD',
  };

  const incomeRecords: IncomeRecord[] = [
    { id: '1', category: 'tuition', amount: 80000, currency: 'HKD', date: '2025-03-01', payer: '家長會', description: '學費收入' },
    { id: '2', category: 'donation', amount: 25000, currency: 'HKD', date: '2025-02-15', payer: '校友會', description: '捐贈款項' },
    { id: '3', category: 'event', amount: 20000, currency: 'HKD', date: '2025-02-20', description: '運動會報名費' },
  ];

  const expenseRecords: ExpenseRecord[] = [
    { id: '1', category: 'equipment', amount: 35000, currency: 'HKD', date: '2025-03-05', vendor: '科技公司', description: '購買電腦設備' },
    { id: '2', category: 'maintenance', amount: 15000, currency: 'HKD', date: '2025-02-25', vendor: '維修公司', description: '校舍維修' },
    { id: '3', category: 'event', amount: 18500, currency: 'HKD', date: '2025-02-10', description: '運動會支出' },
  ];

  return (
    <>
      <Topbar 
        title="財務管理"
        breadcrumbs={[
          { name: 'Apple 子系統', href: '/dashboard/apple' },
          { name: '財務管理' },
        ]}
      />
      
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
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Plus className="w-4 h-4" />
              記錄收支
            </button>
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_income)}</p>
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_expense)}</p>
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.net_balance)}</p>
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
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Search */}
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

            {/* Table */}
            {activeTab === 'income' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">類別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">付款人</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">說明</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">金額</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {incomeRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(record.date)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            {incomeCategoryLabels[record.category] || record.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.payer || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{record.description || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                          {formatCurrency(record.amount, record.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">類別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">供應商</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">說明</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">金額</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenseRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(record.date)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            {expenseCategoryLabels[record.category] || record.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.vendor || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{record.description || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                          {formatCurrency(record.amount, record.currency)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                            record.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {record.payment_status === 'paid' ? '已支付' : record.payment_status === 'partial' ? '部分支付' : '未支付'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
