// FocusTracker component for webcam-based focus monitoring
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFocusContext } from '@/contexts/FocusContext';

interface FocusTrackerProps {
  userId: string;
  className?: string;
}

export const FocusTracker: React.FC<FocusTrackerProps> = ({ userId, className = '' }) => {
  const {
    isTracking,
    focusScore,
    startTracking,
    stopTracking,
    metrics,
    loading,
    error
  } = useFocusContext();

  const [permissionDenied, setPermissionDenied] = useState(false);

  // Check camera permission on mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionDenied(false);
      } catch (err) {
        console.error('Camera permission denied:', err);
        setPermissionDenied(true);
      }
    };

    checkCameraPermission();
  }, []);

  // TODO: Implement focus score visualization
  const getFocusColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getFocusStatus = (score: number): { icon: React.ReactNode; text: string; color: string } => {
    if (score >= 80) {
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        text: 'Excellent Focus',
        color: 'text-green-500'
      };
    } else if (score >= 60) {
      return {
        icon: <Eye className="w-5 h-5" />,
        text: 'Good Focus',
        color: 'text-yellow-500'
      };
    } else if (score >= 40) {
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        text: 'Fair Focus',
        color: 'text-orange-500'
      };
    } else {
      return {
        icon: <EyeOff className="w-5 h-5" />,
        text: 'Poor Focus',
        color: 'text-red-500'
      };
    }
  };

  // Display recent metrics
  const recentMetrics = metrics.slice(-5).reverse();

  const handleStartTracking = async () => {
    try {
      await startTracking();
    } catch (err) {
      console.error('Failed to start tracking:', err);
    }
  };

  if (permissionDenied) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Camera Access Required</h2>
          <p className="text-gray-600 mb-4">
            Please enable camera access to use focus tracking features.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh & Grant Permission
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Focus Tracker</h2>
        <div className="flex items-center gap-2">
          {isTracking && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Recording
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* TODO: Implement focus score display */}
      <div className="text-center mb-8">
        <div className="relative w-48 h-48 mx-auto mb-4">
          {/* Circular progress */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={getFocusColor(focusScore)}
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - focusScore / 100)}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - focusScore / 100) }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </svg>
          
          {/* Score display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={focusScore}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`text-3xl font-bold ${getFocusColor(focusScore)}`}
            >
              {Math.round(focusScore)}
            </motion.div>
            <div className="text-sm text-gray-500">Focus Score</div>
          </div>
        </div>

        {/* Focus status */}
        <div className={`flex items-center justify-center gap-2 ${getFocusColor(focusScore)}`}>
          {getFocusStatus(focusScore).icon}
          <span className="font-medium">{getFocusStatus(focusScore).text}</span>
        </div>
      </div>

      {/* TODO: Implement control buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isTracking ? stopTracking : handleStartTracking}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isTracking
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isTracking ? (
            <>
              <CameraOff className="w-5 h-5" />
              Stop Tracking
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Start Tracking
            </>
          )}
        </motion.button>
      </div>

      {/* Video preview removed - using behavioral tracking */}

      {/* TODO: Implement recent metrics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        
        {recentMetrics.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentMetrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    metric.attentionScore >= 80 ? 'bg-green-500' :
                    metric.attentionScore >= 60 ? 'bg-yellow-500' :
                    metric.attentionScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {Math.round(metric.attentionScore)}% Focus
                    </div>
                    <div className="text-xs text-gray-500">
                      {metric.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {metric.distractions} distractions
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Start tracking to see your focus metrics</p>
          </div>
        )}
      </div>

      {/* TODO: Implement focus tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Focus Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Maintain eye contact with your screen</li>
          <li>• Sit up straight and maintain good posture</li>
          <li>• Minimize distractions in your environment</li>
          <li>• Take breaks when your focus score drops</li>
        </ul>
      </div>
    </div>
  );
};
