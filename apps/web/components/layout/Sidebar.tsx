'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Megaphone, Award, Wallet, Package, Users } from 'lucide-react';

const navigation = [
  { name: '總覽', href: '/dashboard/apple', icon: BarChart3 },
  { name: '公告管理', href: '/dashboard/apple/announcements', icon: Megaphone },
  { name: '獎項管理', href: '/dashboard/apple/awards', icon: Award },
  { name: '財務管理', href: '/dashboard/apple/finance', icon: Wallet },
  { name: '資產管理', href: '/dashboard/apple/assets', icon: Package },
  { name: '成績管理', href: '/dashboard/apple/grade', icon: BarChart3 },
  { name: '學生管理', href: '/dashboard/apple/students', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col w-[224px] h-screen shrink-0"
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-3 py-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg text-lg font-bold"
          style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}
        >
          PY
        </div>
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--sidebar-text)' }}>
            Apple 工作台
          </h1>
          <p className="text-xs" style={{ color: 'var(--sidebar-muted)' }}>
            獎學金・財務・資產・成績
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-2 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'text-sidebar-item'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--sidebar-hover-bg)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--sidebar-item)',
              }}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Note */}
      <div
        className="mx-3 mb-4 p-3 rounded-lg"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <strong className="text-sm" style={{ color: 'var(--sidebar-text)' }}>
          目前身份：Apple
        </strong>
        <p className="text-xs mt-1" style={{ color: 'var(--sidebar-muted)' }}>
          只顯示已授權的獎項獎學金、收支記錄與資產管理功能。
        </p>
      </div>
    </aside>
  );
}
