// Hook for managing session history and statistics
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PomodoroSession } from '@/types';

export interface SessionStats {
  totalSessions: number;
  totalFocusTime: number; // in minutes
  totalBreakTime: number; // in minutes
  averageSessionLength: number; // in minutes
  longestStreak: number;
  currentStreak: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  averageFocusScore: number;
  bestFocusScore: number;
  worstFocusScore: number;
  mostProductiveDay: string;
  mostProductiveHour: number;
}

export interface DailyStats {
  date: string;
  sessionsCompleted: number;
  focusTime: number;
  breakTime: number;
  averageFocusScore: number;
  tasksCompleted: number;
}

export interface WeeklyStats {
  week: string;
  totalSessions: number;
  totalFocusTime: number;
  averageFocusScore: number;
  improvement: number; // percentage change from previous week
}

export interface UseSessionHistoryReturn {
  // Data
  sessions: PomodoroSession[];
  stats: SessionStats | null;
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Actions
  addSession: (session: Omit<PomodoroSession, 'id'>) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<PomodoroSession>) => Promise<void>;
  getSessionStats: (dateRange?: { start: Date; end: Date }) => Promise<SessionStats>;
  getDailyStats: (days: number) => Promise<DailyStats[]>;
  getWeeklyStats: (weeks: number) => Promise<WeeklyStats[]>;
  exportSessionData: (format: 'json' | 'csv') => Promise<string>;
  
  // Real-time updates
  refreshStats: () => Promise<void>;
}

