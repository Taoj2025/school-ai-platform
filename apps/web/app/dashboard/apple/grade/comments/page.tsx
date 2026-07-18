'use client';

import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, MessageSquare, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface Comment {
  id: string;
  exam_session_id: string;
  score_id: string;
  content: string;
  level: string;
  status: string;
  model: string;
}

export default function CommentsPage() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('exam_id');

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getComments(examId ? { exam_session_id: examId } : {});
      setComments((res.data?.items as Comment[]) || []);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => { load(); }, [load]);

  const handleGenerateAll = async () => {
    if (!examId) { setError('請從考試詳情頁進入以批量生成'); return; }
    setGenerating(true);
    setError(null);
    try {
      await api.generateCommentsBatch(examId);
      await load();
    } catch (e: any) {
      setError(e.message || '生成失敗');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Topbar title="AI 評語" />
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link href="/dashboard/apple/grade/exams" className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--brand)' }}>
            <ArrowLeft className="w-4 h-4" /> 返回考試列表
          </Link>
          {examId && (
            <button onClick={handleGenerateAll} disabled={generating} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--brand)', color: '#fff' }}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} 批量生成評語
            </button>
          )}
        </div>

        {error && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>{error}</div>}

        {loading ? (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>載入中...</p>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
            <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--brand-light)' }} />
            {examId ? '暫無評語，點擊右上角「批量生成評語」' : '請從考試詳情頁進入以查看該考試的評語'}
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}>等級 {c.level}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{c.status}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{c.content}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>模型: {c.model}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
