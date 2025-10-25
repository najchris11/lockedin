// Google Cloud Functions for LockIn Analytics
// Deploy these functions to GCP Cloud Functions

const functions = require('@google-cloud/functions-framework');
const { BigQuery } = require('@google-cloud/bigquery');
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Initialize GCP services
const bigquery = new BigQuery();
const storage = new Storage();

// BigQuery dataset and table names
const DATASET_ID = 'lockedin_analytics';
const FOCUS_METRICS_TABLE = 'focus_metrics';
const POMODORO_SESSIONS_TABLE = 'pomodoro_sessions';
const DISTRACTION_EVENTS_TABLE = 'distraction_events';

// Helper function to authenticate requests
const authenticateRequest = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    throw new Error('Invalid authorization token');
  }
};

// Store focus metrics in BigQuery
functions.http('storeFocusMetrics', async (req, res) => {
  try {
    const userId = await authenticateRequest(req);
    const { sessionId, timestamp, focusScore, eyeContactTime, distractionCount, postureScore, environmentData } = req.body;

    const query = `
      INSERT INTO \`qwiklabs-gcp-02-722b4bd68f49.${DATASET_ID}.${FOCUS_METRICS_TABLE}\`
      (user_id, session_id, timestamp, focus_score, eye_contact_time, distraction_count, posture_score, environment_data)
      VALUES (@userId, @sessionId, @timestamp, @focusScore, @eyeContactTime, @distractionCount, @postureScore, @environmentData)
    `;

    const options = {
      query,
      params: {
        userId,
        sessionId,
        timestamp,
        focusScore,
        eyeContactTime,
        distractionCount,
        postureScore,
        environmentData: JSON.stringify(environmentData)
      }
    };

    await bigquery.query(options);

    res.json({ success: true, message: 'Focus metrics stored successfully' });
  } catch (error) {
    console.error('Error storing focus metrics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Store Pomodoro session data
functions.http('storePomodoroSession', async (req, res) => {
  try {
    const userId = await authenticateRequest(req);
    const { sessionId, startTime, endTime, duration, type, completed, focusScore, distractions, breakActivities } = req.body;

    const query = `
      INSERT INTO \`qwiklabs-gcp-02-722b4bd68f49.${DATASET_ID}.${POMODORO_SESSIONS_TABLE}\`
      (user_id, session_id, start_time, end_time, duration, type, completed, focus_score, distractions, break_activities)
      VALUES (@userId, @sessionId, @startTime, @endTime, @duration, @type, @completed, @focusScore, @distractions, @breakActivities)
    `;

    const options = {
      query,
      params: {
        userId,
        sessionId,
        startTime,
        endTime,
        duration,
        type,
        completed,
        focusScore,
        distractions: JSON.stringify(distractions),
        breakActivities: JSON.stringify(breakActivities)
      }
    };

    await bigquery.query(options);

    res.json({ success: true, message: 'Pomodoro session stored successfully' });
  } catch (error) {
    console.error('Error storing pomodoro session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get comprehensive focus analytics
functions.http('getFocusAnalytics', async (req, res) => {
  try {
    const userId = await authenticateRequest(req);
    const { startDate, endDate } = req.body;

    const query = `
      WITH daily_metrics AS (
        SELECT 
          DATE(timestamp) as date,
          AVG(focus_score) as avg_focus_score,
          COUNT(*) as session_count,
          SUM(eye_contact_time) as total_focus_time
        FROM \`qwiklabs-gcp-02-722b4bd68f49.${DATASET_ID}.${FOCUS_METRICS_TABLE}\`
        WHERE user_id = @userId 
          AND timestamp BETWEEN @startDate AND @endDate
        GROUP BY DATE(timestamp)
        ORDER BY date
      ),
      hourly_patterns AS (
        SELECT 
          EXTRACT(HOUR FROM timestamp) as hour,
          AVG(focus_score) as avg_score
        FROM \`qwiklabs-gcp-02-722b4bd68f49.${DATASET_ID}.${FOCUS_METRICS_TABLE}\`
        WHERE user_id = @userId 
          AND timestamp BETWEEN @startDate AND @endDate
        GROUP BY hour
        ORDER BY avg_score DESC
        LIMIT 3
      ),
      distraction_analysis AS (
        SELECT 
          JSON_EXTRACT_SCALAR(environment_data, '$.distraction_type') as distraction_type,
          COUNT(*) as count
        FROM \`qwiklabs-gcp-02-722b4bd68f49.${DATASET_ID}.${FOCUS_METRICS_TABLE}\`
        WHERE user_id = @userId 
          AND timestamp BETWEEN @startDate AND @endDate
          AND JSON_EXTRACT_SCALAR(environment_data, '$.distraction_type') IS NOT NULL
        GROUP BY distraction_type
        ORDER BY count DESC
        LIMIT 5
      )
      SELECT 
        (SELECT AVG(avg_focus_score) FROM daily_metrics) as average_focus_score,
        (SELECT SUM(session_count) FROM daily_metrics) as total_sessions,
        (SELECT SUM(total_focus_time) FROM daily_metrics) as total_focus_time,
        (SELECT ARRAY_AGG(STRUCT(date as date, avg_focus_score as score) ORDER BY date) FROM daily_metrics) as focus_trends,
        (SELECT ARRAY_AGG(CAST(hour AS STRING) ORDER BY avg_score DESC) FROM hourly_patterns) as best_focus_times,
        (SELECT ARRAY_AGG(distraction_type ORDER BY count DESC) FROM distraction_analysis) as distraction_patterns
    `;

    const options = {
      query,
      params: { userId, startDate, endDate }
    };

    const [rows] = await bigquery.query(options);
    const result = rows[0];

    // Generate recommendations based on data
    const recommendations = generateRecommendations(result);

    res.json({
      success: true,
      data: {
        averageFocusScore: result.average_focus_score || 0,
        totalSessions: result.total_sessions || 0,
        totalFocusTime: result.total_focus_time || 0,
        focusTrends: result.focus_trends || [],
        bestFocusTimes: result.best_focus_times || [],
        distractionPatterns: result.distraction_patterns || [],
        recommendations
      }
    });
  } catch (error) {
    console.error('Error fetching focus analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get AI-powered productivity insights
functions.http('getProductivityInsights', async (req, res) => {
  try {
    const userId = await authenticateRequest(req);
    const { analysisPeriod } = req.body;

    const query = `
      WITH session_analysis AS (
        SELECT 
          EXTRACT(HOUR FROM start_time) as hour,
          AVG(focus_score) as avg_focus,
          AVG(duration) as avg_duration,
          COUNT(*) as session_count
        FROM \`qwiklabs-gcp-02-722b4bd68f49.${DATASET_ID}.${POMODORO_SESSIONS_TABLE}\`
        WHERE user_id = @userId 
          AND start_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        GROUP BY hour
      ),
      weekly_trends AS (
        SELECT 
          EXTRACT(DAYOFWEEK FROM start_time) as day_of_week,
          AVG(focus_score) as avg_productivity,
          SUM(duration) as total_focus_time
        FROM \`qwiklabs-gcp-02-722b4bd68f49.${DATASET_ID}.${POMODORO_SESSIONS_TABLE}\`
        WHERE user_id = @userId 
          AND start_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 28 DAY)
        GROUP BY day_of_week
      ),
      focus_distribution AS (
        SELECT 
          CASE 
            WHEN focus_score >= 80 THEN 'Excellent (80-100)'
            WHEN focus_score >= 60 THEN 'Good (60-79)'
            WHEN focus_score >= 40 THEN 'Fair (40-59)'
            ELSE 'Poor (0-39)'
          END as score_range,
          COUNT(*) as count
        FROM \`qwiklabs-gcp-02-722b4bd68f49.${DATASET_ID}.${FOCUS_METRICS_TABLE}\`
        WHERE user_id = @userId 
          AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        GROUP BY score_range
      )
      SELECT 
        (SELECT ARRAY_AGG(CAST(hour AS STRING) ORDER BY avg_focus DESC LIMIT 3) FROM session_analysis) as best_focus_times,
        (SELECT AVG(avg_duration) FROM session_analysis) as average_session_length,
        (SELECT ARRAY_AGG(STRUCT(CAST(day_of_week AS STRING) as day, avg_productivity as productivity) ORDER BY day_of_week) FROM weekly_trends) as weekly_trends,
        (SELECT ARRAY_AGG(STRUCT(score_range as range, count as count) ORDER BY count DESC) FROM focus_distribution) as focus_score_distribution
    `;

    const options = {
      query,
      params: { userId }
    };

    const [rows] = await bigquery.query(options);
    const result = rows[0];

    // Generate AI-powered recommendations
    const recommendations = generateAIRecommendations(result);

    res.json({
      success: true,
      data: {
        bestFocusTimes: result.best_focus_times || [],
        averageSessionLength: result.average_session_length || 0,
        distractionPatterns: [], // Would be populated from distraction analysis
        recommendations,
        weeklyTrends: result.weekly_trends || [],
        focusScoreDistribution: result.focus_score_distribution || []
      }
    });
  } catch (error) {
    console.error('Error generating productivity insights:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Store distraction events
functions.http('storeDistractionEvent', async (req, res) => {
  try {
    const userId = await authenticateRequest(req);
    const { sessionId, distractionType, timestamp } = req.body;

    const query = `
      INSERT INTO \`qwiklabs-gcp-02-722b4bd68f49.${DATASET_ID}.${DISTRACTION_EVENTS_TABLE}\`
      (user_id, session_id, distraction_type, timestamp)
      VALUES (@userId, @sessionId, @distractionType, @timestamp)
    `;

    const options = {
      query,
      params: { userId, sessionId, distractionType, timestamp }
    };

    await bigquery.query(options);

    res.json({ success: true, message: 'Distraction event stored successfully' });
  } catch (error) {
    console.error('Error storing distraction event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export analytics data
functions.http('exportAnalyticsData', async (req, res) => {
  try {
    const userId = await authenticateRequest(req);
    const { format } = req.body;

    const query = `
      SELECT 
        fm.timestamp,
        fm.focus_score,
        fm.eye_contact_time,
        fm.distraction_count,
        fm.posture_score,
        ps.duration,
        ps.type as session_type,
        ps.completed
      FROM \`qwiklabs-gcp-02-722b4bd68f49.${DATASET_ID}.${FOCUS_METRICS_TABLE}\` fm
      LEFT JOIN \`qwiklabs-gcp-02-722b4bd68f49.${DATASET_ID}.${POMODORO_SESSIONS_TABLE}\` ps
        ON fm.session_id = ps.session_id
      WHERE fm.user_id = @userId
      ORDER BY fm.timestamp DESC
    `;

    const options = {
      query,
      params: { userId }
    };

    const [rows] = await bigquery.query(options);

    // Generate file and upload to Cloud Storage
    const fileName = `analytics_export_${userId}_${Date.now()}.${format}`;
    const bucket = storage.bucket(`qwiklabs-gcp-02-722b4bd68f49-analytics-exports`);
    
    let fileContent;
    if (format === 'csv') {
      fileContent = convertToCSV(rows);
    } else {
      fileContent = JSON.stringify(rows, null, 2);
    }

    const file = bucket.file(fileName);
    await file.save(fileContent);

    // Generate signed URL for download
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      success: true,
      data: { downloadUrl: signedUrl }
    });
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions
function generateRecommendations(data) {
  const recommendations = [];
  
  if (data.average_focus_score < 60) {
    recommendations.push("Consider taking more frequent breaks to maintain focus");
  }
  
  if (data.best_focus_times && data.best_focus_times.length > 0) {
    recommendations.push(`Your peak focus times are: ${data.best_focus_times.join(', ')}`);
  }
  
  if (data.distraction_patterns && data.distraction_patterns.length > 0) {
    recommendations.push(`Common distractions: ${data.distraction_patterns.join(', ')}`);
  }
  
  return recommendations;
}

function generateAIRecommendations(data) {
  const recommendations = [];
  
  if (data.average_session_length < 20) {
    recommendations.push("Try extending your focus sessions gradually to build endurance");
  }
  
  if (data.best_focus_times && data.best_focus_times.length > 0) {
    recommendations.push(`Schedule important tasks during your peak hours: ${data.best_focus_times.join(', ')}`);
  }
  
  recommendations.push("Consider using the Pomodoro Technique for better time management");
  recommendations.push("Take regular breaks to prevent mental fatigue");
  
  return recommendations;
}

function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}
