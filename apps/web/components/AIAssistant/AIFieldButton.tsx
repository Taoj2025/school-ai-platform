'use client';

import { useState, useRef } from 'react';
import { Sparkles, Loader2, X, Check, Copy } from 'lucide-react';
import { api } from '@/lib/api';
import { useAIContext } from '@/lib/ai-context';

interface AIFieldButtonProps {
  placeholder?: string;
  label?: string;
  onGenerated?: (content: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function AIFieldButton({ placeholder, label, onGenerated, className = '', style }: AIFieldButtonProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { registerField, unregisterField, insertIntoField } = useAIContext();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setResult(null);
    setInput('');
    registerField(inputRef.current, label || '一般輸入');
  };

  const handleClose = () => {
    setOpen(false);
    unregisterField();
  };

  const handleGenerate = async () => {
    if (!input.trim() || loading) return;
    const prompt = placeholder
      ? `請根據以下關鍵詞生成一段${placeholder}的內容：${input}`
      : input;
    setLoading(true);
    try {
      const res = await api.generateAI(prompt, 'chat');
      const text = res.data?.result || '暫無結果';
      setResult(text);
    } catch (e: any) {
      setResult(`錯誤：${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (result) {
      if (onGenerated) {
        onGenerated(result);
      }
      insertIntoField(result);
      handleClose();
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`} style={style}>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:opacity-80"
        style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        title="AI 幫我生成內容"
      >
        <Sparkles className="w-3.5 h-3.5" />
        AI
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 w-80 rounded-lg shadow-xl overflow-hidden"
          style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI 生成{label && ` - ${label}`}
            </div>
            <button onClick={handleClose} className="p-0.5 rounded hover:bg-white/20">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-2">
            {placeholder && (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                描述你想生成的內容：{placeholder}
              </p>
            )}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder={`輸入關鍵詞或描述，例如：學術比賽報名通知...`}
              className="w-full px-3 py-2 text-sm rounded-lg border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-base)', color: 'var(--text)' }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={!input.trim() || loading}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                生成
              </button>
            </div>

            {result && (
              <div className="mt-2 p-2 rounded border" style={{ backgroundColor: 'var(--panel-soft)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>AI 生成結果：</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                    className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                    style={{ color: 'var(--muted)', backgroundColor: 'var(--border)' }}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? '已複製' : '複製'}
                  </button>
                </div>
                <pre className="text-xs whitespace-pre-wrap" style={{ color: 'var(--text)', fontFamily: 'inherit' }}>{result}</pre>
                <button
                  onClick={handleInsert}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                  style={{ backgroundColor: 'var(--brand)', color: 'white' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  插入到當前字段
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
