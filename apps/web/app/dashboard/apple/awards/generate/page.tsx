'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, FileText, Download, Eye, Check } from 'lucide-react';

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
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">批量生成獎狀</h2>
              <p className="text-sm text-gray-500 mt-1">選擇學生並批量生成獎狀 PDF</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={selectedStudents.length === 0 || generating}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              {generating ? '生成中...' : '生成 PDF'}
            </button>
          </div>
        </div>

        {/* Award Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                獎項名稱
              </label>
              <select
                value={awardName}
                onChange={(e) => setAwardName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="學業優異獎">學業優異獎</option>
                <option value="品行優良獎">品行優良獎</option>
                <option value="服務精神獎">服務精神獎</option>
                <option value="體育優異獎">體育優異獎</option>
                <option value="藝術成就獎">藝術成就獎</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                已選擇
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                {selectedStudents.length} 名學生
              </div>
            </div>
          </div>
        </div>

        {/* Generated Status */}
        {generated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5" />
              <span>已成功生成 {selectedStudents.length} 份獎狀</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-4 h-4" />
              下載全部
            </button>
          </div>
        )}

        {/* Student List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">全選</span>
            </label>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  選擇
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  學號
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  姓名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  班別
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.student_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {student.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handlePreview(student.id)}
                      className="p-2 text-gray-500 hover:text-primary-600 rounded-md hover:bg-gray-100"
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
    </>
  );
}
