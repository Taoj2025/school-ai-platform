'use client';

import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, FileText, Plus, Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import EmptyState from '@/components/ui/EmptyState';

interface Template {
  id: string;
  name: string;
  category: string;
  title_zh_template: string | null;
  body_zh_template: string | null;
  usage_count: number;
  is_active: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  exam: '考試',
  holiday: '假期',
  payment: '繳費',
  weather: '天氣',
  activity: '活動',
  other: '其他',
};

export default function AnnouncementTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recommended, setRecommended] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'exam', title_zh_template: '', body_zh_template: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTemplates({ is_active: true });
      setTemplates((res.data?.items as Template[]) || []);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadRecommend = async (category: string) => {
    try {
      const res = await api.recommendTemplates(category || undefined);
      setRecommended((res.data?.items as Template[]) || []);
    } catch {
      setRecommended([]);
    }
  };

  const handleCreate = async () => {
    if (!form.name) { setError('請填寫模板名稱'); return; }
    setSaving(true);
    setError(null);
    try {
      await api.createTemplate(form);
      setShowForm(false);
      setForm({ name: '', category: 'exam', title_zh_template: '', body_zh_template: '' });
      await load();
    } catch (e: any) {
      setError(e.message || '創建失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Topbar title="公告模板庫" />
      <div className="space-y-4">
        <Link href="/dashboard/apple/announcements" className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--brand)' }}>
          <ArrowLeft className="w-4 h-4" /> 返回公告列表
        </Link>

        {error && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>{error}</div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>模板列表 ({templates.length})</h3>
          <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--brand)', color: '#fff' }}>
            <Plus className="w-4 h-4" /> 新建模板
          </button>
        </div>

        {showForm && (
          <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
            <Field label="模板名稱">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} placeholder="期中考試通知模板" />
            </Field>
            <Field label="類別">
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle}>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="中文標題模板">
              <input value={form.title_zh_template} onChange={(e) => setForm((f) => ({ ...f, title_zh_template: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} placeholder="【{type}】通知" />
            </Field>
            <Field label="中文正文模板">
              <textarea value={form.body_zh_template} onChange={(e) => setForm((f) => ({ ...f, body_zh_template: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} placeholder="各位：茲通知{type}，日期{date}。" />
            </Field>
            <button onClick={handleCreate} disabled={saving} className="px-4 py-2 rounded-lg text-sm flex items-center gap-1" style={{ backgroundColor: 'var(--good)', color: '#fff' }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 創建
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--brand)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>智能推薦</span>
              <select onChange={(e) => loadRecommend(e.target.value)} className="ml-2 px-2 py-1 rounded text-xs" style={inputStyle}>
                <option value="">全部類型</option>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            {recommended.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {recommended.map((t) => (
                  <span key={t.id} className="px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}>
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>載入中...</p>
        ) : templates.length === 0 ? (
          <EmptyState icon={<FileText className="w-8 h-8" />} title="暫無模板" description="創建你的第一個公告模板。" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {templates.map((t) => (
              <div key={t.id} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t.name}</p>
                  <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--panel-soft)', color: 'var(--muted)' }}>
                    {CATEGORY_LABELS[t.category] || t.category}
                  </span>
                </div>
                <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>標題: {t.title_zh_template || '—'}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>使用次數: {t.usage_count}</p>
              </div>
            ))}
          </div>
        )}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
      {children}
    </div>
  );
}
