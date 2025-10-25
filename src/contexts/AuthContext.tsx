// Auth context for managing authentication state
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
import { auth, db, firestoreUtils } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Cache for user data to avoid repeated Firestore calls
const userDataCache = new Map<string, { user: User; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Optimized user data storage with caching
  const storeUserData = useCallback(async (userData: User) => {
    try {
      const userRef = doc(db, 'users', userData.id);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user document
        await setDoc(userRef, {
          ...userData,
          createdAt: userData.createdAt,
          lastLoginAt: new Date(),
          settings: {
            pomodoroFocusDuration: 25,
            pomodoroBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            enableFocusTracking: true,
            enableMusicIntegration: true,
            notifications: {
              desktop: true,
              sound: true,
              browser: true,
            }
          }
        });
        console.log('New user created in Firestore');
      } else {
        // Only update last login time if it's been more than 1 hour
        const lastLogin = userSnap.data()?.lastLoginAt?.toDate();
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        
        if (!lastLogin || lastLogin < oneHourAgo) {
          await setDoc(userRef, {
            lastLoginAt: new Date()
          }, { merge: true });
          console.log('User login updated in Firestore');
        }
      }

      // Cache the user data
      userDataCache.set(userData.id, {
        user: userData,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }, []);

  // Optimized user data fetching with offline support
  const getUserData = useCallback(async (firebaseUser: FirebaseUser): Promise<User> => {
    const cached = userDataCache.get(firebaseUser.uid);
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.user;
    }

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      
      // Try cache first, then server
      let userSnap;
      try {
        userSnap = await getDocFromCache(userRef);
        console.log('User data loaded from cache');
      } catch (cacheError) {
        // Cache miss, try server
        userSnap = await getDocFromServer(userRef);
        console.log('User data loaded from server');
      }
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || userData.displayName || '',
          photoURL: firebaseUser.photoURL || userData.photoURL || undefined,
          createdAt: new Date(userData.createdAt?.toDate() || firebaseUser.metadata.creationTime || Date.now())
        };

        // Cache the user data
        userDataCache.set(firebaseUser.uid, {
          user,
          timestamp: now
        });

        return user;
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      
      // If offline, try to return cached data even if expired
      if (cached && !firestoreUtils.isOnline()) {
        console.log('Offline mode: using expired cached data');
        return cached.user;
      }
    }

    // Fallback to Firebase user data
    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now())
    };

    return userData;
  }, []);

  // Refresh user data manually
  const refreshUser = useCallback(async () => {
    if (!user) return;
    
    try {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser);
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, [user, getUserData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        // Only show loading on initial load, not on subsequent auth changes
        if (!isInitialized) {
          setLoading(true);
        }
        setError(null);

        if (firebaseUser) {
          // Get user data with caching
          const userData = await getUserData(firebaseUser);
          
          // Only store user data if it's a new user or cache is invalid
          const cached = userDataCache.get(firebaseUser.uid);
          if (!cached || (Date.now() - cached.timestamp) >= CACHE_DURATION) {
            await storeUserData(userData);
          }
          
          setUser(userData);
        } else {
          setUser(null);
          // Clear cache when user logs out
          userDataCache.clear();
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Authentication error occurred');
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [isInitialized, getUserData, storeUserData]);

  return (
    <AuthContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
