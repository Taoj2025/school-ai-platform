'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Trophy,
  Wallet,
  Package,
  Users,
  LayoutDashboard,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: '概覽', href: '/dashboard/apple', icon: LayoutDashboard },
  { 
    name: '獎項管理', 
    href: '/dashboard/apple/awards',
    icon: Trophy,
    children: [
      { name: '獎項列表', href: '/dashboard/apple/awards' },
      { name: '生成獎狀', href: '/dashboard/apple/awards/generate' },
    ],
  },
  { name: '財務管理', href: '/dashboard/apple/finance', icon: Wallet },
  { name: '資產管理', href: '/dashboard/apple/assets', icon: Package },
  { name: '學生管理', href: '/dashboard/apple/students', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['獎項管理']);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <span className="text-xl font-bold text-primary-600">Apple 子系統</span>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const hasChildren = !!item.children;
          const isExpanded = expandedItems.includes(item.name);

          return (
            <div key={item.name}>
              <Link
                href={hasChildren ? '#' : item.href}
                onClick={hasChildren ? (e) => { e.preventDefault(); toggleExpand(item.name); } : undefined}
                className={cn(
                  'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {hasChildren && (
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                )}
              </Link>

              {hasChildren && isExpanded && (
                <div className="pl-8 mt-1 space-y-1">
                  {item.children!.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        pathname === child.href
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
        >
          <Settings className="w-5 h-5" />
          <span>設置</span>
        </Link>
      </div>
    </div>
  );
}
