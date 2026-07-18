'use client';

import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle, Eye, Loader2, Trash2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useAIGlobal } from '@/lib/ai-context';
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
  useAIGlobal('announcements', '公告詳情');

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
    return (<><Topbar title="公告詳情" /><p className="p-4 text-sm text-gray-500">載入中...</p></>);
  }
  if (!ann) {
    return (<><Topbar title="公告詳情" /><p className="p-4 text-sm text-red-600">{error || '找不到公告'}</p></>);
  }

  const statusLabel = announcementStatusLabels[ann.status] || ann.status;

  return (
    <>
      <Topbar title="公告詳情" />
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link href="/dashboard/apple/announcements" className="inline-flex items-center gap-1 text-sm text-primary-600">
            <ArrowLeft className="w-4 h-4" /> 返回
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-900">
              {statusLabel}
            </span>
            {ann.status === 'draft' && (
              <button onClick={() => runAction(() => api.submitAnnouncement(id), 'submit')} disabled={!!action} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-primary-600 text-white">
                {action === 'submit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 提交審批
              </button>
            )}
            {ann.status === 'pending_approval' && (
              <button onClick={() => runAction(() => api.approveAnnouncement(id), 'approve')} disabled={!!action} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-blue-600 text-white">
                {action === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} 審批通過
              </button>
            )}
            {ann.status === 'approved' && (
              <button onClick={() => runAction(() => api.sendAnnouncement(id), 'send')} disabled={!!action} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-green-600 text-white">
                {action === 'send' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 發送
              </button>
            )}
            <button onClick={() => setEditing((v) => !v)} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-gray-50 text-gray-900 border border-gray-200">
              <Eye className="w-4 h-4" /> {editing ? '取消' : '編輯'}
            </button>
            <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-red-50 text-red-600">
              <Trash2 className="w-4 h-4" /> 刪除
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600">{error}</div>
        )}

        <div className="p-4 rounded-lg space-y-4 bg-white shadow-sm">
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 rounded bg-gray-50">{announcementTypeLabels[ann.announcement_type] || ann.announcement_type}</span>
            <span className="px-2 py-1 rounded bg-gray-50">{ann.target_audience}</span>
            {ann.ai_generated && <span className="px-2 py-1 rounded bg-blue-50 text-blue-600">AI 生成</span>}
            {ann.key_dates && <span className="px-2 py-1 rounded bg-gray-50">日期: {JSON.stringify(ann.key_dates)}</span>}
          </div>

          {editing ? (
            <div className="space-y-3">
              <EditField label="中文標題" value={draft.title_zh} onChange={(v) => setDraft((d) => ({ ...d, title_zh: v }))} />
              <EditField label="English Title" value={draft.title_en} onChange={(v) => setDraft((d) => ({ ...d, title_en: v }))} />
              <EditArea label="中文正文" value={draft.body_zh} onChange={(v) => setDraft((d) => ({ ...d, body_zh: v }))} />
              <EditArea label="English Body" value={draft.body_en} onChange={(v) => setDraft((d) => ({ ...d, body_en: v }))} />
              <button onClick={saveEdit} disabled={!!action} className="px-4 py-2 rounded-lg text-sm flex items-center gap-1 bg-green-600 text-white">
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

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs mb-1 text-gray-500">{label}</label>
      <input name={label} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900" />
    </div>
  );
}

function EditArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs mb-1 text-gray-500">{label}</label>
      <textarea name={label} value={value} onChange={(e) => onChange(e.target.value)} rows={5} className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900" />
    </div>
  );
}

function ContentBlock({ label, text }: { label: string; text: string | null }) {
  return (
    <div>
      <p className="text-xs mb-1 text-gray-500">{label}</p>
      <div className="p-3 rounded-lg text-sm whitespace-pre-wrap bg-gray-50 text-gray-900 min-h-[60px]">
        {text || '—'}
      </div>
    </div>
  );
}
