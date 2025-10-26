// Notification service for browser notifications
'use client';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  constructor() {
  const hasWindow = typeof window !== 'undefined';
  this.isSupported = hasWindow && 'Notification' in window;
  this.permission = hasWindow && typeof Notification !== 'undefined' ? Notification.permission : 'denied';
}

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  // Check if notifications are supported and permitted
  isAvailable(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  // Show a notification
  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isAvailable()) {
      console.warn('Notifications are not available');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        actions: options.actions || []
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  // Show Pomodoro timer notifications
  async showTimerNotification(type: 'focus-start' | 'focus-end' | 'break-start' | 'break-end' | 'long-break-start' | 'long-break-end'): Promise<void> {
    const notifications = {
      'focus-start': {
        title: '🍅 Focus Session Started',
        body: 'Time to focus! Put away distractions and work on your task.',
        tag: 'pomodoro-focus-start'
      },
      'focus-end': {
        title: '✅ Focus Session Complete!',
        body: 'Great work! Take a well-deserved break.',
        tag: 'pomodoro-focus-end',
        requireInteraction: true
      },
      'break-start': {
        title: '☕ Break Time',
        body: 'Take a 5-minute break. Stretch, hydrate, or relax.',
        tag: 'pomodoro-break-start'
      },
      'break-end': {
        title: '⏰ Break Over',
        body: 'Ready to get back to work? Start your next focus session.',
        tag: 'pomodoro-break-end',
        requireInteraction: true
      },
      'long-break-start': {
        title: '🎉 Long Break Time!',
        body: 'You\'ve completed several sessions. Take a 15-minute break.',
        tag: 'pomodoro-long-break-start'
      },
      'long-break-end': {
        title: '🚀 Ready for More Focus',
        body: 'Long break complete! Time to start your next focus session.',
        tag: 'pomodoro-long-break-end',
        requireInteraction: true
      }
    };

    const notification = notifications[type];
    if (notification) {
      await this.showNotification(notification);
    }
  }

  // Show focus tracking notifications
  async showFocusNotification(type: 'focus-low' | 'focus-good' | 'distraction-detected'): Promise<void> {
    const notifications = {
      'focus-low': {
        title: '👀 Focus Alert',
        body: 'Your focus seems low. Try to refocus on your task.',
        tag: 'focus-low'
      },
      'focus-good': {
        title: '🎯 Great Focus!',
        body: 'You\'re maintaining excellent focus. Keep it up!',
        tag: 'focus-good'
      },
      'distraction-detected': {
        title: '⚠️ Distraction Detected',
        body: 'We noticed you might be distracted. Try to refocus.',
        tag: 'distraction-detected'
      }
    };

    const notification = notifications[type];
    if (notification) {
      await this.showNotification(notification);
    }
  }

  // Show task completion notification
  async showTaskNotification(type: 'task-completed' | 'task-added'): Promise<void> {
    const notifications = {
      'task-completed': {
        title: '✅ Task Completed!',
        body: 'Great job completing your task. Keep up the momentum!',
        tag: 'task-completed'
      },
      'task-added': {
        title: '📝 Task Added',
        body: 'New task added to your list. Ready to get started?',
        tag: 'task-added'
      }
    };

    const notification = notifications[type];
    if (notification) {
      await this.showNotification(notification);
    }
  }

  // Show achievement notification
  async showAchievementNotification(achievement: string): Promise<void> {
    await this.showNotification({
      title: '🏆 Achievement Unlocked!',
      body: achievement,
      tag: 'achievement',
      requireInteraction: true
    });
  }

  // Show session statistics
  async showSessionStats(stats: {
    sessionsCompleted: number;
    totalFocusTime: number;
    averageFocusScore: number;
  }): Promise<void> {
    const timeFormatted = Math.floor(stats.totalFocusTime / 60);
    await this.showNotification({
      title: '📊 Daily Summary',
      body: `Completed ${stats.sessionsCompleted} sessions, ${timeFormatted} minutes focused, ${Math.round(stats.averageFocusScore)}% average focus`,
      tag: 'daily-summary',
      requireInteraction: true
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Hook for using notifications in React components
export const useNotifications = () => {
  const requestPermission = async () => {
    return await notificationService.requestPermission();
  };

  const isAvailable = () => {
    return notificationService.isAvailable();
  };

  const showTimerNotification = async (type: 'focus-start' | 'focus-end' | 'break-start' | 'break-end' | 'long-break-start' | 'long-break-end') => {
    return await notificationService.showTimerNotification(type);
  };

  const showFocusNotification = async (type: 'focus-low' | 'focus-good' | 'distraction-detected') => {
    return await notificationService.showFocusNotification(type);
  };

  const showTaskNotification = async (type: 'task-completed' | 'task-added') => {
    return await notificationService.showTaskNotification(type);
  };

  const showAchievementNotification = async (achievement: string) => {
    return await notificationService.showAchievementNotification(achievement);
  };

  const showSessionStats = async (stats: {
    sessionsCompleted: number;
    totalFocusTime: number;
    averageFocusScore: number;
  }) => {
    return await notificationService.showSessionStats(stats);
  };

  return {
    requestPermission,
    isAvailable,
    showTimerNotification,
    showFocusNotification,
    showTaskNotification,
    showAchievementNotification,
    showSessionStats
  };
};
