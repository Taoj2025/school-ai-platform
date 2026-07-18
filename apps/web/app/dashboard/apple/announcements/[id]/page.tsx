'use client';

import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle, Eye, Loader2, Trash2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { announcementTypeLabels, announcementStatusLabels } from '@/lib/utils';

interface Announcement {
  id: string;
  title_zh: string | null;
  title_en: string | null;
  body_zh: string | null;
  body_en: string | null;
  announcement_type: string;
  target_audience: string;
  status: string;
  key_dates: any;
  key_location: string | null;
  subject: string | null;
  special_notes: string | null;
  formality: string;
  ai_generated: boolean;
  sent_at: string | null;
}

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [ann, setAnn] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title_zh: '', title_en: '', body_zh: '', body_en: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAnnouncement(id);
      const data = res.data || res;
      setAnn(data);
      setDraft({
        title_zh: data.title_zh || '',
        title_en: data.title_en || '',
        body_zh: data.body_zh || '',
        body_en: data.body_en || '',
      });
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
      await fn();
      await load();
    } catch (e: any) {
      setError(e.message || '操作失敗');
    } finally {
      setAction(null);
    }
  };

  const saveEdit = async () => {
    setAction('save');
    setError(null);
    try {
      await api.updateAnnouncement(id, draft);
      setEditing(false);
      await load();
    } catch (e: any) {
      setError(e.message || '保存失敗');
    } finally {
      setAction(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定刪除此公告？')) return;
    try {
      await api.deleteAnnouncement(id);
      router.push('/dashboard/apple/announcements');
    } catch (e: any) {
      setError(e.message || '刪除失敗');
    }
  };

  if (loading) {
    return (<><Topbar title="公告詳情" /><p className="p-4 text-sm" style={{ color: 'var(--muted)' }}>載入中...</p></>);
  }
  if (!ann) {
    return (<><Topbar title="公告詳情" /><p className="p-4 text-sm" style={{ color: 'var(--danger)' }}>{error || '找不到公告'}</p></>);
  }

  const statusLabel = announcementStatusLabels[ann.status] || ann.status;

  return (
    <>
      <Topbar title="公告詳情" />
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link href="/dashboard/apple/announcements" className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--brand)' }}>
            <ArrowLeft className="w-4 h-4" /> 返回
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}>
              {statusLabel}
            </span>
            {ann.status === 'draft' && (
              <button onClick={() => runAction(() => api.submitAnnouncement(id), 'submit')} disabled={!!action} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1" style={{ backgroundColor: 'var(--brand)', color: '#fff' }}>
                {action === 'submit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 提交審批
              </button>
            )}
            {ann.status === 'pending_approval' && (
              <button onClick={() => runAction(() => api.approveAnnouncement(id), 'approve')} disabled={!!action} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1" style={{ backgroundColor: 'var(--info)', color: '#fff' }}>
                {action === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} 審批通過
              </button>
            )}
            {ann.status === 'approved' && (
              <button onClick={() => runAction(() => api.sendAnnouncement(id), 'send')} disabled={!!action} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1" style={{ backgroundColor: 'var(--good)', color: '#fff' }}>
                {action === 'send' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 發送
              </button>
            )}
            <button onClick={() => setEditing((v) => !v)} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1" style={{ backgroundColor: 'var(--panel-soft)', color: 'var(--text)', borderWidth: '1px', borderColor: 'var(--border)' }}>
              <Eye className="w-4 h-4" /> {editing ? '取消' : '編輯'}
            </button>
            <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <Trash2 className="w-4 h-4" /> 刪除
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>{error}</div>
        )}

        <div className="p-4 rounded-lg space-y-4" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
          <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--muted)' }}>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--panel-soft)' }}>{announcementTypeLabels[ann.announcement_type] || ann.announcement_type}</span>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--panel-soft)' }}>{ann.target_audience}</span>
            {ann.ai_generated && <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>AI 生成</span>}
            {ann.key_dates && <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--panel-soft)' }}>日期: {JSON.stringify(ann.key_dates)}</span>}
          </div>

          {editing ? (
            <div className="space-y-3">
              <EditField label="中文標題" value={draft.title_zh} onChange={(v) => setDraft((d) => ({ ...d, title_zh: v }))} />
              <EditField label="English Title" value={draft.title_en} onChange={(v) => setDraft((d) => ({ ...d, title_en: v }))} />
              <EditArea label="中文正文" value={draft.body_zh} onChange={(v) => setDraft((d) => ({ ...d, body_zh: v }))} />
              <EditArea label="English Body" value={draft.body_en} onChange={(v) => setDraft((d) => ({ ...d, body_en: v }))} />
              <button onClick={saveEdit} disabled={!!action} className="px-4 py-2 rounded-lg text-sm flex items-center gap-1" style={{ backgroundColor: 'var(--good)', color: '#fff' }}>
                {action === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <ContentBlock label="中文標題" text={ann.title_zh} />
              <ContentBlock label="English Title" text={ann.title_en} />
              <ContentBlock label="中文正文" text={ann.body_zh} />
              <ContentBlock label="English Body" text={ann.body_en} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--panel-soft)',
  borderWidth: '1px',
  borderColor: 'var(--border)',
  color: 'var(--text)',
};

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
    </div>
  );
}

function EditArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
    </div>
  );
}

function ContentBlock({ label, text }: { label: string; text: string | null }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
      <div className="p-3 rounded-lg text-sm whitespace-pre-wrap" style={{ backgroundColor: 'var(--panel-soft)', color: 'var(--text)', minHeight: '60px' }}>
        {text || '—'}
      </div>
    </div>
  );
}
