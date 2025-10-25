// Google Cloud Platform integration for focus analytics
import { FocusMetrics, PomodoroSession } from '@/types';

// GCP Configuration
const GCP_PROJECT_ID = process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'qwiklabs-gcp-02-722b4bd68f49';
const GCP_REGION = process.env.NEXT_PUBLIC_GCP_REGION || 'us-central1';
const GCP_FUNCTIONS_URL = `https://${GCP_REGION}-${GCP_PROJECT_ID}.cloudfunctions.net`;

// Analytics data interfaces
interface AnalyticsResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface FocusAnalytics {
  averageFocusScore: number;
  totalSessions: number;
  totalFocusTime: number;
  focusTrends: Array<{ date: string; score: number }>;
  bestFocusTimes: string[];
  distractionPatterns: string[];
  recommendations: string[];
}

interface ProductivityInsights {
  bestFocusTimes: string[];
  averageSessionLength: number;
  distractionPatterns: string[];
  recommendations: string[];
  weeklyTrends: Array<{ day: string; productivity: number }>;
  focusScoreDistribution: Array<{ range: string; count: number }>;
}

// Helper function to make authenticated requests to Cloud Functions
const makeAuthenticatedRequest = async (endpoint: string, data: any): Promise<AnalyticsResponse> => {
  try {
    const response = await fetch(`${GCP_FUNCTIONS_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get authentication token for GCP requests
const getAuthToken = async (): Promise<string> => {
  // In a real implementation, you'd get this from Firebase Auth
  // For now, we'll use a placeholder
  return 'placeholder-token';
};

// Store focus metrics in BigQuery via Cloud Function
export const storeFocusMetrics = async (metrics: FocusMetrics): Promise<void> => {
  console.log('Storing focus metrics:', metrics);
  
  const response = await makeAuthenticatedRequest('storeFocusMetrics', {
    userId: metrics.userId,
    sessionId: metrics.sessionId,
    timestamp: new Date().toISOString(),
    focusScore: metrics.attentionScore,
    eyeContactTime: metrics.eyeContact ? 1 : 0,
    distractionCount: metrics.distractions,
    postureScore: metrics.posture === 'good' ? 100 : metrics.posture === 'fair' ? 50 : 0,
    environmentData: { posture: metrics.posture, eyeContact: metrics.eyeContact }
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to store focus metrics');
  }
};

// Store Pomodoro session data in BigQuery via Cloud Function
export const storePomodoroSession = async (session: PomodoroSession): Promise<void> => {
  console.log('Storing pomodoro session:', session);
  
  const response = await makeAuthenticatedRequest('storePomodoroSession', {
    userId: session.userId,
    sessionId: session.id,
    startTime: session.startTime.toISOString(),
    endTime: session.endTime?.toISOString(),
    duration: session.duration,
    type: session.type,
    completed: session.completed,
    focusScore: session.focusScore || 0,
    distractions: [],
    breakActivities: []
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to store pomodoro session');
  }
};

// Get comprehensive focus analytics from BigQuery
export const getFocusAnalytics = async (userId: string, dateRange: { start: Date; end: Date }): Promise<FocusAnalytics> => {
  console.log('Fetching focus analytics for user:', userId, 'range:', dateRange);
  
  const response = await makeAuthenticatedRequest('getFocusAnalytics', {
    userId,
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString()
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch focus analytics');
  }

  return response.data;
};

// Get AI-powered productivity insights
export const getProductivityInsights = async (userId: string): Promise<ProductivityInsights> => {
  console.log('Generating productivity insights for user:', userId);
  
  const response = await makeAuthenticatedRequest('getProductivityInsights', {
    userId,
    analysisPeriod: '30d' // Last 30 days
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to generate productivity insights');
  }

  return response.data;
};

// Get real-time focus score for current session
export const getCurrentFocusScore = async (userId: string, sessionId: string): Promise<number> => {
  const response = await makeAuthenticatedRequest('getCurrentFocusScore', {
    userId,
    sessionId
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to get current focus score');
  }

  return response.data.focusScore;
};

// Store distraction event for analysis
export const storeDistractionEvent = async (userId: string, sessionId: string, distractionType: string): Promise<void> => {
  const response = await makeAuthenticatedRequest('storeDistractionEvent', {
    userId,
    sessionId,
    distractionType,
    timestamp: new Date().toISOString()
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to store distraction event');
  }
};

// Get weekly productivity trends
export const getWeeklyTrends = async (userId: string): Promise<Array<{ day: string; productivity: number; focusTime: number }>> => {
  const response = await makeAuthenticatedRequest('getWeeklyTrends', {
    userId,
    weeks: 4 // Last 4 weeks
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to get weekly trends');
  }

  return response.data;
};

// Export analytics data for user
export const exportAnalyticsData = async (userId: string, format: 'csv' | 'json' = 'json'): Promise<string> => {
  const response = await makeAuthenticatedRequest('exportAnalyticsData', {
    userId,
    format
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to export analytics data');
  }

  return response.data.downloadUrl;
};

// TODO: Set up environment variables in .env.local:
// NEXT_PUBLIC_GCP_PROJECT_ID=your_gcp_project_id
// NEXT_PUBLIC_GCP_REGION=us-central1
