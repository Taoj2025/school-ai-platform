'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { getStudentById, updateStudent } from '@/lib/studentStore';

// Mock student data (default fallback)
const mockStudent = {
  id: '1',
  name: '陳小明',
  student_no: '2025001',
  class: '1A',
  gender: 'M',
  enrollment_date: '2025-09-01',
  status: 'active',
  date_of_birth: '2013-05-15',
  id_number: 'A123456(7)',
  parent_name: '陳先生',
  parent_phone: '9876-5432',
  address: '香港九龍彩虹區彩虹道123號',
};

const classOptions = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
const statusOptions = [
  { value: 'active', label: '在讀' },
  { value: 'graduated', label: '畢業' },
  { value: 'transferred', label: '轉學' },
  { value: 'suspended', label: '休學' },
];

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [formData, setFormData] = useState({ ...mockStudent });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load student data
  useEffect(() => {
    if (id) {
      const student = getStudentById(id);
      if (student) {
        // Merge with mockStudent to ensure all fields exist
        setFormData({ ...mockStudent, ...student });
      } else {
        setFormData({ ...mockStudent, id });
      }
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updated = updateStudent(id, formData);
      if (updated) {
        alert('學生資料已更新');
        router.push(`/dashboard/apple/students/${id}`);
        router.refresh();
      } else {
        alert('更新失敗，找不到學生');
      }
    } catch (error) {
      console.error('Failed to update student:', error);
      alert('更新失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="編輯學生" />
        <div className="p-6 flex items-center justify-center" style={{ minHeight: '400px' }}>
          <p style={{ color: 'var(--muted)' }}>載入中...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="編輯學生" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/apple/students/${id}`}
            className="p-2 rounded-md hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>編輯學生</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              學生ID: {id}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>基本信息</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  姓名 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md outline-none"
                  style={{
                    backgroundColor: 'var(--panel-soft)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              {/* Student No */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  學號 *
                </label>
                <input
                  type="text"
                  name="student_no"
                  value={formData.student_no}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md outline-none"
                  style={{
                    backgroundColor: 'var(--panel-soft)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  班別 *
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md outline-none"
                  style={{
                    backgroundColor: 'var(--panel-soft)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {classOptions.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  性別 *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md outline-none"
                  style={{
                    backgroundColor: 'var(--panel-soft)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  <option value="M">男</option>
                  <option value="F">女</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  出生日期 *
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md outline-none"
                  style={{
                    backgroundColor: 'var(--panel-soft)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              {/* ID Number */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  身份證號碼
                </label>
                <input
                  type="text"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md outline-none"
                  style={{
                    backgroundColor: 'var(--panel-soft)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              {/* Enrollment Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  入學日期 *
                </label>
                <input
                  type="date"
                  name="enrollment_date"
                  value={formData.enrollment_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md outline-none"
                  style={{
                    backgroundColor: 'var(--panel-soft)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  狀態 *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md outline-none"
                  style={{
                    backgroundColor: 'var(--panel-soft)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parent Info */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>監護人信息</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  監護人姓名 *
                </label>
                <input
                  type="text"
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md outline-none"
                  style={{
                    backgroundColor: 'var(--panel-soft)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  聯絡電話 *
                </label>
                <input
                  type="tel"
                  name="parent_phone"
                  value={formData.parent_phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md outline-none"
                  style={{
                    backgroundColor: 'var(--panel-soft)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  住址
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 rounded-md outline-none resize-none"
                  style={{
                    backgroundColor: 'var(--panel-soft)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href={`/dashboard/apple/students/${id}`}
              className="px-6 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}