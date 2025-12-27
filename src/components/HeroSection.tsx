'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import { 
  Sparkles, 
  Heart,
  MessageCircle,
  Eye,
  ArrowRight
} from 'lucide-react';

export default function HeroSection() {
  const { language } = useApp();

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-neon-pink/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neon-blue/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/30 mb-6 animate-float">
          <Sparkles className="w-4 h-4 text-neon-purple" />
          <span className="text-sm text-neon-purple font-medium">
            {language === 'vi' ? 'Bí mật. An toàn. Kết nối.' : 'Secret. Safe. Connected.'}
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
            {t('heroTitle', language)}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          {t('heroSubtitle', language)}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/create"
            className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-neon text-white font-bold text-lg hover:shadow-neon transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{language === 'vi' ? 'Tạo Confession' : 'Create Confession'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <a 
            href="#confessions"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-dark-100/50 border border-neon-purple/30 text-white font-medium hover:border-neon-purple/60 transition-all duration-300"
          >
            <Eye className="w-5 h-5 text-neon-purple" />
            <span>{t('exploreNow', language)}</span>
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 mt-12 pt-8 border-t border-dark-200/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-bold text-white mb-1">
              <Heart className="w-6 h-6 text-neon-pink" />
              <span>2.5K+</span>
            </div>
            <p className="text-sm text-gray-500">
              {language === 'vi' ? 'Confessions' : 'Confessions'}
            </p>
          </div>
          <div className="w-px h-10 bg-dark-200" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-bold text-white mb-1">
              <MessageCircle className="w-6 h-6 text-neon-purple" />
              <span>10K+</span>
            </div>
            <p className="text-sm text-gray-500">
              {language === 'vi' ? 'Tin nhắn' : 'Messages'}
            </p>
          </div>
          <div className="w-px h-10 bg-dark-200" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-bold text-white mb-1">
              <Eye className="w-6 h-6 text-neon-blue" />
              <span>50K+</span>
            </div>
            <p className="text-sm text-gray-500">
              {language === 'vi' ? 'Lượt xem' : 'Views'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
