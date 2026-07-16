'use client';

import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface AssetMovementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    id: string;
    name: string;
    currentLocation: string;
  } | null;
  onSubmit: (data: {
    asset_id: string;
    from_location: string;
    to_location: string;
    move_date: string;
    reason: string;
    operator: string;
  }) => void;
}

const locations = [
  '3樓教員室',
  '地下校務處',
  '1樓禮堂',
  '2樓圖書館',
  '4樓實驗室',
  '操场',
  '2樓美術室',
  '1樓醫療室',
];

export default function AssetMovementDialog({
  isOpen,
  onClose,
  asset,
  onSubmit,
}: AssetMovementDialogProps) {
  const [formData, setFormData] = useState({
    to_location: '',
    move_date: new Date().toISOString().split('T')[0],
    reason: '',
    operator: '',
  });

  const handleSubmit = () => {
    if (!asset) return;
    
    if (!formData.to_location || !formData.reason) {
      alert('請填寫所有必填項目');
      return;
    }

    onSubmit({
      asset_id: asset.id,
      from_location: asset.currentLocation,
      to_location: formData.to_location,
      move_date: formData.move_date,
      reason: formData.reason,
      operator: formData.operator || '管理員',
    });
    
    onClose();
    setFormData({
      to_location: '',
      move_date: new Date().toISOString().split('T')[0],
      reason: '',
      operator: '',
    });
  };

  if (!isOpen || !asset) return null;

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
      onClick={onClose}
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
            <ArrowRight className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              資產搬移記錄
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Asset Info */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: 'var(--panel-soft)',
              borderWidth: '1px',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              資產名稱
            </p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>
              {asset.name}
            </p>
          </div>

          {/* Location Flow */}
          <div
            className="flex items-center justify-between rounded-lg p-4"
            style={{
              backgroundColor: 'var(--brand-light)',
              borderWidth: '1px',
              borderColor: 'var(--brand)',
            }}
          >
            <div className="text-center">
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>
                從
              </p>
              <p className="font-medium" style={{ color: 'var(--brand)' }}>
                {asset.currentLocation}
              </p>
            </div>
            <ArrowRight className="w-6 h-6" style={{ color: 'var(--brand)' }} />
            <div className="text-center">
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>
                搬到
              </p>
              <p className="font-medium" style={{ color: 'var(--brand)' }}>
                {formData.to_location || '請選擇'}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                目標地點 <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                value={formData.to_location}
                onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
                className="w-full rounded-md px-3 py-2"
                style={{
                  borderWidth: '1px',
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--panel)',
                  color: 'var(--text)',
                }}
              >
                <option value="">請選擇目標地點</option>
                {locations
                  .filter((loc) => loc !== asset.currentLocation)
                  .map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                搬移日期 <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.move_date}
                onChange={(e) => setFormData({ ...formData, move_date: e.target.value })}
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
                搬移原因 <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full rounded-md px-3 py-2"
                style={{
                  borderWidth: '1px',
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--panel)',
                  color: 'var(--text)',
                }}
              >
                <option value="">請選擇搬移原因</option>
                <option value="教學需要">教學需要</option>
                <option value="空間調整">空間調整</option>
                <option value="維修保養">維修保養</option>
                <option value="活動用途">活動用途</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                經手人
              </label>
              <input
                type="text"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                placeholder="請輸入經手人姓名"
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

        {/* Footer */}
        <div
          className="flex justify-end gap-3 p-4"
          style={{
            borderTopWidth: '1px',
            borderColor: 'var(--border)',
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:opacity-80"
            style={{
              borderWidth: '1px',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg hover:opacity-90"
            style={{ backgroundColor: 'var(--brand)', color: 'var(--panel)' }}
          >
            確認搬移
          </button>
        </div>
      </div>
    </div>
  );
}
