'use client';

import { useState, useRef } from 'react';
import { X, Upload, Camera, Loader2, Check, AlertCircle } from 'lucide-react';

interface UploadAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: string;
    location: string;
    purchase_date: string;
    value: number;
    confidence: 'high' | 'medium' | 'low';
  }) => void;
}

const assetCategories = [
  '電子設備',
  '家具',
  '教學器材',
  '運動器材',
  '圖書',
  '樂器',
  '其他',
];

const locations = [
  '3樓教員室',
  '地下校務處',
  '1樓禮堂',
  '2樓圖書館',
  '4樓實驗室',
  '操场',
];

export default function UploadAssetDialog({
  isOpen,
  onClose,
  onSubmit,
}: UploadAssetDialogProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    name: string;
    category: string;
    location: string;
    purchase_date: string;
    value: number;
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
        name: '投影機',
        category: '電子設備',
        location: '3樓教員室',
        purchase_date: '2025-01-15',
        value: 8500.0,
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
              OCR 識別資產
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
                拖放發票圖片到這裡，或點擊上傳
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
                正在識別發票...
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
                    資產名稱 <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={ocrResult.name}
                    onChange={(e) => setOcrResult({ ...ocrResult, name: e.target.value })}
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
                    類別
                  </label>
                  <select
                    value={ocrResult.category}
                    onChange={(e) => setOcrResult({ ...ocrResult, category: e.target.value })}
                    className="w-full rounded-md px-3 py-2"
                    style={{
                      borderWidth: '1px',
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--panel)',
                      color: 'var(--text)',
                    }}
                  >
                    {assetCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    存放地點
                  </label>
                  <select
                    value={ocrResult.location}
                    onChange={(e) => setOcrResult({ ...ocrResult, location: e.target.value })}
                    className="w-full rounded-md px-3 py-2"
                    style={{
                      borderWidth: '1px',
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--panel)',
                      color: 'var(--text)',
                    }}
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    購買日期
                  </label>
                  <input
                    type="date"
                    value={ocrResult.purchase_date}
                    onChange={(e) => setOcrResult({ ...ocrResult, purchase_date: e.target.value })}
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
                    價值 (HK$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={ocrResult.value}
                    onChange={(e) => setOcrResult({ ...ocrResult, value: parseFloat(e.target.value) })}
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
              確認並新增
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
