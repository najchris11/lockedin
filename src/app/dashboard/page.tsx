// Dashboard page for authenticated users
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { TodoList } from './components/TodoList';
import { PomodoroTimer } from './components/PomodoroTimer';
import { FocusTracker } from './components/FocusTracker';
import { MusicPlayer } from './components/MusicPlayer';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <Layout user={user}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.displayName || 'User'}! 👋
          </h1>
          <p className="text-blue-100">
            Ready to stay focused and productive today? Let's make it count!
          </p>
        </motion.div>

        {/* Main Dashboard Grid - Mobile First */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-6 lg:space-y-8">
            {/* Pomodoro Timer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <PomodoroTimer userId={user.id} />
            </motion.div>

            {/* Focus Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FocusTracker userId={user.id} />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:space-y-8">
            {/* Todo List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <TodoList userId={user.id} />
            </motion.div>

            {/* Music Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <MusicPlayer userId={user.id} />
            </motion.div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Progress</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Focus Sessions Completed */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">0</div>
              <div className="text-xs lg:text-sm text-gray-600">Focus Sessions</div>
            </div>

            {/* Tasks Completed */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">0</div>
              <div className="text-xs lg:text-sm text-gray-600">Tasks Completed</div>
            </div>

            {/* Focus Score */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-1">0%</div>
              <div className="text-xs lg:text-sm text-gray-600">Average Focus</div>
            </div>

            {/* Time Focused */}
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl lg:text-3xl font-bold text-orange-600 mb-1">0h</div>
              <div className="text-xs lg:text-sm text-gray-600">Time Focused</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-left"
            >
              <div className="text-blue-600 font-semibold mb-1 text-sm lg:text-base">Start Focus Session</div>
              <div className="text-xs lg:text-sm text-blue-500">Begin a 25-minute focus timer</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-left"
            >
              <div className="text-green-600 font-semibold mb-1 text-sm lg:text-base">Add New Task</div>
              <div className="text-xs lg:text-sm text-green-500">Create a new to-do item</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-left sm:col-span-2 lg:col-span-1"
            >
              <div className="text-purple-600 font-semibold mb-1 text-sm lg:text-base">View Analytics</div>
              <div className="text-xs lg:text-sm text-purple-500">Check your productivity insights</div>
            </motion.button>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-linear-to-r from-gray-50 to-blue-50 rounded-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 Productivity Tip</h2>
          <p className="text-gray-700 text-lg">
            "The Pomodoro Technique works best when you eliminate all distractions during focus sessions. 
            Put your phone in another room, close unnecessary browser tabs, and let LockIn help you stay on track!"
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
