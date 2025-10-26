// Shared TypeScript interfaces and types for LockIn app

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  type: 'focus' | 'break';
  duration: number; // in minutes
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  focusScore?: number; // 0-100
}

export interface FocusMetrics {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  attentionScore: number; // 0-100
  eyeContact: boolean;
  posture: 'good' | 'fair' | 'poor';
  distractions: number; // count of detected distractions
}

export interface MusicPlaylist {
  id: string;
  name: string;
  description?: string;
  tracks: MusicTrack[];
  isFocusPlaylist: boolean;
  userId?: string; // undefined for default playlists
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  spotifyId?: string;
  previewUrl?: string;
}

export interface AppSettings {
  userId: string;
  pomodoroFocusDuration: number; // default 25 minutes
  pomodoroBreakDuration: number; // default 5 minutes
  longBreakDuration: number; // default 15 minutes
  longBreakInterval: number; // every 4 sessions
  enableFocusTracking: boolean;
  enableMusicIntegration: boolean;
  defaultPlaylistId?: string;
  notifications: {
    desktop: boolean;
    sound: boolean;
    browser: boolean;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Component Props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Hook return types
export interface UsePomodoroReturn {
  isRunning: boolean;
  isFocus: boolean;
  timeLeft: number;
  sessionCount: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
}

export interface UseTodoReturn {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface UseFocusReturn {
  isTracking: boolean;
  focusScore: number;
  startTracking: () => void;
  stopTracking: () => void;
  metrics: FocusMetrics[];
  loading: boolean;
  error: string | null;
}

export interface UseMusicReturn {
  isPlaying: boolean;
  currentTrack: MusicTrack | null;
  currentPlaylist: MusicPlaylist | null;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  setPlaylist: (playlistId: string) => Promise<void>;
  startFocusMusic: () => Promise<void>;
  startBreakMusic: () => Promise<void>;
  stopMusic: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  loading: boolean;
  error: string | null;
}
