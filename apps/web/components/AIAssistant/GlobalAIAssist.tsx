'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, User, ChevronRight, Wand2, Copy, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAIContext, type AIModule } from '@/lib/ai-context';

interface Message { role: 'user' | 'assistant'; content: string; }

interface Suggestion { label: string; prompt: string; icon: string; }

const MODULE_SUGGESTIONS: Record<AIModule, Suggestion[]> = {
  dashboard: [
    { label: '查詢系統概況', prompt: '請介紹香港培英中學校園管理系統的主要功能模塊', icon: '📊' },
    { label: '本月數據摘要', prompt: '幫我總結本月公告數量、獎項頒發、財務收支和學生表現的概況', icon: '📈' },
  ],
  announcements: [
    { label: '起草學術公告', prompt: '幫我起草一份學校學術比賽的公告，包含報名時間、比賽內容、獎勵', icon: '📢' },
    { label: '起草活動通知', prompt: '幫我起草一份學校運動會或課外活動的通知', icon: '🎉' },
    { label: '翻譯現有內容', prompt: '將以下中文公告翻譯成英文（請提供內容）：', icon: '🌐' },
  ],
  awards: [
    { label: '起草獎項描述', prompt: '幫我起草一個獎項的描述文字，包括獎項名稱、等級、頒發條件', icon: '🏆' },
    { label: '獎學金通知', prompt: '幫我起草一份獎學金申請通知，包含申請資格、金額、截止日期', icon: '💰' },
    { label: '學生推薦信', prompt: '幫我起草一份學生獎項推薦信', icon: '✉️' },
  ],
  finance: [
    { label: '收支分析', prompt: '分析以下財務數據，幫我找出支出異常或收入趨勢（請提供數據）：', icon: '💹' },
    { label: '起草收據說明', prompt: '幫我起草一份收款通知的說明文字', icon: '📄' },
    { label: '預算建議', prompt: '針對學校日常開支，幫我提供一些節省成本的建議', icon: '💡' },
  ],
  assets: [
    { label: '資產盤點報告', prompt: '幫我起草一份資產盤點報告的框架', icon: '📦' },
    { label: '採購申請說明', prompt: '幫我起草一份設備採購申請的說明', icon: '🖥️' },
    { label: '資產報廢說明', prompt: '幫我起草一份資產報廢說明，包括原因和處理建議', icon: '🗑️' },
  ],
  grade: [
    { label: '成績點評', prompt: '幫我為以下學生考試成績撰寫評語：', icon: '📝' },
    { label: '學習建議', prompt: '根據學生學習表現，幫我提供針對性的學習建議', icon: '📚' },
    { label: '家長會通知', prompt: '幫我起草一份家長會通知，包含時間、內容、注意事項', icon: '👨‍👩‍👧' },
  ],
  students: [
    { label: '學生評語', prompt: '幫我撰寫一份學生綜合表現評語', icon: '⭐' },
    { label: '入學歡迎信', prompt: '幫我起草一封新生入學歡迎信', icon: '🎓' },
    { label: '紀律通知', prompt: '幫我起草一份學生紀律處分通知', icon: '📋' },
  ],
  unknown: [
    { label: '一般查詢', prompt: '請回答以下問題：', icon: '❓' },
    { label: '起草文件', prompt: '幫我起草一份學校公文或通知', icon: '📄' },
    { label: '數據分析', prompt: '請分析以下數據並給出建議：', icon: '📊' },
  ],
};

function getModuleFromPath(path: string): AIModule {
  if (path.includes('/announcements')) return 'announcements';
  if (path.includes('/awards')) return 'awards';
  if (path.includes('/finance')) return 'finance';
  if (path.includes('/assets')) return 'assets';
  if (path.includes('/grade')) return 'grade';
  if (path.includes('/students')) return 'students';
  return 'unknown';
}

