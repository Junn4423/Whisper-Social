'use client';

import React from 'react';

/**
 * Skeleton loading component for ConfessionCard
 * Displays a shimmer animation while confession data is loading
 */
export function ConfessionSkeleton() {
    return (
        <div className="relative bg-dark-100/50 backdrop-blur-xl rounded-2xl border border-neon-purple/10 overflow-hidden">
            {/* Background shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="relative p-4 sm:p-5">
                {/* Top Row - Avatar & Info */}
                <div className="flex items-start gap-4">
                    {/* Avatar Skeleton */}
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-dark-200/50 animate-pulse" />
                    </div>

                    {/* Info Skeleton */}
                    <div className="flex-1 min-w-0 space-y-3">
                        {/* Gender & Age Pills */}
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-16 rounded-full bg-dark-200/50 animate-pulse" />
                            <div className="h-5 w-20 rounded-full bg-dark-200/50 animate-pulse" />
                        </div>

                        {/* Text Lines */}
                        <div className="space-y-2">
                            <div className="h-4 w-full rounded bg-dark-200/50 animate-pulse" />
                            <div className="h-4 w-5/6 rounded bg-dark-200/50 animate-pulse" />
                            <div className="h-4 w-2/3 rounded bg-dark-200/50 animate-pulse" />
                        </div>

                        {/* Date */}
                        <div className="h-3 w-20 rounded bg-dark-200/50 animate-pulse" />
                    </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dark-200">
                    <div className="flex-1 h-10 rounded-xl bg-dark-200/50 animate-pulse" />
                    <div className="flex-1 h-10 rounded-xl bg-dark-200/50 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

/**
 * Multiple skeleton cards for feed loading
 */
export function ConfessionSkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <ConfessionSkeleton key={index} />
            ))}
        </div>
    );
}

/**
 * Full page skeleton for confession feed
 */
export function ConfessionFeedSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 rounded-lg bg-dark-200/50 animate-pulse" />
                <div className="h-8 w-24 rounded-lg bg-dark-200/50 animate-pulse" />
            </div>

            {/* Cards */}
            <ConfessionSkeletonList count={4} />
        </div>
    );
}

export default ConfessionSkeleton;
