/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, MessageSquare, Trash2, Menu, LogOut, Shield, Award, 
  Send, Sparkles, User, Key, Check, Info, Server, HelpCircle, 
  ChevronLeft, ChevronRight, Lock, Clock, Eye, SendHorizontal, AlertCircle, X,
  Copy, Smartphone, Tablet, Monitor, Maximize2, RotateCw, Paperclip, Mic, Image as ImageIcon,
  ShieldAlert
} from 'lucide-react';
import { ChatSession, ChatMessage, User as UserType } from './types';
import AdminPanel from './components/AdminPanel';

function LiveVipCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('WAKTU HABIS');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      
      let res = '';
      if (days > 0) res += `${days}h `;
      res += `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      setTimeLeft(res);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="font-mono tabular-nums tracking-tight animate-pulse text-amber-300">{timeLeft}</span>;
}

// Model Categories
const GLOBAL_MODELS = [
  { id: 'ChatGPT', name: 'ChatGPT', dev: 'OpenAI', desc: 'Serba bisa, jawaban tajam dan berstruktur.', color: 'from-emerald-650 to-teal-500' },
  { id: 'DeepSeek', name: 'DeepSeek', dev: 'DeepSeek AI', desc: 'Rasional, teknis, logika canggih.', color: 'from-blue-600 to-indigo-500' },
  { id: 'Kimi', name: 'Kimi', dev: 'Moonshot', desc: 'Ember empati, penalaran panjang mendetail.', color: 'from-orange-600 to-amber-500' },
  { id: 'Grok', name: 'Grok', dev: 'xAI', desc: 'Witty, humoris, sedikit memberontak.', color: 'from-zinc-700 to-zinc-900 border border-zinc-700' },
  { id: 'Dola', name: 'Dola AI', dev: 'Dola Tech', desc: 'Cepat tanggap, struktur poin aksi instan.', color: 'from-cyan-600 to-sky-500' },
  { id: 'Gemini', name: 'Gemini', dev: 'Google', desc: 'Kreatif, ekspresif, wawasan multi-arah.', color: 'from-blue-500 to-purple-600' }
];

const ABIL_FREE_MODELS = [
  { id: 'abil-ai 2.5', name: 'Abil-Ai 2.5', desc: 'Sangat ringan & respon super instan.', tier: 'Standard' },
  { id: 'abil-ai 3.5', name: 'Abil-Ai 3.5', desc: 'Model pintar asisten harian serbaguna.', tier: 'Standard' },
  { id: 'abil-ai 4.5', name: 'Abil-Ai 4.5', desc: 'Penalaran analisis tinggi dengan pemrogram.', tier: 'Standard' }
];

const ABIL_VIP_MODELS = [
  { id: 'Abil-Ai v5.6 pro', name: 'Abil-Ai v5.6 Pro', desc: 'Model Pro canggih penalaran analitik logis tinggi.', tier: 'VIP' },
  { id: 'Abil-Ai v6.6 plus', name: 'Abil-Ai v6.6 Plus', desc: 'Model Plus langkah demi langkah menyelesaikan sains sulit.', tier: 'VIP' },
  { id: 'Abil-Ai v7.5 ultra', name: 'Abil-Ai v7.5 Ultra', desc: 'Puncak model kedaulatan AI murni, koding & analisis dewa.', tier: 'VIP' }
];

// Custom sub-component to render beautifully tabbed code blocks with dynamic local previews
const CodeBlock = ({ 
  code, 
  lang, 
  isHtml, 
  onPreviewHtml 
}: { 
  code: string; 
  lang: string; 
  isHtml: boolean; 
  onPreviewHtml: (html: string) => void; 
  key?: any; 
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="border border-zinc-800/80 rounded-xl overflow-hidden my-3.5 w-full bg-[#0a0a0c] shadow-lg flex flex-col">
      {/* Tab bar header matching style references */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-850 bg-[#121216] select-none shrink-0">
        {/* Language title label */}
        <span className="font-mono text-[11px] font-extrabold text-zinc-350 tracking-wider lowercase">
          {lang || (isHtml ? 'html' : 'code')}
        </span>

        {/* Tools panel on the right */}
        <div className="flex items-center gap-2">
          {/* Main Selectable Toggles: Code vs Preview tab controls */}
          {isHtml && (
            <div className="bg-[#18181c] border border-zinc-800/80 p-0.5 rounded-lg flex items-center">
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-md text-[10px] font-black tracking-wider uppercase transition-all select-none cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-[#2d2d34] text-white shadow-sm border border-zinc-700/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md text-[10px] font-black tracking-wider uppercase transition-all select-none cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-[#2d2d34] text-emerald-400 shadow-sm border border-zinc-700/20'
                    : 'text-zinc-450 hover:text-zinc-250'
                }`}
              >
                Preview
              </button>
            </div>
          )}

          {/* Icon toolbar features */}
          <div className="flex items-center gap-0.5">
            {/* Interactive Refresh indicator in Preview mode */}
            {isHtml && activeTab === 'preview' && (
              <button
                type="button"
                onClick={handleRefresh}
                className="p-1.5 hover:bg-zinc-800/80 text-zinc-450 hover:text-zinc-100 rounded-lg transition cursor-pointer active:scale-95"
                title="Muat Ulang Simulasi (Refresh)"
              >
                <RotateCw size={13} />
              </button>
            )}

            {/* Expand full interactive screen modal option */}
            <button
              type="button"
              onClick={() => onPreviewHtml(code)}
              className="p-1.5 hover:bg-zinc-800/80 text-zinc-450 hover:text-zinc-100 rounded-lg transition cursor-pointer active:scale-95"
              title="Tinjau Layar Penuh"
            >
              <Maximize2 size={13} />
            </button>

            {/* Standard Copy Clipboard system */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 hover:bg-zinc-800/80 text-zinc-450 hover:text-zinc-100 rounded-lg transition cursor-pointer active:scale-95"
              title="Salin Kode"
            >
              {copied ? (
                <Check size={13} className="text-emerald-400 font-extrabold animate-pulse" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main dynamic window panel */}
      <div className="relative w-full overflow-hidden flex-1 flex flex-col">
        {activeTab === 'code' ? (
          <div className="overflow-x-auto w-full p-4 bg-black/45 text-left">
            <pre className="font-mono text-xs text-purple-100/90 whitespace-pre overflow-x-visible min-w-max">
              <code>{code}</code>
            </pre>
          </div>
        ) : (
          <div className="w-full bg-white h-[320px] relative overflow-hidden flex flex-col border-t border-zinc-900/10">
            <iframe
              key={iframeKey}
              title="HTML Sandbox"
              srcDoc={code}
              sandbox="allow-scripts"
              className="w-full h-full bg-white border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Custom component to format, copy and preview HTML codes / general markdown nicely
const MessageRenderer = ({ content, onPreviewHtml, onImageClick }: { content: string; onPreviewHtml: (html: string) => void; onImageClick?: (url: string) => void }) => {
  const parseInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-extrabold text-zinc-50">{part.substring(2, part.length - 2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-850 rounded font-mono text-[11.5px] text-purple-300 font-bold">{part.substring(1, part.length - 1)}</code>;
      }
      return part;
    });
  };

  // Splitting message content by code block markers (```)
  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 font-sans text-[13.5px] leading-relaxed text-zinc-200">
      {segments.map((segment, index) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          // Parse language and clean code output
          const match = segment.match(/^```(\w*)\n([\s\S]*?)```$/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : segment.slice(3, -3);

          const isHtml = lang.toLowerCase() === 'html' || 
                         code.toLowerCase().includes('<!doctype html>') || 
                         code.toLowerCase().includes('<html') ||
                         (code.toLowerCase().includes('<div') && code.toLowerCase().includes('</div'));

          return (
            <CodeBlock 
              key={index} 
              code={code} 
              lang={lang} 
              isHtml={isHtml} 
              onPreviewHtml={onPreviewHtml} 
            />
          );
        }

        // Standard text with lines
        const lines = segment.split('\n');
        return (
          <div key={index} className="space-y-1.5 min-w-0">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (trimmed === '') return <div key={lineIdx} className="h-1.5" />;

              // Support markdown image ![alt](url)
              const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
              if (imgMatch) {
                const altText = imgMatch[1];
                const imgUrl = imgMatch[2];
                return (
                  <div key={lineIdx} className="my-3 flex justify-start">
                    <img 
                      src={imgUrl} 
                      alt={altText || "Gambar AI"} 
                      className="max-w-full max-h-80 rounded-xl border border-white/10 cursor-pointer hover:opacity-95 transition shadow-lg"
                      referrerPolicy="no-referrer"
                      onClick={() => onImageClick?.(imgUrl)}
                    />
                  </div>
                );
              }

              // Support header tags
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lineIdx} className="text-xs font-extrabold text-zinc-350 uppercase tracking-widest mt-4 mb-1.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                    {trimmed.substring(4)}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return <h3 key={lineIdx} className="text-sm font-extrabold text-zinc-100 mt-5 mb-2 pb-1 border-b border-zinc-850/60">{trimmed.substring(3)}</h3>;
              }
              if (trimmed.startsWith('# ')) {
                return <h2 key={lineIdx} className="text-base font-black text-white mt-6 mb-2.5">{trimmed.substring(2)}</h2>;
              }

              // Divider lines
              if (trimmed === '---') {
                return <hr key={lineIdx} className="border-zinc-850/60 my-4" />;
              }

              // Bullets
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lineIdx} className="flex gap-2.5 pl-2.5 my-1 text-zinc-350">
                    <span className="text-purple-400 shrink-0 select-none">•</span>
                    <span className="flex-1">{parseInlineStyles(trimmed.substring(2))}</span>
                  </div>
                );
              }

              // Number bullets
              const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
              if (numMatch) {
                return (
                  <div key={lineIdx} className="flex gap-2.5 pl-2.5 my-1 text-zinc-350">
                    <span className="font-mono text-purple-400 shrink-0 select-none text-xs font-bold">{numMatch[1]}.</span>
                    <span className="flex-1">{parseInlineStyles(numMatch[2])}</span>
                  </div>
                );
              }

              return (
                <p key={lineIdx} className="text-zinc-300 leading-relaxed break-words">
                  {parseInlineStyles(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default function App() {
  // Auth states
  const [token, setToken] = useState<string | null>(localStorage.getItem('abil_token'));
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Chat/Session states
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('Gemini');
  const [loadingChat, setLoadingChat] = useState(false);

  // Modals / Panels
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showVipChatModal, setShowVipChatModal] = useState(false);
  const [longPressedMessageId, setLongPressedMessageId] = useState<string | null>(null);
  const longPressTimerRef = useRef<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [vipChatMessage, setVipChatMessage] = useState('');
  const [vipChatSending, setVipChatSending] = useState(false);
  const [vipChatMessages, setVipChatMessages] = useState<any[]>([]);
  const vipChatRef = useRef<HTMLDivElement>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [htmlCopied, setHtmlCopied] = useState(false);
  const [appAlert, setAppAlert] = useState<string | null>(null);

  const showAlert = (message: string) => {
    setAppAlert(message);
  };

  const [chatAttachment, setChatAttachment] = useState<{name: string, type: string, dataUrl: string} | null>(null);
  const [vipChatAttachment, setVipChatAttachment] = useState<{name: string, type: string, dataUrl: string} | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current user details on token changes & poll periodically for real-time VIP / Admin updates
  useEffect(() => {
    if (token) {
      localStorage.setItem('abil_token', token);
      fetchProfile();
      fetchChats();

      // Poll every 5 seconds for real-time status synchronization
      const interval = setInterval(() => {
        fetchProfile();
      }, 5000);

      return () => clearInterval(interval);
    } else {
      localStorage.removeItem('abil_token');
      setCurrentUser(null);
      setSessions([]);
      setActiveChatId(null);
    }
  }, [token]);

  // Scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeChatId, loadingChat]);

  // Fetch VIP Chat
  useEffect(() => {
    let interval: any;
    if (showVipChatModal) {
      interval = setInterval(fetchVipChat, 3000);
      fetchVipChat();
    } else {
      setVipChatMessages([]);
    }
    return () => clearInterval(interval);
  }, [showVipChatModal]);

  useEffect(() => {
    if (vipChatRef.current) {
      vipChatRef.current.scrollTop = vipChatRef.current.scrollHeight;
    }
  }, [vipChatMessages]);

  const fetchVipChat = async () => {
    try {
      const res = await fetch('/api/vip/chat', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.chat) {
        setVipChatMessages(data.chat.messages || []);
      }
    } catch (e) {
      console.error('Failed to fetch vip chat', e);
    }
  };

  const handleVipPressStart = (msgId: string) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setLongPressedMessageId(msgId);
    }, 600);
  };

  const handleVipPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleVipTouchMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDeleteVipMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/vip/chat/message/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.chat) {
        setVipChatMessages(data.chat.messages || []);
      } else {
        showAlert(data.message || 'Gagal menghapus pesan');
      }
    } catch (e) {
      console.error('Failed to delete support message', e);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
      } else {
        // Token expired / invalid
        setToken(null);
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
        if (data.sessions.length > 0 && !activeChatId) {
          // Auto select first session if none selected
          setActiveChatId(data.sessions[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load chats', e);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setEmailInput('');
        setPasswordInput('');
      } else {
        setAuthError(data.message || 'Gagal tersambung ke server.');
      }
    } catch (err) {
      setAuthError('Koneksi ke server bermasalah. Coba lagi.');
    }
  };

  const handleLogout = () => {
    setToken(null);
  };

  const handleCreateChat = async (modelName: string) => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          model: modelName,
          title: `Percakapan baru - ${modelName}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setSessions(prev => [data.session, ...prev]);
        setActiveChatId(data.session.id);
        setSelectedModel(modelName);
        // On mobile, auto slide collapse for focus
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      }
    } catch (e) {
      console.error('Failed to create new chat session', e);
    }
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSessions(prev => prev.filter(c => c.id !== id));
        if (activeChatId === id) {
          setActiveChatId(null);
        }
      }
    } catch (er) {
      console.error('Failed to delete chat session', er);
    }
  };

  const handleSendVipChat = async () => {
    if (!vipChatMessage.trim()) return;
    const attachmentToSend = vipChatAttachment;
    setVipChatSending(true);
    setVipChatAttachment(null);
    try {
      const res = await fetch('/api/vip/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: vipChatMessage, attachment: attachmentToSend })
      });
      const data = await res.json();
      if (data.success && data.chat) {
        setVipChatMessage('');
        setVipChatMessages(data.chat.messages || []);
      } else {
        showAlert(data.message || 'Gagal mengirim pesan');
      }
    } catch (e) {
      showAlert('Gagal mengirim pesan');
    } finally {
      setVipChatSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChatId || loadingChat) return;

    const userMsg = inputMessage;
    const attachmentToSend = chatAttachment;
    setInputMessage('');
    setChatAttachment(null);
    setLoadingChat(true);

    // Optimistically add user's message immediately to session list so they see it instantly while AI is thinking
    const optimisticMsg: ChatMessage = {
      id: `msg-opt-${Date.now()}`,
      role: 'user',
      content: userMsg,
      timestamp: new Date().toISOString(),
      attachment: attachmentToSend || undefined
    };

    setSessions(prev => 
      prev.map(s => {
        if (s.id === activeChatId) {
          return { ...s, messages: [...s.messages, optimisticMsg] };
        }
        return s;
      })
    );

    try {
      const res = await fetch(`/api/chats/${activeChatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg, attachment: attachmentToSend })
      });
      const data = await res.json();
      if (data.success) {
        setSessions(prev => 
          prev.map(s => s.id === activeChatId ? data.session : s)
        );
      } else {
        // Display server-returned error nicely in messages list, and filter out the optimistic message if it failed
        const errorMsg: ChatMessage = {
          id: `msg-error-${Date.now()}`,
          role: 'system',
          content: data.message || 'Gagal mengirim pesan.',
          timestamp: new Date().toISOString()
        };
        setSessions(prev => 
          prev.map(s => {
            if (s.id === activeChatId) {
              const cleanedMessages = s.messages.filter(m => m.id !== optimisticMsg.id);
              return { ...s, messages: [...cleanedMessages, errorMsg] };
            }
            return s;
          })
        );
      }
    } catch (err: any) {
      console.error('Message payload send error:', err);
      // Remove optimistic message if there was a network error
      setSessions(prev => 
        prev.map(s => {
          if (s.id === activeChatId) {
            return { ...s, messages: s.messages.filter(m => m.id !== optimisticMsg.id) };
          }
          return s;
        })
      );
    } finally {
      setLoadingChat(false);
    }
  };

  const getActiveChatSession = () => {
    return sessions.find(s => s.id === activeChatId) || null;
  };

  const activeChat = getActiveChatSession();

  // Highlight check if current VIP status is active
  const isVipUser = () => {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    if (currentUser.vipUntil) {
      return new Date(currentUser.vipUntil).getTime() > Date.now();
    }
    return false;
  };

  const isModelUnlocked = (modelId: string) => {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    
    const modelIdLower = modelId.toLowerCase();
    const isVipModel = ["abil-ai v5.6 pro", "abil-ai v6.6 plus", "abil-ai v7.5 ultra"].includes(modelIdLower);
    
    if (!isVipModel) return true; // Standard models are always unlocked
    
    if (currentUser.vipUntil) {
      const active = new Date(currentUser.vipUntil).getTime() > Date.now();
      if (active) {
        const unlocked = currentUser.unlockedModels || [];
        return unlocked.map(m => m.toLowerCase().trim()).includes('all') || 
               unlocked.map(m => m.toLowerCase().trim()).includes(modelIdLower);
      }
    }
    return false;
  };

  const activeVipDaysRemaining = () => {
    if (!currentUser || !currentUser.vipUntil) return 0;
    const diff = new Date(currentUser.vipUntil).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const formatIndonesianDateTime = (isoString?: string | null) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' WIB';
    } catch (e) {
      return String(isoString);
    }
  };

  // Auth view container
  if (!token) {
    return (
      <div id="auth-screen" className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Abstract background ambient mesh */}
        <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl z-10 animate-fade-in">
          {/* Logo Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/25 mb-4 scale-100 hover:scale-105 transition-all duration-300">
              <Sparkles className="text-white h-7 w-7 animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Abil-Ai Client</h1>
            <p className="text-sm text-zinc-400 mt-1">Multi-Model AI Ecosystem & VIP Portal</p>
          </div>

          <div className="flex p-1 bg-zinc-950 rounded-xl mb-6 border border-zinc-850">
            <button
              id="switch-login"
              onClick={() => { setIsLoginView(true); setAuthError(null); }}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-semibold tracking-wide transition select-none ${
                isLoginView 
                  ? 'bg-zinc-805 text-white shadow-md shadow-zinc-900/40' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              MASUK (LOGIN)
            </button>
            <button
              id="switch-register"
              onClick={() => { setIsLoginView(false); setAuthError(null); }}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-semibold tracking-wide transition select-none ${
                !isLoginView 
                  ? 'bg-zinc-805 text-white shadow-md shadow-zinc-900/40' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              DAFTAR AKUN BARU
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4" id="auth-form">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 input-label">
                Alamat Email
              </label>
              <input
                type="email"
                required
                placeholder="contoh: budi@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition duration-250 placeholder-zinc-650"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 input-label">
                Kata Sandi (Password)
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition duration-250 placeholder-zinc-650"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2 animate-shake">
                <AlertCircle size={14} className="shrink-0" />
                <p>{authError}</p>
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/20 active:scale-[0.98] transition cursor-pointer select-none"
            >
              {isLoginView ? 'MASUK KE LAYANAN' : 'BUAT AKUN DAN LOGIN'}
            </button>
          </form>



        </div>
      </div>
    );
  }

  return (
    <div id="app-viewport" className="h-[100dvh] w-screen bg-[#0d0d10] text-zinc-100 flex font-sans overflow-hidden relative">
      
      {/* ---------------- SIDEBAR RIWAYAT CHAT (KIRI) ---------------- */}
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <button
          id="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-all duration-300 backdrop-blur-sm border-none outline-none w-full h-full cursor-default"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
          aria-label="Tutup Menu Samping"
        />
      )}

      <aside
        id="app-sidebar"
        className={`bg-[#0f0f12] flex flex-col transition-all duration-300 ease-in-out shrink-0 h-[100dvh] md:h-screen md:relative fixed inset-y-0 left-0 z-50 md:z-30 ${
          sidebarOpen 
            ? 'w-[280px] translate-x-0 opacity-100 border-r border-zinc-800/60' 
            : 'w-[280px] md:w-0 -translate-x-full md:-translate-x-0 opacity-0 pointer-events-none border-r-0 overflow-hidden'
        }`}
      >
        {/* Sidebar Header */}
        <div className="min-h-[4.25rem] py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:pt-3 px-4.5 border-b border-zinc-850/50 flex items-center justify-between bg-zinc-950/15">
          <div className="flex items-center gap-3">
            <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-purple-650 via-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/15">
              <Sparkles size={15} className="text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[#fafafa] text-sm tracking-tight leading-none">Abil-Ai Client</span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wide mt-0.5">Versi 5.6 Pro</span>
            </div>
          </div>

          {/* Collapse sidebar trigger icon */}
          <button
            id="icon-collapse-sidebar"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 hover:text-white text-zinc-400 cursor-pointer transition flex"
            title="Sembunyikan Samping"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* Sidebar Middle Content: New Chat + Chat History */}
        <div className="flex-1 p-4.5 overflow-y-auto space-y-4 select-none">
          
          {/* New Chat Button */}
          <div className="flex flex-col">
            <button
              id="sidebar-new-chat-btn"
              onClick={() => {
                setActiveChatId(null);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600/10 via-purple-600/15 to-purple-600/10 hover:from-purple-600/20 hover:to-purple-600/20 border border-purple-500/25 hover:border-purple-500/40 text-purple-200 hover:text-white rounded-xl flex items-center justify-center gap-2.5 font-bold text-xs tracking-wide uppercase transition-all shadow-md active:scale-[0.98] cursor-pointer select-none"
            >
              <Plus size={15} className="text-purple-400 shrink-0" />
              <span>Percakapan Baru</span>
            </button>
          </div>

          {/* Recents list title */}
          <div className="flex items-center justify-between px-1.5 pt-2">
            <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
              Riwayat Chat
            </p>
            <span className="text-[9px] bg-zinc-900 text-zinc-500 font-mono font-medium px-2 py-0.5 rounded-full border border-zinc-850">
              {sessions.length} Chat
            </span>
          </div>

          {/* Sessions Stack */}
          <div className="space-y-1 block" id="sessions-history-list">
            {sessions.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-zinc-850 rounded-xl bg-zinc-950/20">
                <p className="text-xs text-zinc-550 leading-relaxed font-medium">Belum ada riwayat<br/>percakapan aktif.</p>
              </div>
            ) : (
              sessions.map((c) => {
                const isActive = c.id === activeChatId;
                const isAbilVip = c.model.toLowerCase().includes('pro') || c.model.toLowerCase().includes('plus') || c.model.toLowerCase().includes('ultra');

                return (
                  <div
                    key={c.id}
                    id={`chat-item-${c.id}`}
                    onClick={() => {
                      setActiveChatId(c.id);
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`group relative flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold cursor-pointer select-none transition-all ${
                      isActive 
                        ? 'bg-[#1b1b22] border border-[#2d2d3c] text-purple-400' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141418] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <MessageSquare 
                        size={14} 
                        className={`shrink-0 ${isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} 
                      />
                      <div className="truncate flex-1">
                        <p className="truncate font-bold tracking-tight text-zinc-200">{c.title}</p>
                        <span className={`text-[9.5px] font-mono leading-none flex items-center gap-1 mt-0.5 ${isAbilVip ? 'text-purple-400 font-bold' : 'text-zinc-500 font-medium'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isAbilVip ? 'bg-purple-500' : 'bg-zinc-650'}`} />
                          {c.model}
                        </span>
                      </div>
                    </div>

                    {/* Delete Icon */}
                    <button
                      id={`delete-chat-${c.id}`}
                      onClick={(e) => handleDeleteChat(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-550 hover:text-rose-450 ease-in transition shrink-0 ml-1.5"
                      title="Hapus Percakapan"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar bottom: Logged in profile */}
        <div className="p-4 border-t border-zinc-850/65 bg-zinc-950/20" id="sidebar-profile-box">
          {currentUser && (
            <div className="space-y-3">
              <div className="bg-[#141418] p-3 rounded-xl border border-zinc-850 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 flex items-center justify-center font-black uppercase text-xs shadow-inner">
                  {currentUser.email.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <p className="text-[11.5px] font-bold text-zinc-100 truncate" title={currentUser.email}>{currentUser.email}</p>
                    {isVipUser() && (
                      <span 
                        id="vip-badge-verified-sidebar"
                        className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-blue-500 text-white shrink-0 shadow-sm" 
                        title="Akun VIP Terverifikasi"
                      >
                        <Check size={9} strokeWidth={4} />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {isVipUser() ? (
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-black text-amber-400 flex-shrink-0 tracking-wide uppercase">
                        <Award size={11} className="text-amber-500 animate-pulse" />
                        VIP {currentUser.isAdmin ? 'OWNER' : 'ACCESS'}
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-bold text-zinc-500 tracking-wide uppercase">Normal Member</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                id="logout-btn"
                onClick={handleLogout}
                className="w-full py-2 bg-[#17171a] hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut size={13} />
                <span>Keluar Akun</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ---------------- MAIN VIEW LAYOUT (KANAN) ---------------- */}
      <main id="app-main-view" className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
        
        {/* TOP STATUS BAR ACCENTS */}
        <header id="chat-header" className="min-h-[4.25rem] py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:pt-3 shrink-0 border-b border-[#1e1e24] bg-[#0c0c0e]/80 backdrop-blur px-3 sm:px-6 flex items-center justify-between gap-2 z-20">
          
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {/* Sidebar trigger toggle */}
            <button
              id="sidebar-trigger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:text-white text-zinc-400 cursor-pointer border border-zinc-800 transition-all ${
                sidebarOpen ? 'md:hidden' : 'flex'
              }`}
              title="Toggle Menu Samping"
            >
              <Menu size={18} />
            </button>

            {/* Model descriptor headline if current conversation is active */}
            {activeChat && (
              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-zinc-100 truncate max-w-[90px] sm:max-w-[200px]" title={activeChat.model}>
                  {activeChat.model}
                </p>
                {activeChat.model.toLowerCase().includes('pro') || activeChat.model.toLowerCase().includes('plus') || activeChat.model.toLowerCase().includes('ultra') ? (
                  <span className="text-[8px] sm:text-[9.5px] font-extrabold tracking-wider text-purple-400 uppercase bg-purple-500/10 border border-purple-500/30 px-1 sm:px-2 py-0.5 rounded shrink-0">
                    PRO
                  </span>
                ) : (
                  <span className="text-[8px] sm:text-[9.5px] font-medium tracking-wide text-zinc-400 bg-zinc-805 px-1 sm:px-2 py-0.5 rounded shrink-0">
                    FREE
                  </span>
                )}
              </div>
            )}
          </div>

          {/* RIGHT BUTTONS HEADER: ADMIN & VIP GRANTED ACCESS */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* VIP Access Modal Button */}
            <button
              id="vip-modal-trigger"
              onClick={() => setShowVipModal(true)}
              className={`px-2 md:px-3 py-1.5 sm:py-2 rounded-xl border font-bold text-[10.5px] sm:text-xs flex items-center gap-1 sm:gap-2 transition select-none cursor-pointer ${
                isVipUser() 
                  ? 'bg-purple-500/15 border-purple-500/45 text-purple-400 shadow-md shadow-purple-950/30' 
                  : 'bg-[#18181b] border-zinc-805 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Award size={13} className={isVipUser() ? 'text-amber-400 animate-pulse shrink-0' : 'text-zinc-500 shrink-0'} />
              <span className="block sm:hidden">VIP</span>
              <span className="hidden sm:block">Cek VIP Access</span>
            </button>

            {/* Admin Panel triggers only if user.isAdmin */}
            {currentUser?.isAdmin && (
              <button
                id="admin-panel-trigger"
                onClick={() => {
                  setShowAdminPanel(true);
                  setSuccessFeedback(null);
                }}
                className="px-2 md:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-550 to-amber-600 hover:from-amber-600 hover:to-amber-700 hover:shadow-lg hover:shadow-amber-500/10 text-black font-extrabold text-[10.5px] sm:text-xs flex items-center gap-1 sm:gap-2 cursor-pointer shadow-md select-none transition-all duration-300"
              >
                <Shield size={13} className="shrink-0" />
                <span className="block sm:hidden">Admin</span>
                <span className="hidden sm:block">Panel Admin</span>
              </button>
            )}
          </div>
        </header>

        {/* ---------------- CHAT SCROLL AREA && LANDING SELECTOR ---------------- */}
        <div id="chat-scroller" className="flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-8 bg-gradient-to-b from-[#0e0e11] to-[#09090b]">
          
          {!activeChat ? (
            /* 1. COMPREHENSIVE LANDING SELECTOR (IF NO CHAT SELECTED) */
            <div id="welcome-dashboard" className="max-w-4xl mx-auto space-y-12 py-6">
              
              {/* Giant Greeting Header */}
              <div className="text-center space-y-4">
                <span className="inline-block text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-5 py-2 rounded-full font-bold mb-2 shadow-sm">
                  Sistem Multimodel AI Abil-Ai Aktif
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] tracking-tight leading-none bg-gradient-to-r from-zinc-100 via-zinc-250 to-zinc-455 bg-clip-text">
                  Bagaimana saya bisa membantu Anda hari ini?
                </h1>
                <p className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
                  Pilih model AI andalan Anda di bawah ini dan mulailah percakapan bebas hambatan berbasis API Key aman.
                </p>
              </div>

              {/* Models Showcase Categorized */}
              <div className="space-y-8">
                
                {/* 1. Abil-Ai Free Ecosystem */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#a1a1aa] mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Abil-Ai Assistant Tier Umum (Standard AI)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="abil-free-grid">
                    {ABIL_FREE_MODELS?.map((m) => (
                      <div
                        key={m?.id}
                        id={`card-model-${m?.id?.replace(' ', '-')}`}
                        onClick={() => m?.id && handleCreateChat(m.id)}
                        className="group bg-[#111114] border border-zinc-850 hover:border-zinc-750 p-4.5 rounded-xl cursor-pointer transition hover:-translate-y-0.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-zinc-200">{m?.name}</h4>
                            <span className="text-[9px] font-bold tracking-wider text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded-md uppercase">
                              {m?.tier}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-450 mt-1 lines-clamp-2">{m?.desc}</p>
                        </div>
                        <div className="mt-3 text-right">
                          <span className="text-[10px] font-medium text-zinc-500 group-hover:text-teal-400 transition">Klik untuk masuk</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Abil-Ai VIP Ecosystem */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#a1a1aa] mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                    Abil-Ai VIP Model Eksklusif (Akses Khusus)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="abil-vip-grid">
                    {ABIL_VIP_MODELS?.map((m) => {
                      const hasAccess = m?.id ? isModelUnlocked(m.id) : false;

                      return (
                        <div
                          key={m?.id}
                          id={`card-model-${m?.id?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                          onClick={() => {
                            if (!m?.id) return;
                            if (!hasAccess && !currentUser?.isAdmin) {
                              setShowVipModal(true);
                              return;
                            }
                            handleCreateChat(m.id);
                          }}
                          className={`group relative p-5 rounded-2xl transition duration-300 flex flex-col justify-between ${
                            hasAccess 
                              ? 'bg-[#181225]/40 border border-purple-900/40 hover:border-purple-600 cursor-pointer hover:-translate-y-1' 
                              : 'bg-zinc-900/30 border border-zinc-850 opacity-90 hover:opacity-100 hover:border-zinc-800 hover:bg-zinc-900/40'
                          }`}
                        >
                          {/* Beautiful Golden sparkles inside VIP */}
                          <div className="absolute top-4 right-4 text-amber-500/80">
                            {hasAccess ? <Award size={16} /> : <Lock size={15} className="text-zinc-650" />}
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 font-bold tracking-wide uppercase">{m?.tier}</p>
                            <h4 className="text-sm font-extrabold text-[#f4f4f5] mt-1 group-hover:text-purple-300 transition">{m?.name}</h4>
                            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{m?.desc}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-zinc-800/20 flex justify-end">
                            <span className="text-[10px] font-bold text-zinc-500 group-hover:text-amber-400 transition flex items-center gap-1">
                              {hasAccess ? 'Mulai Percakapan' : 'Butuh Akses VIP'} <ChevronRight size={12} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Global standard AI Models */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#a1a1aa] mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Pilihan Kecerdasan Buatan Umum (Global Models)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="global-models-grid">
                    {GLOBAL_MODELS?.map((m) => (
                      <div
                        key={m?.id}
                        id={`card-model-${m?.id}`}
                        onClick={() => m?.id && handleCreateChat(m.id)}
                        className="group relative bg-[#131316]/75 border border-zinc-800 hover:border-zinc-700/80 p-5 rounded-2xl cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 flex flex-col justify-between"
                      >
                        <div>
                          <p className="text-xs text-zinc-500 font-bold tracking-wide uppercase">{m?.dev}</p>
                          <h4 className="text-base font-extrabold text-[#f4f4f5] mt-1 group-hover:text-purple-400 transition">{m?.name}</h4>
                          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{m?.desc}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-zinc-800/40 flex justify-end">
                          <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-350 transition flex items-center gap-1">
                            Pilih model <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* 2. CHAT SESSION SCROLL AND LIST (IF CHAT SELECTED) */
            <div id="messages-list" className="max-w-4xl mx-auto space-y-6 flex flex-col min-h-full">
              {activeChat.messages.length === 0 ? (
                /* Initial prompt helper inside chatbot */
                <div id="chat-empty-help" className="my-auto text-center space-y-4 py-12 max-w-md mx-auto">
                  <div className="h-12 w-12 rounded-2xl bg-[#1d1d26] border border-zinc-805 flex items-center justify-center text-purple-400 mx-auto">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-250">Sesi Chat Baru Dimulai</h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Anda sedang berkomunikasi dengan <strong className="text-purple-400 font-semibold">{activeChat.model}</strong>. Masukkan pertanyaan atau instruksi tugas di kotak bawah untuk memulai respons.
                    </p>
                  </div>
                </div>
              ) : (
                activeChat.messages.map((m) => {
                  const isUser = m.role === 'user';
                  const isSystemErr = m.role === 'system';

                  if (isSystemErr) {
                    return (
                      <div 
                        key={m.id} 
                        id={`msg-alert-${m.id}`}
                        className="p-4 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-2xl text-xs flex gap-3 leading-relaxed animate-shake"
                      >
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Informasi Sistem</p>
                          <p className="mt-0.5 whitespace-pre-line">{m.content}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      id={`msg-bubble-${m.id}`}
                      className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      {/* Bot Avatar */}
                      {!isUser && (
                        <div className="h-9 w-9 bg-purple-900/20 border border-purple-500/35 text-purple-400 rounded-xl flex items-center justify-center shrink-0 shadow">
                          <Sparkles size={15} />
                        </div>
                      )}

                      {/* Content Bubble */}
                      <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-5 py-3.5 leading-relaxed text-sm break-words overflow-x-auto min-w-0 ${
                        isUser 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white rounded-br-none shadow shadow-purple-900/10' 
                          : 'bg-[#141417]/80 border border-zinc-805 text-zinc-200 rounded-bl-none whitespace-pre-wrap'
                      }`}>
                        
                        {/* Custom visual parsing inside prompt simulated box */}
                        {m.content.includes('[PROTOTIPE') ? (
                          <div className="pb-2.5 mb-2.5 border-b border-zinc-800/80">
                            <span className="text-[10px] font-extrabold bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-md tracking-wider uppercase">
                              Mode Simulasi Prototipe
                            </span>
                          </div>
                        ) : null}

                        <MessageRenderer content={m.content} onPreviewHtml={setPreviewHtml} onImageClick={setFullscreenImage} />

                        {m.attachment && m.attachment.dataUrl && (
                          m.attachment.type.startsWith('image/') ? (
                            <img 
                              src={m.attachment.dataUrl} 
                              alt="lampiran" 
                              className="max-w-full max-h-60 rounded-xl mt-3 border border-white/10 cursor-pointer hover:opacity-90 transition shadow-md" 
                              onClick={() => setFullscreenImage(m.attachment.dataUrl)}
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-3 p-2 px-3 bg-black/20 rounded-xl text-xs font-semibold text-zinc-100">
                              <Paperclip size={14} className="text-purple-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{m.attachment.name}</span>
                            </div>
                          )
                        )}
                      </div>

                      {/* User Avatar */}
                      {isUser && (
                        <div className="h-9 w-9 bg-zinc-800 border border-zinc-700 text-zinc-350 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs uppercase shadow">
                          U
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Bot typing loader spinner item */}
              {loadingChat && (
                <div id="typing-indicator" className="flex gap-4 justify-start animate-pulse">
                  <div className="h-9 w-9 bg-purple-900/20 border border-purple-500/25 text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="animate-spin text-purple-400" />
                  </div>
                  <div className="bg-[#141417] border border-zinc-805 text-zinc-400 text-xs px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <span className="flex gap-1.5 ml-1 mr-1">
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* ---------------- MESSAGE BOX INPUT AREA ---------------- */}
        <div id="footer-input-panel" className="p-4 md:p-6 border-t border-[#1e1e24] bg-[#0c0c0e]/95 backdrop-blur z-10 shrink-0">
          <div className="max-w-4xl mx-auto">
            {activeChat ? (
              <form onSubmit={handleSendMessage} className="relative flex flex-col w-full gap-2" id="chat-input-form">
                {/* Visual Staged Attachment Preview */}
                {chatAttachment && (
                  <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-2.5 mb-1 animate-fade-in text-zinc-355 w-full">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {chatAttachment.type.startsWith('image/') ? (
                        <img 
                          src={chatAttachment.dataUrl} 
                          alt="preview" 
                          className="h-9 w-9 object-cover rounded border border-zinc-700/50 shrink-0" 
                        />
                      ) : (
                        <div className="h-9 w-9 bg-zinc-850 rounded border border-zinc-700/50 flex items-center justify-center text-purple-400 shrink-0">
                          <Paperclip size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-100 truncate max-w-[180px] sm:max-w-md">{chatAttachment.name}</p>
                        <p className="text-[10px] text-zinc-500">Lampiran siap dikirim</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setChatAttachment(null)}
                      className="p-1 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 rounded-md transition shrink-0"
                      title="Hapus lampiran"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}

                <div className="flex bg-[#141418] border border-zinc-800/80 rounded-2xl flex-1 items-center px-1 shadow-inner overflow-hidden focus-within:border-purple-600 focus-within:ring-1 focus-within:ring-purple-600/30 transition w-full">
                  <div className="flex items-center pl-2 gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => document.getElementById('chat-file-upload')?.click()}
                      className="p-1.5 text-zinc-500 hover:text-purple-400 hover:bg-zinc-800 rounded-lg transition"
                      title="Kirim Foto"
                    >
                      <ImageIcon size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => document.getElementById('chat-file-upload')?.click()}
                      className="p-1.5 text-zinc-500 hover:text-purple-400 hover:bg-zinc-800 rounded-lg transition"
                      title="Kirim File"
                    >
                      <Paperclip size={18} />
                    </button>
                    <input 
                      type="file" 
                      id="chat-file-upload" 
                      className="hidden" 
                      accept="image/*,application/pdf,text/plain"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setChatAttachment({
                                name: file.name,
                                type: file.type,
                                dataUrl: event.target.result as string
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                          e.target.value = '';
                        }
                      }} 
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Bertanya kepada ${activeChat.model}...`}
                    className="flex-1 bg-transparent py-4 px-2 text-[#f4f4f5] text-sm focus:outline-none placeholder-zinc-500 disabled:opacity-50"
                    disabled={loadingChat}
                  />
                  <div className="pr-2 shrink-0">
                    <button
                      type="submit"
                      disabled={loadingChat || !inputMessage.trim()}
                      id="send-msg-btn"
                      className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/20 text-white rounded-xl shadow cursor-pointer transition select-none hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
                      title="Kirim Pesan"
                    >
                      <SendHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-zinc-950/20 p-4 border border-zinc-900 rounded-2xl text-center">
                <p className="text-xs text-zinc-500">
                  Untuk mulai mengetik percakapan, silakan ketuk salah satu model asisten di atas atau ketuk tombol <strong className="text-purple-400 font-semibold">Percakapan Baru</strong> di sidebar sebelah kiri!
                </p>
              </div>
            )}
            <p className="text-[10px] text-zinc-550 text-center mt-3 cursor-default tracking-wide font-normal">
              Abil-Ai v5.6 Pro dapat melakukan kesalahan analisis. Harap verifikasi informasi penting secara mandiri.
            </p>
          </div>
        </div>

        {/* ---------------- MODAL DIALOG: VIP USER CHECK/REQUEST ---------------- */}
        {showVipModal && (
          <div id="vip-info-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div id="vip-modal-container" className="w-full max-w-md bg-[#161619] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-zinc-800/60 p-5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                    <Award size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#f4f4f5] text-base tracking-tight">Status Layanan VIP Abil-Ai</h3>
                </div>
                <button
                  id="close-vip-modal"
                  onClick={() => setShowVipModal(false)}
                  className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                >
                  <X size={15} />
                </button>
              </div>

              {/* VIP Status Content Layout */}
              <div className="flex-1 overflow-y-auto p-5 pt-2 space-y-4 custom-scrollbar">
                <div className={`p-4 rounded-xl border flex flex-col items-center gap-2.5 text-center ${
                  isVipUser() 
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' 
                    : 'bg-zinc-900/50 border-zinc-850 text-zinc-400'
                }`}>
                  <div className={`p-3 rounded-full ${isVipUser() ? 'bg-purple-500/20 text-yellow-400' : 'bg-zinc-800 text-zinc-650'}`}>
                    <Award size={28} className={isVipUser() ? 'animate-bounce' : ''} />
                  </div>
                  <div>
                    {isVipUser() ? (
                      <>
                        <div className="flex items-center justify-center gap-1.5">
                          <p className="font-extrabold text-sm tracking-wide text-zinc-100 uppercase">AKSES VIP AKTIF</p>
                          <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full h-4 w-4 shrink-0 shadow-sm" title="Terverifikasi Centang Biru">
                            <Check size={10} strokeWidth={4} />
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          Anda memiliki izin tanpa batas untuk menggunakan model elite Abil-Ai v5.6 Pro, v6.6 Plus, dan v7.5 Ultra!
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-extrabold text-sm tracking-wide text-zinc-300 uppercase">BELUM MEMILIKI AKSES VIP</p>
                        <p className="text-xs text-zinc-450 mt-1 leading-relaxed">
                          Anda sedang berada pada free-tier. Model elite Abil-Ai Pro, Plus, dan Ultra saat ini dikunci untuk email Anda.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Informasi Detil Profil User Biasa */}
                {currentUser && (
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4.5 space-y-3.5">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={13} className="text-blue-400" />
                      Informasi Profil Layanan Anda
                    </h4>
                    
                    <div className="space-y-2 text-xs">
                      {/* Email info with blue badge if VIP */}
                      <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850/40">
                        <span className="text-zinc-500 font-medium">Alamat Email</span>
                        <span className="font-bold text-zinc-100 flex items-center gap-1.5 min-w-0">
                          <span className="truncate max-w-[180px]" title={currentUser.email}>{currentUser.email}</span>
                          {isVipUser() && (
                            <span 
                              id="vip-verified-badge"
                              className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full h-4 w-4 shrink-0 shadow-sm" 
                              title="Akun VIP Terverifikasi (Centang Biru)"
                            >
                              <Check size={10} strokeWidth={4} />
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Mulai Tanggal & Jam Pembuatan Akun */}
                      <div className="flex flex-col gap-1 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850/40">
                        <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                          <span>Mulai Tanggal / Jam</span>
                          <span className="text-emerald-400 font-semibold font-mono text-[10px]">AKTIF</span>
                        </div>
                        <span className="font-bold text-zinc-200 text-right mt-0.5 leading-tight">
                          {formatIndonesianDateTime(currentUser.createdAt)}
                        </span>
                      </div>

                      {/* Batas Berakhir VIP (Waktu VIP Abis) */}
                      <div className="flex flex-col gap-1 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850/40">
                        <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                          <span>Waktu VIP Habis</span>
                          {isVipUser() ? (
                            <span className="font-bold flex items-center gap-1.5 text-[10px]">
                              <Clock size={10} className="text-amber-400" />
                              {currentUser.vipUntil && <LiveVipCountdown targetDate={currentUser.vipUntil} />}
                            </span>
                          ) : (
                            <span className="text-zinc-500 font-bold text-[10px]">Free Tier</span>
                          )}
                        </div>
                        <span className="font-bold text-zinc-200 text-right mt-0.5 leading-tight">
                          {isVipUser() && currentUser.vipUntil ? (
                            <span className="text-purple-400">{formatIndonesianDateTime(currentUser.vipUntil)}</span>
                          ) : (
                            <span className="text-zinc-500 italic">Masa VIP Belum Aktif / Berakhir</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info block regarding request logic requested by user */}
                <div className="bg-[#1b1b20] p-4.5 rounded-xl border border-zinc-850/60 space-y-2.5">
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Info size={13} className="text-purple-400" />
                    Cara Mendapatkan Akses VIP 3 Hari
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    User biasa dapat meminta akses ke Admin. Silakan beritahukan/ketik alamat email Anda (<span className="text-amber-400 font-mono font-medium">{currentUser?.email}</span>) kepada Admin. 
                  </p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Admin kemudian akan memberikan akses VIP melalui Panel Admin dengan mengetikkan email Anda dan mengatur durasi aktif (contoh: 3 hari/day). Segera setelah Admin menyetujui, akses model Anda akan terbuka!
                  </p>
                  <button 
                    onClick={() => {
                      setShowVipModal(false);
                      setShowVipChatModal(true);
                    }}
                    className="w-full mt-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold py-2 rounded-lg transition"
                  >
                    Chat Admin Minta VIP
                  </button>
                </div>

                {/* Harga Paket VIP Button */}
                <div className="bg-[#1b1b20] p-4.5 rounded-xl border border-zinc-850/60 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Award size={13} className="text-amber-400" />
                    Tingkatkan ke VIP
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Suka dengan Abil-Ai? Tingkatkan limit penggunaan Anda 2x lipat bahkan lebih dengan akses model khusus VIP!
                  </p>
                  <button 
                    onClick={() => setShowPricingModal(true)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold py-2 rounded-lg transition border border-zinc-700"
                  >
                    Lihat Daftar Harga Paket
                  </button>
                </div>
              </div>

              {/* Close footer buttons */}
              <div className="flex justify-end p-4 border-t border-zinc-800/60 bg-zinc-950 shrink-0">
                <button
                  id="close-vip-modal-footer"
                  onClick={() => setShowVipModal(false)}
                  className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs select-none cursor-pointer transition"
                >
                  Tutup Dialog Status
                </button>
              </div>
            </div>
          </div>
        )}

        {showPricingModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h3 className="text-zinc-100 font-bold flex items-center gap-2">
                  <Award size={18} className="text-amber-400" />
                  Daftar Harga Paket VIP
                </h3>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {/* Bulanan */}
                <div className="space-y-4">
                  <h5 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider sticky top-[-20px] bg-zinc-900 py-2 z-10">Harga Bulanan</h5>
                  
                  <div className="bg-zinc-950 p-4 rounded-xl border border-purple-500/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-base text-purple-400">Abil-Ai v5.6 Pro</span>
                      <span className="text-sm font-bold text-zinc-200">Rp 75.000<span className="text-[10px] text-zinc-500 font-normal">/bln</span></span>
                    </div>
                    <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4">
                      <li><strong className="text-zinc-300">Batas penggunaan 2x lebih tinggi:</strong> Dapatkan batas penggunaan 2x lebih tinggi dibandingkan tanpa paket Abil-Ai</li>
                      <li><strong className="text-zinc-300">Akses ke model Flash Thinking:</strong> Dapatkan kecepatan dan kecerdasan model Abil-Ai v5.6 Pro kami untuk masalah kompleks</li>
                    </ul>
                    <button 
                      onClick={() => {
                        setShowPricingModal(false);
                        setShowVipModal(false);
                        setVipChatMessage('Halo Admin, saya ingin berlangganan paket Abil-Ai v5.6 Pro Bulanan seharga Rp 75.000/bln. Mohon infonya.');
                        setShowVipChatModal(true);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg text-xs mt-2"
                    >
                      Update ke v5.6 Pro Bulanan
                    </button>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-blue-500/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-base text-blue-400">Abil-Ai v6.6 Plus</span>
                      <span className="text-sm font-bold text-zinc-200">Rp 309.000<span className="text-[10px] text-zinc-500 font-normal">/bln</span></span>
                    </div>
                    <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4">
                      <li><strong className="text-zinc-300">Batas penggunaan 4x lebih tinggi:</strong> Dapatkan batas penggunaan 4x lebih tinggi dibandingkan tanpa paket Google AI</li>
                      <li><strong className="text-zinc-300">Akses ke model Pro kami:</strong> Dapatkan penalaran canggih dari model Abil-Ai v6.6 Plus kami untuk masalah matematika dan coding yang kompleks</li>
                      <li><strong className="text-zinc-300">Deep Research & Fitur Lain:</strong> Dapatkan akses ke lebih banyak fitur canggih seperti Deep Research dan pembuatan video</li>
                    </ul>
                    <button 
                      onClick={() => {
                        setShowPricingModal(false);
                        setShowVipModal(false);
                        setVipChatMessage('Halo Admin, saya ingin berlangganan paket Abil-Ai v6.6 Plus Bulanan seharga Rp 309.000/bln. Mohon infonya.');
                        setShowVipChatModal(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs mt-2"
                    >
                      Update ke v6.6 Plus Bulanan
                    </button>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/40 relative overflow-hidden flex flex-col pt-6 space-y-3">
                    <div className="absolute top-0 right-0 bg-amber-500 text-zinc-900 text-[9px] font-bold px-3 py-1 rounded-bl-lg">TERPOPULER</div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-base text-amber-400">Abil-Ai v7.5 Ultra</span>
                      <span className="text-sm font-bold text-zinc-200">Rp 1.579.000<span className="text-[10px] text-zinc-500 font-normal">/bln</span></span>
                    </div>
                    <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4">
                      <li><strong className="text-zinc-300">Batas 5x lebih tinggi:</strong> Dapatkan batas penggunaan 5x lebih tinggi dibandingkan paket Abil-Ai Pro</li>
                      <li><strong className="text-zinc-300">Akses lebih tinggi model Pro:</strong> Dapatkan penalaran canggih dari model Abil-Ai v7.5 Ultra kami untuk masalah matematika dan coding yang kompleks</li>
                      <li><strong className="text-zinc-300">Akses Deep Think:</strong> Dapatkan akses ke fitur tercanggih kami seperti Deep Think</li>
                    </ul>
                    <button 
                      onClick={() => {
                        setShowPricingModal(false);
                        setShowVipModal(false);
                        setVipChatMessage('Halo Admin, saya ingin berlangganan paket Abil-Ai v7.5 Ultra Bulanan seharga Rp 1.579.000/bln. Mohon infonya.');
                        setShowVipChatModal(true);
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg text-xs mt-2"
                    >
                      Update ke v7.5 Ultra Bulanan
                    </button>
                  </div>
                </div>

                {/* Tahunan */}
                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <h5 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider sticky top-[-20px] bg-zinc-900 py-2 z-10 flex items-center justify-between">
                    Harga Tahunan 
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-[9px]">Hemat lebih banyak!</span>
                  </h5>
                  
                  <div className="bg-zinc-950 p-4 rounded-xl border border-purple-500/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-base text-purple-400">Abil-Ai v5.6 Pro</span>
                      <span className="text-sm font-bold text-zinc-200">Rp 750.000<span className="text-[10px] text-zinc-500 font-normal">/thn</span></span>
                    </div>
                    <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4">
                      <li><strong className="text-zinc-300">Batas penggunaan 2x lebih tinggi:</strong> Dapatkan batas penggunaan 2x lebih tinggi dibandingkan tanpa paket Abil-Ai</li>
                      <li><strong className="text-zinc-300">Akses ke model Flash Thinking:</strong> Dapatkan kecepatan dan kecerdasan model Abil-Ai v5.6 Pro Flash Thinking kami untuk masalah kompleks</li>
                    </ul>
                    <button 
                      onClick={() => {
                        setShowPricingModal(false);
                        setShowVipModal(false);
                        setVipChatMessage('Halo Admin, saya ingin berlangganan paket Abil-Ai v5.6 Pro Tahunan seharga Rp 750.000/thn. Mohon infonya.');
                        setShowVipChatModal(true);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg text-xs mt-2"
                    >
                      Update ke v5.6 Pro Tahunan
                    </button>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-blue-500/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-base text-blue-400">Abil-Ai v6.6 Plus</span>
                      <span className="text-sm font-bold text-zinc-200">Rp 3.099.000<span className="text-[10px] text-zinc-500 font-normal">/thn</span></span>
                    </div>
                    <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4">
                      <li><strong className="text-zinc-300">Batas penggunaan 4x lebih tinggi:</strong> Dapatkan batas penggunaan 4x lebih tinggi dibandingkan tanpa paket Abil-Ai</li>
                      <li><strong className="text-zinc-300">Akses ke model Pro kami:</strong> Dapatkan penalaran canggih dari model Abil-Ai v6.6 Plus kami untuk masalah matematika dan coding yang kompleks</li>
                      <li><strong className="text-zinc-300">Deep Research & Fitur Lain:</strong> Dapatkan akses ke lebih banyak fitur canggih seperti Deep Research dan pembuatan video</li>
                    </ul>
                    <button 
                      onClick={() => {
                        setShowPricingModal(false);
                        setShowVipModal(false);
                        setVipChatMessage('Halo Admin, saya ingin berlangganan paket Abil-Ai v6.6 Plus Tahunan seharga Rp 3.099.000/thn. Mohon infonya.');
                        setShowVipChatModal(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs mt-2"
                    >
                      Update ke v6.6 Plus Tahunan
                    </button>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-base text-amber-400">Abil-Ai v7.5 Ultra</span>
                      <span className="text-sm font-bold text-zinc-200">Rp 4.579.000<span className="text-[10px] text-zinc-500 font-normal">/thn</span></span>
                    </div>
                    <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4">
                      <li><strong className="text-zinc-300">Batas 10x lebih tinggi:</strong> Dapatkan batas penggunaan 10x lebih tinggi dibandingkan tanpa paket Abil-Ai</li>
                      <li><strong className="text-zinc-300">Akses ke model Pro kami:</strong> Dapatkan penalaran canggih dari model Abil-Ai v7.5 Ultra kami untuk masalah matematika dan coding yang kompleks</li>
                      <li><strong className="text-zinc-300">Deep Research & Fitur Lain:</strong> Dapatkan akses ke lebih banyak fitur canggih seperti Deep Research dan pembuatan video</li>
                    </ul>
                    <button 
                      onClick={() => {
                        setShowPricingModal(false);
                        setShowVipModal(false);
                        setVipChatMessage('Halo Admin, saya ingin berlangganan paket Abil-Ai v7.5 Ultra Tahunan seharga Rp 4.579.000/thn. Mohon infonya.');
                        setShowVipChatModal(true);
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg text-xs mt-2"
                    >
                      Update ke v7.5 Ultra Tahunan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showVipChatModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col h-[500px]">
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h3 className="text-zinc-100 font-bold flex items-center gap-2">
                  <User size={16} className="text-purple-400" />
                  Chat Support (Admin)
                </h3>
                <button
                  onClick={() => setShowVipChatModal(false)}
                  className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={vipChatRef}>
                {vipChatMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-xs text-center px-4">
                    Belum ada pesan. Silakan hubungi admin di sini untuk meminta akses VIP atau hal lainnya.
                  </div>
                ) : (
                  vipChatMessages.map((msg, i) => (
                    <div key={msg.id || i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        onMouseDown={() => msg.sender === 'user' && msg.id && handleVipPressStart(msg.id)}
                        onMouseUp={handleVipPressEnd}
                        onMouseLeave={handleVipPressEnd}
                        onTouchStart={() => msg.sender === 'user' && msg.id && handleVipPressStart(msg.id)}
                        onTouchEnd={handleVipPressEnd}
                        onTouchMove={handleVipTouchMove}
                        className={`max-w-[80%] rounded-xl px-4 py-2 relative select-none cursor-pointer ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}
                        title={msg.sender === 'user' ? "Tekan lama untuk memunculkan tombol hapus" : undefined}
                      >
                        <p className="text-sm">{msg.text}</p>
                        {msg.attachment && msg.attachment.dataUrl && (
                          msg.attachment.type.startsWith('image/') ? (
                            <img 
                              src={msg.attachment.dataUrl} 
                              alt="lampiran" 
                              draggable="false"
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="max-w-full max-h-48 rounded-lg mt-2 border border-white/10 cursor-pointer hover:opacity-90 transition shadow select-none" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setFullscreenImage(msg.attachment.dataUrl);
                              }}
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-black/25 rounded-lg text-xs font-semibold text-zinc-200">
                              <Paperclip size={14} className="text-purple-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{msg.attachment.name}</span>
                            </div>
                          )
                        )}
                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 mt-1.5 leading-none">
                          <span className="block ml-auto text-right">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Inline Long-Press Delete Overlay Menu */}
                        {longPressedMessageId === msg.id && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => e.stopPropagation()}
                            className="absolute inset-0 bg-black/95 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 px-2 z-10 duration-200 animate-in fade-in"
                          >
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVipMessage(msg.id);
                                setLongPressedMessageId(null);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1 transition-all active:scale-95 cursor-pointer animate-none"
                            >
                              <Trash2 size={11} /> Hapus
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setLongPressedMessageId(null);
                              }}
                              className="bg-zinc-700 hover:bg-zinc-650 text-zinc-200 text-[11px] font-medium px-2.5 py-1 rounded transition-all active:scale-95 cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 border-t border-zinc-800 bg-zinc-900 rounded-b-2xl flex flex-col gap-2 relative">
                {/* Visual Staged VIP Attachment Preview */}
                {vipChatAttachment && (
                  <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-850 rounded-xl p-2 animate-fade-in text-zinc-300 w-full">
                    <div className="flex items-center gap-2 min-w-0">
                      {vipChatAttachment.type.startsWith('image/') ? (
                        <img 
                          src={vipChatAttachment.dataUrl} 
                          alt="preview" 
                          className="h-8 w-8 object-cover rounded border border-zinc-700/50 shrink-0" 
                        />
                      ) : (
                        <div className="h-8 w-8 bg-zinc-850 rounded border border-zinc-700/50 flex items-center justify-center text-purple-400 shrink-0">
                          <Paperclip size={14} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-200 truncate max-w-[150px]">{vipChatAttachment.name}</p>
                        <p className="text-[10px] text-zinc-500">Lampiran siap dikirim</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setVipChatAttachment(null)}
                      className="p-1 text-zinc-405 hover:bg-zinc-850 hover:text-red-400 rounded-md transition shrink-0"
                      title="Hapus lampiran"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 w-full">
                  <div className="flex gap-1 shrink-0">
                     <button
                        type="button"
                        onClick={() => document.getElementById('vip-file-upload')?.click()}
                        className="p-2 text-zinc-400 hover:text-purple-400 hover:bg-zinc-800 rounded-xl transition"
                        title="Kirim Foto/File ke Admin"
                      >
                        <ImageIcon size={18} />
                      </button>
                      <input 
                        type="file" 
                        id="vip-file-upload" 
                        className="hidden" 
                        accept="image/*,application/pdf,text/plain"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setVipChatAttachment({
                                  name: file.name,
                                  type: file.type,
                                  dataUrl: event.target.result as string
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                          }
                        }} 
                      />
                  </div>
                  <input
                    type="text"
                    value={vipChatMessage}
                    onChange={(e) => setVipChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                         e.preventDefault();
                         handleSendVipChat();
                      }
                    }}
                    placeholder="Ketik pesan ke admin..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50"
                    disabled={vipChatSending}
                  />
                  <button
                    onClick={handleSendVipChat}
                    disabled={(!vipChatMessage.trim() && !vipChatAttachment) || vipChatSending}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50 transition flex items-center justify-center shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Picture Lightbox Modal for any clicked images */}
        {fullscreenImage && (
          <div 
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out select-none"
            onClick={() => setFullscreenImage(null)}
          >
            <button 
              className="absolute top-4 right-4 p-2.5 bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl transition shadow-lg z-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImage(null);
              }}
              title="Tutup"
            >
              <X size={20} />
            </button>
            <img 
              src={fullscreenImage} 
              alt="Fullscreen Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/5 cursor-default transition duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* ---------------- COMPONENT OVERLAY PANEL: ADMIN (KEYS & VIP CONTROLS) ---------------- */}
        {showAdminPanel && currentUser && (
          <AdminPanel
            token={token || ''}
            currentUser={currentUser}
            onClose={() => {
              setShowAdminPanel(false);
              // Refresh details upon closing admin panel (in case updated VIP status)
              fetchProfile();
              fetchChats();
            }}
          />
        )}

        {/* ---------------- LIVE HTML PREVIEW SIMULATOR MODAL ---------------- */}
        {previewHtml && (
          <div className="fixed inset-0 bg-[#060608]/95 backdrop-blur-md z-50 flex flex-col animate-fade-in">
            {/* Header control center bar */}
            <header className="min-h-[4.25rem] py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:pt-3 shrink-0 bg-[#0d0d11] border-b border-zinc-800/80 px-4 md:px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8.5 w-8.5 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Eye size={15} />
                </div>
                <div className="truncate">
                  <p className="font-extrabold text-xs sm:text-sm text-zinc-100 tracking-tight leading-none">Pratinjau Hasil Desain Website</p>
                  <p className="text-[10px] text-zinc-500 font-medium tracking-wide mt-1 truncate">Interaksi responsif langsung (simulasi sandboxed iframe)</p>
                </div>
              </div>

              {/* Viewport size controls */}
              <div className="bg-zinc-950 border border-zinc-850 p-1 rounded-xl flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  title="Tampilan Desktop"
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition select-none cursor-pointer ${
                    previewMode === 'desktop' 
                      ? 'bg-purple-600 text-white shadow shadow-purple-900/40' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Monitor size={12.5} />
                  <span className="hidden md:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  title="Tampilan Tablet"
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition select-none cursor-pointer ${
                    previewMode === 'tablet' 
                      ? 'bg-purple-600 text-white shadow shadow-purple-900/40' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Tablet size={12.5} />
                  <span className="hidden md:inline">Tablet</span>
                </button>
                <button
                  type="button"
                  title="Tampilan Smartphone Mobile"
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition select-none cursor-pointer ${
                    previewMode === 'mobile' 
                      ? 'bg-purple-600 text-white shadow shadow-purple-900/40' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Smartphone size={12.5} />
                  <span className="hidden md:inline">Mobile</span>
                </button>
              </div>

              {/* Copy and Close button tools */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(previewHtml);
                    setHtmlCopied(true);
                    setTimeout(() => setHtmlCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 hover:border-zinc-700 text-zinc-350 hover:text-zinc-100 font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition cursor-pointer select-none"
                >
                  {htmlCopied ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-emerald-400 text-[10.5px] sm:text-xs font-extrabold">Super! Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span className="hidden sm:inline">Salin HTML</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewHtml(null);
                    setHtmlCopied(false);
                  }}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-red-650/15 hover:bg-red-650/30 border border-red-500/25 hover:border-red-500/45 text-red-400 font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition cursor-pointer select-none"
                >
                  <X size={12} />
                  <span>Tutup</span>
                </button>
              </div>
            </header>

            {/* Simulated Live Viewport Area wrapper */}
            <div className="flex-1 bg-[#050507] p-2 sm:p-4 md:p-6 flex items-center justify-center overflow-auto min-h-0">
              <div
                className={`transition-all duration-300 bg-white shadow-2xl relative border border-zinc-800 rounded-xl overflow-hidden text-black flex flex-col ${
                  previewMode === 'mobile' 
                    ? 'w-[375px] h-[667px]' 
                    : previewMode === 'tablet' 
                      ? 'w-[768px] h-[1024px] max-h-full' 
                      : 'w-full h-full'
                }`}
              >
                {/* Mock address or status indicator for responsive frames */}
                {previewMode !== 'desktop' && (
                  <div className="h-7.5 shrink-0 bg-zinc-100 border-b border-zinc-200 flex items-center px-4 justify-between font-sans select-none text-[11px]">
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    </div>
                    <div className="w-2/3 bg-white border border-zinc-250/60 rounded text-center text-[10px] font-mono text-zinc-500 py-0.5 truncate px-2">
                      abil-ai.sandbox/live-simulasi-desain
                    </div>
                    <div className="w-4" />
                  </div>
                )}

                {/* Dynamic sandboxed iframe delivering code */}
                <iframe
                  id="rendered-preview-frame"
                  title="Rendered Website Simulation"
                  srcDoc={previewHtml}
                  sandbox="allow-scripts"
                  className="flex-1 w-full h-full bg-white border-none"
                />
              </div>
            </div>
          </div>
        )}

        {appAlert && (
          <div id="app-alert-modal" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full flex items-center justify-center">
                <ShieldAlert size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-zinc-100 font-extrabold text-base tracking-tight">Pemberitahuan Sistem</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{appAlert}</p>
              </div>
              <button
                onClick={() => setAppAlert(null)}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs rounded-xl border border-zinc-700/60 transition cursor-pointer select-none active:scale-98"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        )}



      </main>
    </div>
  );
}
