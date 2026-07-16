'use client';

import { useState } from 'react';
import { X, Copy, FileDown } from 'lucide-react';

interface AwardsScriptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  awardName: string;
  recipients: Array<{ name: string; class: string; student_no: string }>;
}

export default function AwardsScriptDialog({
  isOpen,
  onClose,
  awardName,
  recipients,
}: AwardsScriptDialogProps) {
  const [groupBy, setGroupBy] = useState<'grade' | 'class' | 'student_no'>('class');
  const [script, setScript] = useState('');

  const generateScript = () => {
    let sortedRecipients = [...recipients];

    if (groupBy === 'class') {
      sortedRecipients.sort((a, b) => a.class.localeCompare(b.class));
    } else if (groupBy === 'student_no') {
      sortedRecipients.sort((a, b) => a.student_no.localeCompare(b.student_no));
    } else {
      // grade - extract first digit of class
      sortedRecipients.sort((a, b) => {
        const gradeA = a.class.charAt(0);
        const gradeB = b.class.charAt(0);
        return gradeA.localeCompare(gradeB);
      });
    }

    const scriptLines = sortedRecipients.map((r, index) => {
      return `${index + 1}. ${r.name}，${r.class}班，學號${r.student_no}`;
    });

    const fullScript = `獎項：${awardName}
頒獎順序：
${scriptLines.join('\n')}

（請按順序上台領獎）`;

    setScript(fullScript);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    alert('已複製到剪貼板');
  };

  const exportToWord = () => {
    // Create a simple text download as placeholder
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${awardName}-讀稿.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-xl"
        style={{
          width: '600px',
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
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            獎狀讀稿制作
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Group By Options */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
              分類方式
            </label>
            <div className="flex gap-4">
              {[
                { value: 'grade', label: '按級' },
                { value: 'class', label: '按班' },
                { value: 'student_no', label: '按學號' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="groupBy"
                    value={option.value}
                    checked={groupBy === option.value}
                    onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
                    className="w-4 h-4"
                    style={{ accentColor: 'var(--brand)' }}
                  />
                  <span style={{ color: 'var(--text)' }}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Recipients Count */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'var(--panel-soft)', borderWidth: '1px', borderColor: 'var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              獎項名稱
            </p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>
              {awardName}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
              獲獎人數：{recipients.length} 人
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateScript}
            className="w-full px-4 py-2 rounded-lg font-medium hover:opacity-90"
            style={{ backgroundColor: 'var(--brand)', color: 'var(--panel)' }}
          >
            生成讀稿文本
          </button>

          {/* Script Preview */}
          {script && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                讀稿預覽
              </label>
              <textarea
                value={script}
                readOnly
                rows={12}
                className="w-full rounded-lg p-4 text-sm font-mono resize-none"
                style={{
                  backgroundColor: 'var(--panel-soft)',
                  borderWidth: '1px',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {script && (
          <div
            className="flex justify-end gap-3 p-4"
            style={{
              borderTopWidth: '1px',
              borderColor: 'var(--border)',
            }}
          >
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-80"
              style={{
                borderWidth: '1px',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              <Copy className="w-4 h-4" />
              複製到剪貼板
            </button>
            <button
              onClick={exportToWord}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)', color: 'var(--panel)' }}
            >
              <FileDown className="w-4 h-4" />
              導出文檔
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
