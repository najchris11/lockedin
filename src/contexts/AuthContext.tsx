// Auth context for managing authentication state
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        setLoading(true);
        setError(null);

        if (firebaseUser) {
          // Convert Firebase user to our User type
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(firebaseUser.metadata.creationTime || Date.now())
          };

          // TODO: Store/update user data in Firestore
          await storeUserData(userData);
          
          setUser(userData);
        } else {
          // Provide a demo user for development/testing when not authenticated
          const demoUser: User = {
            id: 'demo-user-123',
            email: 'demo@lockedin.app',
            displayName: 'Demo User',
            photoURL: undefined,
            createdAt: new Date()
          };
          setUser(demoUser);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Authentication error occurred');
        
        // Fallback to demo user even if there's an auth error
        const demoUser: User = {
          id: 'demo-user-123',
          email: 'demo@lockedin.app',
          displayName: 'Demo User',
          photoURL: undefined,
          createdAt: new Date()
        };
        setUser(demoUser);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Store user data in Firestore
  const storeUserData = async (userData: User) => {
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
        // Update last login time
        await setDoc(userRef, {
          lastLoginAt: new Date()
        }, { merge: true });
        console.log('User login updated in Firestore');
      }
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
