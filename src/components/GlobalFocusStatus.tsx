// Global Focus Status component for navigation bar
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Activity, Brain } from 'lucide-react';
import { useFocusContext } from '@/contexts/FocusContext';

export const GlobalFocusStatus: React.FC = () => {
  const { isTracking, focusScore, error } = useFocusContext();

  const getFocusColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getFocusText = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
      >
        <EyeOff className="w-4 h-4" />
        <span>Focus Error</span>
      </motion.div>
    );
  }

  if (!isTracking) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
      >
        <EyeOff className="w-4 h-4" />
        <span>Not Tracking</span>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`focus-${Math.floor(focusScore / 20)}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="flex items-center space-x-2 bg-white shadow-sm border px-3 py-1 rounded-full text-sm"
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Eye className="w-4 h-4 text-gray-600" />
            <motion.div
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getFocusColor(focusScore)}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="font-medium text-gray-700">{focusScore}%</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{getFocusText(focusScore)}</span>
          </div>
        </div>
        
        {/* Animated focus indicator */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Activity className="w-4 h-4 text-blue-500" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};