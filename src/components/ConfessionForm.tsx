'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useApp } from '@/context/SupabaseAppContext';
import { createConfession } from '@/actions/confessionActions';
import { t } from '@/lib/translations';
import { PriceSlider } from '@/components/ui/PriceSlider';
import {
  PenSquare,
  Image as ImageIcon,
  User,
  Calendar,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Coins,
  MessageCircle
} from 'lucide-react';

export default function ConfessionForm() {
  const router = useRouter();
  const { user, language, refreshConfessions } = useApp();

  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Khác');
  const [age, setAge] = useState(25);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // MODULE 1: Dynamic Pricing States
  const [unlockPrice, setUnlockPrice] = useState(10);
  const [chatPrice, setChatPrice] = useState(5);
  const [showPricing, setShowPricing] = useState(false);

  const defaultImages = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
  ];

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!text.trim()) return;

    if (!user) {
      router.push('/auth/login?redirect=/create');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalImageUrl = imageUrl.trim() || defaultImages[Math.floor(Math.random() * defaultImages.length)];

      const result = await createConfession({
        content: text.trim(),
        imageUrl: finalImageUrl,
        gender,
        age,
        isAnonymous,
        // MODULE 1: Pass dynamic pricing
        unlockPrice,
        chatPrice,
      });

      if (result.success) {
        // Fire-and-forget refresh; don't block UX
        refreshConfessions().catch((err) => {
          console.error('Failed to refresh confessions:', err);
        });

        // Show success toast
        toast.success(
          language === 'vi'
            ? '🎉 Confession đã được đăng thành công!'
            : '🎉 Confession posted successfully!',
          {
            description: language === 'vi'
              ? `Giá mở khóa: ${unlockPrice} xu | Giá chat: ${chatPrice} xu`
              : `Unlock: ${unlockPrice} coins | Chat: ${chatPrice} coins`,
          }
        );

        setShowSuccess(true);
        setText('');
        setImageUrl('');

        // Redirect after showing success
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setError(result.error || 'Failed to create confession');
        toast.error(result.error || 'Failed to create confession');
      }
    } catch (err) {
      console.error('Error submitting confession:', err);
      setError('Có lỗi xảy ra, vui lòng thử lại / Something went wrong');
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-float">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-neon mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('confessionPosted', language)}
          </h2>
          <p className="text-gray-400">
            {language === 'vi' ? 'Đang chuyển hướng...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-neon mb-4 shadow-neon">
          <PenSquare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {t('createConfession', language)}
        </h1>
        <p className="text-gray-400">
          {language === 'vi'
            ? 'Chia sẻ những điều bạn chưa từng nói với ai...'
            : 'Share what you\'ve never told anyone...'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Confession Text */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('yourConfession', language)} *
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('confessionPlaceholder', language)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-dark-100/50 border border-dark-200 focus:border-neon-purple/50 focus:outline-none focus:ring-2 focus:ring-neon-purple/20 text-white placeholder-gray-500 resize-none transition-all"
              maxLength={500}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {text.length}/500
            </div>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <ImageIcon className="inline w-4 h-4 mr-1" />
            {t('imageUrl', language)}
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={t('imageUrlPlaceholder', language)}
            className="w-full px-4 py-3 rounded-xl bg-dark-100/50 border border-dark-200 focus:border-neon-purple/50 focus:outline-none focus:ring-2 focus:ring-neon-purple/20 text-white placeholder-gray-500 transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">
            {language === 'vi'
              ? 'Để trống để sử dụng ảnh mặc định'
              : 'Leave empty to use default image'}
          </p>
        </div>

        {/* Gender & Age Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              {t('selectGender', language)}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Nam', 'Nữ', 'Khác'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${gender === g
                      ? g === 'Nữ'
                        ? 'bg-pink-500/30 border-pink-500 text-pink-400 border'
                        : g === 'Nam'
                          ? 'bg-blue-500/30 border-blue-500 text-blue-400 border'
                          : 'bg-purple-500/30 border-purple-500 text-purple-400 border'
                      : 'bg-dark-200/50 border border-dark-200 text-gray-400 hover:border-gray-500'
                    }`}
                >
                  {g === 'Nam' ? t('male', language) : g === 'Nữ' ? t('female', language) : t('other', language)}
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              {t('age', language)}
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Math.min(99, Math.max(18, parseInt(e.target.value) || 18)))}
              min={18}
              max={99}
              className="w-full px-4 py-2 rounded-lg bg-dark-100/50 border border-dark-200 focus:border-neon-purple/50 focus:outline-none text-white text-center transition-all"
            />
          </div>
        </div>

        {/* ========================================== */}
        {/* MODULE 1: DYNAMIC PRICING SECTION */}
        {/* ========================================== */}
        <div className="space-y-4">
          {/* Pricing Toggle Header */}
          <button
            type="button"
            onClick={() => setShowPricing(!showPricing)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gold/10 to-gold-dark/10 border border-gold/30 hover:border-gold/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/20">
                <Coins className="w-5 h-5 text-gold" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">
                  {language === 'vi' ? '💰 Định giá bài viết' : '💰 Set Your Prices'}
                </p>
                <p className="text-xs text-gray-400">
                  {language === 'vi'
                    ? `Mở khóa: ${unlockPrice} xu | Chat: ${chatPrice} xu`
                    : `Unlock: ${unlockPrice} coins | Chat: ${chatPrice} coins`}
                </p>
              </div>
            </div>
            <div className={`text-gray-400 transition-transform duration-300 ${showPricing ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>

          {/* Pricing Sliders (Collapsible) */}
          {showPricing && (
            <div className="space-y-6 p-5 rounded-xl bg-dark-100/50 border border-dark-200 animate-in slide-in-from-top-2 duration-300">
              {/* Unlock Price Slider */}
              <PriceSlider
                label={language === 'vi' ? 'Giá mở khóa ảnh' : 'Photo Unlock Price'}
                value={unlockPrice}
                onChange={setUnlockPrice}
                min={0}
                max={100}
                step={5}
                icon={<Eye className="w-4 h-4" />}
                colorTheme="gold"
                hint={language === 'vi'
                  ? '💡 Giá thấp (0-20 xu) giúp nhiều người mở khóa hơn. Giá cao (50+ xu) cho nội dung độc quyền.'
                  : '💡 Low prices (0-20 coins) attract more unlocks. High prices (50+ coins) for exclusive content.'}
              />

              {/* Chat Price Slider */}
              <PriceSlider
                label={language === 'vi' ? 'Giá mở khóa chat' : 'Chat Unlock Price'}
                value={chatPrice}
                onChange={setChatPrice}
                min={0}
                max={50}
                step={5}
                icon={<MessageCircle className="w-4 h-4" />}
                colorTheme="pink"
                hint={language === 'vi'
                  ? '💬 Đặt giá 0 để cho phép chat miễn phí. Giá cao hơn lọc bớt người chat nghiêm túc.'
                  : '💬 Set to 0 for free chat. Higher prices filter for serious conversations.'}
              />

              {/* Pricing Preview */}
              <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-dark-200/50">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">
                    {language === 'vi' ? 'Bạn nhận' : 'You earn'}
                  </p>
                  <p className="text-lg font-bold text-neon-purple">
                    {Math.floor(unlockPrice * 0.5)} xu
                  </p>
                  <p className="text-xs text-gray-500">
                    {language === 'vi' ? 'mỗi lần mở khóa' : 'per unlock'}
                  </p>
                </div>
                <div className="w-px h-10 bg-dark-200" />
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">
                    {language === 'vi' ? 'Bạn nhận' : 'You earn'}
                  </p>
                  <p className="text-lg font-bold text-neon-pink">
                    {Math.floor(chatPrice * 0.5)} xu
                  </p>
                  <p className="text-xs text-gray-500">
                    {language === 'vi' ? 'mỗi lần chat' : 'per chat'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Anonymous Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-dark-100/50 border border-dark-200">
          <div className="flex items-center gap-3">
            {isAnonymous ? (
              <EyeOff className="w-5 h-5 text-neon-purple" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-white">{t('anonymousMode', language)}</p>
              <p className="text-xs text-gray-500">
                {language === 'vi'
                  ? 'Ẩn danh tính của bạn'
                  : 'Hide your identity'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative w-14 h-7 rounded-full transition-colors ${isAnonymous ? 'bg-neon-purple' : 'bg-dark-200'
              }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${isAnonymous ? 'left-8' : 'left-1'
                }`}
            />
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${text.trim() && !isSubmitting
              ? 'bg-gradient-neon text-white hover:shadow-neon hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-dark-200 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isSubmitting ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>{language === 'vi' ? 'Đang đăng...' : 'Posting...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{t('postConfession', language)}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
