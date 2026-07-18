'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewExamPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    exam_date: '',
    semester: '2025-2026 上學期',
    academic_year: '2025-2026',
    subject: '',
    grade: '',
    total_score: 100,
  });
  const [questions, setQuestions] = useState<{ q: string; points: number }[]>([
    { q: 'Q1', points: 20 },
    { q: 'Q2', points: 20 },
    { q: 'Q3', points: 20 },
    { q: 'Q4', points: 20 },
    { q: 'Q5', points: 20 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const addQuestion = () => setQuestions((qs) => [...qs, { q: `Q${qs.length + 1}`, points: 10 }]);
  const removeQuestion = (i: number) => setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  const setQ = (i: number, key: 'q' | 'points', val: any) =>
    setQuestions((qs) => qs.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)));

  const totalFromQuestions = questions.reduce((s, q) => s + (Number(q.points) || 0), 0);

  const handleSave = async () => {
    if (!form.name || !form.subject || !form.grade || !form.exam_date) {
      setError('請填寫名稱、科目、年級與考試日期');
      return;
    }
    const answer_key: Record<string, number> = {};
    for (const item of questions) {
      if (item.q) answer_key[item.q] = Number(item.points) || 0;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        exam_date: new Date(form.exam_date).toISOString().slice(0, 10),
        total_score: Number(form.total_score) || totalFromQuestions,
        answer_key,
      };
      const res = await api.createExamSession(payload);
      const id = res.data?.id;
      router.push(`/dashboard/apple/grade/exams/${id}`);
    } catch (e: any) {
      setError(e.message || '保存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Topbar title="新建考試場次" />
      <div className="space-y-4 max-w-2xl">
        <Link href="/dashboard/apple/grade/exams" className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--brand)' }}>
          <ArrowLeft className="w-4 h-4" /> 返回考試列表
        </Link>

        {error && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>{error}</div>
        )}

        <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
          <Field label="考試名稱"><input value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} placeholder="中二數學期中考試" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="科目"><input value={form.subject} onChange={(e) => update('subject', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} placeholder="數學" /></Field>
            <Field label="年級"><input value={form.grade} onChange={(e) => update('grade', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} placeholder="中二" /></Field>
            <Field label="考試日期"><input type="date" value={form.exam_date} onChange={(e) => update('exam_date', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} /></Field>
            <Field label="學年"><input value={form.academic_year} onChange={(e) => update('academic_year', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} /></Field>
            <Field label="學期"><input value={form.semester} onChange={(e) => update('semester', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} /></Field>
            <Field label={`滿分 (題目總分: ${totalFromQuestions})`}><input type="number" value={form.total_score} onChange={(e) => update('total_score', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} /></Field>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs" style={{ color: 'var(--muted)' }}>題目配分 (answer key)</label>
              <button onClick={addQuestion} className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}><Plus className="w-3 h-3" /> 加題</button>
            </div>
            <div className="space-y-2">
              {questions.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={item.q} onChange={(e) => setQ(i, 'q', e.target.value)} className="w-20 px-2 py-1.5 rounded text-sm" style={inputStyle} />
                  <input type="number" value={item.points} onChange={(e) => setQ(i, 'points', e.target.value)} className="w-24 px-2 py-1.5 rounded text-sm" style={inputStyle} />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>分</span>
                  <button onClick={() => removeQuestion(i)} className="p-1 rounded" style={{ color: 'var(--danger)' }}><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--good)', color: '#fff' }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? '保存中...' : '創建考試場次'}
          </button>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
      {children}
    </div>
  );
}
