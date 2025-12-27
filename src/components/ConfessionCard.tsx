'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import { Confession } from '@/types';
import { 
  Eye, 
  MessageCircle, 
  Coins, 
  Lock, 
  Unlock,
  User,
  Sparkles
} from 'lucide-react';

interface ConfessionCardProps {
  confession: Confession;
}

export default function ConfessionCard({ confession }: ConfessionCardProps) {
  const router = useRouter();
  const { 
    unlockPhoto, 
    unlockChat, 
    isPhotoUnlocked, 
    isChatUnlocked,
    language 
  } = useApp();
  
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [photoUnlocked, setPhotoUnlocked] = useState(isPhotoUnlocked(confession.id));
  const chatUnlocked = isChatUnlocked(confession.id);

  const handleUnlockPhoto = async () => {
    setIsUnlocking(true);
    
    // Simulate a small delay for effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const success = unlockPhoto(confession.id);
    if (success) {
      setPhotoUnlocked(true);
    }
    
    setIsUnlocking(false);
  };

  const handleUnlockChat = async () => {
    const success = unlockChat(confession.id);
    if (success) {
      router.push(`/chat/${confession.id}`);
    }
  };

  const handleChatClick = () => {
    if (chatUnlocked) {
      router.push(`/chat/${confession.id}`);
    } else {
      handleUnlockChat();
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Gender icon color
  const genderColor = confession.gender === 'Nữ' 
    ? 'text-pink-400' 
    : confession.gender === 'Nam' 
      ? 'text-blue-400' 
      : 'text-purple-400';

  return (
    <div className="group relative bg-dark-100/50 backdrop-blur-xl rounded-2xl border border-neon-purple/20 overflow-hidden hover:border-neon-purple/50 transition-all duration-300 hover:shadow-neon">
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-neon-pink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Card Content */}
      <div className="relative p-4 sm:p-5">
        {/* Top Row - Avatar & Info */}
        <div className="flex items-start gap-4">
          {/* Avatar with Blur Effect */}
          <div className="relative flex-shrink-0">
            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 ${photoUnlocked ? 'border-neon-purple' : 'border-dark-200'} transition-all duration-500`}>
              <Image
                src={confession.imageUrl}
                alt="Avatar"
                fill
                className={`object-cover transition-all duration-500 ${
                  photoUnlocked ? '' : 'blur-xl scale-110'
                }`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop';
                }}
              />
              
              {/* Locked Overlay */}
              {!photoUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark/30">
                  <Lock className="w-6 h-6 text-white/80" />
                </div>
              )}
              
              {/* Unlocked Badge */}
              {photoUnlocked && (
                <div className="absolute -top-1 -right-1 bg-neon-purple rounded-full p-1">
                  <Unlock className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            {/* Anonymous Badge */}
            {confession.isAnonymous && (
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-dark-200 rounded-full border border-neon-purple/30">
                <span className="text-[10px] text-neon-purple">
                  {t('anonymous', language)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Gender & Age */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-200/50 ${genderColor}`}>
                <User className="w-3 h-3" />
                <span className="text-xs font-medium">{confession.gender}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-200/50 text-gray-400">
                <span className="text-xs">{confession.age} {t('yearsOld', language)}</span>
              </div>
            </div>

            {/* Confession Text */}
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed line-clamp-3">
              {confession.text}
            </p>

            {/* Date */}
            <p className="text-xs text-gray-500 mt-2">
              {formatDate(confession.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dark-200">
          {/* Unlock Photo Button */}
          <button
            onClick={handleUnlockPhoto}
            disabled={photoUnlocked || isUnlocking}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
              photoUnlocked
                ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30 cursor-default'
                : 'bg-gradient-gold text-dark hover:shadow-gold hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isUnlocking ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>...</span>
              </>
            ) : photoUnlocked ? (
              <>
                <Eye className="w-4 h-4" />
                <span>{t('photoUnlocked', language)}</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>{t('unlockPhoto', language)}</span>
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-dark/20 rounded text-xs">
                  <Coins className="w-3 h-3" />
                  10
                </span>
              </>
            )}
          </button>

          {/* Chat Button */}
          <button
            onClick={handleChatClick}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
              chatUnlocked
                ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/30'
                : 'bg-gradient-neon text-white hover:shadow-neon hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{chatUnlocked ? t('chatUnlocked', language) : t('chatNow', language)}</span>
            {!chatUnlocked && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                <Coins className="w-3 h-3" />
                5
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
