// Analytics page using real user data from existing hooks
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  Award,
  Brain,
  Zap,
  Activity,
  PieChart,
  CheckCircle,
  Timer,
  Eye
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { useFocusContext } from '@/contexts/FocusContext';
import { useTodoLocal } from '@/hooks/useTodoLocal';

interface SessionHistory {
  id: string;
  type: 'focus' | 'break';
  duration: number;
  completed: boolean;
  timestamp: Date;
  focusScore?: number;
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const router = useRouter();

  // Get data from existing hooks and contexts
  const pomodoroContext = usePomodoroContext();
  const { todos, loading: todosLoading } = useTodoLocal(user?.id || 'demo-user');
  const { 
    focusScore, 
    metrics, 
    isTracking, 
    startTracking, 
    stopTracking, 
    loading: focusLoading, 
    error: focusError 
  } = useFocusContext();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  // Load session history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('session-history');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSessionHistory(parsed.map((session: any) => ({
            ...session,
            timestamp: new Date(session.timestamp)
          })));
        } catch (error) {
          console.error('Failed to parse session history:', error);
        }
      }
    }
  }, []);

  // Save session to history when pomodoro completes
  useEffect(() => {
    if (pomodoroContext.sessionCount > 0) {
      const newSession: SessionHistory = {
        id: `session_${Date.now()}`,
        type: pomodoroContext.isFocus ? 'focus' : 'break',
        duration: pomodoroContext.isFocus ? pomodoroContext.settings.focusDuration : pomodoroContext.settings.breakDuration,
        completed: true,
        timestamp: new Date(),
        focusScore: focusScore
      };

      setSessionHistory(prev => {
        const updated = [...prev, newSession];
        localStorage.setItem('session-history', JSON.stringify(updated));
        return updated;
      });
    }
  }, [pomodoroContext.sessionCount, pomodoroContext.isFocus, pomodoroContext.settings, focusScore]);

  // Helper functions for advanced analytics
  const calculateFocusConsistency = (focusMetrics: any[]) => {
    if (focusMetrics.length < 2) return 50; // Default moderate consistency
    
    const scores = focusMetrics.map(m => m.attentionScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    return Math.max(0, Math.min(100, 100 - (standardDeviation * 2)));
  };

  const analyzeAttentionPatterns = (focusMetrics: any[]) => {
    const patterns = {
      morningFocus: 0,
      afternoonFocus: 0,
      eveningFocus: 0,
      peakHours: [] as number[],
      lowEnergyHours: [] as number[]
    };

    const hourlyScores: { [hour: number]: number[] } = {};

    focusMetrics.forEach(metric => {
      const hour = metric.timestamp.getHours();
      if (!hourlyScores[hour]) hourlyScores[hour] = [];
      hourlyScores[hour].push(metric.attentionScore);
    });

    Object.entries(hourlyScores).forEach(([hour, scores]) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const hourNum = parseInt(hour);
      
      if (hourNum >= 6 && hourNum < 12) patterns.morningFocus += avgScore;
      else if (hourNum >= 12 && hourNum < 18) patterns.afternoonFocus += avgScore;
      else if (hourNum >= 18 && hourNum < 24) patterns.eveningFocus += avgScore;
      
      if (avgScore > 80) patterns.peakHours.push(hourNum);
      if (avgScore < 50) patterns.lowEnergyHours.push(hourNum);
    });

    return patterns;
  };

  const calculateFocusTrend = (focusMetrics: any[]) => {
    if (focusMetrics.length < 5) return 0; // Need sufficient data
    
    const sortedMetrics = [...focusMetrics].sort((a, b) => a.timestamp - b.timestamp);
    const firstHalf = sortedMetrics.slice(0, Math.floor(sortedMetrics.length / 2));
    const secondHalf = sortedMetrics.slice(Math.floor(sortedMetrics.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, m) => sum + m.attentionScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.attentionScore, 0) / secondHalf.length;
    
    return secondAvg - firstAvg; // Positive = improving, negative = declining
  };

  // Calculate enhanced analytics from real data
  const analytics = useMemo(() => {
    const now = new Date();
    const periodStart = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Filter data by selected period
    const periodSessions = sessionHistory.filter(session => 
      session.timestamp >= periodStart
    );
    
    const periodTodos = todos.filter(todo => 
      todo.createdAt >= periodStart
    );

    // Filter focus metrics by period
    const periodFocusMetrics = metrics.filter(metric => 
      metric.timestamp >= periodStart
    );

    // Calculate comprehensive metrics
    const focusSessions = periodSessions.filter(s => s.type === 'focus');
    const completedTodos = periodTodos.filter(t => t.completed);
    const totalFocusTime = focusSessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Enhanced focus score calculation using both sessions and real-time metrics
    const sessionFocusScore = focusSessions.length > 0 
      ? focusSessions.reduce((sum, session) => sum + (session.focusScore || 0), 0) / focusSessions.length
      : 0;
      
    const metricsFocusScore = periodFocusMetrics.length > 0
      ? periodFocusMetrics.reduce((sum, metric) => sum + metric.attentionScore, 0) / periodFocusMetrics.length
      : 0;
      
    const averageFocusScore = periodFocusMetrics.length > 0 ? metricsFocusScore : sessionFocusScore;

    // Calculate focus consistency (how stable focus levels are)
    const focusConsistency = calculateFocusConsistency(periodFocusMetrics);
    
    // Calculate attention patterns
    const attentionPatterns = analyzeAttentionPatterns(periodFocusMetrics);
    
    // Calculate focus improvement trend
    const focusTrend = calculateFocusTrend(periodFocusMetrics);
    
    // Generate daily trends
    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const daySessions = periodSessions.filter(s => 
        s.timestamp.toDateString() === date.toDateString()
      );
      const dayFocusSessions = daySessions.filter(s => s.type === 'focus');
      const dayScore = dayFocusSessions.length > 0
        ? dayFocusSessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / dayFocusSessions.length
        : 0;
      
      dailyTrends.push({
        date: date.toISOString().split('T')[0],
        score: Math.round(dayScore),
        sessions: dayFocusSessions.length
      });
    }

    return {
      totalSessions: focusSessions.length,
      totalFocusTime,
      averageFocusScore: Math.round(averageFocusScore),
      completedTasks: completedTodos.length,
      totalTasks: periodTodos.length,
      completionRate: periodTodos.length > 0 ? Math.round((completedTodos.length / periodTodos.length) * 100) : 0,
      dailyTrends,
      focusSessions,
      completedTodos,
      currentFocusScore: focusScore,
      isCurrentlyTracking: isTracking,
      // Enhanced focus metrics
      focusConsistency: Math.round(focusConsistency),
      attentionPatterns,
      focusTrend: Math.round(focusTrend),
      totalFocusMetrics: periodFocusMetrics.length,
      eyeContactRate: periodFocusMetrics.length > 0 
        ? Math.round((periodFocusMetrics.filter(m => m.eyeContact).length / periodFocusMetrics.length) * 100)
        : 0,
      averageDistractions: periodFocusMetrics.length > 0
        ? Math.round(periodFocusMetrics.reduce((sum, m) => sum + m.distractions, 0) / periodFocusMetrics.length)
        : 0
    };
  }, [sessionHistory, todos, selectedPeriod, focusScore, isTracking, metrics]);

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Layout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Analytics Dashboard 📊
              </h1>
              <p className="text-blue-100">
                Track your productivity and focus patterns with real data
              </p>
            </div>
            
            {/* Period Selector */}
            <div className="flex bg-white/20 rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Focus Sessions</p>
                <p className="text-3xl font-bold text-blue-600">
                  {analytics.totalSessions}
                </p>
              </div>
              <Timer className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(analytics.totalFocusTime)} total
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tasks Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {analytics.completedTasks}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Target className="w-4 h-4 mr-1" />
                {analytics.completionRate}% completion rate
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Focus Score</p>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics.averageFocusScore}%
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Activity className="w-4 h-4 mr-1" />
                {analytics.isCurrentlyTracking ? 'Currently tracking' : 'Not tracking'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Focus</p>
                <p className="text-3xl font-bold text-orange-600">
                  {analytics.currentFocusScore}%
                </p>
              </div>
              <Eye className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                Real-time tracking
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Focus Analytics */}
        <motion.div
          key={`enhanced-focus-${selectedPeriod}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Focus Consistency */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Focus Consistency</h3>
                <p className="text-3xl font-bold">{analytics.focusConsistency}%</p>
              </div>
              <Activity className="w-8 h-8 text-white/80" />
            </div>
            <div className="text-indigo-100">
              <p className="text-sm">
                {analytics.focusConsistency > 80 ? 'Excellent stability' :
                 analytics.focusConsistency > 60 ? 'Good consistency' :
                 analytics.focusConsistency > 40 ? 'Moderate variation' :
                 'High variability'}
              </p>
            </div>
          </div>

          {/* Focus Trend */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Focus Trend</h3>
                <p className="text-3xl font-bold">
                  {analytics.focusTrend > 0 ? '+' : ''}{analytics.focusTrend}%
                </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${analytics.focusTrend >= 0 ? 'text-white/80' : 'text-red-300 rotate-180'}`} />
            </div>
            <div className="text-emerald-100">
              <p className="text-sm">
                {analytics.focusTrend > 10 ? 'Strong improvement' :
                 analytics.focusTrend > 0 ? 'Slight improvement' :
                 analytics.focusTrend > -10 ? 'Slight decline' :
                 'Needs attention'}
              </p>
            </div>
          </div>

          {/* Eye Contact Rate */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Attention Rate</h3>
                <p className="text-3xl font-bold">{analytics.eyeContactRate}%</p>
              </div>
              <Eye className="w-8 h-8 text-white/80" />
            </div>
            <div className="text-orange-100">
              <p className="text-sm">
                {analytics.totalFocusMetrics} tracking sessions • 
                Avg {analytics.averageDistractions} distractions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Focus Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Focus Tracking Controls</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-600">
                {isTracking ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Current Session</h3>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Real-time Focus Score</span>
                <span className="font-bold text-lg text-blue-600">{focusScore}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${isTracking ? 'text-green-600' : 'text-gray-500'}`}>
                  {isTracking ? 'Tracking Active' : 'Not Tracking'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Controls</h3>
              <div className="space-y-3">
                {!isTracking ? (
                  <button
                    onClick={startTracking}
                    disabled={focusLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {focusLoading ? 'Starting...' : 'Start Focus Tracking'}
                  </button>
                ) : (
                  <button
                    onClick={stopTracking}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Stop Focus Tracking
                  </button>
                )}
                
                {focusError && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {focusError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Focus Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Daily Focus Trends</h2>
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.dailyTrends.map((trend, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '200px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(trend.score, 5)}px` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="w-full bg-linear-to-t from-blue-500 to-blue-400 rounded-t-lg"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {formatDate(trend.date)}
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {trend.score}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {trend.sessions} sessions
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Task Completion Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Task Completion</h2>
              <PieChart className="w-6 h-6 text-green-500" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Completed Tasks</span>
                </div>
                <span className="font-semibold text-gray-800">{analytics.completedTasks}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-gray-700">Pending Tasks</span>
                </div>
                <span className="font-semibold text-gray-800">{analytics.totalTasks - analytics.completedTasks}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Completion Rate</span>
                <span>{analytics.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analytics.completionRate}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-linear-to-r from-green-500 to-green-400 h-3 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Attention Patterns Analysis */}
        {analytics.attentionPatterns && (
          <motion.div
            key={`attention-patterns-${selectedPeriod}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Attention Patterns</h2>
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Time of Day Performance */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Performance by Time</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Morning (6-12)</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, analytics.attentionPatterns.morningFocus / 10)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(analytics.attentionPatterns.morningFocus / 10)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Afternoon (12-18)</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, analytics.attentionPatterns.afternoonFocus / 10)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(analytics.attentionPatterns.afternoonFocus / 10)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Evening (18-24)</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, analytics.attentionPatterns.eveningFocus / 10)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(analytics.attentionPatterns.eveningFocus / 10)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Peak Performance Hours */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Peak Hours</h3>
                <div className="space-y-2">
                  {analytics.attentionPatterns.peakHours.length > 0 ? (
                    analytics.attentionPatterns.peakHours.slice(0, 3).map((hour: number) => (
                      <div key={hour} className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <span className="text-sm text-green-700">
                          {hour}:00 - {hour + 1}:00
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          High Focus
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No peak hours identified yet</p>
                  )}
                </div>
              </div>
              
              {/* Low Energy Hours */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Low Energy Hours</h3>
                <div className="space-y-2">
                  {analytics.attentionPatterns.lowEnergyHours.length > 0 ? (
                    analytics.attentionPatterns.lowEnergyHours.slice(0, 3).map((hour: number) => (
                      <div key={hour} className="flex items-center justify-between bg-red-50 p-2 rounded">
                        <span className="text-sm text-red-700">
                          {hour}:00 - {hour + 1}:00
                        </span>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Low Focus
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No low energy periods identified</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Current Session Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Current Session</h2>
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Timer Status</p>
                  <p className="font-semibold text-gray-800">
                    {pomodoroContext.isRunning ? 'Running' : 'Stopped'}
                  </p>
                </div>
                <Timer className="w-5 h-5 text-blue-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Session Type</p>
                  <p className="font-semibold text-gray-800">
                    {pomodoroContext.isFocus ? 'Focus Session' : 'Break'}
                  </p>
                </div>
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Time Remaining</p>
                  <p className="font-semibold text-gray-800">
                    {Math.floor(pomodoroContext.timeLeft / 60)}:{(pomodoroContext.timeLeft % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <Target className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Focus Tracking Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Focus Tracking</h2>
              <Brain className="w-6 h-6 text-orange-500" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Tracking Status</p>
                  <p className="font-semibold text-gray-800">
                    {isTracking ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Current Score</p>
                  <p className="font-semibold text-gray-800">
                    {focusScore}%
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Metrics Collected</p>
                  <p className="font-semibold text-gray-800">
                    {metrics.length} data points
                  </p>
                </div>
                <BarChart3 className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-linear-to-r from-gray-50 to-blue-50 rounded-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{analytics.totalSessions}</div>
              <div className="text-sm text-gray-600">Focus Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{analytics.completedTasks}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">{analytics.averageFocusScore}%</div>
              <div className="text-sm text-gray-600">Average Focus Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">{formatTime(analytics.totalFocusTime)}</div>
              <div className="text-sm text-gray-600">Total Focus Time</div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
