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
      // Simulate parsing
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
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">批量導入學生</h2>
            <p className="text-sm text-gray-500 mt-1">上傳 Excel 或 CSV 文件批量導入學生資料</p>
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
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              拖放文件到這裡，或點擊上傳
            </p>
            <p className="text-sm text-gray-500">
              支持 .xlsx 和 .csv 格式
            </p>
          </div>
        )}

        {/* Uploading State */}
        {uploading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 mx-auto border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-900">正在解析文件...</p>
          </div>
        )}

        {/* Preview */}
        {imported.length > 0 && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file?.name}</p>
                  <p className="text-sm text-gray-500">{imported.length} 行資料</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="w-4 h-4" />
                  {imported.filter((s) => s.status === 'success').length} 成功
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <X className="w-4 h-4" />
                  {imported.filter((s) => s.status === 'error').length} 失敗
                </span>
              </div>
            </div>

            {/* Preview Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-900">預覽</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">行號</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">學號</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">班別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">性別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {imported.map((student) => (
                      <tr key={student.row} className={student.status === 'error' ? 'bg-red-50' : ''}>
                        <td className="px-4 py-3 text-sm text-gray-500">{student.row}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{student.student_no}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.class}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.gender === 'M' ? '男' : '女'}</td>
                        <td className="px-4 py-3">
                          {student.status === 'success' ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                              準備導入
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
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
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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
