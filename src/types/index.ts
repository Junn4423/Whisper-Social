// Types cho WhisperPay - Phase 2 with Supabase

// Re-export database types
export * from './database';

// Frontend-friendly Confession type (transformed from DB)
export interface Confession {
  id: string;
  text: string;
  imageUrl: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  age: number;
  isAnonymous: boolean;
  createdAt: Date;
  authorName?: string;
  authorId?: string;
  unlockPrice?: number;
  chatPrice?: number;
}

// Profile type for frontend use
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  coins: number;
  is_verified: boolean;
  gender: 'Nam' | 'Nữ' | 'Khác' | null;
  age: number | null;
  created_at: string;
  updated_at: string;
}

// Legacy User type (for backward compatibility)
export interface User {
  id: string;
  coins: number;
  unlockedPhotos: string[]; // IDs của confessions đã mở khóa ảnh
  unlockedChats: string[]; // IDs của confessions đã mở khóa chat
}

// Chat message type for frontend
export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isBot?: boolean;
  isRead?: boolean;
}

// Chat room type for frontend
export interface ChatRoom {
  id: string;
  confessionId: string;
  messages: ChatMessage[];
  partnerId?: string;
  partnerName?: string;
  partnerAvatar?: string;
}

export type Language = 'vi' | 'en';

export interface Translations {
  [key: string]: {
    vi: string;
    en: string;
  };
}

// Auth state type
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
}

// Unlock types
export type UnlockTargetType = 'PHOTO' | 'CHAT';

export interface UnlockStatus {
  photos: string[];
  chats: string[];
}
