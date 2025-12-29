'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Profile, Confession, Language } from '@/types';
import { User, Session } from '@supabase/supabase-js';

interface AppContextType {
  // Auth State
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  
  // Profile/Coins
  coins: number;
  updateCoins: (newAmount: number) => void;
  refreshProfile: () => Promise<void>;
  
  // Confessions
  confessions: Confession[];
  refreshConfessions: () => Promise<void>;
  isConfessionsLoading: boolean;
  
  // Unlock Status
  unlockedPhotos: string[];
  unlockedChats: string[];
  isPhotoUnlocked: (confessionId: string) => boolean;
  isChatUnlocked: (confessionId: string) => boolean;
  addUnlock: (confessionId: string, type: 'PHOTO' | 'CHAT') => void;
  refreshUnlocks: () => Promise<void>;
  
  // Top Up Modal
  showTopUpModal: boolean;
  setShowTopUpModal: (show: boolean) => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Auth Actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Confessions State
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [isConfessionsLoading, setIsConfessionsLoading] = useState(true);
  
  // Unlocks State
  const [unlockedPhotos, setUnlockedPhotos] = useState<string[]>([]);
  const [unlockedChats, setUnlockedChats] = useState<string[]>([]);
  
  // UI State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  
  // Language State
  const [language, setLanguageState] = useState<Language>('vi');

