// AuthButton component for authentication
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { LogIn, LogOut, Loader } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthButtonProps {
  className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  className = '' 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // User data will be automatically stored via AuthContext
      console.log('User signed in:', user);
    } catch (error: any) {
      console.error('Sign-in error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  // TODO: Implement sign-out
  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await signOut(auth);
      // Auth state will be automatically updated via AuthContext
    } catch (error: any) {
      console.error('Sign-out error:', error);
      setError(error.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSignOut}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        Sign Out
      </motion.button>
    );
  }

  return (
    <div className={className}>
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <LogIn className="w-4 h-4" />
          </>
        )}
        Sign in with Google
      </motion.button>
    </div>
  );
};
