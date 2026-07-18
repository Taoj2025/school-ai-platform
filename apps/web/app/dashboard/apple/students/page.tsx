'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { normalizeStudent, type Student } from '@/lib/studentStore';

const classes = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStudents({ page: 1, page_size: 200 });
      const items = (res.data?.items ?? []).map(normalizeStudent);
      setStudents(items);
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || student.class === filterClass;
    const matchesStatus = !filterStatus || student.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const activeStudents = students.filter((s) => s.status === 'active').length;
  const totalStudents = students.length;

  const handleExport = () => {
    const csv = [
      ['學號', '姓名', '班別', '性別', '入學日期', '狀態'],
      ...filteredStudents.map((s) => [
        s.student_no,
        s.name,
        s.class,
        s.gender === 'M' ? '男' : '女',
        s.enrollment_date,
        s.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`確定刪除學生「${student.name}」？`)) return;
    try {
      await api.deleteStudent(student.id);
      await loadStudents();
    } catch (e: any) {
      alert(e.message || '刪除失敗');
    }
  };

  return (
    <>
      <Topbar title="學生管理" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>學生列表</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>管理學生資料、出席記錄和證明文件</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/apple/students/import"
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)', color: 'var(--text)' }}
            >
              <Upload className="w-4 h-4" />
              批量導入
            </Link>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)', color: 'var(--text)' }}>
              <Download className="w-4 h-4" />
              匯出名單
            </button>
            <Link
              href="/dashboard/apple/students/new"
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Plus className="w-4 h-4" />
              新增學生
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {loading && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>載入中...</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}>
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>學生總數</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{totalStudents}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--good-bg)', color: 'var(--good)' }}>
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>在讀學生</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--good)' }}>{activeStudents}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>休學學生</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>
                  {totalStudents - activeStudents}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>班別數量</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{classes.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
              <input
                type="search"
                placeholder="搜索學生姓名或學號..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-md"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}
              />
            </div>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 border rounded-md"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}
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
              className="px-3 py-2 border rounded-md"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}
            >
              <option value="">全部狀態</option>
              <option value="active">在讀</option>
              <option value="inactive">休學</option>
              <option value="graduated">畢業</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    學號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    班別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    性別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    入學日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    狀態
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center" style={{ color: 'var(--muted)' }}>
                      暫無學生記錄
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono" style={{ color: 'var(--text)' }}>
                        {student.student_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}>
                            <span className="text-sm font-medium">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                        {student.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                        {student.gender === 'M' ? '男' : '女'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                        {student.enrollment_date}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className="px-2 py-1 text-xs font-medium rounded-full"
                           style={{ backgroundColor: student.status === 'active' ? 'var(--good-bg)' : 'var(--warning-bg)', color: student.status === 'active' ? 'var(--good)' : 'var(--warning)' }}>
                           {student.status === 'active' ? '在讀' : student.status === 'graduated' ? '畢業' : student.status === 'transferred' ? '轉學' : student.status === 'suspended' ? '休學' : student.status}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <div className="flex items-center justify-end gap-1">
                           <Link
                             href={`/dashboard/apple/students/${student.id}`}
                             className="p-2 rounded-md hover:opacity-70"
                             style={{ color: 'var(--brand)' }}
                           >
                             <Eye className="w-4 h-4" />
                           </Link>
                           <Link
                             href={`/dashboard/apple/students/${student.id}/edit`}
                             className="p-2 rounded-md hover:opacity-70"
                             style={{ color: 'var(--brand)' }}
                           >
                             <Edit className="w-4 h-4" />
                           </Link>
                           <button
                             onClick={() => handleDelete(student)}
                             className="p-2 rounded-md hover:opacity-70"
                             style={{ color: 'var(--danger)' }}
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
