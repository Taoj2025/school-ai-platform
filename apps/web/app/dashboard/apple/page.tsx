import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { Award, Wallet, Package, Users, Plus, FileText, ArrowRight } from 'lucide-react';

export default function AppleOverviewPage() {
  return (
    <>
      <Topbar title="總覽" />
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '獎項總數', value: '12', icon: Award, color: 'var(--brand)' },
            { label: '本學期收入', value: 'HK$ 133,500', icon: Wallet, color: 'var(--good)' },
            { label: '資產數量', value: '45', icon: Package, color: 'var(--info)' },
            { label: '學生人數', value: '320', icon: Users, color: 'var(--accent)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-lg"
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
            </div>
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
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: '新增獎項', href: '/dashboard/apple/awards/new', icon: Award, desc: '創建新獎項記錄' },
                { name: '記錄收支', href: '/dashboard/apple/finance', icon: Wallet, desc: '新增收入或支出' },
                { name: '添加資產', href: '/dashboard/apple/assets/new', icon: Package, desc: '新增學校資產' },
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
              { name: '服務精神獎', type: '服務', semester: '2025-2026 全學年', count: 20 },
            ].map((award) => (
              <div
                key={award.name}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: 'var(--good-bg)', color: 'var(--good)' }}
                  >
                    {award.type}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{award.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{award.semester}</p>
                  </div>
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {award.count} 人
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
