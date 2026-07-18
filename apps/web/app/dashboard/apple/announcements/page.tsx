'use client';

import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { Megaphone, Plus, FileText, Send, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AnnouncementsOverviewPage() {
  const announcements = [
    {
      id: '1',
      title: '中二數學期中考試通知',
      titleEn: 'Secondary 2 Math Mid-term Exam Notice',
      type: '考試',
      status: 'sent',
      sentAt: '2026-07-15 09:00',
      readCount: 120,
      totalCount: 150,
    },
    {
      id: '2',
      title: '暑期興趣班報名通知',
      titleEn: 'Summer Interest Class Registration Notice',
      type: '報名',
      status: 'pending',
      sentAt: '2026-07-18 14:00',
      readCount: 45,
      totalCount: 150,
    },
    {
      id: '3',
      title: '家長會通知',
      titleEn: 'Parent-Teacher Association Meeting Notice',
      type: '活動',
      status: 'draft',
      sentAt: null,
      readCount: 0,
      totalCount: 0,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return { icon: Send, label: '已發送', class: 'var(--good)', bg: 'var(--good-bg)' };
      case 'pending':
        return { icon: Clock, label: '待發送', class: 'var(--accent)', bg: 'var(--accent-bg)' };
      case 'draft':
        return { icon: FileText, label: '草稿', class: 'var(--muted)', bg: 'var(--panel-soft)' };
      default:
        return { icon: FileText, label: status, class: 'var(--muted)', bg: 'var(--panel-soft)' };
    }
  };

  return (
    <>
      <Topbar title="公告管理" />
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '總公告數', value: '24', icon: Megaphone, color: 'var(--brand)' },
            { label: '待審批', value: '3', icon: Clock, color: 'var(--accent)' },
            { label: '已發送', value: '18', icon: Send, color: 'var(--good)' },
            { label: '草稿', value: '3', icon: FileText, color: 'var(--muted)' },
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

        {/* Quick Actions */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
        >
          <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>
            快速操作
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: '新建公告', href: '/dashboard/apple/announcements/new', icon: Plus, desc: '創建新公告' },
              { name: '模板庫', href: '/dashboard/apple/announcements/templates', icon: FileText, desc: '查看公告模板' },
              { name: '歷史記錄', href: '/dashboard/apple/announcements/history', icon: Send, desc: '查看已發送公告' },
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

        {/* Recent Announcements */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              最近公告
            </h3>
          </div>
          <div className="space-y-2">
            {announcements.map((ann) => {
              const status = getStatusBadge(ann.status);
              return (
                <div
                  key={ann.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}
                    >
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{ann.title}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{ann.titleEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: status.bg, color: status.class }}
                    >
                      {ann.status === 'sent' && <Send className="w-3 h-3 inline mr-1" />}
                      {ann.status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                      {ann.status === 'draft' && <FileText className="w-3 h-3 inline mr-1" />}
                      {status.label}
                    </span>
                    {ann.status === 'sent' && (
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>
                        {ann.readCount}/{ann.totalCount} 已讀
                      </span>
                    )}
                    <Link
                      href={`/dashboard/apple/announcements/${ann.id}`}
                      className="text-sm hover:underline"
                      style={{ color: 'var(--brand)' }}
                    >
                      查看
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
