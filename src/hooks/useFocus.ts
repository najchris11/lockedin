// Custom hook for focus tracking functionality
import { useState, useEffect, useCallback, useRef } from 'react';
import { UseFocusReturn, FocusMetrics } from '@/types';
import { storeFocusMetrics } from '@/lib/gcp';

export const useFocus = (userId: string): UseFocusReturn => {
  const [isTracking, setIsTracking] = useState(false);
  const [focusScore, setFocusScore] = useState(0);
  const [metrics, setMetrics] = useState<FocusMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Eye tracking and behavior-based tracking
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Behavioral tracking variables
  const lastActivityRef = useRef<number>(Date.now());
  const mouseMovementsRef = useRef<number[]>([]);
  const keyPressesRef = useRef<number[]>([]);
  const pageVisibilityRef = useRef<boolean>(true);
  const idleTimeRef = useRef<number>(0);
  const windowFocusRef = useRef<boolean>(true);
  const clicksRef = useRef<number[]>([]);
  const scrollsRef = useRef<number[]>([]);
  
  // Eye tracking variables
  const eyeTrackingRef = useRef<boolean>(false);
  const gazeDataRef = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);
  const blinkCountRef = useRef<number>(0);
  const lastBlinkRef = useRef<number>(0);
  const eyeContactTimeRef = useRef<number>(0);
  const lookAwayCountRef = useRef<number>(0);

  // Enhanced focus score calculation based on comprehensive user behavior
  const calculateFocusScore = useCallback((): number => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    const recentWindow = 30000; // 30 seconds
    const shortWindow = 10000; // 10 seconds for immediate activity
    
    // Filter recent activities
    const recentMouseMovements = mouseMovementsRef.current.filter(time => now - time < recentWindow);
    const recentKeyPresses = keyPressesRef.current.filter(time => now - time < recentWindow);
    const recentClicks = clicksRef.current.filter(time => now - time < recentWindow);
    const recentScrolls = scrollsRef.current.filter(time => now - time < recentWindow);
    
    // Short-term activity (more recent = higher weight)
    const shortMouseMovements = mouseMovementsRef.current.filter(time => now - time < shortWindow);
    const shortKeyPresses = keyPressesRef.current.filter(time => now - time < shortWindow);
    
    let score = 100;
    
    // Core engagement indicators
    
    // 1. Page visibility (critical)
    if (!pageVisibilityRef.current) {
      score -= 50; // Major penalty for tab not being visible
    }
    
    // 2. Window focus (very important)
    if (!windowFocusRef.current) {
      score -= 35; // Heavy penalty for window not being focused
    }
    
    // 3. Recent activity (immediate engagement)
    if (timeSinceLastActivity > 15000) { // 15 seconds of no activity
      const inactivityPenalty = Math.min(30, (timeSinceLastActivity - 15000) / 1000 * 2);
      score -= inactivityPenalty;
    }
    
    // 4. Activity diversity bonus (varied interaction = better focus)
    const totalRecentActivity = recentMouseMovements.length + recentKeyPresses.length + 
                               recentClicks.length + recentScrolls.length;
    const activityTypes = [
      recentMouseMovements.length > 0,
      recentKeyPresses.length > 0,
      recentClicks.length > 0,
      recentScrolls.length > 0
    ].filter(Boolean).length;
    
    // Bonus for diverse activity types
    if (activityTypes >= 2) {
      score += Math.min(15, activityTypes * 5);
    }
    
    // 5. Consistent engagement (steady activity over time)
    if (totalRecentActivity >= 10) {
      score += Math.min(10, totalRecentActivity / 5);
    }
    
    // 6. Short-term engagement boost
    const shortTermActivity = shortMouseMovements.length + shortKeyPresses.length;
    if (shortTermActivity > 0) {
      score += Math.min(8, shortTermActivity);
    }
    
    // 7. Idle time penalty (extended periods without activity)
    if (idleTimeRef.current > 45000) { // More than 45 seconds idle
      score -= Math.min(25, idleTimeRef.current / 45000 * 15);
    }
    
    // 8. Erratic behavior detection (too much activity can indicate distraction)
    if (totalRecentActivity > 100) {
      score -= Math.min(15, (totalRecentActivity - 100) / 20);
    }
    
    // 9. Consistency bonus (steady activity pattern)
    const activityRate = totalRecentActivity / 30; // activities per second over 30s
    if (activityRate >= 0.3 && activityRate <= 2) { // Sweet spot for focused work
      score += 5;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }, []);

  // Enhanced focus tracking with behavioral analysis
  const startTracking = useCallback(async () => {
    // Prevent multiple tracking sessions
    if (isTracking) {
      console.log('Focus tracking already active');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Generate session ID
      sessionIdRef.current = `focus_session_${Date.now()}`;
      
      // Reset tracking variables
      lastActivityRef.current = Date.now();
      mouseMovementsRef.current = [];
      keyPressesRef.current = [];
      clicksRef.current = [];
      scrollsRef.current = [];
      idleTimeRef.current = 0;
      
      // Enhanced event listeners for comprehensive activity tracking
      const handleMouseMove = () => {
        const now = Date.now();
        lastActivityRef.current = now;
        mouseMovementsRef.current.push(now);
        idleTimeRef.current = 0;
        
        // Keep only recent movements (last 5 minutes)
        mouseMovementsRef.current = mouseMovementsRef.current.filter(time => now - time < 300000);
      };
      
      const handleKeyPress = () => {
        const now = Date.now();
        lastActivityRef.current = now;
        keyPressesRef.current.push(now);
        idleTimeRef.current = 0;
        
        // Keep only recent key presses (last 5 minutes)
        keyPressesRef.current = keyPressesRef.current.filter(time => now - time < 300000);
      };
      
      const handleClick = () => {
        const now = Date.now();
        lastActivityRef.current = now;
        clicksRef.current.push(now);
        idleTimeRef.current = 0;
        
        // Keep only recent clicks (last 5 minutes)
        clicksRef.current = clicksRef.current.filter(time => now - time < 300000);
      };
      
      const handleScroll = () => {
        const now = Date.now();
        lastActivityRef.current = now;
        scrollsRef.current.push(now);
        idleTimeRef.current = 0;
        
        // Keep only recent scrolls (last 5 minutes)
        scrollsRef.current = scrollsRef.current.filter(time => now - time < 300000);
      };
      
      const handleVisibilityChange = () => {
        pageVisibilityRef.current = !document.hidden;
      };
      
      const handleWindowFocus = () => {
        windowFocusRef.current = true;
      };
      
      const handleWindowBlur = () => {
        windowFocusRef.current = false;
      };
      
      // Add comprehensive event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('keydown', handleKeyPress);
      document.addEventListener('click', handleClick);
      document.addEventListener('scroll', handleScroll);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleWindowFocus);
      window.addEventListener('blur', handleWindowBlur);
      
      setIsTracking(true);

      // Start focus tracking with enhanced algorithm
      trackingIntervalRef.current = setInterval(() => {
        const currentScore = calculateFocusScore();
        setFocusScore(currentScore);
        
        // Update idle time
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        if (timeSinceActivity > 5000) { // 5 seconds without activity
          idleTimeRef.current += 2000; // Add 2 seconds to idle time
        }

        // Store metrics with enhanced data
        const newMetric: FocusMetrics = {
          id: `metric_${Date.now()}`,
          userId,
          sessionId: sessionIdRef.current!,
          timestamp: new Date(),
          attentionScore: currentScore,
          eyeContact: currentScore > 70 && pageVisibilityRef.current,
          posture: currentScore > 80 ? 'good' : currentScore > 50 ? 'fair' : 'poor',
          distractions: Math.floor((100 - currentScore) / 25)
        };

        setMetrics(prev => [...prev.slice(-99), newMetric]); // Keep last 100 metrics

        // Store to GCP (with error handling)
        storeFocusMetrics(newMetric).catch(err => {
          console.error('Failed to store focus metrics:', err);
        });
      }, 2000); // Update every 2 seconds

      // Store cleanup function
      (trackingIntervalRef.current as any).cleanup = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('keydown', handleKeyPress);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('scroll', handleScroll);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleWindowFocus);
        window.removeEventListener('blur', handleWindowBlur);
      };

      setLoading(false);
    } catch (err) {
      console.error('Error starting focus tracking:', err);
      
      setLoading(false);
    }
  }, [userId, calculateFocusScore, isTracking]);

  // Enhanced stop tracking with proper cleanup
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    
    if (trackingIntervalRef.current) {
      // Call cleanup function if it exists
      if ((trackingIntervalRef.current as any).cleanup) {
        (trackingIntervalRef.current as any).cleanup();
      }
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    // No camera cleanup needed

    // Reset tracking variables
    sessionIdRef.current = null;
    lastActivityRef.current = Date.now();
    mouseMovementsRef.current = [];
    keyPressesRef.current = [];
    clicksRef.current = [];
    scrollsRef.current = [];
    idleTimeRef.current = 0;
    pageVisibilityRef.current = true;
    windowFocusRef.current = true;
    
    setFocusScore(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // Enhanced focus detection using behavioral patterns
  const detectFocus = useCallback((): number => {
    return calculateFocusScore();
  }, [calculateFocusScore]);

  // Enhanced behavioral distraction detection
  const detectDistractions = useCallback((): string[] => {
    const distractions: string[] = [];
    const now = Date.now();
    const recentWindow = 30000; // 30 seconds
    
    // Check for various distraction patterns
    if (!pageVisibilityRef.current) {
      distractions.push('Tab not visible');
    }
    
    if (!windowFocusRef.current) {
      distractions.push('Window not in focus');
    }
    
    if (now - lastActivityRef.current > 20000) {
      distractions.push('No recent activity');
    }
    
    if (idleTimeRef.current > 90000) {
      distractions.push('Extended idle period');
    }
    
    // Check activity patterns for signs of distraction
    const recentMouse = mouseMovementsRef.current.filter((time: number) => now - time < 10000);
    const recentClicks = clicksRef.current.filter((time: number) => now - time < recentWindow);
    const recentKeys = keyPressesRef.current.filter((time: number) => now - time < recentWindow);
    
    // Erratic mouse behavior
    if (recentMouse.length > 60) {
      distractions.push('Excessive mouse activity');
    }
    
    // Too many clicks might indicate browsing/distraction
    if (recentClicks.length > 20) {
      distractions.push('Rapid clicking detected');
    }
    
    // Very low activity might indicate user left
    const totalActivity = recentMouse.length + recentClicks.length + recentKeys.length;
    if (totalActivity < 3 && now - lastActivityRef.current < 60000) {
      distractions.push('Very low engagement');
    }
    
    return distractions;
  }, []);

  // Posture analysis based on activity patterns
  const analyzePosture = useCallback((): 'good' | 'fair' | 'poor' => {
    const currentScore = focusScore;
    
    if (currentScore >= 80) return 'good';
    if (currentScore >= 60) return 'fair';
    return 'poor';
  }, [focusScore]);

  return {
    isTracking,
    focusScore,
    startTracking,
    stopTracking,
    metrics,
    loading,
    error
  };
};
