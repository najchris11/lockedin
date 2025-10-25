// Custom hook for Pomodoro timer functionality
import { useState, useEffect, useCallback, useRef } from 'react';
import { UsePomodoroReturn, PomodoroSession } from '@/types';
import { storePomodoroSession } from '@/lib/gcp';

interface PomodoroSettings {
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // every N sessions
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4
};

export const usePomodoro = (settings: PomodoroSettings = DEFAULT_SETTINGS): UsePomodoroReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60); // in seconds
  const [sessionCount, setSessionCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // TODO: Implement timer logic
  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = new Date();
      
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer finished
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isRunning]);

  const pauseTimer = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRunning]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset to current session type duration
    const duration = isFocus ? settings.focusDuration : settings.breakDuration;
    setTimeLeft(duration * 60);
  }, [isFocus, settings.focusDuration, settings.breakDuration]);

  const skipSession = useCallback(() => {
    handleTimerComplete();
  }, []);

  // TODO: Implement timer completion logic
  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // TODO: Store session data to GCP
    if (startTimeRef.current) {
      const session: PomodoroSession = {
        id: `session_${Date.now()}`,
        userId: 'current_user', // TODO: Get from auth context
        type: isFocus ? 'focus' : 'break',
        duration: isFocus ? settings.focusDuration : settings.breakDuration,
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
    if (isFocus) {
      // Focus session completed, start break
      setIsFocus(false);
      setTimeLeft(settings.breakDuration * 60);
      setSessionCount(prev => prev + 1);
      
      // TODO: Trigger break notification
      // TODO: Start break music playlist
    } else {
      // Break completed, start focus session
      setIsFocus(true);
      
      // Check if it's time for a long break
      const shouldLongBreak = sessionCount > 0 && sessionCount % settings.longBreakInterval === 0;
      const breakDuration = shouldLongBreak ? settings.longBreakDuration : settings.breakDuration;
      
      setTimeLeft(breakDuration * 60);
      
      // TODO: Trigger focus notification
      // TODO: Start focus music playlist
    }
  }, [isFocus, settings, sessionCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // TODO: Implement auto-start next session
  useEffect(() => {
    if (!isRunning && timeLeft === 0) {
      // Auto-start next session after a short delay
      const timeout = setTimeout(() => {
        startTimer();
      }, 2000); // 2 second delay

      return () => clearTimeout(timeout);
    }
  }, [isRunning, timeLeft, startTimer]);

  return {
    isRunning,
    isFocus,
    timeLeft,
    sessionCount,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession
  };
};
