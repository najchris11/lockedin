// Performance monitoring and optimization utilities
'use client';

import { useEffect, useState } from 'react';
import { firestoreUtils } from '@/lib/firebase';
import { cacheUtils, dataCache } from '@/lib/cache';

interface PerformanceMetrics {
  isOnline: boolean;
  cacheHitRate: number;
  lastSyncTime: Date | null;
  networkLatency: number;
  memoryUsage: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    isOnline: true,
    cacheHitRate: 0,
    lastSyncTime: null,
    networkLatency: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setMetrics(prev => ({ ...prev, isOnline: true }));
      console.log('🟢 Back online - syncing data');
    };

    const handleOffline = () => {
      setMetrics(prev => ({ ...prev, isOnline: false }));
      console.log('🔴 Offline - using cached data');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor network latency
    const measureLatency = async () => {
      const start = performance.now();
      try {
        await fetch('https://www.google.com/favicon.ico', { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        const latency = performance.now() - start;
        setMetrics(prev => ({ ...prev, networkLatency: latency }));
      } catch (error) {
        console.log('Network latency measurement failed');
      }
    };

    // Monitor memory usage
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    // Initial measurements
    setMetrics(prev => ({ ...prev, isOnline: navigator.onLine }));
    measureLatency();
    updateMemoryUsage();

    // Periodic updates
    const interval = setInterval(() => {
      measureLatency();
      updateMemoryUsage();
    }, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return metrics;
};

// Performance optimization utilities
export const performanceUtils = {
  // Preload critical data
  preloadUserData: async (userId: string) => {
    try {
      const cached = cacheUtils.getUserData(userId);
      if (!cached) {
        console.log('Preloading user data...');
        // This will trigger the auth context to load user data
      }
    } catch (error) {
      console.error('Failed to preload user data:', error);
    }
  },

  // Clear old cache entries
  cleanupCache: () => {
    cacheUtils.clearAllCache();
    console.log('🧹 Cache cleared');
  },

  // Get cache statistics
  getCacheStats: () => {
    return dataCache.getStats();
  },

  // Optimize for mobile
  optimizeForMobile: () => {
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        // Reduce cache size on mobile
        console.log('📱 Mobile detected - optimizing cache');
        return true;
      }
    }
    return false;
  },

  // Measure component render time
  measureRenderTime: (componentName: string, startTime: number) => {
    const renderTime = performance.now() - startTime;
    if (renderTime > 16) { // More than one frame (16ms)
      console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
    return renderTime;
  }
};

// Performance monitoring component
export const PerformanceMonitor: React.FC = () => {
  const metrics = usePerformanceMonitor();
  const [showDetails, setShowDetails] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${metrics.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{metrics.isOnline ? 'Online' : 'Offline'}</span>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-400 hover:text-blue-300"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        {showDetails && (
          <div className="space-y-1">
            <div>Latency: {metrics.networkLatency.toFixed(0)}ms</div>
            <div>Memory: {metrics.memoryUsage.toFixed(1)}%</div>
            <div>Cache: {performanceUtils.getCacheStats().size} items</div>
            {metrics.lastSyncTime && (
              <div>Last Sync: {metrics.lastSyncTime.toLocaleTimeString()}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
