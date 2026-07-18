import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { Award, Wallet, Package, Users, Plus, FileText, ArrowRight, Megaphone, BarChart3 } from 'lucide-react';

export default function AppleOverviewPage() {
  return (
    <>
      <Topbar title="總覽" />
      <div className="space-y-4">
        {/* Stats Grid - 5 Modules */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: '公告', value: '24', icon: Megaphone, color: 'var(--brand)', href: '/dashboard/apple/announcements' },
            { label: '獎項', value: '12', icon: Award, color: 'var(--good)', href: '/dashboard/apple/awards' },
            { label: '財務', value: 'HK$133K', icon: Wallet, color: 'var(--info)', href: '/dashboard/apple/finance' },
            { label: '資產', value: '45', icon: Package, color: 'var(--accent)', href: '/dashboard/apple/assets' },
            { label: '成績', value: '8', icon: BarChart3, color: 'var(--danger)', href: '/dashboard/apple/grade' },
          ].map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-3 rounded-lg transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--panel-soft)' }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-4">
          {/* Quick Actions */}
          <div
            className="col-span-2 p-4 rounded-lg"
            style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
          >
            <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>
              快速操作
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: '新建公告', href: '/dashboard/apple/announcements/new', icon: Megaphone, desc: '發布新公告' },
                { name: '新增獎項', href: '/dashboard/apple/awards/new', icon: Award, desc: '創建新獎項記錄' },
                { name: '記錄收支', href: '/dashboard/apple/finance', icon: Wallet, desc: '新增收入或支出' },
                { name: '添加資產', href: '/dashboard/apple/assets/new', icon: Package, desc: '新增學校資產' },
                { name: '新建考試', href: '/dashboard/apple/grade/exams/new', icon: FileText, desc: '創建考試場次' },
                { name: '導入學生', href: '/dashboard/apple/students/import', icon: Users, desc: '批量導入學生' },
              ].map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg border transition-colors hover:border-brand"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)' }}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}
                  >
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{action.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
          >
            <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>
              即將到來
            </h3>
            <div className="space-y-2">
              {[
                { name: '獎學金發放日', date: '2026-09-15' },
                { name: '頒獎典禮', date: '2026-09-20' },
                { name: '學期資產盤點', date: '2026-10-01' },
                { name: '期中考試', date: '2026-10-15' },
              ].map((event) => (
                <div
                  key={event.name}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--panel-soft)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text)' }}>{event.name}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{event.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-2 gap-4">
          {/* Recent Awards */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                最新獎項
              </h3>
              <Link
                href="/dashboard/apple/awards"
                className="flex items-center gap-1 text-sm hover:underline"
                style={{ color: 'var(--brand)' }}
              >
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {[
                { name: '學業優異獎', type: '學業', semester: '2025-2026 上學期', count: 45 },
                { name: '品行優良獎', type: '品行', semester: '2025-2026 上學期', count: 30 },
              ].map((award) => (
                <div
                  key={award.name}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--panel-soft)' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: 'var(--good-bg)', color: 'var(--good)' }}
                    >
                      {award.type}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text)' }}>{award.name}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{award.count}人</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Announcements */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                最新公告
              </h3>
              <Link
                href="/dashboard/apple/announcements"
                className="flex items-center gap-1 text-sm hover:underline"
                style={{ color: 'var(--brand)' }}
              >
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {[
                { title: '中二數學期中考試通知', status: '已發送', date: '07-15' },
                { title: '暑期興趣班報名通知', status: '待發送', date: '07-18' },
              ].map((ann) => (
                <div
                  key={ann.title}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--panel-soft)' }}
                >
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--text)' }}>{ann.title}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{ann.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
