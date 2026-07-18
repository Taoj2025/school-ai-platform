'use client';

import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { Megaphone, Plus, FileText, Send, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { announcementTypeLabels, announcementStatusLabels } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

interface Announcement {
  id: string;
  title_zh: string | null;
  title_en: string | null;
  announcement_type: string;
  target_audience: string;
  status: string;
  ai_generated: boolean;
  sent_at: string | null;
  created_at: string;
}

export default function AnnouncementsOverviewPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: 1, page_size: 50 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.announcement_type = typeFilter;
      const res = await api.getAnnouncements(params);
      setAnnouncements((res.data?.items as Announcement[]) || []);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = announcements.filter((a) =>
    search
      ? (a.title_zh || a.title_en || '').toLowerCase().includes(search.toLowerCase())
      : true
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return { icon: Send, label: announcementStatusLabels[status] || status, class: 'var(--good)', bg: 'var(--good-bg)' };
      case 'pending_approval':
        return { icon: Clock, label: announcementStatusLabels[status] || status, class: 'var(--accent)', bg: 'var(--accent-bg)' };
      case 'approved':
        return { icon: CheckCircle, label: announcementStatusLabels[status] || status, class: 'var(--info)', bg: 'var(--info-bg)' };
      case 'rejected':
        return { icon: XCircle, label: announcementStatusLabels[status] || status, class: 'var(--danger)', bg: 'var(--danger-bg)' };
      case 'draft':
      default:
        return { icon: FileText, label: announcementStatusLabels[status] || status, class: 'var(--muted)', bg: 'var(--panel-soft)' };
    }
  };

  const stats = {
    total: announcements.length,
    draft: announcements.filter((a) => a.status === 'draft').length,
    pending: announcements.filter((a) => a.status === 'pending_approval').length,
    sent: announcements.filter((a) => a.status === 'sent').length,
  };

  return (
    <>
      <Topbar title="公告管理" />
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '總公告數', value: stats.total, icon: Megaphone, color: 'var(--brand)' },
            { label: '待審批', value: stats.pending, icon: Clock, color: 'var(--accent)' },
            { label: '已發送', value: stats.sent, icon: Send, color: 'var(--good)' },
            { label: '草稿', value: stats.draft, icon: FileText, color: 'var(--muted)' },
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
              { name: '新建公告', href: '/dashboard/apple/announcements/new', icon: Plus, desc: 'AI 生成或手動創建公告' },
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

        {/* Filters + List */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              所有公告
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'var(--panel-soft)', borderWidth: '1px', borderColor: 'var(--border)' }}
              >
                <Search className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜尋標題..."
                  className="bg-transparent outline-none text-sm"
                  style={{ color: 'var(--text)' }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--panel-soft)', borderWidth: '1px', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="all">全部狀態</option>
                <option value="draft">草稿</option>
                <option value="pending_approval">待審批</option>
                <option value="approved">已審批</option>
                <option value="sent">已發送</option>
                <option value="rejected">已退回</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--panel-soft)', borderWidth: '1px', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="all">全部類型</option>
                <option value="exam">考試</option>
                <option value="holiday">假期</option>
                <option value="payment">繳費</option>
                <option value="weather">天氣</option>
                <option value="activity">活動</option>
                <option value="other">其他</option>
              </select>
              <Link
                href="/dashboard/apple/announcements/new"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'var(--brand)', color: '#fff' }}
              >
                <Plus className="w-4 h-4" /> 新建
              </Link>
            </div>
          </div>

          {loading ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>載入中...</p>
          ) : error ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--danger)' }}>{error}</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="w-8 h-8" />}
              title="暫無公告"
              description="點擊「新建公告」開始創建你的第一份公告。"
              action={
                <Link
                  href="/dashboard/apple/announcements/new"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: 'var(--brand)', color: '#fff' }}
                >
                  <Plus className="w-4 h-4" /> 新建公告
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((ann) => {
                const status = getStatusBadge(ann.status);
                const Icon = status.icon;
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
                        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                          {ann.title_zh || ann.title_en || '（無標題）'}
                          {ann.ai_generated && (
                            <span
                              className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
                              style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}
                            >AI</span>
                          )}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          {announcementTypeLabels[ann.announcement_type] || ann.announcement_type}
                          {' · '}
                          {ann.target_audience}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1"
                        style={{ backgroundColor: status.bg, color: status.class }}
                      >
                        <Icon className="w-3 h-3" />
                        {status.label}
                      </span>
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
          )}
        </div>
      </div>
    </>
  );
}
