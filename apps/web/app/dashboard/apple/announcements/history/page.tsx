'use client';

import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Send, Megaphone } from 'lucide-react';
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
  sent_at: string | null;
}

export default function AnnouncementHistoryPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAnnouncements({ status: 'sent', page: 1, page_size: 100 });
      setItems((res.data?.items as Announcement[]) || []);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Topbar title="已發送公告" />
      <div className="space-y-4">
        <Link href="/dashboard/apple/announcements" className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--brand)' }}>
          <ArrowLeft className="w-4 h-4" /> 返回公告列表
        </Link>

        {loading ? (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>載入中...</p>
        ) : error ? (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--danger)' }}>{error}</p>
        ) : items.length === 0 ? (
          <EmptyState icon={<Send className="w-8 h-8" />} title="暫無已發送公告" description="發送後的公告會顯示在這裡。" />
        ) : (
          <div className="space-y-2">
            {items.map((ann) => (
              <div key={ann.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}>
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{ann.title_zh || ann.title_en || '（無標題）'}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {announcementTypeLabels[ann.announcement_type] || ann.announcement_type}
                      {' · '}
                      {ann.target_audience}
                      {ann.sent_at ? ` · 發送於 ${new Date(ann.sent_at).toLocaleString('zh-HK')}` : ''}
                    </p>
                  </div>
                </div>
                <Link href={`/dashboard/apple/announcements/${ann.id}`} className="text-sm hover:underline" style={{ color: 'var(--brand)' }}>查看</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