export const useSessionHistory = (userId: string): UseSessionHistoryReturn => {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from Firestore
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        const sessionsData: PomodoroSession[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          sessionsData.push({
            id: doc.id,
            userId: data.userId,
            type: data.type,
            duration: data.duration,
            completed: data.completed,
            startTime: data.startTime?.toDate() || new Date(),
            endTime: data.endTime?.toDate(),
            focusScore: data.focusScore || 0
          });
        });
        setSessions(sessionsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading sessions:', err);
        setError('Failed to load session history');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Calculate statistics
  const calculateStats = useCallback((sessionsData: PomodoroSession[]): SessionStats => {
    if (sessionsData.length === 0) {
      return {
        totalSessions: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
        averageSessionLength: 0,
        longestStreak: 0,
        currentStreak: 0,
        sessionsThisWeek: 0,
        sessionsThisMonth: 0,
        averageFocusScore: 0,
        bestFocusScore: 0,
        worstFocusScore: 0,
        mostProductiveDay: 'Monday',
        mostProductiveHour: 9
      };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const focusSessions = sessionsData.filter(s => s.type === 'focus' && s.completed);
    const breakSessions = sessionsData.filter(s => s.type === 'break' && s.completed);
    
    const totalFocusTime = focusSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalBreakTime = breakSessions.reduce((sum, s) => sum + s.duration, 0);
    
    const sessionsThisWeek = sessionsData.filter(s => s.startTime >= oneWeekAgo).length;
    const sessionsThisMonth = sessionsData.filter(s => s.startTime >= oneMonthAgo).length;
    
    const focusScores = focusSessions.map(s => s.focusScore).filter(score => score > 0);
    const averageFocusScore = focusScores.length > 0 
      ? focusScores.reduce((sum, score) => sum + score, 0) / focusScores.length 
      : 0;
    
    const bestFocusScore = focusScores.length > 0 ? Math.max(...focusScores) : 0;
    const worstFocusScore = focusScores.length > 0 ? Math.min(...focusScores) : 0;

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const sortedSessions = [...sessionsData].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i];
      if (session.type === 'focus' && session.completed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
        
        // Check if this is part of current streak
        const sessionDate = new Date(session.startTime);
        const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    // Find most productive day and hour
    const dayCounts: { [key: string]: number } = {};
    const hourCounts: { [key: number]: number } = {};
    
    focusSessions.forEach(session => {
      const date = new Date(session.startTime);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const mostProductiveDay = Object.entries(dayCounts).reduce((a, b) => 
      dayCounts[a[0]] > dayCounts[b[0]] ? a : b
    )[0] || 'Monday';
    
    const mostProductiveHour = Object.entries(hourCounts).reduce((a, b) => 
      hourCounts[parseInt(a[0])] > hourCounts[parseInt(b[0])] ? a : b
    )[0] || '9';

    return {
      totalSessions: focusSessions.length,
      totalFocusTime,
      totalBreakTime,
      averageSessionLength: focusSessions.length > 0 ? totalFocusTime / focusSessions.length : 0,
      longestStreak,
      currentStreak,
      sessionsThisWeek,
      sessionsThisMonth,
      averageFocusScore,
      bestFocusScore,
      worstFocusScore,
      mostProductiveDay,
      mostProductiveHour: parseInt(mostProductiveHour)
    };
  }, []);

  // Update stats when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      const newStats = calculateStats(sessions);
      setStats(newStats);
    }
  }, [sessions, calculateStats]);

  // Add a new session
  const addSession = useCallback(async (sessionData: Omit<PomodoroSession, 'id'>) => {
    try {
      setError(null);
      await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('Error adding session:', err);
      setError('Failed to add session');
      throw err;
    }
  }, []);

  // Update an existing session
  const updateSession = useCallback(async (sessionId: string, updates: Partial<PomodoroSession>) => {
    try {
      setError(null);
      await updateDoc(doc(db, 'sessions', sessionId), {
        ...updates,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error updating session:', err);
      setError('Failed to update session');
      throw err;
    }
  }, []);

  // Get session statistics
  const getSessionStats = useCallback(async (dateRange?: { start: Date; end: Date }) => {
    try {
      let sessionsToAnalyze = sessions;
      
      if (dateRange) {
        sessionsToAnalyze = sessions.filter(session => 
          session.startTime >= dateRange.start && session.startTime <= dateRange.end
        );
      }
      
      return calculateStats(sessionsToAnalyze);
    } catch (err) {
      console.error('Error getting session stats:', err);
      throw err;
    }
  }, [sessions, calculateStats]);

  // Get daily statistics
  const getDailyStats = useCallback(async (days: number = 7): Promise<DailyStats[]> => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      const dailyStatsMap: { [key: string]: DailyStats } = {};
      
      // Initialize all days
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        dailyStatsMap[dateKey] = {
          date: dateKey,
          sessionsCompleted: 0,
          focusTime: 0,
          breakTime: 0,
          averageFocusScore: 0,
          tasksCompleted: 0
        };
      }
      
      // Process sessions
      sessions.forEach(session => {
        const sessionDate = new Date(session.startTime);
        const dateKey = sessionDate.toISOString().split('T')[0];
        
        if (dailyStatsMap[dateKey]) {
          if (session.type === 'focus' && session.completed) {
            dailyStatsMap[dateKey].sessionsCompleted++;
            dailyStatsMap[dateKey].focusTime += session.duration;
            if (session.focusScore > 0) {
              dailyStatsMap[dateKey].averageFocusScore = 
                (dailyStatsMap[dateKey].averageFocusScore + session.focusScore) / 2;
            }
          } else if (session.type === 'break' && session.completed) {
            dailyStatsMap[dateKey].breakTime += session.duration;
          }
        }
      });
      
      return Object.values(dailyStatsMap).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (err) {
      console.error('Error getting daily stats:', err);
      throw err;
    }
  }, [sessions]);

  // Get weekly statistics
  const getWeeklyStats = useCallback(async (weeks: number = 4): Promise<WeeklyStats[]> => {
    try {
      const weeklyStatsMap: { [key: string]: WeeklyStats } = {};
      
      // Process sessions by week
      sessions.forEach(session => {
        const sessionDate = new Date(session.startTime);
        const weekStart = new Date(sessionDate);
        weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyStatsMap[weekKey]) {
          weeklyStatsMap[weekKey] = {
            week: weekKey,
            totalSessions: 0,
            totalFocusTime: 0,
            averageFocusScore: 0,
            improvement: 0
          };
        }
        
        if (session.type === 'focus' && session.completed) {
          weeklyStatsMap[weekKey].totalSessions++;
          weeklyStatsMap[weekKey].totalFocusTime += session.duration;
          if (session.focusScore > 0) {
            weeklyStatsMap[weekKey].averageFocusScore = 
              (weeklyStatsMap[weekKey].averageFocusScore + session.focusScore) / 2;
          }
        }
      });
      
      return Object.values(weeklyStatsMap).sort((a, b) => 
        new Date(a.week).getTime() - new Date(b.week).getTime()
      );
    } catch (err) {
      console.error('Error getting weekly stats:', err);
      throw err;
    }
  }, [sessions]);

  // Export session data
  const exportSessionData = useCallback(async (format: 'json' | 'csv'): Promise<string> => {
    try {
      if (format === 'json') {
        return JSON.stringify(sessions, null, 2);
      } else {
        // CSV format
        const headers = ['Date', 'Type', 'Duration (min)', 'Completed', 'Focus Score'];
        const csvRows = [headers.join(',')];
        
        sessions.forEach(session => {
          const row = [
            session.startTime.toISOString().split('T')[0],
            session.type,
            session.duration.toString(),
            session.completed.toString(),
            session.focusScore.toString()
          ];
          csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
      }
    } catch (err) {
      console.error('Error exporting session data:', err);
      throw err;
    }
  }, [sessions]);

  // Refresh statistics
  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newStats = calculateStats(sessions);
      setStats(newStats);
      
      const dailyData = await getDailyStats(7);
      setDailyStats(dailyData);
      
      const weeklyData = await getWeeklyStats(4);
      setWeeklyStats(weeklyData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing stats:', err);
      setError('Failed to refresh statistics');
      setLoading(false);
    }
  }, [sessions, calculateStats, getDailyStats, getWeeklyStats]);

  return {
    sessions,
    stats,
    dailyStats,
    weeklyStats,
    loading,
    error,
    addSession,
    updateSession,
    getSessionStats,
    getDailyStats,
    getWeeklyStats,
    exportSessionData,
    refreshStats
  };
};
