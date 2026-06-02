/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: string;
    dataUrl: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  createdAt: string;
  userId: string;
}

export interface User {
  email: string;
  isAdmin: boolean;
  vipUntil: string | null; // ISO Date String
  unlockedModels?: string[]; // e.g. ["all"] or ["abil-ai v5.6 pro"]
  createdAt: string;
}

export interface ApiKeys {
  gemini: string;
  chatgpt: string;
  deepseek: string;
  kimi: string;
  grok: string;
  dola: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string; // Standard session representation
}

export interface VIPAccessInfo {
  email: string;
  vipUntil: string | null;
  daysRemaining: number;
  hasAccess: boolean;
}
