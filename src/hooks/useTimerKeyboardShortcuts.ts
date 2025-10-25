'use client';

import { useEffect } from 'react';
import { usePomodoroContext } from '@/contexts/PomodoroContext';

export const useTimerKeyboardShortcuts = () => {
  const {
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession
  } = usePomodoroContext();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Check for modifier keys
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      switch (event.code) {
        case 'Space':
          // Spacebar: Start/Pause timer
          event.preventDefault();
          if (isRunning) {
            pauseTimer();
          } else {
            startTimer();
          }
          break;

        case 'KeyR':
          // R: Reset timer
          if (isCtrlOrCmd || isShift) {
            event.preventDefault();
            resetTimer();
          }
          break;

        case 'KeyS':
          // Ctrl/Cmd + S: Skip session
          if (isCtrlOrCmd) {
            event.preventDefault();
            skipSession();
          }
          break;

        case 'Escape':
          // Escape: Pause timer
          event.preventDefault();
          if (isRunning) {
            pauseTimer();
          }
          break;

        default:
          break;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isRunning, startTimer, pauseTimer, resetTimer, skipSession]);

  return null;
};