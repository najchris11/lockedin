// Data caching utility for optimizing API calls and Firestore operations

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const dataCache = new DataCache();

// Cache key generators
export const cacheKeys = {
  user: (userId: string) => `user_${userId}`,
  userSettings: (userId: string) => `user_settings_${userId}`,
  todos: (userId: string) => `todos_${userId}`,
  pomodoroSessions: (userId: string) => `pomodoro_sessions_${userId}`,
  spotifyPlaylists: (userId: string) => `spotify_playlists_${userId}`,
  spotifyToken: (userId: string) => `spotify_token_${userId}`,
};

// Cache TTL constants
export const CACHE_TTL = {
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  USER_SETTINGS: 10 * 60 * 1000, // 10 minutes
  TODOS: 2 * 60 * 1000, // 2 minutes
  POMODORO_SESSIONS: 1 * 60 * 1000, // 1 minute
  SPOTIFY_PLAYLISTS: 10 * 60 * 1000, // 10 minutes
  SPOTIFY_TOKEN: 30 * 60 * 1000, // 30 minutes
};

// Utility functions for common caching patterns
export const cacheUtils = {
  // Cache with automatic key generation
  cacheUserData: <T>(userId: string, data: T, ttl?: number) => {
    dataCache.set(cacheKeys.user(userId), data, ttl);
  },

  getUserData: <T>(userId: string): T | null => {
    return dataCache.get<T>(cacheKeys.user(userId));
  },

  // Cache user settings
  cacheUserSettings: <T>(userId: string, settings: T) => {
    dataCache.set(cacheKeys.userSettings(userId), settings, CACHE_TTL.USER_SETTINGS);
  },

  getUserSettings: <T>(userId: string): T | null => {
    return dataCache.get<T>(cacheKeys.userSettings(userId));
  },

  // Cache todos
  cacheTodos: <T>(userId: string, todos: T) => {
    dataCache.set(cacheKeys.todos(userId), todos, CACHE_TTL.TODOS);
  },

  getTodos: <T>(userId: string): T | null => {
    return dataCache.get<T>(cacheKeys.todos(userId));
  },

  // Clear user-specific cache
  clearUserCache: (userId: string) => {
    dataCache.delete(cacheKeys.user(userId));
    dataCache.delete(cacheKeys.userSettings(userId));
    dataCache.delete(cacheKeys.todos(userId));
    dataCache.delete(cacheKeys.pomodoroSessions(userId));
    dataCache.delete(cacheKeys.spotifyPlaylists(userId));
  },

  // Clear all cache
  clearAllCache: () => {
    dataCache.clear();
  }
};

// Auto-cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    dataCache.cleanup();
  }, 5 * 60 * 1000);
}
