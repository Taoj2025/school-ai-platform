'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, FileText, Download, Eye, Check } from 'lucide-react';

// Common input style using CSS variables
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--border)',
  borderRadius: '6px',
  backgroundColor: 'var(--panel)',
  color: 'var(--text)',
  outline: 'none',
};

// Mock students data
const mockStudents = [
  { id: '1', name: '陳小明', class: '1A', student_no: '2025001' },
  { id: '2', name: '李美美', class: '1A', student_no: '2025002' },
  { id: '3', name: '張大文', class: '1B', student_no: '2025003' },
  { id: '4', name: '王小红', class: '1B', student_no: '2025004' },
  { id: '5', name: '劉志偉', class: '2A', student_no: '2024001' },
  { id: '6', name: '黃淑芬', class: '2A', student_no: '2024002' },
  { id: '7', name: '周杰倫', class: '2B', student_no: '2024003' },
  { id: '8', name: '吳依琳', class: '3A', student_no: '2023001' },
  { id: '9', name: '孫雅琪', class: '3A', student_no: '2023002' },
  { id: '10', name: '鄭宇翔', class: '3B', student_no: '2023003' },
];

export default function GenerateCertificatesPage() {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [awardName, setAwardName] = useState('學業優異獎');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(mockStudents.map((s) => s.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((s) => s !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleGenerate = () => {
    if (selectedStudents.length === 0) {
      alert('請選擇至少一名學生');
      return;
    }
    setGenerating(true);
    // Simulate PDF generation
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const handlePreview = (studentId: string) => {
    const student = mockStudents.find((s) => s.id === studentId);
    alert(`預覽獎狀：${student?.name} - ${awardName}`);
  };

  return (
    <>
      <Topbar title="生成獎狀" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/apple/awards"
              className="p-2 rounded-md hover:opacity-70"
              style={{ color: 'var(--muted)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>批量生成獎狀</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>選擇學生並批量生成獎狀 PDF</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={selectedStudents.length === 0 || generating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--brand)', color: 'var(--panel)' }}
            >
              <FileText className="w-4 h-4" />
              {generating ? '生成中...' : '生成 PDF'}
            </button>
          </div>
        </div>

        {/* Award Info */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                獎項名稱
              </label>
              <select
                value={awardName}
                onChange={(e) => setAwardName(e.target.value)}
                style={inputStyle}
              >
                <option value="學業優異獎">學業優異獎</option>
                <option value="品行優良獎">品行優良獎</option>
                <option value="服務精神獎">服務精神獎</option>
                <option value="體育優異獎">體育優異獎</option>
                <option value="藝術成就獎">藝術成就獎</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                已選擇
              </label>
              <div className="px-3 py-2 rounded-md" style={{ backgroundColor: 'var(--panel-soft)', borderWidth: '1px', borderColor: 'var(--border)' }}>
                {selectedStudents.length} 名學生
              </div>
            </div>
          </div>
        </div>

        {/* Generated Status */}
        {generated && (
          <div className="rounded-lg p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--good-bg)', borderWidth: '1px', borderColor: 'var(--good)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--good)' }}>
              <Check className="w-5 h-5" />
              <span>已成功生成 {selectedStudents.length} 份獎狀</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90" style={{ backgroundColor: 'var(--good)', color: 'var(--panel)' }}>
              <Download className="w-4 h-4" />
              下載全部
            </button>
          </div>
        )}

        {/* Student List */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="p-4" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)' }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--brand)' }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>全選</span>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-12" style={{ color: 'var(--muted)' }}>
                    選擇
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    學號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    班別
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
              {mockStudents.map((student) => (
                <tr key={student.id} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--brand)' }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text)' }}>
                    {student.student_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                    {student.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handlePreview(student.id)}
                      className="p-2 rounded hover:opacity-70"
                      style={{ color: 'var(--brand)' }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </>
  );
}
