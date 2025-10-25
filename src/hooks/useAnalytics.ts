// Analytics hook for integrating GCP analytics with React components
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  storeFocusMetrics, 
  storePomodoroSession, 
  getFocusAnalytics, 
  getProductivityInsights,
  getCurrentFocusScore,
  storeDistractionEvent,
  getWeeklyTrends,
  exportAnalyticsData
} from '@/lib/gcp';
import { FocusMetrics, PomodoroSession } from '@/types';

interface UseAnalyticsReturn {
  // Data
  analytics: any;
  insights: any;
  weeklyTrends: any[];
  currentFocusScore: number;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Actions
  storeFocusData: (metrics: FocusMetrics) => Promise<void>;
  storeSessionData: (session: PomodoroSession) => Promise<void>;
  loadAnalytics: (dateRange: { start: Date; end: Date }) => Promise<void>;
  loadInsights: () => Promise<void>;
  loadWeeklyTrends: () => Promise<void>;
  trackDistraction: (sessionId: string, distractionType: string) => Promise<void>;
  exportData: (format: 'csv' | 'json') => Promise<string>;
  
  // Real-time updates
  updateFocusScore: (sessionId: string) => Promise<void>;
}

export const useAnalytics = (userId: string): UseAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [currentFocusScore, setCurrentFocusScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store focus metrics
  const storeFocusData = useCallback(async (metrics: FocusMetrics) => {
    try {
      setError(null);
      await storeFocusMetrics(metrics);
      console.log('Focus metrics stored successfully');
    } catch (err) {
      console.error('Failed to store focus metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to store focus metrics');
      throw err;
    }
  }, []);

  // Store Pomodoro session data
  const storeSessionData = useCallback(async (session: PomodoroSession) => {
    try {
      setError(null);
      await storePomodoroSession(session);
      console.log('Pomodoro session stored successfully');
    } catch (err) {
      console.error('Failed to store pomodoro session:', err);
      setError(err instanceof Error ? err.message : 'Failed to store session data');
      throw err;
    }
  }, []);

  // Load analytics data
  const loadAnalytics = useCallback(async (dateRange: { start: Date; end: Date }) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getFocusAnalytics(userId, dateRange);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load productivity insights
  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getProductivityInsights(userId);
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load weekly trends
  const loadWeeklyTrends = useCallback(async () => {
    try {
      setError(null);
      
      const data = await getWeeklyTrends(userId);
      setWeeklyTrends(data);
    } catch (err) {
      console.error('Failed to load weekly trends:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weekly trends');
    }
  }, [userId]);

  // Track distraction events
  const trackDistraction = useCallback(async (sessionId: string, distractionType: string) => {
    try {
      setError(null);
      await storeDistractionEvent(userId, sessionId, distractionType);
      console.log('Distraction event tracked');
    } catch (err) {
      console.error('Failed to track distraction:', err);
      setError(err instanceof Error ? err.message : 'Failed to track distraction');
    }
  }, [userId]);

  // Export analytics data
  const exportData = useCallback(async (format: 'csv' | 'json' = 'json'): Promise<string> => {
    try {
      setError(null);
      
      const downloadUrl = await exportAnalyticsData(userId, format);
      return downloadUrl;
    } catch (err) {
      console.error('Failed to export data:', err);
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    }
  }, [userId]);

  // Update current focus score
  const updateFocusScore = useCallback(async (sessionId: string) => {
    try {
      setError(null);
      
      const score = await getCurrentFocusScore(userId, sessionId);
      setCurrentFocusScore(score);
    } catch (err) {
      console.error('Failed to update focus score:', err);
      setError(err instanceof Error ? err.message : 'Failed to update focus score');
    }
  }, [userId]);

  // Auto-load insights on mount
  useEffect(() => {
    if (userId) {
      loadInsights();
      loadWeeklyTrends();
    }
  }, [userId, loadInsights, loadWeeklyTrends]);

  return {
    // Data
    analytics,
    insights,
    weeklyTrends,
    currentFocusScore,
    
    // Loading states
    loading,
    error,
    
    // Actions
    storeFocusData,
    storeSessionData,
    loadAnalytics,
    loadInsights,
    loadWeeklyTrends,
    trackDistraction,
    exportData,
    
    // Real-time updates
    updateFocusScore
  };
};
