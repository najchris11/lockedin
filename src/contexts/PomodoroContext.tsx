'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { PomodoroSession } from '@/types';
import { storePomodoroSession } from '@/lib/gcp';

interface PomodoroSettings {
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // every N sessions
}

interface PomodoroState {
  isRunning: boolean;
  isFocus: boolean;
  timeLeft: number; // in seconds
  sessionCount: number;
  settings: PomodoroSettings;
}

interface PomodoroContextType extends PomodoroState {
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

interface PomodoroProviderProps {
  children: ReactNode;
}

export const PomodoroProvider: React.FC<PomodoroProviderProps> = ({ children }) => {
  const [state, setState] = useState<PomodoroState>(() => {
    // Try to load from localStorage on initialization
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoro-state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const calculatedTimeLeft = calculateRemainingTime(parsed);
          return {
            ...parsed,
            // Keep the running state if timer was running and there's time left
            isRunning: parsed.isRunning && calculatedTimeLeft > 0,
            // Recalculate timeLeft based on elapsed time
            timeLeft: calculatedTimeLeft
          };
        } catch (error) {
          console.error('Failed to parse saved pomodoro state:', error);
        }
      }
    }
    
    return {
      isRunning: false,
      isFocus: true,
      timeLeft: DEFAULT_SETTINGS.focusDuration * 60,
      sessionCount: 0,
      settings: DEFAULT_SETTINGS
    };
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Calculate remaining time based on elapsed time since last save
  function calculateRemainingTime(savedState: PomodoroState): number {
    if (!savedState.isRunning) {
      return savedState.timeLeft;
    }

    const savedTimestamp = localStorage.getItem('pomodoro-timestamp');
    if (!savedTimestamp) {
      return savedState.timeLeft;
    }

    const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
    const remaining = savedState.timeLeft - elapsed;
    
    return Math.max(0, remaining);
  }

