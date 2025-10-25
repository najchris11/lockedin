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
import { User } from '@/types';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { useTodo } from '@/hooks/useTodo';
import { useFocus } from '@/hooks/useFocus';

interface SessionHistory {
  id: string;
  type: 'focus' | 'break';
  duration: number;
  completed: boolean;
  timestamp: Date;
  focusScore?: number;
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const router = useRouter();

  // Get data from existing hooks
  const pomodoroContext = usePomodoroContext();
  const { todos, loading: todosLoading } = useTodo(user?.id || '');
  const { focusScore, metrics, isTracking } = useFocus(user?.id || '');

  // Mock authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const mockUser: User = {
          id: 'mock_user_id',
          email: 'user@example.com',
          displayName: 'Demo User',
          photoURL: undefined,
          createdAt: new Date()
        };
        
        setUser(mockUser);
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

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

  // Calculate analytics from real data
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

    // Calculate metrics
    const focusSessions = periodSessions.filter(s => s.type === 'focus');
    const completedTodos = periodTodos.filter(t => t.completed);
    const totalFocusTime = focusSessions.reduce((sum, session) => sum + session.duration, 0);
    const averageFocusScore = focusSessions.length > 0 
      ? focusSessions.reduce((sum, session) => sum + (session.focusScore || 0), 0) / focusSessions.length
      : 0;
    
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
      isCurrentlyTracking: isTracking
    };
  }, [sessionHistory, todos, selectedPeriod, focusScore, isTracking]);

  if (loading) {
    return (
      <Layout user={user} onAuthChange={setUser}>
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
    <Layout user={user} onAuthChange={setUser}>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
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
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg"
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
                  className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>

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
          className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6"
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
