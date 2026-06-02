/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ApiKeys, User, VIPAccessInfo } from '../types';
import { Key, Users, ShieldAlert, Award, Clock, ArrowRight, X, Check, Calendar, Trash2, Loader2, Image as ImageIcon, Paperclip } from 'lucide-react';

interface AdminPanelProps {
  token: string;
  onClose: () => void;
  currentUser: User;
}

export default function AdminPanel({ token, onClose, currentUser }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'keys' | 'users' | 'requests'>('keys');
  const [keys, setKeys] = useState<ApiKeys>({
    gemini: '',
    chatgpt: '',
    deepseek: '',
    kimi: '',
    grok: '',
    dola: ''
  });
  const [users, setUsers] = useState<(User & { hasAccess: boolean; daysRemaining: number })[]>([]);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantDays, setGrantDays] = useState('3');
  const [selectedModels, setSelectedModels] = useState<string[]>(['all']); // default to ['all'] (Buka Semua)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminChats, setAdminChats] = useState<any[]>([]);
  const [activeChatEmail, setActiveChatEmail] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [adminAttachment, setAdminAttachment] = useState<{name: string, type: string, dataUrl: string} | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const [longPressedMessageId, setLongPressedMessageId] = useState<string | null>(null);
  const longPressTimerRef = useRef<any>(null);

  const handleAdminPressStart = (msgId: string) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setLongPressedMessageId(msgId);
    }, 600);
  };

  const handleAdminPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleAdminTouchMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    fetchKeys();
    fetchUsers();
    
    let interval: any;
    if (activeTab === 'requests') {
      fetchAdminChats();
      interval = setInterval(fetchAdminChats, 3000);
    }
    return () => clearInterval(interval);
  }, [token, activeTab]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [adminChats, activeChatEmail]);

  const fetchAdminChats = async () => {
    try {
      const res = await fetch('/api/admin/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminChats(data.chats);
      }
    } catch (e) {
      console.error('Failed to fetch admin chats', e);
    }
  };

  const handleSendAdminChat = async () => {
    if (!activeChatEmail || (!chatMessage.trim() && !adminAttachment)) return;
    const attachmentToSend = adminAttachment;
    setAdminAttachment(null);
    try {
      const res = await fetch(`/api/admin/chats/${activeChatEmail}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: chatMessage, attachment: attachmentToSend })
      });
      const data = await res.json();
      if (data.success && data.chat) {
        setChatMessage('');
        fetchAdminChats();
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const handleDeleteAdminMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/vip/chat/message/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminChats();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Gagal menghapus pesan' });
      }
    } catch (e) {
      console.error('Failed to delete support message', e);
    }
  };

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/admin/keys', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setKeys(data.keys);
      }
    } catch (e) {
      console.error('Failed to fetch API keys', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error('Failed to fetch list of users', e);
    }
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(keys)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Kunci API berhasil disimpan!' });
        fetchKeys();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Gagal menyimpan kunci API.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    } finally {
      setLoading(false);
    }
  };

  const handleModelToggle = (modelId: string) => {
    if (modelId === 'all') {
      if (selectedModels.includes('all')) {
        setSelectedModels([]); // clear all
      } else {
        setSelectedModels(['all']); // check all only
      }
    } else {
      let updated = [...selectedModels];
      if (updated.includes('all')) {
        updated = updated.filter(m => m !== 'all');
      }
      
      if (updated.includes(modelId)) {
        updated = updated.filter(m => m !== modelId);
      } else {
        updated.push(modelId);
      }
      
      // If all three models are checked, auto-convert to 'all'
      if (updated.includes('abil-ai v5.6 pro') && 
          updated.includes('abil-ai v6.6 plus') && 
          updated.includes('abil-ai v7.5 ultra')) {
        setSelectedModels(['all']);
      } else {
        setSelectedModels(updated);
      }
    }
  };

  const handleRevokeVip = async (email: string) => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/vip/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        fetchUsers();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Gagal menghapus VIP.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Koneksi ke server terputus.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGrantVip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail) {
      setStatusMsg({ type: 'error', text: 'Email penerima wajib diisi!' });
      return;
    }
    if (selectedModels.length === 0) {
      setStatusMsg({ type: 'error', text: 'Silakan pilih setidaknya satu model atau Buka Semua!' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/vip/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: grantEmail,
          days: parseInt(grantDays) || 3,
          unlockedModels: selectedModels
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        setGrantEmail('');
        setSelectedModels(['all']);
        fetchUsers();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Gagal memberikan akses VIP.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Koneksi ke server terputus.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-panel-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div id="admin-panel-container" className="w-full max-w-4xl bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-xl text-white">
              <ShieldAlert size={22} id="admin-icon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Panel Pengontrol Admin Abil-Ai</h2>
              <p className="text-xs text-zinc-400 font-mono">Operator: {currentUser.email}</p>
            </div>
          </div>
          <button 
            id="close-admin-panel"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition"
          >
            <X size={20} id="close-icon" />
          </button>
        </div>

        {/* Tab Selector */}
        <div id="admin-tabs" className="flex border-b border-zinc-800 bg-zinc-900/30 px-6 gap-4">
          <button
            id="tab-keys"
            onClick={() => setActiveTab('keys')}
            className={`py-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition select-none ${
              activeTab === 'keys' 
                ? 'border-amber-500 text-amber-400 font-semibold' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key size={16} />
            Konfigurasi API Key
          </button>
          <button
            id="tab-users"
            onClick={() => setActiveTab('users')}
            className={`py-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition select-none ${
              activeTab === 'users' 
                ? 'border-amber-500 text-amber-400 font-semibold' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users size={16} />
            Kelola VIP & Pengguna
          </button>
          <button
            id="tab-requests"
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition select-none ${
              activeTab === 'requests' 
                ? 'border-amber-500 text-amber-400 font-semibold' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert size={16} />
            Chat Admin
            {adminChats.length > 0 && (
              <span className="bg-amber-500 text-zinc-950 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                {adminChats.length}
              </span>
            )}
          </button>
        </div>

        {/* Messaging Box */}
        {statusMsg && (
          <div className="px-6 pt-4">
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-sm font-medium ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <div className="rounded-full bg-current/25 p-1">
                <Check size={14} />
              </div>
              <p>{statusMsg.text}</p>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'keys' && (
            <form onSubmit={handleSaveKeys} className="space-y-6" id="api-keys-form">
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 mb-4">
                <h3 className="text-sm font-bold text-amber-400 mb-1 flex items-center gap-2">
                  <Clock size={16} />
                  Keterangan API Key
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Konfigurasikan Kunci API Server di bawah ini secara aman. Jika kunci tidak dimasukkan, server akan menggunakan model simulasi otomatis atau kunci Gemini bawaan agar pengguna Anda tetap mendapat respons yang pintar dan ramah tanpa hambatan!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan API Key Gemini..."
                    value={keys.gemini}
                    onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
                    className="w-full bg-[#202024] border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                    ChatGPT (OpenAI) Key
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan API Key ChatGPT..."
                    value={keys.chatgpt}
                    onChange={(e) => setKeys({ ...keys, chatgpt: e.target.value })}
                    className="w-full bg-[#202024] border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                    DeepSeek Key
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan API Key DeepSeek..."
                    value={keys.deepseek}
                    onChange={(e) => setKeys({ ...keys, deepseek: e.target.value })}
                    className="w-full bg-[#202024] border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                    Kimi Key
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan API Key Kimi..."
                    value={keys.kimi}
                    onChange={(e) => setKeys({ ...keys, kimi: e.target.value })}
                    className="w-full bg-[#202024] border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                    Grok Key
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan API Key Grok..."
                    value={keys.grok}
                    onChange={(e) => setKeys({ ...keys, grok: e.target.value })}
                    className="w-full bg-[#202024] border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                    Dola Key
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan API Key Dola..."
                    value={keys.dola}
                    onChange={(e) => setKeys({ ...keys, dola: e.target.value })}
                    className="w-full bg-[#202024] border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                <button
                  type="submit"
                  disabled={loading}
                  id="save-keys"
                  className={`px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer transition-all duration-300 disabled:opacity-75 ${
                    loading ? 'animate-pulse' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-black" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span>Simpan Perubahan Kunci API</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
          
          {activeTab === 'users' && (
            <div className="space-y-6" id="users-panel-content">
              {/* Grant VIP Form */}
              <form onSubmit={handleGrantVip} className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-805 space-y-4" id="grant-vip-form">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Beri Hak Akses VIP (Ketik Email)
                    </label>
                    <input
                      type="email"
                      placeholder="contoh: emailuser@gmail.com"
                      value={grantEmail}
                      onChange={(e) => setGrantEmail(e.target.value)}
                      className="w-full bg-[#1e1e22] border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition placeholder-zinc-600"
                    />
                  </div>

                  <div className="w-full md:w-44">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Durasi VIP (Hari)
                    </label>
                    <select
                      value={grantDays}
                      onChange={(e) => setGrantDays(e.target.value)}
                      className="w-full bg-[#1e1e22] border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition"
                    >
                      <option value="1">1 Hari</option>
                      <option value="3">3 Hari</option>
                      <option value="7">7 Hari</option>
                      <option value="30">30 Hari</option>
                      <option value="365">1 Tahun</option>
                    </select>
                  </div>
                </div>

                {/* Model Permissions Selection Selector */}
                <div className="p-4 bg-[#141416]/50 border border-zinc-800/80 rounded-xl">
                  <label className="block text-xs font-extrabold text-[#d4d4d8] mb-2.5 uppercase tracking-wider flex items-center gap-2">
                    <Award size={14} className="text-amber-500 animate-pulse" />
                    Pilih Model VIP yang Akan Dibuka:
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleModelToggle('all')}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-200 select-none cursor-pointer flex items-center gap-1.5 ${
                        selectedModels.includes('all')
                          ? 'bg-purple-600/25 border-purple-500 text-purple-400 shadow-md shadow-purple-550/10'
                          : 'bg-zinc-900 border-zinc-800/90 text-zinc-405 hover:text-zinc-300'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${selectedModels.includes('all') ? 'bg-purple-400' : 'bg-transparent border border-zinc-500'}`} />
                      Buka Semua AI (All-In-One VIP)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModelToggle('abil-ai v5.6 pro')}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-200 select-none cursor-pointer flex items-center gap-1.5 ${
                        selectedModels.includes('abil-ai v5.6 pro') || selectedModels.includes('all')
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md shadow-amber-550/10'
                          : 'bg-zinc-900 border-zinc-800/90 text-zinc-405 hover:text-zinc-300'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${(selectedModels.includes('abil-ai v5.6 pro') || selectedModels.includes('all')) ? 'bg-amber-400' : 'bg-transparent border border-zinc-500'}`} />
                      Abil-Ai v5.6 Pro
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModelToggle('abil-ai v6.6 plus')}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-200 select-none cursor-pointer flex items-center gap-1.5 ${
                        selectedModels.includes('abil-ai v6.6 plus') || selectedModels.includes('all')
                          ? 'bg-pink-500/15 border-pink-500 text-pink-400 shadow-md shadow-pink-550/10'
                          : 'bg-zinc-900 border-zinc-800/90 text-zinc-405 hover:text-zinc-300'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${(selectedModels.includes('abil-ai v6.6 plus') || selectedModels.includes('all')) ? 'bg-pink-400' : 'bg-transparent border border-zinc-500'}`} />
                      Abil-Ai v6.6 Plus
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModelToggle('abil-ai v7.5 ultra')}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-200 select-none cursor-pointer flex items-center gap-1.5 ${
                        selectedModels.includes('abil-ai v7.5 ultra') || selectedModels.includes('all')
                          ? 'bg-blue-500/15 border-blue-500 text-blue-400 shadow-md shadow-blue-550/10'
                          : 'bg-zinc-900 border-zinc-800/90 text-zinc-405 hover:text-zinc-305'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${(selectedModels.includes('abil-ai v7.5 ultra') || selectedModels.includes('all')) ? 'bg-blue-400' : 'bg-transparent border border-zinc-500'}`} />
                      Abil-Ai v7.5 Ultra
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    id="grant-vip-btn"
                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-indigo-600/10 disabled:opacity-50"
                  >
                    <Award size={16} />
                    Beri Hak Akses VIP
                  </button>
                </div>
              </form>

              {/* Users Table */}
              <div className="bg-[#1b1b1f] border border-zinc-850 rounded-2xl overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/40 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-zinc-300">Daftar Pengguna & Status Layanan</h3>
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-mono font-medium">
                    Total: {users.length} User
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm" id="users-table">
                    <thead>
                      <tr className="border-b border-zinc-800/60 text-zinc-400 text-xs uppercase font-semibold">
                        <th className="p-4">Alamat Email</th>
                        <th className="p-4">Peran (Role)</th>
                        <th className="p-4">Status & Model Terbuka</th>
                        <th className="p-4">Masa Berlaku</th>
                        <th className="p-4 text-center">Aksi (Hapus VIP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-zinc-500">
                            Belum ada pengguna terdaftar selain Admin bawaan.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.email} className="hover:bg-zinc-900/20 text-zinc-200 transition-colors">
                            <td className="p-4 font-semibold text-zinc-100">{u.email}</td>
                            <td className="p-4">
                              {u.isAdmin ? (
                                <span className="text-[10px] font-bold tracking-wider uppercase bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md">
                                  Owner/Admin
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold tracking-wider uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                                  User Biasa
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1.5">
                                {u.hasAccess ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2.5 py-1 rounded-full font-semibold w-fit animate-pulse">
                                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                                    VIP Aktif
                                  </span>
                                ) : u.isAdmin ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-semibold w-fit">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                    Selamanya (Admin)
                                  </span>
                                ) : (
                                  <span className="text-xs text-zinc-500">Tidak Ada</span>
                                )}

                                {/* Show list of unlocked models */}
                                {u.hasAccess && u.unlockedModels && u.unlockedModels.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {u.unlockedModels.includes('all') ? (
                                      <span className="text-[9px] font-extrabold bg-purple-600/10 text-purple-450 border border-purple-500/20 px-2 py-0.5 rounded">
                                        Semua Model Terbuka ✓
                                      </span>
                                    ) : (
                                      u.unlockedModels.map((m: string) => {
                                        let shortName = m.replace('abil-ai ', '');
                                        return (
                                          <span key={m} className="text-[9px] font-bold bg-zinc-800/80 text-zinc-300 border border-zinc-700 px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">
                                            {shortName}
                                          </span>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-xs font-mono text-zinc-400">
                              {u.hasAccess && u.vipUntil ? (
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} className="text-purple-400" />
                                  <span>{u.daysRemaining} hari lagi ({new Date(u.vipUntil).toLocaleDateString('id-ID')})</span>
                                </div>
                              ) : u.isAdmin ? (
                                "Tak Terbatas"
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {!u.isAdmin && u.hasAccess ? (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeVip(u.email)}
                                  disabled={loading}
                                  className="mx-auto px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold text-xs flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer select-none"
                                >
                                  <Trash2 size={12} className="shrink-0" />
                                  <span>Hapus VIP</span>
                                </button>
                              ) : (
                                <span className="text-xs text-zinc-600 font-medium">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="flex h-full min-h-[500px]">
              {/* Chat List (Sidebar) */}
              <div className="w-1/3 border-r border-zinc-800 pr-4 flex flex-col h-[500px] overflow-y-auto space-y-2">
                <h3 className="text-zinc-200 font-bold mb-2">Riwayat Chat</h3>
                {adminChats.length === 0 ? (
                  <div className="text-zinc-500 text-xs text-center mt-10">Belum ada chat.</div>
                ) : (
                  adminChats.map((chat: any) => {
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    const active = activeChatEmail === chat.email;
                    return (
                      <button
                        key={chat.email}
                        onClick={() => setActiveChatEmail(chat.email)}
                        className={`w-full text-left p-3 rounded-xl transition ${active ? 'bg-purple-600/20 border border-purple-500/50' : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'}`}
                      >
                        <div className="text-zinc-300 font-bold text-xs truncate mb-1">{chat.email}</div>
                        {lastMsg && (
                          <div className="text-[10px] text-zinc-500 truncate max-w-full">
                            {lastMsg.sender === 'admin' ? 'Anda: ' : ''}{lastMsg.text}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Chat View */}
              <div className="w-2/3 pl-4 flex flex-col h-[500px]">
                {!activeChatEmail ? (
                  <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs">
                    Pilih percakapan dari kiri untuk membalas pesan.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div className="text-zinc-200 font-bold text-sm">{activeChatEmail}</div>
                      <button
                        onClick={() => {
                          setGrantEmail(activeChatEmail);
                          setActiveTab('users');
                        }}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded border border-amber-500/30 text-[10px] font-bold"
                      >
                        Kelola VIP
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 space-y-3" ref={chatRef}>
                      {adminChats.find(c => c.email === activeChatEmail)?.messages.map((msg: any, i: number) => (
                        <div key={msg.id || i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div 
                            onMouseDown={() => msg.id && handleAdminPressStart(msg.id)}
                            onMouseUp={handleAdminPressEnd}
                            onMouseLeave={handleAdminPressEnd}
                            onTouchStart={() => msg.id && handleAdminPressStart(msg.id)}
                            onTouchEnd={handleAdminPressEnd}
                            onTouchMove={handleAdminTouchMove}
                            className={`max-w-[80%] rounded-xl px-4 py-2 relative select-none cursor-pointer ${msg.sender === 'admin' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}
                            title="Tekan lama untuk memunculkan tombol hapus"
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
                                  className="max-w-full max-h-40 rounded-lg mt-2 border border-white/10 cursor-pointer hover:opacity-90 transition shadow select-none" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFullscreenImage(msg.attachment.dataUrl);
                                  }}
                                />
                              ) : (
                                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-black/25 rounded-lg text-xs font-semibold text-zinc-200">
                                  <Paperclip size={14} className="text-purple-400 shrink-0" />
                                  <span className="truncate max-w-[155px]">{msg.attachment.name}</span>
                                </div>
                              )
                            )}
                            <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 mt-1.5 leading-none">
                              <span className="block ml-auto text-right">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Inline Long-Press Delete Overlay Menu for Admin */}
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
                                    handleDeleteAdminMessage(msg.id);
                                    setLongPressedMessageId(null);
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
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
                      ))}
                    </div>

                    <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2 flex-shrink-0 relative w-full">
                      {/* Visual Staged Admin Attachment Preview */}
                      {adminAttachment && (
                        <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-850 rounded-xl p-2 animate-fade-in text-zinc-300 w-full">
                          <div className="flex items-center gap-2 min-w-0">
                            {adminAttachment.type.startsWith('image/') ? (
                              <img 
                                src={adminAttachment.dataUrl} 
                                alt="preview" 
                                className="h-8 w-8 object-cover rounded border border-zinc-700/50 shrink-0" 
                              />
                            ) : (
                              <div className="h-8 w-8 bg-zinc-850 rounded border border-zinc-700/50 flex items-center justify-center text-purple-400 shrink-0">
                                <Paperclip size={14} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-200 truncate max-w-[150px]">{adminAttachment.name}</p>
                              <p className="text-[10px] text-zinc-500">Lampiran siap dikirim</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setAdminAttachment(null)}
                            className="p-1 text-zinc-400 hover:bg-zinc-850 hover:text-red-400 rounded-md transition shrink-0"
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
                              onClick={() => document.getElementById('admin-file-upload')?.click()}
                              className="p-2 text-zinc-400 hover:text-purple-400 hover:bg-zinc-800 rounded-xl transition"
                              title="Kirim Foto/File"
                            >
                              <ImageIcon size={18} />
                            </button>
                            <input 
                              type="file" 
                              id="admin-file-upload" 
                              className="hidden" 
                              accept="image/*,application/pdf,text/plain"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setAdminAttachment({
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
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendAdminChat();
                            }
                          }}
                          placeholder="Balas pesan..."
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50"
                        />
                        <button
                          onClick={handleSendAdminChat}
                          disabled={!chatMessage.trim() && !adminAttachment}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50 transition shrink-0"
                        >
                          Kirim
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Admin Lightbox fullscreen image portal */}
        {fullscreenImage && (
          <div 
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out select-none"
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
      </div>
    </div>
  );
}
