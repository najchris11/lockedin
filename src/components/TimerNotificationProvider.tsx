'use client';

import { useTimerNotifications } from '@/hooks/useTimerNotifications';
import { useTimerKeyboardShortcuts } from '@/hooks/useTimerKeyboardShortcuts';

interface TimerNotificationProviderProps {
  children: React.ReactNode;
  enableSound?: boolean;
  enableDesktop?: boolean;
  soundVolume?: number;
}

export const TimerNotificationProvider: React.FC<TimerNotificationProviderProps> = ({
  children,
  enableSound = true,
  enableDesktop = true,
  soundVolume = 0.5
}) => {
  // Initialize notifications
  useTimerNotifications({
    enableSound,
    enableDesktop,
    soundVolume
  });

  // Initialize keyboard shortcuts
  useTimerKeyboardShortcuts();

  return <>{children}</>;
};