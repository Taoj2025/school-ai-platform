'use client';

import { useState, useRef } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, Download, Check, X, AlertCircle } from 'lucide-react';

interface ImportedStudent {
  row: number;
  name: string;
  student_no: string;
  class: string;
  gender: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export default function ImportStudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imported, setImported] = useState<ImportedStudent[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      simulateImport();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      simulateImport();
    }
  };

  const simulateImport = () => {
    setUploading(true);
    setTimeout(() => {
      setImported([
        { row: 1, name: '陳小明', student_no: '2025001', class: '1A', gender: 'M', status: 'success' },
        { row: 2, name: '李美美', student_no: '2025002', class: '1A', gender: 'F', status: 'success' },
        { row: 3, name: '張大文', student_no: '2025003', class: '1B', gender: 'M', status: 'error', error: '學號已存在' },
        { row: 4, name: '王小红', student_no: '2025004', class: '1B', gender: 'F', status: 'success' },
        { row: 5, name: '劉志偉', student_no: '2024001', class: '2A', gender: 'M', status: 'success' },
      ]);
      setUploading(false);
    }, 1500);
  };

  const handleImport = () => {
    const successCount = imported.filter((s) => s.status === 'success').length;
    alert(`成功導入 ${successCount} 名學生`);
    setImported([]);
    setFile(null);
  };

  const downloadTemplate = () => {
    alert('下載學生資料範本');
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
