# GCP Analytics Deployment Guide

## 🚀 Complete Setup Instructions

### 1. **Prerequisites**

1. **Google Cloud Account**: Sign up at [Google Cloud Console](https://console.cloud.google.com/)
2. **Firebase Project**: Already created from previous setup
3. **Node.js 18+**: For Cloud Functions development
4. **gcloud CLI**: Install from [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

### 2. **Enable Required APIs**

```bash
# Enable required Google Cloud APIs
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable firebase.googleapis.com
```

### 3. **Set Up BigQuery**

1. **Go to BigQuery Console**: [console.cloud.google.com/bigquery](https://console.cloud.google.com/bigquery)
2. **Create Dataset**:
   ```sql
   CREATE SCHEMA IF NOT EXISTS `your-project-id.lockedin_analytics`
   OPTIONS (
     description = "LockIn productivity analytics data",
     location = "US"
   );
   ```
3. **Run Schema Setup**: Execute the SQL commands from `cloud-functions/bigquery-schema.sql`

### 4. **Deploy Cloud Functions**

```bash
# Navigate to cloud-functions directory
cd cloud-functions

# Install dependencies
npm install

# Deploy all functions
gcloud functions deploy storeFocusMetrics \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source . \
  --entry-point storeFocusMetrics \
  --project qwiklabs-gcp-02-722b4bd68f49

gcloud functions deploy storePomodoroSession \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source . \
  --entry-point storePomodoroSession \
  --project qwiklabs-gcp-02-722b4bd68f49

gcloud functions deploy getFocusAnalytics \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source . \
  --entry-point getFocusAnalytics \
  --project qwiklabs-gcp-02-722b4bd68f49

gcloud functions deploy getProductivityInsights \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source . \
  --entry-point getProductivityInsights \
  --project qwiklabs-gcp-02-722b4bd68f49

gcloud functions deploy storeDistractionEvent \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source . \
  --entry-point storeDistractionEvent \
  --project qwiklabs-gcp-02-722b4bd68f49

gcloud functions deploy exportAnalyticsData \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source . \
  --entry-point exportAnalyticsData \
  --project qwiklabs-gcp-02-722b4bd68f49
```

### 5. **Set Up Cloud Storage**

```bash
# Create storage bucket for analytics exports
gsutil mb gs://qwiklabs-gcp-02-722b4bd68f49-analytics-exports

# Set bucket permissions
gsutil iam ch allUsers:objectViewer gs://qwiklabs-gcp-02-722b4bd68f49-analytics-exports
```

### 6. **Configure Authentication**

1. **Go to Firebase Console** → **Authentication** → **Service Accounts**
2. **Generate New Private Key**
3. **Download JSON file**
4. **Set Environment Variable**:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"
   ```

### 7. **Update Environment Variables**

Add to your `.env.local`:

```env
# GCP Configuration
NEXT_PUBLIC_GCP_PROJECT_ID=qwiklabs-gcp-02-722b4bd68f49
NEXT_PUBLIC_GCP_REGION=us-central1

# Cloud Functions URLs (auto-generated)
NEXT_PUBLIC_GCP_FUNCTIONS_URL=https://us-central1-qwiklabs-gcp-02-722b4bd68f49.cloudfunctions.net
```

### 8. **Test the Integration**

```bash
# Test focus metrics storage
curl -X POST https://us-central1-qwiklabs-gcp-02-722b4bd68f49.cloudfunctions.net/storeFocusMetrics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "sessionId": "test-session",
    "timestamp": "2024-01-01T00:00:00Z",
    "focusScore": 85.5,
    "eyeContactTime": 1200.0,
    "distractionCount": 2,
    "postureScore": 78.0,
    "environmentData": {"lighting": "good", "noise_level": "low"}
  }'
```

### 9. **Integrate with React Components**

```tsx
// Example usage in a component
import { useAnalytics } from '@/hooks/useAnalytics';

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { 
    analytics, 
    insights, 
    loading, 
    error,
    loadAnalytics,
    storeFocusData 
  } = useAnalytics(user?.id || '');

  useEffect(() => {
    if (user?.id) {
      loadAnalytics({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
      });
    }
  }, [user?.id, loadAnalytics]);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Focus Analytics</h2>
      <p>Average Focus Score: {analytics?.averageFocusScore}</p>
      <p>Total Sessions: {analytics?.totalSessions}</p>
      
      <h3>Productivity Insights</h3>
      <p>Best Focus Times: {insights?.bestFocusTimes?.join(', ')}</p>
      <p>Average Session Length: {insights?.averageSessionLength} minutes</p>
    </div>
  );
};
```

### 10. **Monitoring and Debugging**

1. **Cloud Functions Logs**:
   ```bash
   gcloud functions logs read storeFocusMetrics --limit 50
   ```

2. **BigQuery Queries**:
   ```sql
SELECT * FROM `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.focus_metrics` 
WHERE user_id = 'test-user' 
ORDER BY timestamp DESC 
LIMIT 10;
   ```

3. **Cloud Storage**:
   ```bash
   gsutil ls gs://qwiklabs-gcp-02-722b4bd68f49-analytics-exports/
   ```

### 11. **Production Considerations**

1. **Security**:
   - Remove `--allow-unauthenticated` flags in production
   - Implement proper authentication middleware
   - Use Firebase Auth tokens for all requests

2. **Performance**:
   - Set up BigQuery scheduled queries for heavy analytics
   - Implement caching for frequently accessed data
   - Use Cloud CDN for static assets

3. **Cost Optimization**:
   - Set up BigQuery cost alerts
   - Use partitioned tables for better performance
   - Implement data retention policies

4. **Monitoring**:
   - Set up Cloud Monitoring alerts
   - Implement error tracking
   - Monitor function execution times

### 12. **Troubleshooting**

**Common Issues:**

1. **Authentication Errors**:
   - Verify Firebase service account key
   - Check Cloud Functions IAM permissions
   - Ensure Firebase Auth is properly configured

2. **BigQuery Errors**:
   - Verify dataset and table names
   - Check data types match schema
   - Ensure proper partitioning

3. **Function Deployment Errors**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check function entry points

**Debug Commands:**
```bash
# Check function status
gcloud functions describe storeFocusMetrics

# View function logs
gcloud functions logs read storeFocusMetrics

# Test function locally
functions-framework --target=storeFocusMetrics --port=8080
```

## 🎉 **You're All Set!**

Your GCP analytics system is now fully integrated with:
- ✅ Real-time focus tracking
- ✅ Pomodoro session analytics
- ✅ AI-powered productivity insights
- ✅ Data export capabilities
- ✅ Comprehensive monitoring

The analytics will automatically start collecting data as users interact with your app!
