'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Clock, Settings, ChevronDown } from 'lucide-react';
import { usePomodoroContext } from '@/contexts/PomodoroContext';

export const NavbarTimer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalTime = isFocus ? settings.focusDuration * 60 : settings.breakDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getSessionType = (): string => {
    if (isFocus) {
      return 'Focus';
    } else {
      const isLongBreak = sessionCount > 0 && sessionCount % settings.longBreakInterval === 0;
      return isLongBreak ? 'Long Break' : 'Break';
    }
  };

  const SettingsPanel = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full right-0 mt-2 w-72 p-4 bg-white rounded-lg shadow-lg border z-50"
    >
      <h3 className="text-lg font-semibold mb-4">Timer Settings</h3>
      
      <div className="space-y-3">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t">
        <div className="text-xs text-gray-500 mb-2">
          Sessions completed: {Math.floor(sessionCount / 2)}
        </div>
        <div className="text-xs text-gray-400">
          <strong>Keyboard Shortcuts:</strong><br />
          Spacebar: Start/Pause • Esc: Pause<br />
          Ctrl+R: Reset • Ctrl+S: Skip
        </div>
      </div>
    </motion.div>
  );

  const TimerControls = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full right-0 mt-2 w-64 p-4 bg-white rounded-lg shadow-lg border z-50"
    >
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {formatTime(timeLeft)}
        </div>
        <div className={`text-sm font-medium ${
          isFocus ? 'text-blue-600' : 'text-green-600'
        }`}>
          {getSessionType()} Session
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <motion.div
            className={`h-2 rounded-full ${
              isFocus ? 'bg-blue-500' : 'bg-green-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${getProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRunning ? pauseTimer : startTimer}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
            isRunning
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={skipSession}
          className="flex items-center gap-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
        >
          <SkipForward className="w-4 h-4" />
          Skip
        </motion.button>
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-gray-500 text-center">
        Sessions completed: {Math.floor(sessionCount / 2)}
      </div>
    </motion.div>
  );

  return (
    <div className="relative">
      {/* Main Timer Display */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
          isRunning
            ? isFocus 
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-green-50 border-green-200 text-green-600'
            : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}
      >
        <Clock className={`w-4 h-4 ${
          isRunning 
            ? isFocus ? 'text-blue-600' : 'text-green-600'
            : 'text-gray-500'
        }`} />
        
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">
            {formatTime(timeLeft)}
          </span>
          {isRunning && (
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isFocus ? 'bg-blue-500' : 'bg-green-500'
            }`} />
          )}
        </div>

        <ChevronDown className={`w-4 h-4 transition-transform ${
          isExpanded ? 'rotate-180' : ''
        }`} />
      </motion.button>

      {/* Quick Controls (always visible when running) */}
      {isRunning && !isExpanded && (
        <div className="absolute top-full right-0 mt-1 flex gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={pauseTimer}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Pause Timer"
          >
            <Pause className="w-3 h-3" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            title="Timer Settings"
          >
            <Settings className="w-3 h-3" />
          </motion.button>
        </div>
      )}

      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-2 -right-8 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Timer Settings"
      >
        <Settings className="w-4 h-4" />
      </motion.button>

      {/* Expanded Controls */}
      <AnimatePresence>
        {isExpanded && <TimerControls />}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && <SettingsPanel />}
      </AnimatePresence>
    </div>
  );
};