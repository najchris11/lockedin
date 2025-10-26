// Loading spinner component with different variants
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (variant === 'spinner') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={sizeClasses[size]}
        >
          <Loader2 className={`w-full h-full text-blue-600 dark:text-blue-400`} />
        </motion.div>
        {text && (
          <span className={`ml-2 text-gray-600 dark:text-gray-400 ${textSizeClasses[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-1 ${className}`}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
        {text && (
          <span className={`ml-2 text-gray-600 dark:text-gray-400 ${textSizeClasses[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <motion.div
          className={`${sizeClasses[size]} bg-blue-600 dark:bg-blue-400 rounded-full`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity
          }}
        />
        {text && (
          <span className={`ml-2 text-gray-600 dark:text-gray-400 ${textSizeClasses[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return null;
};

// Loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Loading...',
  children
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 text-center">
          <LoadingSpinner size="lg" text={text} />
        </div>
      </div>
    </div>
  );
};

// Loading page component
interface LoadingPageProps {
  text?: string;
  subtitle?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  text = 'Loading...',
  subtitle
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <LoadingSpinner size="xl" text={text} />
        {subtitle && (
          <p className="mt-4 text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </motion.div>
    </div>
  );
};
