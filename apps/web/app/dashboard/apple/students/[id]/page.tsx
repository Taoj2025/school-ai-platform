'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Edit, FileText, Download, User, Calendar, Book, Award } from 'lucide-react';

// Mock student data
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

const mockAttendance = [
  { date: '2025-09-15', status: 'present', remark: '' },
  { date: '2025-09-16', status: 'present', remark: '' },
  { date: '2025-09-17', status: 'absent', remark: '病假' },
  { date: '2025-09-18', status: 'present', remark: '' },
  { date: '2025-09-19', status: 'present', remark: '' },
];

const mockAwards = [
  { name: '學業進步獎', date: '2025-06-30', semester: '2024-2025 下學期' },
  { name: '服務精神獎', date: '2025-06-30', semester: '2024-2025 下學期' },
];

const mockCertificates = [
  { name: '獎學金證明', issue_date: '2025-06-30', type: 'scholarship' },
  { name: '操行獎勵證明', issue_date: '2025-06-30', type: 'conduct' },
];

const statusMap = {
  active: { label: '在讀', color: 'bg-green-100 text-green-700' },
  inactive: { label: '休學', color: 'bg-gray-100 text-gray-700' },
  graduated: { label: '畢業', color: 'bg-blue-100 text-blue-700' },
};

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'awards' | 'certificates'>('info');
  const [student] = useState(mockStudent);

  return (
    <>
      <Topbar title="學生詳情" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/apple/students"
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">
                  {student.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[student.status as keyof typeof statusMap].color}`}>
                    {statusMap[student.status as keyof typeof statusMap].label}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  學號：{student.student_no} | 班別：{student.class}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/apple/students/${student.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
              編輯
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <FileText className="w-4 h-4" />
              生成證明
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'info'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                基本信息
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'attendance'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                出席記錄
              </button>
              <button
                onClick={() => setActiveTab('awards')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'awards'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                獎項記錄
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'certificates'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                證明文件
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">姓名</p>
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">學號</p>
                    <p className="text-sm font-medium text-gray-900">{student.student_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">班別</p>
                    <p className="text-sm font-medium text-gray-900">{student.class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">性別</p>
                    <p className="text-sm font-medium text-gray-900">{student.gender === 'M' ? '男' : '女'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">出生日期</p>
                    <p className="text-sm font-medium text-gray-900">{student.date_of_birth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">身份證號碼</p>
                    <p className="text-sm font-medium text-gray-900">{student.id_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">入學日期</p>
                    <p className="text-sm font-medium text-gray-900">{student.enrollment_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">監護人</p>
                    <p className="text-sm font-medium text-gray-900">{student.parent_name}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">聯絡電話</p>
                  <p className="text-sm font-medium text-gray-900">{student.parent_phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">住址</p>
                  <p className="text-sm font-medium text-gray-900">{student.address}</p>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">備註</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockAttendance.map((record, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {record.status === 'present' ? '出席' : '缺席'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{record.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'awards' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">獎項名稱</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">學期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">獲獎日期</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockAwards.map((award, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-500" />
                            {award.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{award.semester}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{award.date}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-2 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="grid grid-cols-2 gap-4">
                {mockCertificates.map((cert, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{cert.name}</p>
                          <p className="text-sm text-gray-500">發出日期：{cert.issue_date}</p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
