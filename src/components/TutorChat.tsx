import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, AlertCircle, X, HelpCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import MathRenderer from './MathRenderer';

interface TutorChatProps {
  topicTitle: string;
  grade: string;
  onClose?: () => void;
}

export default function TutorChat({ topicTitle, grade, onClose }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    setMessages([
      {
        role: 'model',
        text: `Chào em! Thầy/Cô là MathJunior, gia sư toán AI của em. 🌾 \n\nEm đang ôn tập bài **"${topicTitle}"** (Lớp ${grade}). Em có chỗ nào chưa hiểu rõ trong phần lý thuyết hoặc bài tập chưa biết hướng giải không? Đừng ngần ngại hỏi nhé, thầy/cô sẽ hướng dẫn em từng bước một!`
      }
    ]);
    checkApiKeyStatus();
  }, [topicTitle, grade]);

  // Scroll to bottom on response
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const checkApiKeyStatus = async () => {
    try {
      const res = await fetch('/api/math/status');
      const data = await res.json();
      if (!data.hasKey) {
        setApiKeyMissing(true);
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setError(null);

    const updatedMessages: ChatMessage[] = [...messages, { role: 'user', text: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/math/chat-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          topicTitle,
          grade
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi liên lạc với gia sư AI.');
      }

      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đớp kết nối mạng. Hãy kiểm tra lại cấu hình.');
      if (err.message?.includes('GEMINI_API_KEY') || err.message?.includes('thiết lập')) {
        setApiKeyMissing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (text: string) => {
    setInput(text);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl">
      {/* Title Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/30 rounded-lg text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100">Gia sư AI ôn tập</h3>
            <p className="text-[11px] text-slate-400 capitalize max-w-[180px] truncate">chủ đề: {topicTitle}</p>
          </div>
        </div>
        
        {onClose && (
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{ id: `chat-msg-${index}` }}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`text-[10px] mb-1 px-1 text-slate-400 font-medium`}>
              {msg.role === 'user' ? 'Em' : 'Gia sư MathJunior 🎓'}
            </div>
            <div 
              style={{ id: `chat-bubble-${index}` }}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs inline-block leading-relaxed shadow-md ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
              }`}
            >
              <MathRenderer text={msg.text} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start" style={{ id: 'chat-loading' }}>
            <div className="text-[10px] mb-1 px-1 text-slate-400">Gia sư đang suy nghĩ...</div>
            <div className="bg-slate-800 text-slate-400 border border-slate-700/50 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {error && (
          <div style={{ id: 'chat-error' }} className="flex gap-2.5 bg-red-950/40 text-red-300 p-3 rounded-xl border border-red-900/60 text-xs mt-2 relative">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-400" />
            <div className="flex-1">
              <p className="font-semibold mb-0.5">Lỗi kết nối</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {apiKeyMissing && (
          <div style={{ id: 'chat-api-notice' }} className="bg-amber-950/40 text-amber-200 p-3.5 rounded-xl border border-amber-900/50 text-xs space-y-1.5 mt-2">
            <p className="font-semibold flex items-center gap-1.5 text-amber-400">
              <HelpCircle className="w-4.5 h-4.5" />
              Thiếu API Key cho Gia sư AI
            </p>
            <p className="text-[11px] leading-relaxed text-amber-300">
              Bạn chưa định cấu hình <strong>GEMINI_API_KEY</strong>. Vui lòng mở bảng điều khiển <strong>Settings &gt; Secrets</strong> ở góc màn hình, tạo khóa bí mật mới và đặt tên là <code>GEMINI_API_KEY</code> rồi dán mã khóa API vào đó để trải nghiệm tính năng.
            </p>
          </div>
        )}
      </div>

      {/* Suggestion Prompts */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-slate-800 space-y-1 bg-slate-900" style={{ id: 'chat-suggestions' }}>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Gợi ý câu hỏi nhanh:</p>
          <div className="flex flex-wrap gap-1.5 max-h-[75px] overflow-y-auto">
            <button 
              type="button"
              onClick={() => handleQuickQuestion('Hãy lấy thêm cho em một ví dụ thực tế khác về bài này!')}
              className="text-[11px] bg-slate-850 hover:bg-slate-750 text-slate-300 border border-slate-750 hover:border-slate-650 px-2.5 py-1 rounded-full transition-all text-left truncate max-w-full"
            >
              💡 Lấy thêm ví dụ minh họa thực tế
            </button>
            <button 
              type="button"
              onClick={() => handleQuickQuestion('Nội dung phần lý thuyết trọng tâm gồm những gì thầy/cô?')}
              className="text-[11px] bg-slate-850 hover:bg-slate-750 text-slate-300 border border-slate-750 hover:border-slate-650 px-2.5 py-1 rounded-full transition-all text-left truncate max-w-full"
            >
              📚 Tóm tắt lý thuyết cốt lõi
            </button>
            <button 
              type="button"
              onClick={() => handleQuickQuestion('Lỗi nào dễ bị mất điểm nhất khi làm dạng toán này ạ?')}
              className="text-[11px] bg-slate-850 hover:bg-slate-750 text-slate-300 border border-slate-750 hover:border-slate-650 px-2.5 py-1 rounded-full transition-all text-left truncate max-w-full"
            >
              ⚠️ Những lỗi sai cần đặc biệt tránh
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-850 border-t border-slate-800 flex items-center gap-2">
        <input 
          id="tutor-chat-input"
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập phần em muốn hỏi gia sư..."
          disabled={loading}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button 
          id="btn-send-tutor-chat"
          type="submit" 
          disabled={!input.trim() || loading}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
