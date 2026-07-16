'use client';

import { Bell, Search, User } from 'lucide-react';

interface TopbarProps {
  title: string;
  breadcrumbs?: { name: string; href?: string }[];
}

export default function Topbar({ title, breadcrumbs }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center h-16 px-6 bg-white border-b border-gray-200">
      <div className="flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.name} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="text-gray-500 hover:text-gray-700">
                    {crumb.name}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium">{crumb.name}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="搜索..."
            className="w-64 pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-md">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <span className="text-sm font-medium">管理員</span>
        </button>
      </div>
    </header>
  );
}
