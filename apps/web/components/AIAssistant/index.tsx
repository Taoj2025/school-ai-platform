'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  className?: string;
}

const suggestions = [
  '上周發布了多少公告？',
  '幫我起草一份期中考試通知',
  '哪些學生這個月退步明顯？',
  '上月收支情況如何？',
];

export default function AIAssistant({ className = '' }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是 Apple AI 助手。我可以幫助你：\n\n• 查詢公告、獎項、財務、資產、成績等數據\n• 幫你起草各類通知\n• 分析學生表現\n• 回答系統操作問題\n\n請問有什麼可以幫到你？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '感謝你的提問！我正在分析你的需求...\n\n目前我還在學習階段，請告訴我你具體想做什么，我會尽力幫你完成任務。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className={`ai-assistant ${className}`}>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all hover:scale-105"
        style={{
          backgroundColor: 'var(--brand)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(161, 56, 56, 0.4)',
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 rounded-xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: 'var(--brand)', color: 'white' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Apple AI 助手</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="h-96 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: 'var(--bg-base)' }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
                  style={{
                    backgroundColor:
                      msg.role === 'user' ? 'var(--brand)' : 'var(--accent)',
                    color: 'white',
                  }}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                    msg.role === 'user' ? '' : 'rounded-tl-none'
                  }`}
                  style={{
                    backgroundColor:
                      msg.role === 'user' ? 'var(--brand-light)' : 'var(--panel)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div
                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div
                  className="px-4 py-2 rounded-lg rounded-tl-none"
                  style={{
                    backgroundColor: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: 'var(--muted)', animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: 'var(--muted)', animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: 'var(--muted)', animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div
            className="px-4 py-2 border-t"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)' }}
          >
            <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
              試試這些問題：
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-xs rounded-full border transition-colors hover:border-brand"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--panel-soft)',
                    color: 'var(--text)',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div
            className="p-4 border-t"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)' }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="輸入你的問題..."
                className="flex-1 px-4 py-2 text-sm rounded-lg border"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text)',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--brand)', color: 'white' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
