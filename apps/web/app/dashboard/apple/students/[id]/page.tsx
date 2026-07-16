'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Edit, FileText, Download, User, Award, X } from 'lucide-react';
import { getStudentById } from '@/lib/studentStore';

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
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [selectedCertType, setSelectedCertType] = useState<string>('study');
  const [generating, setGenerating] = useState(false);

  // Load student data based on ID
  useEffect(() => {
    if (id) {
      const studentData = getStudentById(id);
      if (studentData) {
        setStudent(studentData as typeof mockStudent);
      } else {
        // Fallback to default mock data with adjusted ID
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

  const certTypes = [
    { value: 'study', label: '在讀證明', description: '證明學生在校就讀' },
    { value: 'conduct', label: '操行證明', description: '證明學生品行良好' },
    { value: 'scholarship', label: '獎學金證明', description: '證明學生獲得獎學金' },
    { value: 'attendance', label: '出席證明', description: '證明學生出席記錄良好' },
  ];

  const handleGenerateCertificate = async () => {
    setGenerating(true);

    try {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = '#ffffff';
      document.body.appendChild(container);

      const certTypeLabel = certTypes.find((c) => c.value === selectedCertType)?.label || '證明';
      const today = new Date();
      const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

      container.innerHTML = `
        <div style="font-family: 'Microsoft JhengHei', 'PingFang TC', serif; padding: 60px 80px; border: 8px double #8b4513; background: linear-gradient(135deg, #fffef5 0%, #fff9e6 100%); min-height: 1000px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="font-size: 24px; color: #8b4513; font-weight: bold; letter-spacing: 8px; margin-bottom: 10px;">香港培英中學</div>
            <div style="font-size: 36px; color: #8b4513; font-weight: bold; letter-spacing: 16px;">${certTypeLabel}</div>
            <div style="width: 60px; height: 3px; background: #8b4513; margin: 20px auto;"></div>
          </div>

          <div style="font-size: 16px; line-height: 2.5; color: #333; margin: 40px 0; text-indent: 2em;">
            <p>茲證明本校學生</p>
            <p style="text-align: center; font-size: 24px; font-weight: bold; color: #8b4513; margin: 20px 0;">
              ${student.name}（學號：${student.student_no}）
            </p>
            <p>現於本校 ${student.class} 班就讀，${selectedCertType === 'study' ? '在校期間表現良好，特此證明。' : selectedCertType === 'conduct' ? '品行端正，遵守校規，特此證明。' : selectedCertType === 'scholarship' ? '榮獲本校獎學金，特此證明。' : '出席記錄良好，特此證明。'}</p>
          </div>

          <div style="margin-top: 80px; display: flex; justify-content: space-between;">
            <div style="text-align: center;">
              <div style="border-top: 2px solid #333; width: 150px; padding-top: 10px; font-size: 14px;">班主任簽署</div>
            </div>
            <div style="text-align: center;">
              <div style="border-top: 2px solid #333; width: 150px; padding-top: 10px; font-size: 14px;">校長簽署</div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 60px; font-size: 14px; color: #666;">
            <p>發出日期：${dateStr}</p>
            <p style="margin-top: 10px;">（本證明書須蓋校印方為有效）</p>
          </div>
        </div>
      `;

      await new Promise(resolve => setTimeout(resolve, 200));

      // Dynamically import html2canvas and jsPDF
      const [html2canvas, jspdfModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas.default(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/png');
      const jsPDF = jspdfModule.default;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `${certTypeLabel}_${student.name}_${student.student_no}.pdf`;
      pdf.save(fileName);

      setShowCertDialog(false);
    } catch (error) {
      console.error('Certificate generation error:', error);
      alert('證明生成失敗，請稍後再試');
    } finally {
      setGenerating(false);
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
            <button
              onClick={() => setShowCertDialog(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
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

      {/* Certificate Generation Dialog */}
      {showCertDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => !generating && setShowCertDialog(false)}
        >
          <div
            className="rounded-lg w-full max-w-md p-6"
            style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>生成證明文件</h3>
              <button
                onClick={() => setShowCertDialog(false)}
                disabled={generating}
                className="p-1 rounded hover:opacity-70 disabled:opacity-30"
                style={{ color: 'var(--muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              為 {student.name}（學號：{student.student_no}）選擇證明類型
            </p>

            <div className="space-y-2 mb-6">
              {certTypes.map((type) => (
                <label
                  key={type.value}
                  className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:opacity-80"
                  style={{
                    borderWidth: '1px',
                    borderColor: selectedCertType === type.value ? 'var(--brand)' : 'var(--border)',
                    backgroundColor: selectedCertType === type.value ? 'var(--brand-light)' : 'var(--panel-soft)',
                  }}
                >
                  <input
                    type="radio"
                    name="certType"
                    value={type.value}
                    checked={selectedCertType === type.value}
                    onChange={(e) => setSelectedCertType(e.target.value)}
                    className="mt-1"
                    disabled={generating}
                  />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{type.label}</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>{type.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCertDialog(false)}
                disabled={generating}
                className="px-4 py-2 border rounded-lg hover:opacity-80 disabled:opacity-50"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                取消
              </button>
              <button
                onClick={handleGenerateCertificate}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                <Download className="w-4 h-4" />
                {generating ? '生成中...' : '下載 PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
