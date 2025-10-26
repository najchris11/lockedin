// Layout component for consistent page structure
'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { User } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  className = '' 
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark-900 ${className}`}>
      <Navbar user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 mt-8 sm:mt-12 lg:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Brand */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">LockIn</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-md">
                Stay focused and productive with Pomodoro timers, task management, 
                and AI-powered focus tracking. Achieve your goals with LockIn.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/features" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/integrations" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="/api" className="text-gray-600 hover:text-blue-600 transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/status" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="/community" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                © 2024 LockIn. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-gray-500 hover:text-gray-700 text-sm">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-gray-500 hover:text-gray-700 text-sm">
                  Terms of Service
                </a>
                <a href="/cookies" className="text-gray-500 hover:text-gray-700 text-sm">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
