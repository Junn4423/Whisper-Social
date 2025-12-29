'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/SupabaseAppContext';
import { useChat } from '@/hooks/useChat';
import { t } from '@/lib/translations';
import { Confession } from '@/types';
import { Message } from '@/types/database';
import { 
  ArrowLeft, 
  Send,
  Sparkles,
  Loader2
} from 'lucide-react';

interface ChatInterfaceProps {
  confession: Confession;
  partnerId: string;
  currentUserId: string;
}

export default function RealtimeChatInterface({ confession, partnerId, currentUserId }: ChatInterfaceProps) {
  const { language, isPhotoUnlocked } = useApp();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    messages,
    isLoading,
    partnerTyping,
    partnerOnline,
    sendMessage,
    handleTyping,
  } = useChat({
    confessionId: confession.id,
    currentUserId,
    partnerId,
  });

  const photoUnlocked = isPhotoUnlocked(confession.id);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const content = inputValue.trim();
    setInputValue('');
    
    await sendMessage(content);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    handleTyping();
  };

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-screen bg-dark">
      {/* Header */}
      <div className="flex-shrink-0 bg-dark-100/80 backdrop-blur-xl border-b border-neon-purple/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link 
              href="/" 
              className="p-2 rounded-lg bg-dark-200/50 hover:bg-dark-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>

            {/* User Info */}
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-neon-purple/50">
                <Image
                  src={confession.imageUrl}
                  alt="Avatar"
                  fill
                  className={`object-cover ${photoUnlocked ? '' : 'blur-lg'}`}
                />
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">
                    {confession.isAnonymous ? t('anonymous', language) : confession.authorName || t('anonymous', language)}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    confession.gender === 'Nữ' ? 'bg-pink-500/20 text-pink-400' : 
                    confession.gender === 'Nam' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {confession.gender}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {confession.age} {t('yearsOld', language)}
                </p>
              </div>
            </div>

            {/* Online Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                partnerOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              }`} />
              <span className="text-xs text-gray-400">
                {partnerOnline ? t('online', language) : t('offline', language)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Confession Preview */}
        <div className="flex justify-center mb-6">
          <div className="max-w-sm p-4 rounded-2xl bg-dark-100/50 border border-dark-200 text-center">
            <p className="text-sm text-gray-400 mb-2">
              {t('chattingWith', language)}:
            </p>
            <p className="text-gray-200 text-sm leading-relaxed line-clamp-2">
              &ldquo;{confession.text}&rdquo;
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
          </div>
        )}

        {/* Messages */}
        {messages.map((message: Message) => {
          const isOwn = message.sender_id === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                {/* Avatar for partner messages */}
                {!isOwn && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-neon-purple/30">
                    <Image
                      src={confession.imageUrl}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className={`object-cover ${photoUnlocked ? '' : 'blur-md'}`}
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl ${
                    isOwn
                      ? 'bg-gradient-to-r from-neon-purple to-neon-pink rounded-br-none'
                      : 'bg-dark-100 border border-dark-200 rounded-bl-none'
                  }`}
                >
                  <p className={`text-sm ${isOwn ? 'text-white' : 'text-gray-200'}`}>
                    {message.content}
                  </p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-gray-500'}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {partnerTyping && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-neon-purple/30">
                <Image
                  src={confession.imageUrl}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className={`object-cover ${photoUnlocked ? '' : 'blur-md'}`}
                />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-dark-100 border border-dark-200 rounded-bl-none">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-dark-100/80 backdrop-blur-xl border-t border-neon-purple/20 p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3">
            {/* Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={t('typeMessage', language)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-dark-200/50 border border-dark-200 focus:border-neon-purple/50 focus:outline-none text-white placeholder-gray-500 transition-colors"
              />
              <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`p-3 rounded-xl transition-all duration-300 ${
                inputValue.trim()
                  ? 'bg-gradient-neon text-white hover:shadow-neon hover:scale-105 active:scale-95'
                  : 'bg-dark-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
