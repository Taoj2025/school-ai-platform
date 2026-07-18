'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Megaphone, Sparkles, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAIGlobal } from '@/lib/ai-context';

interface GeneratedResult {
  title_zh: string;
  title_en: string;
  body_zh: string;
  body_en: string;
  confidence?: string;
  warnings?: string[];
}

const TYPE_OPTIONS = [
  { value: 'exam', label: '考試' },
  { value: 'holiday', label: '假期' },
  { value: 'payment', label: '繳費' },
  { value: 'weather', label: '天氣' },
  { value: 'activity', label: '活動' },
  { value: 'other', label: '其他' },
];

const AUDIENCE_OPTIONS = [
  { value: 'whole_school', label: '全校' },
  { value: 'grade_1', label: '一年級' },
  { value: 'grade_2', label: '二年級' },
  { value: 'grade_3', label: '三年級' },
  { value: 'class_3A', label: '3A 班' },
];

export default function NewAnnouncementPage() {
  const router = useRouter();
  useAIGlobal('announcements', '新建公告');
  const [form, setForm] = useState({
    title_type: 'exam',
    target_audience: 'whole_school',
    key_dates: '',
    key_location: '',
    subject: '',
    teachers: '',
    special_notes: '',
    formality: 'formal',
    school_name: '香港培英文具',
  });
  const [generated, setGenerated] = useState<GeneratedResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const keyDates = form.key_dates
        ? form.key_dates.split(',').map((d) => `${d.trim()}T09:00:00`)
        : [];
      const payload: any = {
        title_type: form.title_type,
        target_audience: form.target_audience,
        key_dates: keyDates,
        key_location: form.key_location || undefined,
        subject: form.subject || undefined,
        teachers: form.teachers ? form.teachers.split(',').map((t) => t.trim()) : undefined,
        special_notes: form.special_notes || undefined,
        formality: form.formality,
        school_name: form.school_name,
      };
      const res = await api.generateAnnouncement(payload);
      const result = res.data?.result || res.data;
      setGenerated(result);
    } catch (e: any) {
      setError(e.message || '生成失敗');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generated) {
      setError('請先生成公告內容');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title_zh: generated.title_zh,
        title_en: generated.title_en,
        body_zh: generated.body_zh,
        body_en: generated.body_en,
        announcement_type: form.title_type,
        target_audience: form.target_audience,
        key_location: form.key_location || undefined,
        subject: form.subject || undefined,
        special_notes: form.special_notes || undefined,
        formality: form.formality,
        status: 'draft',
      };
      const res = await api.createAnnouncement(payload);
      const id = res.data?.id;
      router.push(`/dashboard/apple/announcements/${id}`);
    } catch (e: any) {
      setError(e.message || '保存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Topbar title="新建公告" />
      <div className="space-y-4">
        <Link
          href="/dashboard/apple/announcements"
          className="inline-flex items-center gap-1 text-sm text-primary-600"
        >
          <ArrowLeft className="w-4 h-4" /> 返回公告列表
        </Link>

        {error && (
          <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Input form */}
          <div className="p-4 rounded-lg space-y-3 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">公告資訊</h3>

            <Field label="公告類型">
              <select name="title_type" value={form.title_type} onChange={(e) => update('title_type', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900">
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            <Field label="目標對象">
              <select name="target_audience" value={form.target_audience} onChange={(e) => update('target_audience', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900">
                {AUDIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            <Field label="關鍵日期 (用逗號分隔)">
              <input name="key_dates" value={form.key_dates} onChange={(e) => update('key_dates', e.target.value)} placeholder="2026-10-15, 2026-10-20" className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900" />
            </Field>

            <Field label="地點">
              <input name="key_location" value={form.key_location} onChange={(e) => update('key_location', e.target.value)} placeholder="禮堂" className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900" />
            </Field>

            <Field label="科目 (考試類型)">
              <input name="subject" value={form.subject} onChange={(e) => update('subject', e.target.value)} placeholder="數學" className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900" />
            </Field>

            <Field label="負責老師 (用逗號分隔)">
              <input name="teachers" value={form.teachers} onChange={(e) => update('teachers', e.target.value)} placeholder="陳老師, 李老師" className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900" />
            </Field>

            <Field label="特別要求">
              <textarea name="special_notes" value={form.special_notes} onChange={(e) => update('special_notes', e.target.value)} placeholder="請穿著整齊校服" rows={2} className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900" />
            </Field>

            <Field label="語氣">
              <select name="formality" value={form.formality} onChange={(e) => update('formality', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900">
                <option value="formal">正式</option>
                <option value="semi-formal">半正式</option>
                <option value="casual">輕鬆</option>
              </select>
            </Field>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-600 text-white"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? 'AI 生成中...' : 'AI 生成雙語公告'}
            </button>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg space-y-3 bg-white shadow-sm">
            <h3 className="text-base font-semibold flex items-center gap-2 text-gray-900">
              <Megaphone className="w-4 h-4 text-primary-600" /> 預覽
            </h3>
            {!generated ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                <Sparkles className="w-10 h-10 mb-3 text-primary-400" />
                <p className="text-sm">填寫左側資訊後點擊「AI 生成」</p>
              </div>
            ) : (
              <div className="space-y-3">
                {generated.warnings && generated.warnings.length > 0 && (
                  <div className="p-2 rounded-lg text-xs bg-yellow-50 text-yellow-600">
                    ⚠️ {generated.warnings.join('；')}
                  </div>
                )}
                <PreviewBlock label="中文標題" text={generated.title_zh} />
                <PreviewBlock label="English Title" text={generated.title_en} />
                <PreviewBlock label="中文正文" text={generated.body_zh} />
                <PreviewBlock label="English Body" text={generated.body_en} />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? '保存中...' : '保存為草稿'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1 text-gray-500">{label}</label>
      {children}
    </div>
  );
}

function PreviewBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs mb-1 text-gray-500">{label}</p>
      <div className="p-2 rounded-lg text-sm whitespace-pre-wrap bg-gray-50 text-gray-900">
        {text || '—'}
      </div>
    </div>
  );
}
