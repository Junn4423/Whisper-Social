// Types cho WhisperPay

export interface Confession {
  id: string;
  text: string;
  imageUrl: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  age: number;
  isAnonymous: boolean;
  createdAt: Date;
  authorName?: string;
}

export interface User {
  id: string;
  coins: number;
  unlockedPhotos: string[]; // IDs của confessions đã mở khóa ảnh
  unlockedChats: string[]; // IDs của confessions đã mở khóa chat
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isBot?: boolean;
}

export interface ChatRoom {
  id: string;
  confessionId: string;
  messages: ChatMessage[];
}

export type Language = 'vi' | 'en';

export interface Translations {
  [key: string]: {
    vi: string;
    en: string;
  };
}
