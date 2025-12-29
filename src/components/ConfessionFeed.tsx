'use client';

import React from 'react';
import { useApp } from '@/context/SupabaseAppContext';
import { t } from '@/lib/translations';
import ConfessionCard from './ConfessionCard';
import { Flame, Loader2 } from 'lucide-react';

export default function ConfessionFeed() {
  const { confessions, isConfessionsLoading, language } = useApp();

  return (
    <section id="confessions" className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <Flame className="w-6 h-6 text-neon-pink animate-pulse" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {t('latestConfessions', language)}
          </h2>
        </div>

        {/* Loading State */}
        {isConfessionsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
          </div>
        ) : confessions.length > 0 ? (
          /* Confessions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {confessions.map((confession) => (
              <ConfessionCard key={confession.id} confession={confession} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {t('noConfessions', language)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
