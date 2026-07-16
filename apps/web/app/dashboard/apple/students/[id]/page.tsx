'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Edit, FileText, Download, User, Award } from 'lucide-react';

// Mock student data
const mockStudents: Record<string, typeof mockStudent> = {
  '1': {
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
  },
  '2': {
    id: '2',
    name: '李美美',
    student_no: '2025002',
    class: '1A',
    gender: 'F',
    enrollment_date: '2025-09-01',
    status: 'active',
    date_of_birth: '2013-08-22',
    id_number: 'A234567(8)',
    parent_name: '李太太',
    parent_phone: '9123-4567',
    address: '香港九龍旺角彌敦道456號',
  },
  '3': {
    id: '3',
    name: '張大文',
    student_no: '2025003',
    class: '1B',
    gender: 'M',
    enrollment_date: '2025-09-01',
    status: 'active',
    date_of_birth: '2013-03-10',
    id_number: 'A345678(9)',
    parent_name: '張先生',
    parent_phone: '9234-5678',
    address: '香港新界沙田區沙田正街789號',
  },
  '4': {
    id: '4',
    name: '王小红',
    student_no: '2025004',
    class: '1B',
    gender: 'F',
    enrollment_date: '2025-09-01',
    status: 'active',
    date_of_birth: '2013-11-25',
    id_number: 'A456789(0)',
    parent_name: '王太太',
    parent_phone: '9345-6789',
    address: '香港港島東區太古城道321號',
  },
  '5': {
    id: '5',
    name: '劉志偉',
    student_no: '2024001',
    class: '2A',
    gender: 'M',
    enrollment_date: '2024-09-01',
    status: 'active',
    date_of_birth: '2012-07-18',
    id_number: 'A567890(1)',
    parent_name: '劉先生',
    parent_phone: '9456-7890',
    address: '香港九龍觀塘區觀塘道654號',
  },
  '6': {
    id: '6',
    name: '黃思婷',
    student_no: '2024002',
    class: '2A',
    gender: 'F',
    enrollment_date: '2024-09-01',
    status: 'active',
    date_of_birth: '2012-04-12',
    id_number: 'A678901(2)',
    parent_name: '黃太太',
    parent_phone: '9567-8901',
    address: '香港新界元朗區元朗大馬路987號',
  },
  '7': {
    id: '7',
    name: '周俊宇',
    student_no: '2024003',
    class: '2B',
    gender: 'M',
    enrollment_date: '2024-09-01',
    status: 'active',
    date_of_birth: '2012-09-30',
    id_number: 'A789012(3)',
    parent_name: '周先生',
    parent_phone: '9678-9012',
    address: '香港港島南區香港仔大道147號',
  },
};

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

export default function StudentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'awards' | 'certificates'>('info');
  const [student, setStudent] = useState(mockStudent);
  const [loading, setLoading] = useState(true);

  // Load student data based on ID
  useEffect(() => {
    if (id) {
      const studentData = mockStudents[id];
      if (studentData) {
        setStudent(studentData);
      } else {
        // For other IDs, use default mock data with adjusted ID
        setStudent({ ...mockStudent, id });
      }
      setLoading(false);
    }
  }, [id]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '在讀';
      case 'graduated': return '畢業';
      case 'transferred': return '轉學';
      case 'suspended': return '休學';
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { backgroundColor: 'var(--good-bg)', color: 'var(--good)' };
      case 'graduated':
        return { backgroundColor: 'var(--info-bg)', color: 'var(--info)' };
      case 'transferred':
        return { backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' };
      case 'suspended':
        return { backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' };
      default:
        return { backgroundColor: 'var(--panel-soft)', color: 'var(--text)' };
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="學生詳情" />
        <div className="p-6 flex items-center justify-center" style={{ minHeight: '400px' }}>
          <p style={{ color: 'var(--muted)' }}>載入中...</p>
        </div>
      </>
    );
  }

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
                    style={getStatusStyle(student.status)}>
                    {getStatusLabel(student.status)}
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
