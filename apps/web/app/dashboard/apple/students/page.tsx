'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import {
  Plus,
  Search,
  Upload,
  Download,
  Eye,
  Edit,
  FileText,
  Users,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

// Mock data
const mockStudents = [
  { id: '1', name: '陳小明', student_no: '2025001', class: '1A', gender: 'M', enrollment_date: '2025-09-01', status: 'active' },
  { id: '2', name: '李美美', student_no: '2025002', class: '1A', gender: 'F', enrollment_date: '2025-09-01', status: 'active' },
  { id: '3', name: '張大文', student_no: '2025003', class: '1B', gender: 'M', enrollment_date: '2025-09-01', status: 'active' },
  { id: '4', name: '王小红', student_no: '2025004', class: '1B', gender: 'F', enrollment_date: '2025-09-01', status: 'active' },
  { id: '5', name: '劉志偉', student_no: '2024001', class: '2A', gender: 'M', enrollment_date: '2024-09-01', status: 'active' },
  { id: '6', name: '黃淑芬', student_no: '2024002', class: '2A', gender: 'F', enrollment_date: '2024-09-01', status: 'active' },
  { id: '7', name: '周杰倫', student_no: '2024003', class: '2B', gender: 'M', enrollment_date: '2024-09-01', status: 'inactive' },
  { id: '8', name: '吳依琳', student_no: '2023001', class: '3A', gender: 'F', enrollment_date: '2023-09-01', status: 'active' },
  { id: '9', name: '孫雅琪', student_no: '2023002', class: '3A', gender: 'F', enrollment_date: '2023-09-01', status: 'active' },
  { id: '10', name: '鄭宇翔', student_no: '2023003', class: '3B', gender: 'M', enrollment_date: '2023-09-01', status: 'active' },
];

const classes = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
const statusMap = {
  active: { label: '在讀', color: 'bg-green-100 text-green-700' },
  inactive: { label: '休學', color: 'bg-gray-100 text-gray-700' },
  graduated: { label: '畢業', color: 'bg-blue-100 text-blue-700' },
};

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || student.class === filterClass;
    const matchesStatus = !filterStatus || student.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const activeStudents = mockStudents.filter((s) => s.status === 'active').length;
  const totalStudents = mockStudents.length;

  return (
    <>
      <Topbar title="學生管理" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">學生列表</h2>
            <p className="text-sm text-gray-500 mt-1">管理學生資料、出席記錄和證明文件</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/apple/students/import"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="w-4 h-4" />
              批量導入
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              匯出名單
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary-50">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">學生總數</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-50">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">在讀學生</p>
                <p className="text-2xl font-bold text-green-600">{activeStudents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-50">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">休學學生</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {totalStudents - activeStudents}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-50">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">班別數量</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
            </div>
          </div>
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
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部班別</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部狀態</option>
              {Object.entries(statusMap).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
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
                  班別
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  性別
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
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.gender === 'M' ? '男' : '女'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.enrollment_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[student.status as keyof typeof statusMap].color}`}>
                        {statusMap[student.status as keyof typeof statusMap].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/apple/students/${student.id}`}
                          className="p-2 text-gray-500 hover:text-primary-600 rounded-md hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/apple/students/${student.id}/edit`}
                          className="p-2 text-gray-500 hover:text-primary-600 rounded-md hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
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
