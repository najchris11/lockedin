'use client';

import { useEffect, useCallback } from 'react';
import { usePomodoroContext } from '@/contexts/PomodoroContext';

interface NotificationOptions {
  enableSound?: boolean;
  enableDesktop?: boolean;
  soundVolume?: number;
}

export const useTimerNotifications = (options: NotificationOptions = {}) => {
  const {
    enableSound = true,
    enableDesktop = true,
    soundVolume = 0.5
  } = options;

  const { isRunning, timeLeft, isFocus } = usePomodoroContext();

  // Request notification permission
  useEffect(() => {
    if (enableDesktop && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [enableDesktop]);

  // Play notification sound
  const playNotificationSound = useCallback((type: 'session-complete' | 'session-start') => {
    if (!enableSound) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'session-complete') {
        // Triple chime for session complete
        [523.25, 659.25, 783.99].forEach((freq, index) => {
          setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            gain.gain.setValueAtTime(0, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(soundVolume, audioContext.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.6);
          }, index * 200);
        });
      } else {
        // Single tone for session start
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(soundVolume, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [enableSound, soundVolume]);

  // Show desktop notification
  const showDesktopNotification = useCallback((title: string, body: string, icon?: string) => {
    if (!enableDesktop || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'pomodoro-timer',
      requireInteraction: false,
      silent: false
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }, [enableDesktop]);

  // Handle session completion
  useEffect(() => {
    if (!isRunning && timeLeft === 0) {
      if (isFocus) {
        playNotificationSound('session-complete');
        showDesktopNotification(
          '🎯 Focus Session Complete!',
          'Great job! Time for a well-deserved break.',
          '/icons/focus-complete.png'
        );
      } else {
        playNotificationSound('session-complete');
        showDesktopNotification(
          '☕ Break Time Over!',
          'Ready to get back to work? Let\'s start the next focus session.',
          '/icons/break-complete.png'
        );
      }
    }
  }, [isRunning, timeLeft, isFocus, playNotificationSound, showDesktopNotification]);

  // Handle session start
  useEffect(() => {
    if (isRunning) {
      playNotificationSound('session-start');
      if (isFocus) {
        showDesktopNotification(
          '🚀 Focus Session Started!',
          'Stay focused and avoid distractions. You\'ve got this!',
          '/icons/focus-start.png'
        );
      } else {
        showDesktopNotification(
          '🌿 Break Time Started!',
          'Take a moment to relax and recharge.',
          '/icons/break-start.png'
        );
      }
    }
  }, [isRunning, isFocus, playNotificationSound, showDesktopNotification]);

  // Warning notifications (5 minutes before session ends)
  useEffect(() => {
    if (isRunning && timeLeft === 300) { // 5 minutes remaining
      if (isFocus) {
        showDesktopNotification(
          '⏰ 5 Minutes Remaining',
          'Focus session ending soon. Stay concentrated!',
          '/icons/warning.png'
        );
      }
    }
  }, [isRunning, timeLeft, isFocus, showDesktopNotification]);

  // Browser tab title updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalTitle = document.title;

    if (isRunning) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      const sessionType = isFocus ? '🎯' : '☕';
      
      document.title = `${sessionType} ${timeString} - ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [isRunning, timeLeft, isFocus]);

  return {
    playNotificationSound,
    showDesktopNotification
  };
};