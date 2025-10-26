// Error display component for showing error states
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, X, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface ErrorDisplayProps {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'network' | 'offline';
  className?: string;
  showDetails?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title,
  onRetry,
  onDismiss,
  variant = 'error',
  className = '',
  showDetails = false
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' && error.stack;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          icon: AlertCircle
        };
      case 'network':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          icon: Wifi
        };
      case 'offline':
        return {
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-400',
          icon: WifiOff
        };
      default:
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          icon: AlertTriangle
        };
    }
  };

  const styles = getVariantStyles();
  const Icon = styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-lg border ${styles.bgColor} ${styles.borderColor} p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${styles.iconColor}`} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-medium ${styles.iconColor} mb-1`}>
              {title}
            </h3>
          )}
          
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {errorMessage}
          </p>

          {showDetails && errorStack && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-700 rounded p-2 overflow-auto">
                {errorStack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Retry"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          )}
          
          {onDismiss && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDismiss}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Network status component
interface NetworkStatusProps {
  isOnline: boolean;
  className?: string;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isOnline,
  className = ''
}) => {
  if (isOnline) return null;

  return (
    <ErrorDisplay
      error="You're currently offline. Some features may not be available."
      title="No Internet Connection"
      variant="offline"
      className={className}
    />
  );
};

// Error toast component
interface ErrorToastProps {
  error: string | Error;
  onDismiss: () => void;
  duration?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onDismiss,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <ErrorDisplay
        error={error}
        onDismiss={onDismiss}
        variant="error"
        className="shadow-lg"
      />
    </motion.div>
  );
};

// Error boundary fallback component
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError
}) => {
  return (
    <div className="min-h-96 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorDisplay
          error={error}
          title="Something went wrong"
          onRetry={resetError}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </div>
    </div>
  );
};
