# Firestore Security Rules

## Rules for LockIn App

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own todos
    match /todos/{todoId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only access their own pomodoro sessions
    match /pomodoro_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only access their own focus tracking data
    match /focus_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only access their own settings
    match /user_settings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firestore Indexes Configuration

### Required Composite Indexes

1. **Todos Collection**
   - Fields: `userId` (Ascending), `createdAt` (Descending)
   - Query: `where('userId', '==', userId).orderBy('createdAt', 'desc')`

2. **Pomodoro Sessions Collection**
   - Fields: `userId` (Ascending), `startTime` (Descending)
   - Query: `where('userId', '==', userId).orderBy('startTime', 'desc')`

3. **Focus Sessions Collection**
   - Fields: `userId` (Ascending), `timestamp` (Descending)
   - Query: `where('userId', '==', userId).orderBy('timestamp', 'desc')`

4. **Todos by Status**
   - Fields: `userId` (Ascending), `completed` (Ascending), `createdAt` (Descending)
   - Query: `where('userId', '==', userId).where('completed', '==', false).orderBy('createdAt', 'desc')`

5. **Todos by Priority**
   - Fields: `userId` (Ascending), `priority` (Ascending), `createdAt` (Descending)
   - Query: `where('userId', '==', userId).where('priority', '==', 'high').orderBy('createdAt', 'desc')`

## Firebase Console Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `lockedin-app` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Choose Analytics account or create new one

### 2. Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add your domain to authorized domains:
   - `localhost` (for development)
   - Your production domain (e.g., `your-app.vercel.app`)

### 3. Create Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location close to your users (e.g., `us-central1`)

### 4. Add Security Rules
1. In Firestore Database, go to "Rules" tab
2. Replace the default rules with the security rules above
3. Click "Publish"

### 5. Create Required Indexes
1. In Firestore Database, go to "Indexes" tab
2. Click "Create Index"
3. Add each composite index listed above
4. Wait for indexes to build (can take a few minutes)

### 6. Get Configuration Keys
1. Go to "Project Settings" (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app
4. Register app with nickname: `LockIn Web App`
5. Copy the configuration object

### 7. Update Environment Variables
Add these to your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Spotify Configuration
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your-spotify-client-id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

# Google Cloud Platform
NEXT_PUBLIC_GCP_PROJECT_ID=your-project-id
```

### 8. Enable Required APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" → "Library"
4. Enable these APIs:
   - Cloud Firestore API
   - Firebase Authentication API
   - Google Cloud Storage API

### 9. Configure Storage (Optional)
1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Select same location as Firestore

### 10. Test Configuration
1. Start your development server: `npm run dev`
2. Try signing in with Google
3. Check Firestore Database for new user documents
4. Verify security rules are working

## Performance Optimization Tips

### 1. Use Composite Indexes
- Always create indexes for your queries
- Firestore will suggest missing indexes in the console

### 2. Optimize Queries
- Use `limit()` to reduce data transfer
- Use `startAfter()` for pagination
- Avoid `!=` and `not-in` operators

### 3. Enable Offline Persistence
- Already configured in the code
- Users can work offline and sync when online

### 4. Use Batch Operations
- Group multiple writes together
- Reduces API calls and improves performance

### 5. Monitor Usage
- Check Firebase Console for usage metrics
- Monitor read/write operations
- Set up billing alerts

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check security rules
   - Verify user is authenticated
   - Ensure user ID matches document

2. **Missing Index**
   - Check Firestore Console for index suggestions
   - Create required composite indexes
   - Wait for indexes to build

3. **Slow Queries**
   - Add appropriate indexes
   - Use `limit()` to reduce data
   - Consider pagination for large datasets

4. **Authentication Issues**
   - Check Google provider is enabled
   - Verify authorized domains
   - Check API keys in environment variables

### Debug Mode
Enable debug logging in development:
```javascript
// In your Firebase config
if (process.env.NODE_ENV === 'development') {
  import('firebase/firestore').then(({ enableNetwork }) => {
    enableNetwork(db);
  });
}
```
