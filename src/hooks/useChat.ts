'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Message, ChatRoom } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseChatOptions {
  confessionId: string;
  currentUserId: string;
  partnerId: string;
}

interface TypingState {
  isTyping: boolean;
  userId: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  partnerTyping: boolean;
  partnerOnline: boolean;
  partnerLastSeen: string | null;
}

export function useChat({ confessionId, currentUserId, partnerId }: UseChatOptions) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: true,
    error: null,
    partnerTyping: false,
    partnerOnline: false,
    partnerLastSeen: null,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!supabase) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Service not available' }));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('confession_id', confessionId)
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        messages: data || [],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load messages',
        isLoading: false,
      }));
    }
  }, [confessionId, currentUserId, partnerId]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !supabase) return null;

    const newMessage = {
      sender_id: currentUserId,
      receiver_id: partnerId,
      confession_id: confessionId,
      content: content.trim(),
      is_read: false,
    };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();

      if (error) throw error;

      // Message will be added via realtime subscription
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to send message',
      }));
      return null;
    }
  }, [confessionId, currentUserId, partnerId]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!supabase) return;
    
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUserId)
        .eq('sender_id', partnerId)
        .eq('confession_id', confessionId)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [confessionId, currentUserId, partnerId]);

  // Broadcast typing status
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: currentUserId,
          isTyping,
        },
      });
    }
  }, [currentUserId]);

  // Handle input change with typing indicator
  const handleTyping = useCallback(() => {
    sendTypingIndicator(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000);
  }, [sendTypingIndicator]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!currentUserId || !partnerId || !supabase) return;

    // Fetch initial messages
    fetchMessages();

    // Create unique channel name for this chat
    const channelName = `chat:${[currentUserId, partnerId, confessionId].sort().join('-')}`;

    // Subscribe to realtime channel
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    // Subscribe to new messages via Postgres Changes
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `confession_id=eq.${confessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Only add if it's relevant to this chat
          if (
            (newMessage.sender_id === currentUserId && newMessage.receiver_id === partnerId) ||
            (newMessage.sender_id === partnerId && newMessage.receiver_id === currentUserId)
          ) {
            setState(prev => ({
              ...prev,
              messages: [...prev.messages, newMessage],
            }));

            // Auto mark as read if we're the receiver
            if (newMessage.receiver_id === currentUserId) {
              markAsRead();
            }
          }
        }
      )
      // Subscribe to typing events (Broadcast)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, isTyping } = payload.payload as TypingState;
        
        if (userId === partnerId) {
          setState(prev => ({
            ...prev,
            partnerTyping: isTyping,
          }));
        }
      })
      // Subscribe to presence (Online status)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const isPartnerOnline = Object.keys(presenceState).includes(partnerId);
        
        setState(prev => ({
          ...prev,
          partnerOnline: isPartnerOnline,
        }));
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === partnerId) {
          setState(prev => ({
            ...prev,
            partnerOnline: true,
          }));
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === partnerId) {
          setState(prev => ({
            ...prev,
            partnerOnline: false,
            partnerLastSeen: new Date().toISOString(),
          }));
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track our presence
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: currentUserId,
          });
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [confessionId, currentUserId, partnerId, fetchMessages, markAsRead]);

  return {
    ...state,
    sendMessage,
    handleTyping,
    markAsRead,
    refetch: fetchMessages,
  };
}

// Hook for getting chat room list with unread counts
export function useChatRooms(userId: string) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchChatRooms = useCallback(async () => {
    if (!userId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          confession:confessions(*),
          participant_1_profile:profiles!chat_rooms_participant_1_fkey(id, username, avatar_url),
          participant_2_profile:profiles!chat_rooms_participant_2_fkey(id, username, avatar_url)
        `)
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      setChatRooms((data as ChatRoom[]) || []);
      setIsLoading(false);

      // Fetch unread counts for each room
      const counts: Record<string, number> = {};
      for (const room of data || []) {
        const partnerId = room.participant_1 === userId ? room.participant_2 : room.participant_1;
        
        if (!room.confession_id) continue;
        
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', userId)
          .eq('sender_id', partnerId)
          .eq('confession_id', room.confession_id)
          .eq('is_read', false);

        counts[room.id] = count || 0;
      }
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!supabase) return;
    
    fetchChatRooms();

    // Subscribe to new messages for notification
    const channel = supabase
      .channel(`user-messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          // Refetch to update unread counts
          fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchChatRooms]);

  return {
    chatRooms,
    isLoading,
    unreadCounts,
    totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
    refetch: fetchChatRooms,
  };
}
