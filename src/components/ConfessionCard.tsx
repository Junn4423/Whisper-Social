'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useApp } from '@/context/SupabaseAppContext';
import { unlockContent } from '@/actions/confessionActions';
import { t } from '@/lib/translations';
import { Confession } from '@/types';
import { ReportModal } from '@/components/ui/ReportModal';
import {
  Eye,
  MessageCircle,
  Coins,
  Lock,
  Unlock,
  User,
  Sparkles,
  MoreVertical,
  Flag,
  EyeOff
} from 'lucide-react';

interface ConfessionCardProps {
  confession: Confession;
  onHide?: () => void; // Callback when confession is hidden (after report)
}

const ALLOWED_IMAGE_HOSTS = [
  'images.unsplash.com',
  'unsplash.com',
  'picsum.photos',
  'i.pravatar.cc',
  'randomuser.me',
  'encrypted-tbn0.gstatic.com',
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop';

function sanitizeImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return FALLBACK_IMAGE;
    const host = parsed.hostname.toLowerCase();
    const allowed = ALLOWED_IMAGE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    return allowed ? parsed.toString() : FALLBACK_IMAGE;
  } catch {
    return FALLBACK_IMAGE;
  }
}

export default function ConfessionCard({ confession, onHide }: ConfessionCardProps) {
  const router = useRouter();
  const {
    user,
    isPhotoUnlocked,
    isChatUnlocked,
    addUnlock,
    updateCoins,
    coins,
    setShowTopUpModal,
    language
  } = useApp();

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [photoUnlocked, setPhotoUnlocked] = useState(isPhotoUnlocked(confession.id));
  const chatUnlocked = isChatUnlocked(confession.id);

  // MODULE 3: Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dynamic pricing from confession
  const unlockPrice = confession.unlockPrice ?? 10;
  const chatPrice = confession.chatPrice ?? 5;

  const imageSrc = sanitizeImageUrl(confession.imageUrl || FALLBACK_IMAGE);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleUnlockPhoto = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/');
      return;
    }

    if (coins < unlockPrice) {
      setShowTopUpModal(true);
      return;
    }

    setIsUnlocking(true);

    const result = await unlockContent(confession.id, 'PHOTO');

    if (result.success && result.data) {
      setPhotoUnlocked(true);
      addUnlock(confession.id, 'PHOTO');
      updateCoins(result.data.newBalance);

      // Show success toast
      toast.success(
        language === 'vi'
          ? '🔓 Đã mở khóa ảnh thành công!'
          : '🔓 Photo unlocked successfully!',
        {
          description: language === 'vi'
            ? `Đã trừ ${result.data.coinsSpent} xu`
            : `Spent ${result.data.coinsSpent} coins`,
        }
      );
    } else if (result.error?.includes('Insufficient')) {
      setShowTopUpModal(true);
    } else {
      toast.error(result.error || 'Failed to unlock');
    }

    setIsUnlocking(false);
  };

  const handleUnlockChat = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/');
      return;
    }

    if (chatUnlocked) {
      router.push(`/chat/${confession.id}`);
      return;
    }

    if (coins < chatPrice) {
      setShowTopUpModal(true);
      return;
    }

    const result = await unlockContent(confession.id, 'CHAT');

    if (result.success && result.data) {
      addUnlock(confession.id, 'CHAT');
      updateCoins(result.data.newBalance);

      toast.success(
        language === 'vi'
          ? '💬 Đã mở khóa chat!'
          : '💬 Chat unlocked!',
        {
          description: language === 'vi'
            ? `Đã trừ ${result.data.coinsSpent} xu`
            : `Spent ${result.data.coinsSpent} coins`,
        }
      );

      router.push(`/chat/${confession.id}`);
    } else if (result.error?.includes('Insufficient')) {
      setShowTopUpModal(true);
    } else {
      toast.error(result.error || 'Failed to unlock');
    }
  };

  const handleChatClick = () => {
    if (chatUnlocked) {
      router.push(`/chat/${confession.id}`);
    } else {
      handleUnlockChat();
    }
  };

  // MODULE 3: Handle report success - hide card
  const handleReportSuccess = () => {
    setIsHidden(true);
    if (onHide) {
      onHide();
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

  // If hidden (after report), don't render
  if (isHidden) {
    return null;
  }

  return (
    <>
      <div className="group relative bg-dark-100/50 backdrop-blur-xl rounded-2xl border border-neon-purple/20 overflow-hidden hover:border-neon-purple/50 transition-all duration-300 hover:shadow-neon">
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-neon-pink/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Card Content */}
        <div className="relative p-4 sm:p-5">
          {/* ========================================== */}
          {/* MODULE 3: Three-dot Menu (Report) */}
          {/* ========================================== */}
          <div className="absolute top-3 right-3 z-10" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full bg-dark-200/50 hover:bg-dark-200 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-10 w-48 bg-dark-100 border border-dark-200 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200 z-20">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowReportModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'vi' ? 'Báo cáo vi phạm' : 'Report violation'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsHidden(true);
                    toast.info(
                      language === 'vi'
                        ? 'Đã ẩn bài viết khỏi feed của bạn'
                        : 'Hidden from your feed'
                    );
                    if (onHide) onHide();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-dark-200 transition-colors border-t border-dark-200"
                >
                  <EyeOff className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'vi' ? 'Ẩn bài viết' : 'Hide post'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Top Row - Avatar & Info */}
          <div className="flex items-start gap-4">
            {/* Avatar with Blur Effect */}
            <div className="relative flex-shrink-0">
              <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 ${photoUnlocked ? 'border-neon-purple' : 'border-dark-200'} transition-all duration-500`}>
                <Image
                  src={imageSrc}
                  alt="Avatar"
                  fill
                  className={`object-cover transition-all duration-500 ${photoUnlocked ? '' : 'blur-xl scale-110'
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
            {/* Unlock Photo Button - Dynamic Price */}
            <button
              onClick={handleUnlockPhoto}
              disabled={photoUnlocked || isUnlocking}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${photoUnlocked
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
                    {unlockPrice}
                  </span>
                </>
              )}
            </button>

            {/* Chat Button - Dynamic Price */}
            <button
              onClick={handleChatClick}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${chatUnlocked
                  ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/30'
                  : 'bg-gradient-neon text-white hover:shadow-neon hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{chatUnlocked ? t('chatUnlocked', language) : t('chatNow', language)}</span>
              {!chatUnlocked && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                  <Coins className="w-3 h-3" />
                  {chatPrice}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MODULE 3: Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        confessionId={confession.id}
        onReportSuccess={handleReportSuccess}
      />
    </>
  );
}
