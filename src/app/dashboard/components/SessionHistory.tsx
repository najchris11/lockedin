// Session History component for displaying statistics
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar, 
  Download, 
  RefreshCw,
  Award,
  BarChart3,
  Zap
} from 'lucide-react';
import { useSessionHistory } from '@/hooks/useSessionHistory';

interface SessionHistoryProps {
  userId: string;
  className?: string;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ userId, className = '' }) => {
  const {
    sessions,
    stats,
    dailyStats,
    weeklyStats,
    loading,
    error,
    refreshStats,
    exportSessionData
  } = useSessionHistory(userId);

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [isExporting, setIsExporting] = useState(false);

  // Refresh stats when component mounts
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true);
      const data = await exportSessionData(format);
      
      // Create and download file
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `session-history.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-dark-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-dark-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-red-500">
          <p>Failed to load session history</p>
          <button 
            onClick={refreshStats}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Session History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your productivity progress
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            onClick={refreshStats}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalSessions}
                </div>
                <div className="text-sm text-blue-500 dark:text-blue-300">
                  Total Sessions
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(stats.totalFocusTime)}m
                </div>
                <div className="text-sm text-green-500 dark:text-green-300">
                  Focus Time
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(stats.averageFocusScore)}%
                </div>
                <div className="text-sm text-purple-500 dark:text-purple-300">
                  Avg Focus Score
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.currentStreak}
                </div>
                <div className="text-sm text-orange-500 dark:text-orange-300">
                  Current Streak
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Detailed Statistics */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              This Week
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Sessions Completed</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.sessionsThisWeek}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Focus Time</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(stats.totalFocusTime)} minutes
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Average Session</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(stats.averageSessionLength)} minutes
                </span>
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Achievements
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Longest Streak
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.longestStreak} sessions
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Best Focus Score
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(stats.bestFocusScore)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Most Productive Day
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.mostProductiveDay}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Sessions
        </h3>
        <div className="space-y-2">
          {sessions.slice(0, 5).map((session, index) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  session.type === 'focus' 
                    ? 'bg-blue-500' 
                    : 'bg-green-500'
                }`} />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {session.type === 'focus' ? 'Focus Session' : 'Break'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(session.startTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {session.duration} min
                </div>
                {session.focusScore !== undefined && session.focusScore > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(session.focusScore)}% focus
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
