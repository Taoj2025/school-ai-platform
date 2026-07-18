'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useAIGlobal } from '@/lib/ai-context';
import { awardTypeLabel, awardStatusLabel } from '@/lib/utils';

const awardTypeOptions = [
  { value: 'academic', label: '學業獎' },
  { value: 'conduct', label: '品行獎' },
  { value: 'service', label: '服務獎' },
  { value: 'sports', label: '體育獎' },
  { value: 'arts', label: '藝術獎' },
  { value: 'other', label: '其他獎' },
];

const semesterOptions = [
  { value: '上學期', label: '上學期' },
  { value: '下學期', label: '下學期' },
  { value: '全學年', label: '全學年' },
];

const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'pending_approval', label: '待審批' },
  { value: 'approved', label: '已審批' },
  { value: 'published', label: '已發布' },
  { value: 'archived', label: '已歸檔' },
];

export default function EditAwardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  useAIGlobal('awards', '編輯獎項');

  const [formData, setFormData] = useState({
    name: '',
    award_type: 'academic',
    academic_year: '2025-2026',
    semester: '上學期',
    amount: '',
    status: 'draft',
    description: '',
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.getAward(id);
        const a = res.data;
        setFormData({
          name: a.name || '',
          award_type: a.award_type || 'academic',
          academic_year: a.academic_year || '2025-2026',
          semester: a.semester || '上學期',
          amount: a.amount != null ? String(a.amount) : '',
          status: a.status || 'draft',
          description: a.description || '',
        });
      } catch (e: any) {
        setError(e.message || '載入失敗');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateAward(id, {
        name: formData.name,
        award_type: formData.award_type,
        academic_year: formData.academic_year,
        semester: formData.semester,
        amount: formData.amount ? Number(formData.amount) : null,
        status: formData.status,
        description: formData.description,
      });
      router.push(`/dashboard/apple/awards/${id}`);
    } catch (e: any) {
      alert(e.message || '保存失敗');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (<><Topbar title="編輯獎項" /><div className="p-6 flex items-center justify-center min-h-[400px]"><p className="text-gray-500">載入中...</p></div></>);
  }

  const inputClass = 'w-full px-4 py-2 rounded-md outline-none transition-colors bg-gray-50 border border-gray-200 text-gray-900';

  return (
    <>
      <Topbar title="編輯獎項" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/apple/awards/${id}`} className="p-2 rounded-md hover:opacity-70 text-gray-500"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">編輯獎項</h2>
              <p className="text-sm mt-1 text-gray-500">獎項ID: {id}</p>
            </div>
          </div>
        </div>

        {error && <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg p-6 bg-white border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">獎項信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">獎項名稱 *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">獎項類型 *</label>
                <select name="award_type" value={formData.award_type} onChange={handleChange} required className={inputClass}>
                  {awardTypeOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">學年 *</label>
                <input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange} required placeholder="例如: 2025-2026" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">學期 *</label>
                <select name="semester" value={formData.semester} onChange={handleChange} required className={inputClass}>
                  {semesterOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">獎金金額 (HKD)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="選填" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">狀態 *</label>
                <select name="status" value={formData.status} onChange={handleChange} required className={inputClass}>
                  {statusOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2 text-gray-900">備註說明</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="輸入獎項的詳細說明..." />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href={`/dashboard/apple/awards/${id}`} className="px-6 py-2 border rounded-lg hover:opacity-80 transition-opacity border-gray-200 text-gray-900">取消</Link>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity bg-primary-600">
              <Save className="w-4 h-4" />{saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
