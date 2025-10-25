// PomodoroTimer component for focus sessions
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Settings } from 'lucide-react';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { useMusic } from '@/hooks/useMusic';

interface PomodoroTimerProps {
  userId: string;
  className?: string;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ userId, className = '' }) => {
  const [showSettings, setShowSettings] = useState(false);

  const {
    isRunning,
    isFocus,
    timeLeft,
    sessionCount,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    updateSettings
  } = usePomodoroContext();

  const { play, pause, setPlaylist } = useMusic(userId);

  // TODO: Implement auto-music integration
  useEffect(() => {
    if (isRunning && isFocus) {
      // Start focus music when focus session begins
      setPlaylist('focus_classical');
      play();
    } else if (isRunning && !isFocus) {
      // Start break music when break begins
      setPlaylist('focus_ambient');
      play();
    } else {
      // Pause music when timer stops
      pause();
    }
  }, [isRunning, isFocus, setPlaylist, play, pause]);

  // TODO: Implement time formatting
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // TODO: Implement progress calculation
  const getProgress = (): number => {
    const totalTime = isFocus ? settings.focusDuration * 60 : settings.breakDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // TODO: Implement session type display
  const getSessionType = (): string => {
    if (isFocus) {
      return `Focus Session ${Math.floor(sessionCount / 2) + 1}`;
    } else {
      const isLongBreak = sessionCount > 0 && sessionCount % settings.longBreakInterval === 0;
      return isLongBreak ? 'Long Break' : 'Short Break';
    }
  };

  // TODO: Implement settings panel
  const SettingsPanel = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border z-10"
    >
      <h3 className="text-lg font-semibold mb-4">Timer Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Focus Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={settings.focusDuration}
            onChange={(e) => updateSettings({ 
              focusDuration: parseInt(e.target.value) || 25 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Break Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.breakDuration}
            onChange={(e) => updateSettings({ 
              breakDuration: parseInt(e.target.value) || 5 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Long Break Duration (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="60"
            value={settings.longBreakDuration}
            onChange={(e) => updateSettings({ 
              longBreakDuration: parseInt(e.target.value) || 15 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Long Break Interval (sessions)
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={settings.longBreakInterval}
            onChange={(e) => updateSettings({ 
              longBreakInterval: parseInt(e.target.value) || 4 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pomodoro Timer</h2>
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          
          <AnimatePresence>
            {showSettings && <SettingsPanel />}
          </AnimatePresence>
        </div>
      </div>

      {/* TODO: Implement circular progress indicator */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-64 h-64 mb-6">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={isFocus ? 'text-blue-500' : 'text-green-500'}
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - getProgress() / 100) }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </svg>
          
          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={timeLeft}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-gray-800"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <div className={`text-lg font-medium ${
              isFocus ? 'text-blue-600' : 'text-green-600'
            }`}>
              {getSessionType()}
            </div>
          </div>
        </div>

        {/* TODO: Implement session counter */}
        <div className="text-sm text-gray-500">
          Sessions completed: {Math.floor(sessionCount / 2)}
        </div>
      </div>

      {/* TODO: Implement control buttons */}
      <div className="flex justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRunning ? pauseTimer : startTimer}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={skipSession}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <SkipForward className="w-5 h-5" />
          Skip
        </motion.button>
      </div>

      {/* TODO: Implement focus tips */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Focus Tips</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Put your phone in another room</li>
          <li>• Close unnecessary browser tabs</li>
          <li>• Use headphones to block distractions</li>
          <li>• Take breaks to maintain productivity</li>
        </ul>
      </div>
    </div>
  );
};
