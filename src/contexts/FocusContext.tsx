// Focus Context for managing global focus tracking state
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFocus } from '@/hooks/useFocus';
import { useAuth } from './AuthContext';

interface FocusContextType {
  isTracking: boolean;
  focusScore: number;
  metrics: any[];
  loading: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
}

const FocusContext = createContext<FocusContextType>({
  isTracking: false,
  focusScore: 0,
  metrics: [],
  loading: false,
  error: null,
  startTracking: () => {},
  stopTracking: () => {}
});

export const useFocusContext = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocusContext must be used within a FocusProvider');
  }
  return context;
};

interface FocusProviderProps {
  children: React.ReactNode;
}

export const FocusProvider: React.FC<FocusProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isGlobalTracking, setIsGlobalTracking] = useState(false);
  const lastPathnameRef = useRef<string>('');
  
  // Use the focus hook with the current user
  const focusHook = useFocus(user?.id || 'demo-user');

  // Restore and auto-resume tracking state from localStorage on mount and route changes
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const hasRouteChanged = lastPathnameRef.current !== '' && lastPathnameRef.current !== pathname;
      lastPathnameRef.current = pathname;

      const savedTrackingPreference = localStorage.getItem('focus-tracking-preference');
      if (savedTrackingPreference === 'enabled') {
        // Auto-resume tracking after navigation
        const resumeTracking = async () => {
          try {
            await focusHook.startTracking();
            setIsGlobalTracking(true);
            if (hasRouteChanged) {
              console.log('Focus tracking resumed after route change to:', pathname);
            } else {
              console.log('Focus tracking resumed on mount');
            }
          } catch (error) {
            console.log('Could not auto-resume tracking:', error);
            // Remove preference if we can't start tracking
            localStorage.removeItem('focus-tracking-preference');
          }
        };
        
        // Small delay to ensure component is fully mounted
        const delay = hasRouteChanged ? 300 : 100;
        setTimeout(resumeTracking, delay);
      }
    }
  }, [user, focusHook.startTracking, pathname]);

  // Save tracking state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('focus-tracking-state', isGlobalTracking.toString());
    }
  }, [isGlobalTracking]);

  // Sync local tracking state with the hook
  useEffect(() => {
    setIsGlobalTracking(focusHook.isTracking);
  }, [focusHook.isTracking]);

  // Enhanced start tracking that persists across navigation
  const startGlobalTracking = useCallback(async () => {
    try {
      console.log('Starting global focus tracking...');
      await focusHook.startTracking();
      setIsGlobalTracking(true);
      
      // Store tracking preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('focus-tracking-preference', 'enabled');
        console.log('Focus tracking preference saved');
      }
    } catch (error) {
      console.error('Failed to start global focus tracking:', error);
    }
  }, [focusHook.startTracking]);

  // Enhanced stop tracking
  const stopGlobalTracking = useCallback(() => {
    console.log('Stopping global focus tracking...');
    focusHook.stopTracking();
    setIsGlobalTracking(false);
    
    // Remove tracking preference
    if (typeof window !== 'undefined') {
      localStorage.removeItem('focus-tracking-preference');
      console.log('Focus tracking preference removed');
    }
  }, [focusHook.stopTracking]);

  // Auto-restart tracking on page navigation and visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const savedPreference = localStorage.getItem('focus-tracking-preference');
        if (savedPreference === 'enabled' && !focusHook.isTracking) {
          // Try to resume tracking when page becomes visible
          const resumeTracking = async () => {
            try {
              await focusHook.startTracking();
              setIsGlobalTracking(true);
              console.log('Focus tracking resumed on visibility change');
            } catch (error) {
              console.log('Could not resume tracking on visibility change:', error);
            }
          };
          resumeTracking();
        }
      }
    };

    // Also handle page navigation events (Next.js specific)
    const handleRouteChange = () => {
      const savedPreference = localStorage.getItem('focus-tracking-preference');
      if (savedPreference === 'enabled' && !focusHook.isTracking) {
        // Resume tracking after route change
        setTimeout(async () => {
          try {
            await focusHook.startTracking();
            setIsGlobalTracking(true);
            console.log('Focus tracking resumed after route change');
          } catch (error) {
            console.log('Could not resume tracking after route change:', error);
          }
        }, 200);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for Next.js route changes
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handleRouteChange);
      }
    };
  }, [focusHook.isTracking, focusHook.startTracking]);

  const contextValue: FocusContextType = {
    isTracking: focusHook.isTracking,
    focusScore: focusHook.focusScore,
    metrics: focusHook.metrics,
    loading: focusHook.loading,
    error: focusHook.error,
    startTracking: startGlobalTracking,
    stopTracking: stopGlobalTracking
  };

  return (
    <FocusContext.Provider value={contextValue}>
      {children}
    </FocusContext.Provider>
  );
};