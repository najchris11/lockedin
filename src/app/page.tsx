// Landing page for LockIn
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, Music, Eye, CheckCircle, ArrowRight, Play } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { AuthButton } from '@/components/AuthButton';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Pomodoro Timer',
      description: 'Customizable focus sessions with automatic break reminders to maximize productivity.',
      color: 'text-blue-500'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Focus Tracking',
      description: 'Webcam-based attention monitoring to help you stay focused and identify distractions.',
      color: 'text-purple-500'
    },
    {
      icon: <Music className="w-8 h-8" />,
      title: 'Music Integration',
      description: 'Spotify integration with curated focus playlists to enhance your concentration.',
      color: 'text-green-500'
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: 'Task Management',
      description: 'Smart to-do lists with priority levels and progress tracking for your goals.',
      color: 'text-orange-500'
    }
  ];

  const benefits = [
    'Increase productivity by up to 40%',
    'Reduce distractions and improve focus',
    'Track your progress with detailed analytics',
    'Customize your workflow to fit your needs',
    'Sync across all your devices',
    'Free to use with premium features available'
  ];

  return (
    <Layout user={user}>
      {/* Hero Section */}
      <section className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Stay <span className="text-blue-600">Focused</span>, Stay <span className="text-purple-600">Productive</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            LockIn combines Pomodoro timers, AI-powered focus tracking, and music integration 
            to help you achieve your goals and maintain peak productivity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to focus
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools designed to help you maintain concentration and achieve your productivity goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-100 rounded-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why choose LockIn?
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of users who have transformed their productivity with LockIn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 mb-6">
                Sign up for free and start your productivity journey today. 
                No credit card required.
              </p>
              <AuthButton className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Start your focus journey today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who have already transformed their productivity with LockIn.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started for Free
          </motion.button>
        </motion.div>
      </section>
    </Layout>
  );
}