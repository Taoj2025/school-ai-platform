'use client';

import { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

interface UploadDropzoneProps {
  accept?: string;
  maxSize?: number; // in MB
  onUpload: (file: File) => void;
  onError?: (error: string) => void;
}

export default function UploadDropzone({
  accept = '*/*',
  maxSize = 10,
  onUpload,
  onError,
}: UploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.size > maxSize * 1024 * 1024) {
      onError?.(`文件大小不能超過 ${maxSize}MB`);
      return;
    }
    setFile(selectedFile);
    onUpload(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
      style={{
        borderColor: dragOver ? 'var(--brand)' : 'var(--border)',
        backgroundColor: dragOver ? 'var(--brand-light)' : 'var(--panel-soft)',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) {
            handleFile(selectedFile);
          }
        }}
        className="hidden"
      />

      {file ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="w-8 h-8" style={{ color: 'var(--brand)' }} />
          <div className="text-left">
            <p className="font-medium" style={{ color: 'var(--text)' }}>
              {file.name}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      ) : (
        <>
          <Upload
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: 'var(--muted)' }}
          />
          <p className="font-medium mb-2" style={{ color: 'var(--text)' }}>
            拖放文件到這裡，或點擊上傳
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            支持 {accept} 格式，最大 {maxSize}MB
          </p>
        </>
      )}
    </div>
  );
}