  // =============================================
  // PROFILE FUNCTIONS
  // =============================================
  
  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user || !supabase) return;
    
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData as Profile);
    }
  }, [user, fetchProfile]);

  const updateCoins = useCallback((newAmount: number) => {
    setProfile(prev => prev ? { ...prev, coins: newAmount } : null);
  }, []);

  // =============================================
  // CONFESSIONS FUNCTIONS
  // =============================================

  const refreshConfessions = useCallback(async () => {
    if (!supabase) return;
    
    setIsConfessionsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('confessions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching confessions:', error);
        return;
      }
      
      // Transform to match frontend Confession type
      const transformedConfessions: Confession[] = (data || []).map(conf => ({
        id: conf.id,
        text: conf.content,
        imageUrl: conf.image_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop',
        gender: conf.gender as 'Nam' | 'Nữ' | 'Khác',
        age: conf.age,
        isAnonymous: conf.is_anonymous,
        createdAt: new Date(conf.created_at),
        authorName: conf.is_anonymous ? undefined : undefined, // Would need join for author name
        authorId: conf.author_id || undefined,
        unlockPrice: conf.unlock_price,
        chatPrice: conf.chat_price,
      }));
      
      setConfessions(transformedConfessions);
    } catch (error) {
      console.error('Error in refreshConfessions:', error);
    } finally {
      setIsConfessionsLoading(false);
    }
  }, []);

  // =============================================
  // UNLOCKS FUNCTIONS
  // =============================================

  const refreshUnlocks = useCallback(async () => {
    if (!user || !supabase) {
      setUnlockedPhotos([]);
      setUnlockedChats([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('unlocks')
        .select('target_id, target_type')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching unlocks:', error);
        return;
      }

      const photos = data?.filter(u => u.target_type === 'PHOTO').map(u => u.target_id) || [];
      const chats = data?.filter(u => u.target_type === 'CHAT').map(u => u.target_id) || [];
      
      setUnlockedPhotos(photos);
      setUnlockedChats(chats);
    } catch (error) {
      console.error('Error in refreshUnlocks:', error);
    }
  }, [user]);

  const isPhotoUnlocked = useCallback((confessionId: string): boolean => {
    return unlockedPhotos.includes(confessionId);
  }, [unlockedPhotos]);

  const isChatUnlocked = useCallback((confessionId: string): boolean => {
    return unlockedChats.includes(confessionId);
  }, [unlockedChats]);

  const addUnlock = useCallback((confessionId: string, type: 'PHOTO' | 'CHAT') => {
    if (type === 'PHOTO') {
      setUnlockedPhotos(prev => [...prev, confessionId]);
    } else {
      setUnlockedChats(prev => [...prev, confessionId]);
    }
  }, []);

  // =============================================
  // AUTH FUNCTIONS
  // =============================================

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Service not available' };
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { error: error.message };
    }
    
    return {};
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: 'Service not available' };
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      return { error: error.message };
    }
    
    return {};
  };

  const signOut = async () => {
    if (!supabase) return;
    
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setUnlockedPhotos([]);
    setUnlockedChats([]);
  };

  const signInWithGoogle = async () => {
    if (!supabase) return { error: 'Service not available' };
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    
    if (error) {
      return { error: error.message };
    }
    
    return {};
  };

  // =============================================
  // LANGUAGE FUNCTIONS
  // =============================================

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('whisperPay_language', lang);
  };

  // =============================================
  // INITIALIZATION & SUBSCRIPTIONS
  // =============================================

  const syncProfileFromUser = useCallback(async (u: User) => {
    if (!supabase || !u) return;

    const avatarUrl = (u.user_metadata as Record<string, any>)?.avatar_url
      || (u.user_metadata as Record<string, any>)?.picture
      || null;

    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', u.id)
      .single();

    if (error) {
      // If not found, insert new profile with email as username
      await supabase.from('profiles').upsert({
        id: u.id,
        username: u.email || `user_${u.id}`,
        avatar_url: avatarUrl,
      });
      return;
    }

    const updates: Partial<Profile> = {};
    if (u.email && existingProfile?.username !== u.email) {
      updates.username = u.email;
    }
    if (avatarUrl && !existingProfile?.avatar_url) {
      updates.avatar_url = avatarUrl;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('profiles').update(updates).eq('id', u.id);
    }
  }, []);

  // Initialize auth
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    
    const initAuth = async () => {
      setIsLoading(true);
      
      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        
        // Fetch profile
        const profileData = await fetchProfile(initialSession.user.id);
        if (profileData) {
          setProfile(profileData as Profile);
          await syncProfileFromUser(initialSession.user);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id);
          if (profileData) {
            setProfile(profileData as Profile);
          }
          await syncProfileFromUser(newSession.user);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Load language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('whisperPay_language');
    if (savedLanguage === 'en' || savedLanguage === 'vi') {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Fetch confessions on mount
  useEffect(() => {
    refreshConfessions();
  }, [refreshConfessions]);

  // Fetch unlocks when user changes
  useEffect(() => {
    refreshUnlocks();
  }, [user, refreshUnlocks]);

  // Subscribe to realtime confessions updates
  useEffect(() => {
    if (!supabase) return;
    
    const channel = supabase
      .channel('public:confessions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'confessions',
        },
        (payload) => {
          const newConf = payload.new;
          const transformed: Confession = {
            id: newConf.id,
            text: newConf.content,
            imageUrl: newConf.image_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop',
            gender: newConf.gender as 'Nam' | 'Nữ' | 'Khác',
            age: newConf.age,
            isAnonymous: newConf.is_anonymous,
            createdAt: new Date(newConf.created_at),
            authorId: newConf.author_id || undefined,
            unlockPrice: newConf.unlock_price,
            chatPrice: newConf.chat_price,
          };
          
          setConfessions(prev => [transformed, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to realtime profile updates (for coins)
  useEffect(() => {
    if (!user || !supabase) return;

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // =============================================
  // CONTEXT VALUE
  // =============================================

  const value: AppContextType = {
    // Auth
    user,
    profile,
    session,
    isLoading,
    
    // Profile/Coins
    coins: profile?.coins || 0,
    updateCoins,
    refreshProfile,
    
    // Confessions
    confessions,
    refreshConfessions,
    isConfessionsLoading,
    
    // Unlocks
    unlockedPhotos,
    unlockedChats,
    isPhotoUnlocked,
    isChatUnlocked,
    addUnlock,
    refreshUnlocks,
    
    // UI
    showTopUpModal,
    setShowTopUpModal,
    
    // Language
    language,
    setLanguage,
    
    // Auth Actions
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return (
    <AppContext.Provider value={value}>
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
