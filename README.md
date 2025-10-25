# LockIn - Productivity Focus App

A modern productivity web application that combines Pomodoro timers, AI-powered focus tracking, music integration, and task management to help users stay focused and achieve their goals.

## 🚀 Features

### Core Functionality
- **Pomodoro Timer**: Customizable focus/break sessions with automatic transitions
- **AI Focus Tracking**: Webcam-based attention monitoring using computer vision
- **Music Integration**: Spotify integration with curated focus playlists
- **Task Management**: Smart to-do lists with priority levels and progress tracking
- **Analytics Dashboard**: Detailed insights into productivity patterns and focus metrics

### Technical Features
- **Next.js 14** with App Router and TypeScript
- **Firebase** for authentication and data storage
- **Tailwind CSS** for modern, responsive UI
- **Framer Motion** for smooth animations
- **Real-time** data synchronization
- **PWA-ready** for mobile installation

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── dashboard/               # Authenticated user area
│   │   ├── page.tsx            # Main dashboard
│   │   └── components/         # Dashboard-specific components
│   │       ├── TodoList.tsx    # Task management
│   │       ├── PomodoroTimer.tsx # Focus timer
│   │       ├── FocusTracker.tsx # Webcam tracking
│   │       └── MusicPlayer.tsx # Music integration
├── components/                  # Shared UI components
│   ├── Navbar.tsx              # Navigation bar
│   ├── AuthButton.tsx          # Authentication button
│   └── Layout.tsx              # Page layout wrapper
├── hooks/                      # Custom React hooks
│   ├── usePomodoro.ts          # Timer logic
│   ├── useTodo.ts              # Task management
│   ├── useFocus.ts             # Focus tracking
│   └── useMusic.ts             # Music player
├── lib/                        # External service integrations
│   ├── firebase.ts             # Firebase configuration
│   ├── spotify.ts              # Spotify API integration
│   └── gcp.ts                  # Google Cloud Platform
├── types/                      # TypeScript type definitions
│   └── index.ts                # Shared interfaces
└── styles/
    └── globals.css             # Global styles and utilities
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Spotify Developer account (optional)
- Google Cloud Platform account (optional)

### 1. Clone and Install
```bash
git clone <repository-url>
cd lockedin
npm install
```

### 2. Environment Configuration
```bash
# Copy the environment template
cp env.example .env.local

# Edit .env.local with your actual values
```

### 3. Firebase Setup
1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Google provider)
3. Enable Firestore Database
4. Copy your config values to `.env.local`

### 4. Spotify Setup (Optional)
1. Create a Spotify app at [developer.spotify.com](https://developer.spotify.com)
2. Add `http://localhost:3000/auth/spotify/callback` as redirect URI
3. Copy your client ID to `.env.local`

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🎯 Development Roadmap

### Phase 1: Core Features (Current)
- [x] Project scaffolding
- [x] Basic UI components
- [x] Firebase authentication
- [x] Pomodoro timer logic
- [x] Task management system
- [x] Focus tracking placeholder
- [x] Music player placeholder

### Phase 2: Integrations
- [ ] Spotify API integration
- [ ] Real focus tracking with MediaPipe
- [ ] Google Cloud Functions
- [ ] Analytics dashboard
- [ ] Mobile responsiveness

### Phase 3: Advanced Features
- [ ] Team collaboration
- [ ] Advanced analytics
- [ ] Custom themes
- [ ] Browser extensions
- [ ] Desktop app (Electron)

## 👥 Team Development

This project is designed for 4 developers to work in parallel:

### Frontend UI Developer
- Focus on: Components, styling, animations
- Files: `src/components/`, `src/styles/`, UI-related files
- Tasks: Responsive design, accessibility, user experience

### Pomodoro Logic Developer  
- Focus on: Timer functionality, session management
- Files: `src/hooks/usePomodoro.ts`, `src/app/dashboard/components/PomodoroTimer.tsx`
- Tasks: Timer logic, notifications, session analytics

### Focus Tracking Developer
- Focus on: Computer vision, webcam integration
- Files: `src/hooks/useFocus.ts`, `src/app/dashboard/components/FocusTracker.tsx`
- Tasks: MediaPipe integration, distraction detection, focus scoring

### Integrations Developer
- Focus on: External APIs, backend services
- Files: `src/lib/`, `src/hooks/useMusic.ts`, `src/hooks/useTodo.ts`
- Tasks: Spotify API, Firebase integration, GCP functions

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:watch   # Run tests in watch mode
```

## 📱 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📊 Analytics

The app includes built-in analytics for:
- Focus session completion rates
- Task completion patterns
- Focus score trends
- Productivity insights

## 🔒 Security

- Firebase Authentication for user management
- Firestore security rules for data protection
- Environment variables for sensitive data
- HTTPS enforcement in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide React](https://lucide.dev/) for icons

## 📞 Support

For support, email support@lockedin.app or join our Discord community.

---

**Happy coding! 🚀**