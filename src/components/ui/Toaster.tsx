'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'group toast flex items-center gap-3 w-full max-w-md p-4 rounded-xl shadow-2xl backdrop-blur-xl',
          success: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400',
          error: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 text-red-400',
          warning: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 text-yellow-400',
          info: 'bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30 text-neon-purple',
          title: 'font-semibold text-sm',
          description: 'text-sm opacity-80',
          actionButton: 'bg-neon-purple text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-neon-purple/80 transition-colors',
          cancelButton: 'bg-dark-200 text-gray-400 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-dark-100 transition-colors',
          closeButton: 'text-gray-500 hover:text-white transition-colors',
          icon: 'w-5 h-5',
        },
      }}
      theme="dark"
      richColors
      closeButton
      duration={4000}
    />
  );
}
