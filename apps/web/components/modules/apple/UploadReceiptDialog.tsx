'use client';

import { useState, useRef } from 'react';
import { X, Upload, Camera, Loader2, Check, AlertCircle } from 'lucide-react';

interface UploadReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    date: string;
    payer: string;
    purpose: string;
    confidence: 'high' | 'medium' | 'low';
  }) => void;
}

export default function UploadReceiptDialog({
  isOpen,
  onClose,
  onSubmit,
}: UploadReceiptDialogProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    amount: number;
    date: string;
    payer: string;
    purpose: string;
    confidence: 'high' | 'medium' | 'low';
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateOCR(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      simulateOCR(file);
    }
  };

  const simulateOCR = (file: File) => {
    setUploading(true);
    // Simulate OCR processing
    setTimeout(() => {
      setOcrResult({
        amount: 1500.0,
        date: '2025-07-15',
        payer: '家長會',
        purpose: '學生活動費',
        confidence: 'high',
      });
      setUploading(false);
    }, 2000);
  };

  const handleSubmit = () => {
    if (ocrResult) {
      onSubmit(ocrResult);
      onClose();
      setOcrResult(null);
    }
  };

  const handleClose = () => {
    onClose();
    setOcrResult(null);
    setUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        className="rounded-lg shadow-xl"
        style={{
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: 'var(--panel)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{
            borderBottomWidth: '1px',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              OCR 識別收據
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-md hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Upload Area */}
          {!ocrResult && !uploading && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
              style={{
                borderColor: dragOver ? 'var(--brand)' : 'var(--border)',
                backgroundColor: dragOver ? 'var(--brand-light)' : 'var(--panel-soft)',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted)' }} />
              <p className="font-medium mb-2" style={{ color: 'var(--text)' }}>
                拖放收據圖片到這裡，或點擊上傳
              </p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                支持 JPG、PNG 格式
              </p>
            </div>
          )}

          {/* Uploading State */}
          {uploading && (
            <div
              className="rounded-lg p-12 text-center"
              style={{ backgroundColor: 'var(--panel-soft)', borderWidth: '1px', borderColor: 'var(--border)' }}
            >
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: 'var(--brand)' }} />
              <p className="font-medium" style={{ color: 'var(--text)' }}>
                正在識別收據...
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                請稍候
              </p>
            </div>
          )}

          {/* OCR Result */}
          {ocrResult && (
            <div className="space-y-4">
              {/* Confidence Badge */}
              <div
                className="rounded-lg p-3 flex items-center gap-2"
                style={{
                  backgroundColor:
                    ocrResult.confidence === 'high'
                      ? 'var(--good-bg)'
                      : ocrResult.confidence === 'medium'
                      ? 'var(--warning-bg)'
                      : 'var(--danger-bg)',
                  color:
                    ocrResult.confidence === 'high'
                      ? 'var(--good)'
                      : ocrResult.confidence === 'medium'
                      ? 'var(--warning)'
                      : 'var(--danger)',
                }}
              >
                {ocrResult.confidence === 'high' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">
                  識別可信度：
                  {ocrResult.confidence === 'high'
                    ? '高'
                    : ocrResult.confidence === 'medium'
                    ? '中'
                    : '低'}
                </span>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    金額 (HK$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={ocrResult.amount}
                    onChange={(e) => setOcrResult({ ...ocrResult, amount: parseFloat(e.target.value) })}
                    className="w-full rounded-md px-3 py-2"
                    style={{
                      borderWidth: '1px',
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--panel)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    日期
                  </label>
                  <input
                    type="date"
                    value={ocrResult.date}
                    onChange={(e) => setOcrResult({ ...ocrResult, date: e.target.value })}
                    className="w-full rounded-md px-3 py-2"
                    style={{
                      borderWidth: '1px',
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--panel)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    付款人
                  </label>
                  <input
                    type="text"
                    value={ocrResult.payer}
                    onChange={(e) => setOcrResult({ ...ocrResult, payer: e.target.value })}
                    className="w-full rounded-md px-3 py-2"
                    style={{
                      borderWidth: '1px',
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--panel)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    用途
                  </label>
                  <input
                    type="text"
                    value={ocrResult.purpose}
                    onChange={(e) => setOcrResult({ ...ocrResult, purpose: e.target.value })}
                    className="w-full rounded-md px-3 py-2"
                    style={{
                      borderWidth: '1px',
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--panel)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 p-4"
          style={{
            borderTopWidth: '1px',
            borderColor: 'var(--border)',
          }}
        >
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg hover:opacity-80"
            style={{
              borderWidth: '1px',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            取消
          </button>
          {ocrResult && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)', color: 'var(--panel)' }}
            >
              確認並提交
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
