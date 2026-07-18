'use client';

import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Loader2, Users, AlertTriangle, FileBarChart, MessageSquare, Table as TableIcon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '@/lib/api';

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

interface Statistics {
  mean: number;
  median: number;
  std: number;
  max_score: number;
  min_score: number;
  pass_rate: number;
  excellent_rate: number;
  total_students: number;
  question_stats: Record<string, { mean: number; difficulty: number; discrimination: number; total: number }>;
  class_comparison: Record<string, { mean: number; pass_rate: number; count: number }>;
}

interface Score {
  id: string;
  student_id: string;
  total_score: number;
  percentage: number;
  class_rank?: number;
}

export default function ExamDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [exam, setExam] = useState<ExamSession | null>(null);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [distribution, setDistribution] = useState<{ range: string; count: number }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [examRes, statsRes, scoresRes] = await Promise.all([
        api.getExamSession(id),
        api.getExamStatistics(id),
        api.getExamScores(id),
      ]);
      const examData = examRes.data || examRes;
      setExam(examData);
      const statsData = statsRes.data || statsRes;
      setStats(statsData);
      const scoreList = (scoresRes.data as Score[]) || [];
      setScores(scoreList);

      // build distribution buckets
      const total = examData.total_score || 100;
      const buckets = [
        { range: '<60%', count: 0 },
        { range: '60-70%', count: 0 },
        { range: '70-80%', count: 0 },
        { range: '80-90%', count: 0 },
        { range: '90-100%', count: 0 },
      ];
      for (const s of scoreList) {
        const pct = s.percentage;
        if (pct < 0.6) buckets[0].count++;
        else if (pct < 0.7) buckets[1].count++;
        else if (pct < 0.8) buckets[2].count++;
        else if (pct < 0.9) buckets[3].count++;
        else buckets[4].count++;
      }
      setDistribution(buckets);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (fn: () => Promise<any>, label: string) => {
    setAction(label);
    setError(null);
    try {
      const res = await fn();
      alert(`${label}完成：${JSON.stringify(res.data?.total ?? res.data?.alerts?.length ?? 'OK')}`);
      await load();
    } catch (e: any) {
      setError(e.message || '操作失敗');
    } finally {
      setAction(null);
    }
  };

  if (loading) return (<><Topbar title="考試詳情" /><p className="p-4 text-sm" style={{ color: 'var(--muted)' }}>載入中...</p></>);
  if (!exam) return (<><Topbar title="考試詳情" /><p className="p-4 text-sm" style={{ color: 'var(--danger)' }}>{error || '找不到考試'}</p></>);

  return (
    <>
      <Topbar title="考試詳情" />
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link href="/dashboard/apple/grade/exams" className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--brand)' }}>
            <ArrowLeft className="w-4 h-4" /> 返回
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/dashboard/apple/grade/comments?exam_id=${id}`} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}>
              <MessageSquare className="w-4 h-4" /> 評語
            </Link>
            <Link href={`/dashboard/apple/grade/alerts?exam_id=${id}`} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <AlertTriangle className="w-4 h-4" /> 預警
            </Link>
            <button onClick={() => runAction(() => api.generateCommentsBatch(id), '批量生成評語')} disabled={!!action} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1" style={{ backgroundColor: 'var(--brand)', color: '#fff' }}>
              {action === '批量生成評語' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />} 批量評語
            </button>
            <button onClick={() => runAction(() => api.detectRegressions(id), '退步檢測')} disabled={!!action} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
              {action === '退步檢測' ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />} 退步檢測
            </button>
          </div>
        </div>

        {error && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>{error}</div>}

        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{exam.name}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {exam.subject} · {exam.grade} · {exam.exam_date} · {exam.academic_year} {exam.semester} · 滿分 {exam.total_score}
          </p>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: '平均', value: stats.mean.toFixed(1) },
                { label: '中位數', value: stats.median.toFixed(1) },
                { label: '最高', value: stats.max_score },
                { label: '最低', value: stats.min_score },
                { label: '標準差', value: stats.std.toFixed(1) },
                { label: '及格率', value: `${(stats.pass_rate * 100).toFixed(0)}%` },
                { label: '優異率', value: `${(stats.excellent_rate * 100).toFixed(0)}%` },
                { label: '人數', value: stats.total_students },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}><FileBarChart className="w-4 h-4" /> 分數分佈</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="range" tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--brand)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}><TableIcon className="w-4 h-4" /> 題目分析</h3>
                <div className="space-y-2">
                  {Object.entries(stats.question_stats).map(([q, qs]) => (
                    <div key={q} className="flex items-center justify-between text-sm p-2 rounded" style={{ backgroundColor: 'var(--panel-soft)' }}>
                      <span style={{ color: 'var(--text)' }}>{q}</span>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>
                        平均 {qs.mean.toFixed(1)}/{qs.total} · 難度 {qs.difficulty.toFixed(2)} · 鑑別度 {qs.discrimination.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {Object.keys(stats.class_comparison).length > 0 && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
                <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>班級比較</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={Object.entries(stats.class_comparison).map(([name, c]) => ({ name, mean: c.mean, pass_rate: (c.pass_rate * 100) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="mean" name="平均分" fill="var(--brand)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pass_rate" name="及格率%" fill="var(--good)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}><TableIcon className="w-4 h-4" /> 成績列表 ({scores.length})</h3>
          {scores.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>暫無成績記錄</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--muted)' }}>
                    <th className="text-left p-2">學生 ID</th>
                    <th className="text-right p-2">總分</th>
                    <th className="text-right p-2">百分比</th>
                    <th className="text-right p-2">班排名</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s) => (
                    <tr key={s.id} style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                      <td className="p-2" style={{ color: 'var(--text)' }}>{s.student_id.slice(0, 8)}</td>
                      <td className="p-2 text-right" style={{ color: 'var(--text)' }}>{s.total_score}</td>
                      <td className="p-2 text-right" style={{ color: 'var(--text)' }}>{(s.percentage * 100).toFixed(1)}%</td>
                      <td className="p-2 text-right" style={{ color: 'var(--muted)' }}>{s.class_rank ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
