'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/context/SupabaseAppContext';
import { topUpCoins } from '@/actions/confessionActions';
import { COIN_PACKAGES, CoinPackage } from '@/lib/coinPackages';
import { t } from '@/lib/translations';
import {
  X,
  Coins,
  Sparkles,
  Crown,
  Zap,
  Gift,
  AlertTriangle,
  RefreshCcw,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function TopUpModal() {
  const { showTopUpModal, setShowTopUpModal, updateCoins, refreshProfile, language, user } = useApp();

  // State for payment flow
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!showTopUpModal) return null;

  const handlePurchase = async (pkg: CoinPackage) => {
    if (!user) {
      toast.error(language === 'vi' ? 'Vui lòng đăng nhập!' : 'Please login first!');
      setShowTopUpModal(false);
      return;
    }

    setSelectedPackage(pkg);
    setPaymentState('processing');
    setErrorMessage('');

    // =============================================
    // MODULE 2: ADVANCED MOCK PAYMENT
    // - Processing state with spinner (1.5-2s delay from backend)
    // - Success flow for packages < 500 coins
    // - Error flow for packages >= 500 coins (testing purpose)
    // =============================================

    const result = await topUpCoins(pkg.id);

    if (result.success && result.data) {
      setPaymentState('success');
      updateCoins(result.data.newBalance);
      refreshProfile().catch((err) => console.error('Failed to refresh profile:', err));

      // Show success toast
      toast.success(
        language === 'vi'
          ? `🎉 Nạp ${result.data.coinsAdded} xu thành công!`
          : `🎉 Successfully added ${result.data.coinsAdded} coins!`,
        {
          description: language === 'vi'
            ? `Số dư mới: ${result.data.newBalance} xu`
            : `New balance: ${result.data.newBalance} coins`,
        }
      );

      // Auto close after success
      setTimeout(() => {
        setShowTopUpModal(false);
        setPaymentState('idle');
        setSelectedPackage(null);
      }, 2000);
    } else {
      // Error flow
      setPaymentState('error');
      setErrorMessage(result.error || 'Payment failed');

      // Show error toast
      toast.error(
        language === 'vi' ? '❌ Giao dịch thất bại!' : '❌ Transaction failed!',
        {
          description: language === 'vi'
            ? 'Vui lòng thử lại hoặc chọn gói khác.'
            : 'Please try again or select a different package.',
        }
      );
    }
  };

  const handleRetry = () => {
    setPaymentState('idle');
    setSelectedPackage(null);
    setErrorMessage('');
  };

  const formatPrice = (pkg: CoinPackage) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: language === 'vi' ? 'VND' : 'USD',
      minimumFractionDigits: 0,
    }).format(language === 'vi' ? pkg.priceVND : pkg.priceUSD);
  };

  const getPackageIcon = (pkg: CoinPackage) => {
    if (pkg.bestValue) return <Crown className="w-5 h-5 text-gold" />;
    if (pkg.popular) return <Zap className="w-5 h-5 text-neon-purple" />;
    if (pkg.coins >= 500) return <Gift className="w-5 h-5 text-red-400" />;
    return <Coins className="w-5 h-5 text-gray-400" />;
  };

  // =============================================
  // PROCESSING STATE UI
  // =============================================
  if (paymentState === 'processing') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" />
        <div className="relative w-full max-w-md bg-dark-100 rounded-2xl border border-neon-purple/30 shadow-2xl overflow-hidden p-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-neon-purple/30 blur-3xl" />

          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-neon mb-6">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {language === 'vi' ? 'Đang xử lý thanh toán...' : 'Processing payment...'}
            </h2>
            <p className="text-gray-400 mb-4">
              {language === 'vi'
                ? `Nạp ${selectedPackage?.coins} xu`
                : `Adding ${selectedPackage?.coins} coins`}
            </p>
            <div className="flex justify-center gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-neon-purple animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // SUCCESS STATE UI
  // =============================================
  if (paymentState === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" />
        <div className="relative w-full max-w-md bg-dark-100 rounded-2xl border border-green-500/30 shadow-2xl overflow-hidden p-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-green-500/20 blur-3xl" />

          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6 animate-float">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {language === 'vi' ? '🎉 Nạp xu thành công!' : '🎉 Top up successful!'}
            </h2>
            <p className="text-green-400 text-lg font-semibold">
              +{selectedPackage?.coins} {t('coins', language)}
            </p>
            <p className="text-gray-400 mt-4">
              {language === 'vi' ? 'Đang đóng cửa sổ...' : 'Closing window...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // ERROR STATE UI
  // =============================================
  if (paymentState === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
          onClick={() => { setPaymentState('idle'); setSelectedPackage(null); }}
        />
        <div className="relative w-full max-w-md bg-dark-100 rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden">
          {/* Red Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-red-500/20 blur-3xl" />

          {/* Close Button */}
          <button
            onClick={handleRetry}
            className="absolute top-4 right-4 p-2 rounded-full bg-dark-200/50 hover:bg-dark-200 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Error Content */}
          <div className="relative p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 mb-6">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {language === 'vi' ? '❌ Giao dịch thất bại' : '❌ Transaction Failed'}
            </h2>

            {/* Error Message Box */}
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-left">
              <p className="text-red-400 text-sm whitespace-pre-line">
                {errorMessage}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowTopUpModal(false);
                  setPaymentState('idle');
                }}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-gray-400 bg-dark-200/50 hover:bg-dark-200 transition-colors"
              >
                {t('cancel', language)}
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>{language === 'vi' ? 'Thử lại' : 'Try Again'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // DEFAULT (IDLE) STATE UI - Package Selection
  // =============================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
        onClick={() => setShowTopUpModal(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-dark-100 rounded-2xl border border-neon-purple/30 shadow-2xl overflow-hidden animate-float">
        {/* Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-neon-purple/30 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={() => setShowTopUpModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-dark-200/50 hover:bg-dark-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="relative p-6 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-gold shadow-gold mb-4">
            <Coins className="w-8 h-8 text-dark" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('notEnoughCoins', language)}
          </h2>
          <p className="text-gray-400">
            {t('buyCoins', language)}
          </p>
        </div>

        {/* Packages */}
        <div className="p-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            {t('selectPackage', language)}
          </h3>

          {COIN_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handlePurchase(pkg)}
              className={`relative w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${pkg.popular
                ? 'bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border-neon-purple hover:shadow-neon'
                : pkg.bestValue
                  ? 'bg-gradient-to-r from-gold/20 to-gold-dark/20 border-gold hover:shadow-gold'
                  : pkg.coins >= 500
                    ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/50 hover:border-red-500'
                    : 'bg-dark-200/50 border-dark-200 hover:border-neon-purple/50'
                }`}
            >
              {/* Popular/Best Value/Test Badge */}
              {(pkg.popular || pkg.bestValue || pkg.coins >= 500) && (
                <div className={`absolute -top-2 left-4 px-2 py-0.5 rounded-full text-xs font-bold ${pkg.popular
                  ? 'bg-neon-purple text-white'
                  : pkg.bestValue
                    ? 'bg-gold text-dark'
                    : 'bg-red-500 text-white'
                  }`}>
                  {pkg.popular ? (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {t('popular', language)}
                    </span>
                  ) : pkg.bestValue ? (
                    <span className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      {t('bestValue', language)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {language === 'vi' ? 'Test Lỗi' : 'Test Error'}
                    </span>
                  )}
                </div>
              )}

              {/* Coins */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pkg.popular
                  ? 'bg-neon-purple/30'
                  : pkg.bestValue
                    ? 'bg-gold/30'
                    : pkg.coins >= 500
                      ? 'bg-red-500/20'
                      : 'bg-dark-200'
                  }`}>
                  {getPackageIcon(pkg)}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{pkg.coins}</span>
                    <span className="text-sm text-gray-400">{t('coins', language)}</span>
                  </div>
                  <span className="text-xs text-gray-500">{pkg.label[language]}</span>
                </div>
              </div>

              {/* Price */}
              <div className={`px-4 py-2 rounded-lg font-bold ${pkg.popular
                ? 'bg-neon-purple text-white'
                : pkg.bestValue
                  ? 'bg-gold text-dark'
                  : pkg.coins >= 500
                    ? 'bg-red-500 text-white'
                    : 'bg-dark-200 text-white'
                }`}>
                {formatPrice(pkg)}
              </div>
            </button>
          ))}

          {/* Test Note */}
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-xs text-yellow-400 text-center">
              💡 {language === 'vi'
                ? 'Gói "Đại gia" (500 xu) được thiết kế để test UI lỗi thanh toán'
                : '"Whale Pack" (500 coins) is designed to test payment error UI'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={() => setShowTopUpModal(false)}
            className="w-full py-3 text-center text-gray-400 hover:text-white transition-colors"
          >
            {t('cancel', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
