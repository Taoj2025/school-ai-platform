'use client';

import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import {
  Trophy,
  Wallet,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
} from 'lucide-react';

const stats = [
  {
    name: '獎項總數',
    value: '24',
    change: '+3',
    changeType: 'positive',
    icon: Trophy,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    href: '/dashboard/apple/awards',
  },
  {
    name: '收入總計',
    value: 'HK$125,000',
    change: '+12%',
    changeType: 'positive',
    icon: Wallet,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    href: '/dashboard/apple/finance',
  },
  {
    name: '支出總計',
    value: 'HK$68,500',
    change: '-5%',
    changeType: 'negative',
    icon: TrendingDown,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    href: '/dashboard/apple/finance',
  },
  {
    name: '資產數量',
    value: '1,234',
    change: '+45',
    changeType: 'positive',
    icon: Package,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    href: '/dashboard/apple/assets',
  },
  {
    name: '學生人數',
    value: '856',
    change: '+12',
    changeType: 'positive',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    href: '/dashboard/apple/students',
  },
];

const recentAwards = [
  { id: 1, title: '2024-2025年度學業獎', type: 'academic', recipients: 45, date: '2025-03-15' },
  { id: 2, title: '品行優秀獎', type: 'conduct', recipients: 32, date: '2025-03-10' },
  { id: 3, title: '服務之星獎', type: 'service', recipients: 18, date: '2025-02-28' },
];

const quickActions = [
  { name: '新增獎項', href: '/dashboard/apple/awards/new', icon: Trophy },
  { name: '記錄收入', href: '/dashboard/apple/finance/income/new', icon: Wallet },
  { name: '添加資產', href: '/dashboard/apple/assets/new', icon: Package },
  { name: '導入學生', href: '/dashboard/apple/students/import', icon: Users },
];

export default function AppleOverviewPage() {
  return (
    <>
      <Topbar title="Apple 子系統概覽" />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.name}
                href={stat.href}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.name}</p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <Icon className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{action.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Awards & Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Awards */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">最近獎項</h2>
              <Link
                href="/dashboard/apple/awards"
                className="flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                查看全部
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentAwards.map((award) => (
                <Link
                  key={award.id}
                  href={`/dashboard/apple/awards/${award.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{award.title}</p>
                    <p className="text-sm text-gray-500">
                      {award.recipients} 名獲獎者 · {award.date}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                    {award.type === 'academic' && '學業'}
                    {award.type === 'conduct' && '品行'}
                    {award.type === 'service' && '服務'}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">即將到來</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary-50">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">獎學金發放日</p>
                  <p className="text-sm text-gray-500">2025年4月15日</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">頒獎典禮</p>
                  <p className="text-sm text-gray-500">2025年4月20日</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">資產盤點</p>
                  <p className="text-sm text-gray-500">2025年4月25日</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
