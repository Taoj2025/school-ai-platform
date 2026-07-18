'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import EmptyState from '@/components/ui/EmptyState';

interface Alert {
  id: string;
  student_id: string;
  exam_session_id: string;
  severity: string;
  from_avg: number;
  to_avg: number;
  change: number;
  message: string;
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm" style={{ color: 'var(--muted)' }}>載入中...</div>}>
      <AlertsContent />
    </Suspense>
  );
}

function AlertsContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('exam_id');

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAlerts(examId ? { exam_session_id: examId } : {});
      setAlerts((res.data as Alert[]) || []);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => { load(); }, [load]);

  const handleDetect = async () => {
    if (!examId) { setError('請從考試詳情頁進入以執行退步檢測'); return; }
    setDetecting(true);
    setError(null);
    try {
      await api.detectRegressions(examId);
      await load();
    } catch (e: any) {
      setError(e.message || '檢測失敗');
    } finally {
      setDetecting(false);
    }
  };

  return (
    <>
      <Topbar title="退步預警" />
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link href="/dashboard/apple/grade/exams" className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--brand)' }}>
            <ArrowLeft className="w-4 h-4" /> 返回考試列表
          </Link>
          {examId && (
            <button onClick={handleDetect} disabled={detecting} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
              {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />} 執行退步檢測
            </button>
          )}
        </div>

        {error && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>{error}</div>}

        {loading ? (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>載入中...</p>
        ) : alerts.length === 0 ? (
          <EmptyState icon={<AlertTriangle className="w-8 h-8" />} title="暫無退步預警" description={examId ? '點擊右上角執行退步檢測' : '請從考試詳情頁進入以檢測退步學生'} />
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-start justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--danger-light)', backgroundColor: 'var(--danger-bg)' }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: 'var(--danger)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      學生 {a.student_id.slice(0, 8)} · {(a.change * 100).toFixed(0)}%
                      <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: a.severity === 'high' ? 'var(--danger)' : 'var(--warning)', color: '#fff' }}>
                        {a.severity === 'high' ? '嚴重' : '中等'}
                      </span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{a.message}</p>
                  </div>
                </div>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {(a.from_avg * 100).toFixed(0)}% → {(a.to_avg * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
