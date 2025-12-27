'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Confession, ChatRoom, ChatMessage, Language } from '@/types';
import { mockConfessions, generateId, botResponses } from '@/lib/mockData';

interface AppContextType {
  // User State
  user: User;
  updateCoins: (amount: number) => void;
  
  // Confessions
  confessions: Confession[];
  addConfession: (confession: Omit<Confession, 'id' | 'createdAt'>) => void;
  
  // Unlock Actions
  unlockPhoto: (confessionId: string) => boolean;
  unlockChat: (confessionId: string) => boolean;
  isPhotoUnlocked: (confessionId: string) => boolean;
  isChatUnlocked: (confessionId: string) => boolean;
  
  // Chat
  chatRooms: ChatRoom[];
  getChatRoom: (confessionId: string) => ChatRoom | undefined;
  sendMessage: (confessionId: string, text: string) => void;
  
  // Top Up Modal
  showTopUpModal: boolean;
  setShowTopUpModal: (show: boolean) => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_COINS = 20;
const PHOTO_UNLOCK_COST = 10;
const CHAT_UNLOCK_COST = 5;

export function AppProvider({ children }: { children: ReactNode }) {
  // User State - Khởi tạo với 20 xu
  const [user, setUser] = useState<User>({
    id: 'current-user',
    coins: INITIAL_COINS,
    unlockedPhotos: [],
    unlockedChats: [],
  });

  // Confessions State
  const [confessions, setConfessions] = useState<Confession[]>(mockConfessions);
  
  // Chat Rooms State
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  
  // UI State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  
  // Language State
  const [language, setLanguage] = useState<Language>('vi');

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('whisperPay_user');
    const savedConfessions = localStorage.getItem('whisperPay_confessions');
    const savedChatRooms = localStorage.getItem('whisperPay_chatRooms');
    const savedLanguage = localStorage.getItem('whisperPay_language');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    if (savedConfessions) {
      try {
        const parsed = JSON.parse(savedConfessions);
        // Merge with mock data, avoiding duplicates
        const mergedConfessions = [...mockConfessions];
        parsed.forEach((conf: Confession) => {
          if (!mergedConfessions.find(c => c.id === conf.id)) {
            mergedConfessions.push(conf);
          }
        });
        setConfessions(mergedConfessions);
      } catch (e) {
        console.error('Error parsing confessions:', e);
      }
    }
    
    if (savedChatRooms) {
      try {
        setChatRooms(JSON.parse(savedChatRooms));
      } catch (e) {
        console.error('Error parsing chat rooms:', e);
      }
    }
    
    if (savedLanguage) {
      setLanguage(savedLanguage as Language);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('whisperPay_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    // Only save user-created confessions (not mock data)
    const userConfessions = confessions.filter(
      c => !mockConfessions.find(m => m.id === c.id)
    );
    localStorage.setItem('whisperPay_confessions', JSON.stringify(userConfessions));
  }, [confessions]);

  useEffect(() => {
    localStorage.setItem('whisperPay_chatRooms', JSON.stringify(chatRooms));
  }, [chatRooms]);

  useEffect(() => {
    localStorage.setItem('whisperPay_language', language);
  }, [language]);

  // Update coins
  const updateCoins = (amount: number) => {
    setUser(prev => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  };

  // Add new confession
  const addConfession = (confession: Omit<Confession, 'id' | 'createdAt'>) => {
    const newConfession: Confession = {
      ...confession,
      id: generateId(),
      createdAt: new Date(),
    };
    setConfessions(prev => [newConfession, ...prev]);
  };

  // Unlock photo - returns true if successful
  const unlockPhoto = (confessionId: string): boolean => {
    if (user.unlockedPhotos.includes(confessionId)) {
      return true; // Already unlocked
    }
    
    if (user.coins < PHOTO_UNLOCK_COST) {
      setShowTopUpModal(true);
      return false;
    }
    
    setUser(prev => ({
      ...prev,
      coins: prev.coins - PHOTO_UNLOCK_COST,
      unlockedPhotos: [...prev.unlockedPhotos, confessionId],
    }));
    
    return true;
  };

  // Unlock chat - returns true if successful
  const unlockChat = (confessionId: string): boolean => {
    if (user.unlockedChats.includes(confessionId)) {
      return true; // Already unlocked
    }
    
    if (user.coins < CHAT_UNLOCK_COST) {
      setShowTopUpModal(true);
      return false;
    }
    
    setUser(prev => ({
      ...prev,
      coins: prev.coins - CHAT_UNLOCK_COST,
      unlockedChats: [...prev.unlockedChats, confessionId],
    }));
    
    // Create chat room if doesn't exist
    if (!chatRooms.find(room => room.confessionId === confessionId)) {
      const newRoom: ChatRoom = {
        id: generateId(),
        confessionId,
        messages: [],
      };
      setChatRooms(prev => [...prev, newRoom]);
    }
    
    return true;
  };

  // Check if photo is unlocked
  const isPhotoUnlocked = (confessionId: string): boolean => {
    return user.unlockedPhotos.includes(confessionId);
  };

  // Check if chat is unlocked
  const isChatUnlocked = (confessionId: string): boolean => {
    return user.unlockedChats.includes(confessionId);
  };

  // Get chat room
  const getChatRoom = (confessionId: string): ChatRoom | undefined => {
    return chatRooms.find(room => room.confessionId === confessionId);
  };

  // Send message and simulate bot reply
  const sendMessage = (confessionId: string, text: string) => {
    const roomIndex = chatRooms.findIndex(room => room.confessionId === confessionId);
    
    if (roomIndex === -1) return;
    
    const userMessage: ChatMessage = {
      id: generateId(),
      senderId: user.id,
      text,
      timestamp: new Date(),
    };
    
    setChatRooms(prev => {
      const updated = [...prev];
      updated[roomIndex] = {
        ...updated[roomIndex],
        messages: [...updated[roomIndex].messages, userMessage],
      };
      return updated;
    });
    
    // Simulate bot reply after 2-3 seconds
    setTimeout(() => {
      const responses = botResponses[language];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const botMessage: ChatMessage = {
        id: generateId(),
        senderId: 'bot',
        text: randomResponse,
        timestamp: new Date(),
        isBot: true,
      };
      
      setChatRooms(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(room => room.confessionId === confessionId);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            messages: [...updated[idx].messages, botMessage],
          };
        }
        return updated;
      });
    }, 2000 + Math.random() * 1000);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateCoins,
        confessions,
        addConfession,
        unlockPhoto,
        unlockChat,
        isPhotoUnlocked,
        isChatUnlocked,
        chatRooms,
        getChatRoom,
        sendMessage,
        showTopUpModal,
        setShowTopUpModal,
        language,
        setLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
