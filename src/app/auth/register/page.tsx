'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/SupabaseAppContext';
import { t } from '@/lib/translations';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowLeft,
  Chrome,
  Check
} from 'lucide-react';

export default function RegisterPage() {
  const { signUp, signInWithGoogle, language } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch', language));
      return;
    }

    if (password.length < 6) {
      setError(t('passwordTooShort', language));
      return;
    }

    setIsLoading(true);

    const result = await signUp(email, password);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const result = await signInWithGoogle();
    
    if (result.error) {
      setError(result.error);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="bg-dark-100/50 backdrop-blur-xl rounded-2xl border border-neon-purple/20 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t('checkEmail', language)}
            </h1>
            <p className="text-gray-400 mb-6">
              {t('confirmationSent', language)}
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-neon text-white font-medium hover:shadow-neon transition-all"
            >
              {t('backToLogin', language)}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToHome', language)}</span>
        </Link>

        {/* Card */}
        <div className="bg-dark-100/50 backdrop-blur-xl rounded-2xl border border-neon-purple/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-neon mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t('createAccount', language)}
            </h1>
            <p className="text-gray-400">
              {t('joinCommunity', language)}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-200/50 border border-dark-200 focus:border-neon-purple/50 focus:outline-none text-white placeholder-gray-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('password', language)}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-dark-200/50 border border-dark-200 focus:border-neon-purple/50 focus:outline-none text-white placeholder-gray-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('minPassword', language)}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('confirmPassword', language)}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-200/50 border border-dark-200 focus:border-neon-purple/50 focus:outline-none text-white placeholder-gray-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-neon text-white font-medium hover:shadow-neon transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  {t('loading', language)}
                </span>
              ) : (
                t('signUp', language)
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-dark-200" />
            <span className="text-gray-500 text-sm">{t('or', language)}</span>
            <div className="flex-1 h-px bg-dark-200" />
          </div>

          {/* Social Login */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 rounded-xl bg-dark-200/50 border border-dark-200 text-white font-medium hover:bg-dark-200 transition-colors flex items-center justify-center gap-3"
          >
            <Chrome className="w-5 h-5" />
            {t('continueWithGoogle', language)}
          </button>

          {/* Sign In Link */}
          <p className="text-center text-gray-400 mt-6">
            {t('haveAccount', language)}{' '}
            <Link 
              href="/auth/login"
              className="text-neon-purple hover:text-neon-pink transition-colors font-medium"
            >
              {t('login', language)}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
