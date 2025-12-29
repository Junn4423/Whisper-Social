'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/SupabaseAppContext';
import { t } from '@/lib/translations';
import { 
  Coins, 
  Home, 
  PenSquare, 
  Sparkles,
  Globe,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export default function Header() {
  const { user, profile, coins, language, setLanguage, signOut } = useApp();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-neon-purple/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-neon-purple group-hover:text-neon-pink transition-colors" />
              <div className="absolute inset-0 blur-lg bg-neon-purple/50 group-hover:bg-neon-pink/50 transition-colors" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-purple bg-clip-text text-transparent">
              {t('appName', language)}
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-300 hover:text-neon-purple transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">{t('home', language)}</span>
            </Link>
            <Link 
              href="/create" 
              className="flex items-center gap-2 text-gray-300 hover:text-neon-pink transition-colors"
            >
              <PenSquare className="w-4 h-4" />
              <span className="text-sm">{t('createPost', language)}</span>
            </Link>
          </nav>

          {/* Right Side - Auth, Coins & Language */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-dark-100/50 border border-neon-purple/20 hover:border-neon-purple/50 transition-all"
              title={t('language', language)}
            >
              <Globe className="w-4 h-4 text-neon-purple" />
              <span className="text-xs font-medium text-gray-300 uppercase">
                {language}
              </span>
            </button>

            {/* Coin Balance - Only show when logged in */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-dark/30 to-gold/30 border border-gold/50 shadow-gold">
                <Coins className="w-5 h-5 text-gold animate-pulse-slow" />
                <span className="font-bold text-gold">{coins}</span>
                <span className="text-xs text-gold-light hidden sm:inline">
                  {t('coins', language)}
                </span>
              </div>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* Profile */}
                <div className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-lg bg-dark-100/50 border border-neon-purple/20">
                  <UserIcon className="w-4 h-4 text-neon-purple" />
                  <span className="text-xs text-gray-300 max-w-20 truncate">
                    {profile?.username || 'User'}
                  </span>
                </div>
                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-dark-100/50 border border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all"
                  title={t('signOut', language)}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">{t('signOut', language)}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-neon text-white text-sm font-medium hover:shadow-neon transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('login', language)}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex sm:hidden items-center justify-center gap-6 mt-3 pt-3 border-t border-dark-200">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-300 hover:text-neon-purple transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">{t('home', language)}</span>
          </Link>
          <Link 
            href="/create" 
            className="flex items-center gap-2 text-gray-300 hover:text-neon-pink transition-colors"
          >
            <PenSquare className="w-4 h-4" />
            <span className="text-sm">{t('createPost', language)}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
