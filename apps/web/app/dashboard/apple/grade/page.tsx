'use client';

import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { BarChart3, Upload, FileText, Users, AlertTriangle, CheckCircle, Clock, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import EmptyState from '@/components/ui/EmptyState';

interface ExamSession {
  id: string;
  name: string;
  exam_date: string;
  semester: string;
  academic_year: string;
  subject: string;
  grade: string;
  total_score: number;
  status: string;
}

export default function GradeOverviewPage() {
  const [exams, setExams] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getExamSessions({ page: 1, page_size: 50 });
      setExams((res.data?.items as ExamSession[]) || []);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = exams.filter((e) =>
    search ? (e.name || '').toLowerCase().includes(search.toLowerCase()) : true
  );

  const stats = {
    total: exams.length,
    draft: exams.filter((e) => e.status === 'draft').length,
    published: exams.filter((e) => e.status === 'published').length,
  };

  return (
    <>
      <Topbar title="成績管理" />
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '考試場次', value: stats.total, icon: FileText, color: 'var(--brand)' },
            { label: '草稿', value: stats.draft, icon: Clock, color: 'var(--accent)' },
            { label: '已發布', value: stats.published, icon: CheckCircle, color: 'var(--good)' },
            { label: '科目覆蓋', value: new Set(exams.map((e) => e.subject)).size, icon: BarChart3, color: 'var(--info)' },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--panel-soft)' }}>
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
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
          <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>快速操作</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: '新建考試', href: '/dashboard/apple/grade/exams/new', icon: FileText, desc: '創建新考試場次' },
              { name: '批量評語', href: '/dashboard/apple/grade/comments', icon: Users, desc: 'AI批量生成評語' },
              { name: '退步預警', href: '/dashboard/apple/grade/alerts', icon: AlertTriangle, desc: '退步預警查看' },
              { name: '全部考試', href: '/dashboard/apple/grade/exams', icon: BarChart3, desc: '查看所有考試場次' },
            ].map((action) => (
              <Link key={action.name} href={action.href} className="flex items-center gap-3 p-3 rounded-lg border transition-colors hover:border-brand" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)' }}>
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}>
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

        {/* Recent Exams */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>最近考試</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--panel-soft)', borderWidth: '1px', borderColor: 'var(--border)' }}>
                <Search className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜尋..." className="bg-transparent outline-none text-sm" style={{ color: 'var(--text)' }} />
              </div>
              <Link href="/dashboard/apple/grade/exams/new" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--brand)', color: '#fff' }}>
                <Plus className="w-4 h-4" /> 新建
              </Link>
            </div>
          </div>

          {loading ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>載入中...</p>
          ) : error ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--danger)' }}>{error}</p>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<FileText className="w-8 h-8" />} title="暫無考試場次" description="點擊「新建考試」創建第一個考試場次。" />
          ) : (
            <div className="space-y-2">
              {filtered.map((exam) => (
                <Link key={exam.id} href={`/dashboard/apple/grade/exams/${exam.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:border-brand" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)' }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{exam.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{exam.subject} · {exam.grade} · {exam.exam_date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{exam.total_score}分</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: exam.status === 'published' ? 'var(--good-bg)' : 'var(--panel-soft)', color: exam.status === 'published' ? 'var(--good)' : 'var(--muted)' }}>
                        {exam.status === 'published' ? '已發布' : exam.status}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
