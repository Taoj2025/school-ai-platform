'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { formatDate, studentStatusLabels } from '@/lib/utils';
import {
  Plus,
  Search,
  Upload,
  Download,
  User,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';

interface Student {
  id: string;
  student_no: string;
  name_zh: string;
  name_en?: string;
  gender: string;
  class_name: string;
  grade: number;
  enrollment_date: string;
  status: string;
}

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('');

  const students: Student[] = [
    { id: '1', student_no: 'S2024001', name_zh: '陳小明', name_en: 'Chan Ming', gender: 'M', class_name: '1A', grade: 1, enrollment_date: '2024-09-01', status: 'active' },
    { id: '2', student_no: 'S2024002', name_zh: '李小華', name_en: 'Lee Hua', gender: 'M', class_name: '1A', grade: 1, enrollment_date: '2024-09-01', status: 'active' },
    { id: '3', student_no: 'S2023051', name_zh: '王美麗', name_en: 'Wang Mei', gender: 'F', class_name: '2B', grade: 2, enrollment_date: '2023-09-01', status: 'active' },
    { id: '4', student_no: 'S2024045', name_zh: '張偉', name_en: 'Zhang Wei', gender: 'M', class_name: '3C', grade: 3, enrollment_date: '2024-09-01', status: 'active' },
    { id: '5', student_no: 'S2022089', name_zh: '劉靜', name_en: 'Liu Jing', gender: 'F', class_name: '4D', grade: 4, enrollment_date: '2022-09-01', status: 'active' },
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name_zh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !filterGrade || student.grade === parseInt(filterGrade);
    return matchesSearch && matchesGrade;
  });

  return (
    <>
      <Topbar 
        title="學生管理"
        breadcrumbs={[
          { name: 'Apple 子系統', href: '/dashboard/apple' },
          { name: '學生管理' },
        ]}
      />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">學生列表</h2>
            <p className="text-sm text-gray-500 mt-1">管理學生資料、出席記錄和證明文件</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              匯出名單
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              批量導入
            </button>
            <Link
              href="/dashboard/apple/students/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              新增學生
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((grade) => {
            const count = students.filter(s => s.grade === grade).length;
            return (
              <div key={grade} className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">一年級</p>
                <p className="text-2xl font-bold text-gray-900">{count} 人</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="搜索學生姓名或學號..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部年級</option>
              <option value="1">一年級</option>
              <option value="2">二年級</option>
              <option value="3">三年級</option>
              <option value="4">四年級</option>
              <option value="5">五年級</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  學號
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  姓名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  班級
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  年級
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  入學日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    暫無學生記錄
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {student.student_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name_zh}</p>
                          {student.name_en && (
                            <p className="text-xs text-gray-500">{student.name_en}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.class_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.grade} 年級
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(student.enrollment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-700' :
                        student.status === 'graduated' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {studentStatusLabels[student.status] || student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/apple/students/${student.id}`}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="查看"
                        >
                          <User className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/apple/students/${student.id}/certificates`}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="證明文件"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