export default function GlobalAIAssist() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'chat'>('quick');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentModule, setCurrentModule] = useState<AIModule>('unknown');
  const { insertIntoField, activeFieldLabel } = useAIContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = window.location.pathname;
    setCurrentModule(getModuleFromPath(path));
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  const runPrompt = async (prompt: string, label?: string) => {
    setActiveTab('chat');
    if (label) {
      setInput(prompt);
    }
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
    try {
      const res = await api.generateAI(prompt, 'chat');
      const reply = res.data?.result || '抱歉，暫時無法生成回覆。';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ 錯誤：${e.message || '請求失敗'}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    runPrompt(input);
    setInput('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const suggestions = MODULE_SUGGESTIONS[currentModule] || MODULE_SUGGESTIONS.unknown;

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all hover:scale-110 animate-pulse-subtle"
        style={{ backgroundColor: 'var(--accent)', color: 'white', boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)' }}
        title="AI 助手"
      >
        <Sparkles className="w-5 h-5" />
      </button>

      {/* AI Popover */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 rounded-xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">AI 全局助手</span>
              <span className="text-xs opacity-75 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                {currentModule === 'unknown' ? '通用' : '當前頁面'}
              </span>
              {activeFieldLabel && (
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  目標：{activeFieldLabel}
                </span>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
            {[['quick', '快捷功能'], ['chat', '聊天']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'quick' | 'chat')}
                className="flex-1 py-2 text-sm font-medium transition-colors"
                style={{ color: activeTab === key ? 'var(--accent)' : 'var(--muted)', borderBottom: activeTab === key ? '2px solid var(--accent)' : '2px solid transparent' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 120px)' }}>
            {activeTab === 'quick' && (
              <div className="p-3 space-y-2">
                <p className="text-xs px-1 mb-3" style={{ color: 'var(--muted)' }}>
                  根據當前頁面，為你推薦以下 AI 功能：
                </p>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => runPrompt(s.prompt, s.label)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: 'var(--panel-soft)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{s.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>由 AI 幫你快速生成</div>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                  </button>
                ))}

                <div className="border-t pt-3 mt-3" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs px-1 mb-2" style={{ color: 'var(--muted)' }}>插入到當前輸入框：</p>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80"
                    style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}
                  >
                    <Wand2 className="w-4 h-4" />
                    輸入指令，讓 AI 幫你填寫當前字段
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col" style={{ minHeight: '300px' }}>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--muted)' }} />
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        告訴我你想做什麼，我會幫你完成
                      </p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: msg.role === 'user' ? 'var(--brand)' : 'var(--accent)', color: 'white' }}
                      >
                        {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      <div
                        className="max-w-[80%] px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: msg.role === 'user' ? 'var(--brand-light)' : 'var(--panel-soft)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                        {msg.role === 'assistant' && (
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => copyToClipboard(msg.content)}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:opacity-70"
                              style={{ backgroundColor: 'var(--border)', color: 'var(--muted)' }}
                            >
                              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              複製
                            </button>
                            <button
                              onClick={() => insertIntoField(msg.content)}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:opacity-70"
                              style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                              title={activeFieldLabel ? `插入到：${activeFieldLabel}` : '請先點擊一個輸入框再使用此功能'}
                            >
                              <Wand2 className="w-3 h-3" />
                              {activeFieldLabel ? '插入字段' : '需選擇字段'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="px-3 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--panel-soft)', border: '1px solid var(--border)' }}>
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--muted)' }} />
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>AI 思考中...</span>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="輸入指令或描述你需要 AI 幫你做的事..."
                      className="flex-1 px-3 py-2 text-sm rounded-lg border"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-base)', color: 'var(--text)' }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      className="px-3 py-2 rounded-lg disabled:opacity-50"
                      style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>
                    {activeFieldLabel ? "按 Enter 發送，AI 回覆會插入到「" + activeFieldLabel + "」" : '先點擊任意輸入框，AI 回覆將自動插入'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
