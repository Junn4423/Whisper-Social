'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ChatInterface } from '@/components';
import { Confession } from '@/types';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { confessions, isChatUnlocked } = useApp();
  const [confession, setConfession] = useState<Confession | null>(null);
  const [loading, setLoading] = useState(true);

  const confessionId = params.id as string;

  useEffect(() => {
    // Find the confession
    const found = confessions.find(c => c.id === confessionId);
    
    if (!found) {
      // Confession not found, redirect to home
      router.push('/');
      return;
    }

    // Check if chat is unlocked
    if (!isChatUnlocked(confessionId)) {
      // Chat not unlocked, redirect to home
      router.push('/');
      return;
    }

    setConfession(found);
    setLoading(false);
  }, [confessionId, confessions, isChatUnlocked, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!confession) {
    return null;
  }

  return <ChatInterface confession={confession} />;
}
