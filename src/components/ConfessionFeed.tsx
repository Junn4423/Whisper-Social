'use client';

import React, { useState, useCallback } from 'react';
import { useApp } from '@/context/SupabaseAppContext';
import { t } from '@/lib/translations';
import ConfessionCard from './ConfessionCard';
import { ConfessionSkeletonList } from './ui/ConfessionSkeleton';
import { Flame, RefreshCw } from 'lucide-react';

export default function ConfessionFeed() {
  const { confessions, isConfessionsLoading, language, refreshConfessions } = useApp();

  // Track locally hidden confessions (from reports/manual hide)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter out hidden confessions
  const visibleConfessions = confessions.filter(c => !hiddenIds.has(c.id));

  // Handle hiding a confession
  const handleHide = useCallback((confessionId: string) => {
    setHiddenIds(prev => {
      const newSet = new Set(prev);
      newSet.add(confessionId);
      return newSet;
    });
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshConfessions();
    setIsRefreshing(false);
  };

  return (
    <section id="confessions" className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-neon-pink animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {t('latestConfessions', language)}
            </h2>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isConfessionsLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-200/50 hover:bg-dark-200 text-gray-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm hidden sm:inline">
              {language === 'vi' ? 'Làm mới' : 'Refresh'}
            </span>
          </button>
        </div>

        {/* Loading State with Skeleton */}
        {isConfessionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ConfessionSkeletonList count={6} />
          </div>
        ) : visibleConfessions.length > 0 ? (
          /* Confessions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleConfessions.map((confession) => (
              <ConfessionCard
                key={confession.id}
                confession={confession}
                onHide={() => handleHide(confession.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-200/50 mb-4">
              <Flame className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-500 text-lg">
              {t('noConfessions', language)}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              {language === 'vi'
                ? 'Hãy là người đầu tiên chia sẻ!'
                : 'Be the first to share!'}
            </p>
          </div>
        )}

        {/* Hidden count indicator */}
        {hiddenIds.size > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {language === 'vi'
                ? `${hiddenIds.size} bài viết đã ẩn`
                : `${hiddenIds.size} posts hidden`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
