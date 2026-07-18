'use client';

import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { BarChart3, Plus, Search, FileText } from 'lucide-react';
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

export default function ExamsListPage() {
  const [exams, setExams] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getExamSessions({ page: 1, page_size: 100 });
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

  return (
    <>
      <Topbar title="考試場次" />
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--panel-soft)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <Search className="w-4 h-4" style={{ color: 'var(--muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜尋考試名稱..." className="bg-transparent outline-none text-sm" style={{ color: 'var(--text)' }} />
          </div>
          <Link href="/dashboard/apple/grade/exams/new" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--brand)', color: '#fff' }}>
            <Plus className="w-4 h-4" /> 新建考試
          </Link>
        </div>

        {loading ? (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>載入中...</p>
        ) : error ? (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--danger)' }}>{error}</p>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<FileText className="w-8 h-8" />} title="暫無考試場次" description="創建考試場次以開始錄入成績。" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((exam) => (
              <Link key={exam.id} href={`/dashboard/apple/grade/exams/${exam.id}`} className="p-4 rounded-lg hover:border-brand" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)', borderWidth: '1px', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{exam.name}</p>
                  <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: exam.status === 'published' ? 'var(--good-bg)' : 'var(--panel-soft)', color: exam.status === 'published' ? 'var(--good)' : 'var(--muted)' }}>
                    {exam.status === 'published' ? '已發布' : exam.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
                  <span><BarChart3 className="w-3 h-3 inline mr-1" />{exam.subject}</span>
                  <span>{exam.grade}</span>
                  <span>{exam.exam_date}</span>
                  <span>滿分 {exam.total_score}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{exam.academic_year} {exam.semester}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
