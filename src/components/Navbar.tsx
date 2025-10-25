// Navbar component for navigation
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, User, Settings, LogOut } from 'lucide-react';
import { AuthButton } from './AuthButton';
import { NavbarTimer } from './NavbarTimer';
import { GlobalFocusStatus } from './GlobalFocusStatus';

interface NavbarProps {
  user?: {
    displayName: string;
    email: string;
    photoURL?: string;
  } | null;
  onLogout?: () => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, className = '' }) => {
  return (
    <nav className={`bg-white shadow-lg border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">LockIn</span>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Dashboard
            </a>
            <a
              href="/analytics"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Analytics
            </a>
            <a
              href="/settings"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Settings
            </a>
            
            {/* Enhanced Timer Controls */}
            <NavbarTimer />
          </div>

          {/* Focus Status & User Menu */}
          <div className="flex items-center gap-4">
            {/* Global Focus Status */}
            <GlobalFocusStatus />
            {user ? (
              <div className="flex items-center gap-3">
                {/* User Info */}
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-800">
                    {user.displayName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.email}
                  </div>
                </div>

                {/* User Avatar */}
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </motion.button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <a
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </a>
                      <a
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </a>
                      <hr className="my-1" />
                      <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <AuthButton />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-2 space-y-1">
          <a
            href="/dashboard"
            className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            Dashboard
          </a>
          <a
            href="/analytics"
            className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            Analytics
          </a>
          <a
            href="/settings"
            className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            Settings
          </a>
          
          {/* Mobile Timer */}
          <div className="px-3 py-2">
            <NavbarTimer />
          </div>
        </div>
      </div>
    </nav>
  );
};
