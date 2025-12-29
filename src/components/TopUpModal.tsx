'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/SupabaseAppContext';
import { topUpCoins } from '@/actions/confessionActions';
import { t } from '@/lib/translations';
import { 
  X, 
  Coins, 
  Sparkles, 
  Crown,
  Zap,
  Gift
} from 'lucide-react';

interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  popular?: boolean;
  bestValue?: boolean;
}

const coinPackages: CoinPackage[] = [
  { id: 'pack1', coins: 50, price: 19000 },
  { id: 'pack2', coins: 120, price: 39000, popular: true },
  { id: 'pack3', coins: 300, price: 79000, bestValue: true },
  { id: 'pack4', coins: 700, price: 149000 },
];

export default function TopUpModal() {
  const { showTopUpModal, setShowTopUpModal, updateCoins, language, user } = useApp();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  if (!showTopUpModal) return null;

  const handlePurchase = async (packageId: string, coins: number) => {
    if (!user) {
      setShowTopUpModal(false);
      // Would redirect to login
      return;
    }

    setIsProcessing(packageId);
    
    // In production, this would integrate with a payment gateway
    // For now, we simulate adding coins
    const result = await topUpCoins(coins);
    
    if (result.success && result.data) {
      updateCoins(result.data.newBalance);
      setShowTopUpModal(false);
      // Show success notification
    }
    
    setIsProcessing(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: language === 'vi' ? 'VND' : 'USD',
      minimumFractionDigits: 0,
    }).format(language === 'vi' ? price : price / 24000);
  };

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
          
          {coinPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handlePurchase(pkg.id, pkg.coins)}
              disabled={isProcessing !== null}
              className={`relative w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                pkg.popular 
                  ? 'bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border-neon-purple hover:shadow-neon' 
                  : pkg.bestValue
                    ? 'bg-gradient-to-r from-gold/20 to-gold-dark/20 border-gold hover:shadow-gold'
                    : 'bg-dark-200/50 border-dark-200 hover:border-neon-purple/50'
              }`}
            >
              {/* Popular/Best Value Badge */}
              {(pkg.popular || pkg.bestValue) && (
                <div className={`absolute -top-2 left-4 px-2 py-0.5 rounded-full text-xs font-bold ${
                  pkg.popular 
                    ? 'bg-neon-purple text-white' 
                    : 'bg-gold text-dark'
                }`}>
                  {pkg.popular ? (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {t('popular', language)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      {t('bestValue', language)}
                    </span>
                  )}
                </div>
              )}

              {/* Coins */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  pkg.popular 
                    ? 'bg-neon-purple/30' 
                    : pkg.bestValue 
                      ? 'bg-gold/30' 
                      : 'bg-dark-200'
                }`}>
                  {pkg.bestValue ? (
                    <Gift className="w-5 h-5 text-gold" />
                  ) : pkg.popular ? (
                    <Sparkles className="w-5 h-5 text-neon-purple" />
                  ) : (
                    <Coins className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{pkg.coins}</span>
                    <span className="text-sm text-gray-400">{t('coins', language)}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className={`px-4 py-2 rounded-lg font-bold ${
                pkg.popular 
                  ? 'bg-neon-purple text-white' 
                  : pkg.bestValue 
                    ? 'bg-gold text-dark' 
                    : 'bg-dark-200 text-white'
              }`}>
                {formatPrice(pkg.price)}
              </div>
            </button>
          ))}
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
