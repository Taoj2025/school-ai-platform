'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, Download, Check, X, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ImportedStudent {
  row: number;
  name: string;
  student_no: string;
  class: string;
  gender: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  for (const line of lines) {
    const cells = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    rows.push(cells);
  }
  return rows;
}

export default function ImportStudentsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imported, setImported] = useState<ImportedStudent[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      parseFile(droppedFile);
    }
  };

  const parseFile = (f: File) => {
    setError(null);
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const rows = parseCsv(text);
        if (rows.length < 2) {
          setError('文件沒有資料行');
          setUploading(false);
          return;
        }
        const header = rows[0].map((h) => h.toLowerCase());
        const col = (name: string) => header.indexOf(name);
        const nameIdx = col('姓名') >= 0 ? col('姓名') : 0;
        const noIdx = col('學號') >= 0 ? col('學號') : 1;
        const classIdx = col('班別') >= 0 ? col('班別') : 2;
        const genderIdx = col('性別') >= 0 ? col('性別') : 3;

        const parsed: ImportedStudent[] = rows.slice(1).map((cells, i) => {
          const name = cells[nameIdx] || '';
          const student_no = cells[noIdx] || '';
          const cls = cells[classIdx] || '';
          const genderRaw = (cells[genderIdx] || '').toUpperCase();
          const gender = genderRaw === 'F' || genderRaw === '女' ? 'F' : 'M';
          if (!name || !student_no) {
            return { row: i + 2, name, student_no, class: cls, gender, status: 'error', error: '缺少姓名或學號' };
          }
          return { row: i + 2, name, student_no, class: cls, gender, status: 'success' };
        });
        setImported(parsed);
      } catch {
        setError('解析文件失敗');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(f, 'utf-8');
  };

  const handleImport = async () => {
    const successStudents = imported.filter((s) => s.status === 'success');
    if (successStudents.length === 0) {
      setError('沒有可導入的學生');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const payload = successStudents.map((s) => ({
        student_no: s.student_no,
        name_zh: s.name,
        name_en: s.name,
        gender: s.gender,
        class_name: s.class,
        admission_date: new Date().toISOString().split('T')[0],
      }));
      const res = await api.bulkCreateStudents(payload);
      const importedCount = res?.data?.imported ?? successStudents.length;
      const failed = res?.data?.failed ?? 0;
      alert(`成功導入 ${importedCount} 名學生${failed > 0 ? `（${failed} 名失敗）` : ''}`);
      setImported([]);
      setFile(null);
      router.push('/dashboard/apple/students');
      router.refresh();
    } catch (e: any) {
      setError(e.message || '導入失敗');
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Generate a CSV template
    const headers = ['姓名', '學號', '班別', '性別'];
    const exampleRows = [
      ['陳小明', '2025001', '1A', 'M'],
      ['李美美', '2025002', '1A', 'F'],
    ];
    const csvContent = '\uFEFF' + [headers, ...exampleRows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '學生資料範本.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      <Topbar title="導入學生" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/apple/students"
            className="p-2 rounded-md hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>批量導入學生</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>上傳 Excel 或 CSV 文件批量導入學生資料</p>
          </div>
        </div>

        {/* Upload Area */}
        {!imported.length && !uploading && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors"
            style={{
              borderColor: dragOver ? 'var(--brand)' : 'var(--border)',
              backgroundColor: dragOver ? 'var(--brand-light)' : 'var(--panel)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted)' }} />
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>
              拖放文件到這裡，或點擊上傳
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              支持 .xlsx 和 .csv 格式
            </p>
          </div>
        )}

        {/* Uploading State */}
        {uploading && (
          <div className="rounded-lg p-12 text-center" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
            <div className="w-12 h-12 mx-auto border-4 rounded-full animate-spin mb-4" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>正在解析文件...</p>
          </div>
        )}

        {/* Preview */}
        {imported.length > 0 && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="rounded-lg p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--good-bg)', color: 'var(--good)' }}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{file?.name}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{imported.length} 行資料</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1" style={{ color: 'var(--good)' }}>
                  <Check className="w-4 h-4" />
                  {imported.filter((s) => s.status === 'success').length} 成功
                </span>
                <span className="flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                  <X className="w-4 h-4" />
                  {imported.filter((s) => s.status === 'error').length} 失敗
                </span>
              </div>
            </div>

            {/* Preview Table */}
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
              <div className="p-4" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)' }}>
                <h3 className="font-medium" style={{ color: 'var(--text)' }}>預覽</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>行號</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>學號</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>姓名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>班別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>性別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>狀態</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                    {imported.map((student) => (
                      <tr key={student.row} style={{ borderBottomWidth: '1px', borderColor: 'var(--border)', backgroundColor: student.status === 'error' ? 'var(--danger-bg)' : undefined }}>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{student.row}</td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text)' }}>{student.student_no}</td>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>{student.name}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{student.class}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{student.gender === 'M' ? '男' : '女'}</td>
                        <td className="px-4 py-3">
                          {student.status === 'success' ? (
                            <span className="flex items-center gap-1" style={{ color: 'var(--good)' }}>
                              <Check className="w-4 h-4" />
                              準備導入
                            </span>
                          ) : (
                            <span className="flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                              <AlertCircle className="w-4 h-4" />
                              {student.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg p-4" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <Download className="w-4 h-4" />
                下載範本
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setImported([]);
                    setFile(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  取消
                </button>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  <Check className="w-4 h-4" />
                  確認導入
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
