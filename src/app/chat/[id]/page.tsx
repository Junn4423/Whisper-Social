'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/SupabaseAppContext';
import RealtimeChatInterface from '@/components/RealtimeChatInterface';
import { getChatRoomByConfession } from '@/actions/confessionActions';
import { Confession } from '@/types';

interface ChatData {
  confession: Confession;
  partnerId: string;
  currentUserId: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isChatUnlocked, confessions } = useApp();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const confessionId = params.id as string;

  useEffect(() => {
    const loadChatData = async () => {
      if (!user) {
        router.push(`/auth/login?redirect=/chat/${confessionId}`);
        return;
      }

      // Try to get from local confessions first
      const localConfession = confessions.find(c => c.id === confessionId);
      
      // Check if chat is unlocked
      if (!isChatUnlocked(confessionId)) {
        // Chat not unlocked, redirect to home
        router.push('/');
        return;
      }

      // Fetch full chat room data
      const result = await getChatRoomByConfession(confessionId);
      
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to load chat');
        setLoading(false);
        return;
      }

      const { confession, currentUserId, partnerId } = result.data;

      // Transform DB confession to frontend format
      const transformedConfession: Confession = localConfession || {
        id: confession.id,
        text: confession.content,
        imageUrl: confession.image_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop',
        gender: confession.gender as 'Nam' | 'Nữ' | 'Khác',
        age: confession.age,
        isAnonymous: confession.is_anonymous,
        createdAt: new Date(confession.created_at),
        authorId: confession.author_id || undefined,
      };

      setChatData({
        confession: transformedConfession,
        partnerId,
        currentUserId,
      });
      setLoading(false);
    };

    loadChatData();
  }, [confessionId, user, isChatUnlocked, confessions, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded-lg bg-neon-purple text-white"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!chatData) {
    return null;
  }

  return (
    <RealtimeChatInterface 
      confession={chatData.confession} 
      partnerId={chatData.partnerId}
      currentUserId={chatData.currentUserId}
    />
  );
}