  // Save state to localStorage
  const saveState = useCallback((newState: PomodoroState) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoro-state', JSON.stringify(newState));
      if (newState.isRunning) {
        localStorage.setItem('pomodoro-timestamp', Date.now().toString());
      } else {
        localStorage.removeItem('pomodoro-timestamp');
      }
    }
  }, []);

  // Update state and save to localStorage
  const updateState = useCallback((updates: Partial<PomodoroState>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const startTimer = useCallback(() => {
    if (!state.isRunning) {
      // Clear any existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      updateState({ isRunning: true });
      startTimeRef.current = new Date();
    }
  }, [state.isRunning, updateState]);

  const pauseTimer = useCallback(() => {
    if (state.isRunning) {
      updateState({ isRunning: false });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state.isRunning, updateState]);

  const resetTimer = useCallback(() => {
    updateState({ isRunning: false });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset to current session type duration
    const duration = state.isFocus ? state.settings.focusDuration : state.settings.breakDuration;
    updateState({ timeLeft: duration * 60 });
  }, [state.isFocus, state.settings.focusDuration, state.settings.breakDuration, updateState]);

  const skipSession = useCallback(() => {
    handleTimerComplete();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    updateState({ 
      settings: { ...state.settings, ...newSettings },
      // Reset timer if settings change while running
      isRunning: false,
      timeLeft: newSettings.focusDuration ? newSettings.focusDuration * 60 : state.timeLeft
    });
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [state.settings, state.timeLeft, updateState]);

  const handleTimerComplete = useCallback(async () => {
    updateState({ isRunning: false });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Store session data to GCP
    if (startTimeRef.current) {
      const session: PomodoroSession = {
        id: `session_${Date.now()}`,
        userId: 'current_user', // TODO: Get from auth context
        type: state.isFocus ? 'focus' : 'break',
        duration: state.isFocus ? state.settings.focusDuration : state.settings.breakDuration,
        completed: true,
        startTime: startTimeRef.current,
        endTime: new Date(),
        focusScore: 0 // TODO: Get from focus tracking
      };

      try {
        await storePomodoroSession(session);
      } catch (error) {
        console.error('Failed to store session:', error);
      }
    }

    // Switch to next session type
    if (state.isFocus) {
      // Focus session completed, start break
      updateState({
        isFocus: false,
        timeLeft: state.settings.breakDuration * 60,
        sessionCount: state.sessionCount + 1
      });
      
      // TODO: Trigger break notification
      // TODO: Start break music playlist
    } else {
      // Break completed, start focus session
      const shouldLongBreak = state.sessionCount > 0 && state.sessionCount % state.settings.longBreakInterval === 0;
      const breakDuration = shouldLongBreak ? state.settings.longBreakDuration : state.settings.breakDuration;
      
      updateState({
        isFocus: true,
        timeLeft: breakDuration * 60
      });
      
      // TODO: Trigger focus notification
      // TODO: Start focus music playlist
    }
  }, [state.isFocus, state.settings, state.sessionCount, updateState]);

  // Handle timer completion
  useEffect(() => {
    if (!state.isRunning && state.timeLeft === 0) {
      handleTimerComplete();
    }
  }, [state.isRunning, state.timeLeft, handleTimerComplete]);

  // Auto-start next session (but only if user hasn't manually paused)
  useEffect(() => {
    if (!state.isRunning && state.timeLeft === 0) {
      // Check if this is a natural completion (not manual pause)
      const lastAction = localStorage.getItem('pomodoro-last-action');
      if (lastAction !== 'manual-pause') {
        const timeout = setTimeout(() => {
          startTimer();
        }, 3000); // 3 second delay for user to react

        return () => clearTimeout(timeout);
      }
    }
  }, [state.isRunning, state.timeLeft, startTimer]);

  // Track manual pause/start actions
  const enhancedPauseTimer = useCallback(() => {
    localStorage.setItem('pomodoro-last-action', 'manual-pause');
    pauseTimer();
  }, [pauseTimer]);

  const enhancedStartTimer = useCallback(() => {
    localStorage.removeItem('pomodoro-last-action');
    startTimer();
  }, [startTimer]);

  // Manage timer interval based on isRunning state
  useEffect(() => {
    if (state.isRunning && !intervalRef.current) {
      // Start the interval
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            // Timer finished - handle completion inline to avoid circular dependency
            return { ...prev, timeLeft: 0, isRunning: false };
          }
          const newState = { ...prev, timeLeft: prev.timeLeft - 1 };
          saveState(newState);
          return newState;
        });
      }, 1000);
    } else if (!state.isRunning && intervalRef.current) {
      // Clear the interval
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, saveState]);

  // Handle page visibility changes to maintain accurate timing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.isRunning) {
        // Page became hidden while timer is running - save the timestamp
        localStorage.setItem('pomodoro-hidden-timestamp', Date.now().toString());
      } else if (!document.hidden && state.isRunning) {
        // Page became visible while timer is running - calculate elapsed time
        const hiddenTimestamp = localStorage.getItem('pomodoro-hidden-timestamp');
        if (hiddenTimestamp) {
          const elapsed = Math.floor((Date.now() - parseInt(hiddenTimestamp)) / 1000);
          setState(prev => {
            const newTimeLeft = Math.max(0, prev.timeLeft - elapsed);
            const newState = { ...prev, timeLeft: newTimeLeft };
            if (newTimeLeft === 0) {
              newState.isRunning = false;
            }
            saveState(newState);
            return newState;
          });
          localStorage.removeItem('pomodoro-hidden-timestamp');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isRunning, saveState]);

  const contextValue: PomodoroContextType = {
    ...state,
    startTimer: enhancedStartTimer,
    pauseTimer: enhancedPauseTimer,
    resetTimer,
    skipSession,
    updateSettings
  };

  return (
    <PomodoroContext.Provider value={contextValue}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoroContext = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoroContext must be used within a PomodoroProvider');
  }
  return context;
};
