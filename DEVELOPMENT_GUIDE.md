# LockIn Development Guide

## 🎯 Project Overview

LockIn is a productivity web application that combines Pomodoro timers, AI-powered focus tracking, music integration, and task management. The project is scaffolded and ready for 4 developers to work in parallel.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 👥 Team Assignments

### 1. Frontend UI Developer
**Focus**: Components, styling, animations, responsive design

**Key Files**:
- `src/components/` - All shared components
- `src/styles/globals.css` - Global styles and utilities
- `src/app/page.tsx` - Landing page
- `src/app/dashboard/page.tsx` - Dashboard layout

**Priority Tasks**:
- [ ] Implement responsive design for mobile/tablet
- [ ] Add dark mode support
- [ ] Improve accessibility (ARIA labels, keyboard navigation)
- [ ] Create loading states and error boundaries
- [ ] Add micro-interactions and animations

**Current Status**: ✅ Basic UI components created with Tailwind CSS and Framer Motion

### 2. Pomodoro Logic Developer
**Focus**: Timer functionality, session management, notifications

**Key Files**:
- `src/hooks/usePomodoro.ts` - Core timer logic
- `src/app/dashboard/components/PomodoroTimer.tsx` - Timer UI component

**Priority Tasks**:
- [ ] Implement actual timer countdown logic
- [ ] Add browser notifications for session end
- [ ] Create session history and statistics
- [ ] Add custom timer presets
- [ ] Implement auto-start next session
- [ ] Add sound alerts and visual cues

**Current Status**: ✅ Hook structure created, needs timer implementation

### 3. Focus Tracking Developer
**Focus**: Computer vision, webcam integration, AI focus detection

**Key Files**:
- `src/hooks/useFocus.ts` - Focus tracking logic
- `src/app/dashboard/components/FocusTracker.tsx` - Tracking UI component

**Priority Tasks**:
- [ ] Integrate MediaPipe for face detection
- [ ] Implement eye tracking and blink detection
- [ ] Add posture analysis
- [ ] Create distraction detection (phone usage, looking away)
- [ ] Implement focus score calculation algorithm
- [ ] Add privacy controls and data handling

**Current Status**: ✅ Placeholder implementation, needs MediaPipe integration

### 4. Integrations Developer
**Focus**: External APIs, backend services, data management

**Key Files**:
- `src/lib/firebase.ts` - Firebase configuration
- `src/lib/spotify.ts` - Spotify API integration
- `src/lib/gcp.ts` - Google Cloud Platform integration
- `src/hooks/useTodo.ts` - Task management
- `src/hooks/useMusic.ts` - Music player

**Priority Tasks**:
- [X] Complete Firebase authentication flow
- [X] Implement Spotify Web API integration
- [ ] Set up Firestore data models and security rules
- [ ] Create Google Cloud Functions for analytics
- [ ] Implement real-time data synchronization
- [ ] Add error handling and retry logic

**Current Status**: ✅ Service integrations scaffolded, needs API implementation

## 🏗️ Architecture Overview

### Frontend Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend Services
- **Firebase Auth** for authentication
- **Firestore** for data storage
- **Spotify Web API** for music integration
- **Google Cloud Functions** for analytics
- **MediaPipe** for computer vision

### Data Flow
```
User Interaction → React Components → Custom Hooks → Firebase/APIs → Real-time Updates
```

## 📁 File Structure Deep Dive

### Components (`src/components/`)
- **Layout.tsx**: Main page wrapper with navbar and footer
- **Navbar.tsx**: Navigation with user menu and auth button
- **AuthButton.tsx**: Google sign-in/sign-out functionality

### Dashboard Components (`src/app/dashboard/components/`)
- **TodoList.tsx**: Task management with CRUD operations
- **PomodoroTimer.tsx**: Timer with circular progress and controls
- **FocusTracker.tsx**: Webcam-based focus monitoring
- **MusicPlayer.tsx**: Spotify integration with playlist management

### Hooks (`src/hooks/`)
- **usePomodoro.ts**: Timer state and session management
- **useTodo.ts**: Task CRUD operations with Firestore
- **useFocus.ts**: Webcam access and focus detection
- **useMusic.ts**: Music playback and playlist management

### Services (`src/lib/`)
- **firebase.ts**: Firebase configuration and initialization
- **spotify.ts**: Spotify API client and authentication
- **gcp.ts**: Google Cloud Platform integration

## 🔧 Development Workflow

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Add your Firebase config
# Add your Spotify client ID
# Add your GCP project ID
```

### 2. Feature Development
1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement changes in assigned files
3. Test functionality locally
4. Create pull request with clear description

### 3. Code Standards
- Use TypeScript for all new code
- Follow existing component patterns
- Add JSDoc comments for complex functions
- Use meaningful variable and function names
- Test components in isolation

## 🧪 Testing Strategy

### Unit Tests
```bash
npm run test
```

### Component Testing
- Test each component in isolation
- Mock external dependencies
- Test user interactions and state changes

### Integration Testing
- Test hook integrations with Firebase
- Test API integrations with Spotify
- Test real-time data synchronization

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push to main

## 📊 Current Implementation Status

### ✅ Completed
- [x] Project scaffolding with Next.js + TypeScript
- [x] Tailwind CSS configuration and custom styles
- [x] Component structure and basic UI
- [x] Firebase configuration and setup
- [x] Custom hooks architecture
- [x] TypeScript interfaces and types
- [x] Landing page and dashboard layout
- [x] Responsive design foundation

### 🚧 In Progress
- [ ] Firebase authentication implementation
- [ ] Real-time data synchronization
- [ ] Component state management
- [ ] Error handling and loading states

### 📋 Next Steps
1. **Frontend Developer**: Implement responsive design and dark mode
2. **Pomodoro Developer**: Add timer logic and notifications
3. **Focus Tracking Developer**: Integrate MediaPipe for computer vision
4. **Integrations Developer**: Complete Firebase and Spotify API integration

## 🐛 Common Issues & Solutions

### Firebase Connection Issues
- Check environment variables in `.env.local`
- Verify Firebase project configuration
- Ensure Firestore rules allow read/write access

### TypeScript Errors
- Run `npm run type-check` to identify issues
- Check import paths and type definitions
- Ensure all props are properly typed

### Styling Issues
- Use Tailwind CSS classes consistently
- Check responsive breakpoints
- Verify custom CSS in `globals.css`

## 📞 Communication

### Daily Standups
- Share progress on assigned tasks
- Discuss blockers and dependencies
- Coordinate integration points

### Code Reviews
- Review all pull requests before merging
- Test functionality in development environment
- Provide constructive feedback

### Documentation
- Update README.md with new features
- Document API changes and new components
- Keep development guide current

---

**Happy coding! Let's build something amazing together! 🚀**
