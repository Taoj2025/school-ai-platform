'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Edit, FileText, Download, User, Award } from 'lucide-react';

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

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
              className="p-2 rounded-md hover:opacity-70"
              style={{ color: 'var(--muted)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}>
                <span className="text-2xl font-bold">
                  {student.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{student.name}</h2>
                  <span className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{ backgroundColor: 'var(--good-bg)', color: 'var(--good)' }}>
                    在讀
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  學號：{student.student_no} | 班別：{student.class}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/apple/students/${student.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <Edit className="w-4 h-4" />
              編輯
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}>
              <FileText className="w-4 h-4" />
              生成證明
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-lg" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
            <nav className="flex -mb-px">
              {['info', 'attendance', 'awards', 'certificates'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className="px-6 py-3 text-sm font-medium border-b-2"
                  style={{
                    borderColor: activeTab === tab ? 'var(--brand)' : 'transparent',
                    color: activeTab === tab ? 'var(--brand)' : 'var(--muted)',
                  }}
                >
                  {tab === 'info' ? '基本信息' : tab === 'attendance' ? '出席記錄' : tab === 'awards' ? '獎項記錄' : '證明文件'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[
                    { label: '姓名', value: student.name },
                    { label: '學號', value: student.student_no },
                    { label: '班別', value: student.class },
                    { label: '性別', value: student.gender === 'M' ? '男' : '女' },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>{item.label}</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[
                    { label: '出生日期', value: student.date_of_birth },
                    { label: '身份證號碼', value: student.id_number },
                    { label: '入學日期', value: student.enrollment_date },
                    { label: '監護人', value: student.parent_name },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>{item.label}</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="col-span-2">
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>聯絡電話</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{student.parent_phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>住址</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{student.address}</p>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>狀態</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>備註</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                    {mockAttendance.map((record, idx) => (
                      <tr key={idx} style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>{record.date}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{ backgroundColor: record.status === 'present' ? 'var(--good-bg)' : 'var(--danger-bg)', color: record.status === 'present' ? 'var(--good)' : 'var(--danger)' }}>
                            {record.status === 'present' ? '出席' : '缺席'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{record.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'awards' && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>獎項名稱</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>學期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>獲獎日期</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                    {mockAwards.map((award, idx) => (
                      <tr key={idx} style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                            {award.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{award.semester}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{award.date}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-2 rounded hover:opacity-70" style={{ color: 'var(--brand)' }}>
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
                  <div key={idx} className="rounded-lg p-4 hover:opacity-80" style={{ borderWidth: '1px', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text)' }}>{cert.name}</p>
                          <p className="text-sm" style={{ color: 'var(--muted)' }}>發出日期：{cert.issue_date}</p>
                        </div>
                      </div>
                      <button className="p-2 rounded hover:opacity-70" style={{ color: 'var(--brand)' }}>
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
