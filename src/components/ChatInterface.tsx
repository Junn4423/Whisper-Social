'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import { Confession, ChatMessage } from '@/types';
import { 
  ArrowLeft, 
  Send,
  Sparkles
} from 'lucide-react';

interface ChatInterfaceProps {
  confession: Confession;
}

export default function ChatInterface({ confession }: ChatInterfaceProps) {
  const { getChatRoom, sendMessage, language, isPhotoUnlocked } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatRoom = getChatRoom(confession.id);
  const messages = useMemo(() => chatRoom?.messages || [], [chatRoom?.messages]);
  const photoUnlocked = isPhotoUnlocked(confession.id);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect when bot is "typing"
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && !lastMessage.isBot) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    sendMessage(confession.id, inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: Date) => {
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
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-400">Online</span>
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

        {/* Messages */}
        {messages.map((message: ChatMessage) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`flex items-end gap-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse'}`}>
              {/* Avatar for bot messages */}
              {message.isBot && (
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
                  message.isBot
                    ? 'bg-dark-100 border border-dark-200 rounded-bl-none'
                    : 'bg-gradient-to-r from-neon-purple to-neon-pink rounded-br-none'
                }`}
              >
                <p className={`text-sm ${message.isBot ? 'text-gray-200' : 'text-white'}`}>
                  {message.text}
                </p>
                <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-500' : 'text-white/60'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
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
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
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
