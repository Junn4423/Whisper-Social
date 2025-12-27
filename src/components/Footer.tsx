'use client';

import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-8 border-t border-dark-200/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-purple" />
            <span className="font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
              WhisperPay
            </span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-neon-pink" /> for anonymous connections
          </p>

          {/* Year */}
          <p className="text-sm text-gray-500">
            © 2024 WhisperPay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
