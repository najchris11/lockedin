// MusicPlayer component for Spotify integration
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, Repeat, Music } from 'lucide-react';
import { useMusic } from '@/hooks/useMusic';
import { MusicPlaylist } from '@/types';

interface MusicPlayerProps {
  userId: string;
  className?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ userId, className = '' }) => {
  const {
    isPlaying,
    currentTrack,
    currentPlaylist,
    play,
    pause,
    nextTrack,
    previousTrack,
    setPlaylist,
    loading,
    error
  } = useMusic(userId);

  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');

  // TODO: Implement default playlists
  const defaultPlaylists: MusicPlaylist[] = [
    {
      id: 'focus_classical',
      name: 'Classical Focus',
      description: 'Instrumental classical music for deep focus',
      isFocusPlaylist: true,
      tracks: [
        {
          id: 'track_1',
          title: 'Piano Sonata No. 14 "Moonlight"',
          artist: 'Ludwig van Beethoven',
          duration: 180,
          spotifyId: 'placeholder_id_1'
        },
        {
          id: 'track_2',
          title: 'The Four Seasons - Spring',
          artist: 'Antonio Vivaldi',
          duration: 240,
          spotifyId: 'placeholder_id_2'
        },
        {
          id: 'track_3',
          title: 'Clair de Lune',
          artist: 'Claude Debussy',
          duration: 300,
          spotifyId: 'placeholder_id_3'
        }
      ]
    },
    {
      id: 'focus_ambient',
      name: 'Ambient Focus',
      description: 'Calm ambient sounds for concentration',
      isFocusPlaylist: true,
      tracks: [
        {
          id: 'track_4',
          title: 'Rain Sounds',
          artist: 'Nature Sounds',
          duration: 600,
          spotifyId: 'placeholder_id_4'
        },
        {
          id: 'track_5',
          title: 'Ocean Waves',
          artist: 'Relaxing Sounds',
          duration: 480,
          spotifyId: 'placeholder_id_5'
        }
      ]
    },
    {
      id: 'focus_electronic',
      name: 'Electronic Focus',
      description: 'Minimal electronic music for productivity',
      isFocusPlaylist: true,
      tracks: [
        {
          id: 'track_6',
          title: 'Deep Focus',
          artist: 'Electronic Artist',
          duration: 360,
          spotifyId: 'placeholder_id_6'
        }
      ]
    }
  ];

  // TODO: Implement time formatting
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // TODO: Implement volume control
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // TODO: Implement actual volume control
    console.log('Setting volume to:', newVolume);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Implement actual mute functionality
    console.log('Mute toggled:', !isMuted);
  };

  // TODO: Implement playlist selection
  const handlePlaylistSelect = async (playlistId: string) => {
    try {
      await setPlaylist(playlistId);
      setShowPlaylists(false);
    } catch (error) {
      console.error('Failed to set playlist:', error);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Music Player</h2>
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPlaylists(!showPlaylists)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Music className="w-4 h-4" />
            Playlists
          </motion.button>

          <AnimatePresence>
            {showPlaylists && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-10"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Select Playlist</h3>
                  <div className="space-y-2">
                    {defaultPlaylists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => handlePlaylistSelect(playlist.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentPlaylist?.id === playlist.id
                            ? 'bg-blue-100 text-blue-800'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium">{playlist.name}</div>
                        <div className="text-sm text-gray-500">{playlist.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {playlist.tracks.length} tracks
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* TODO: Implement current track display */}
      <div className="mb-6">
        {currentTrack ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">{currentTrack.title}</h3>
              <p className="text-sm text-gray-600 truncate">{currentTrack.artist}</p>
              <p className="text-xs text-gray-500">
                {currentPlaylist?.name} • {formatTime(currentTrack.duration)}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No track selected</p>
            <p className="text-sm">Choose a playlist to get started</p>
          </div>
        )}
      </div>

      {/* TODO: Implement progress bar */}
      {currentTrack && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '30%' }} // TODO: Implement actual progress
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0:00</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>
      )}

      {/* TODO: Implement control buttons */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShuffleMode(!shuffleMode)}
          className={`p-2 rounded-full transition-colors ${
            shuffleMode ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Shuffle className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={previousTrack}
          disabled={loading}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <SkipBack className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isPlaying ? pause : play}
          disabled={loading || !currentTrack}
          className={`p-4 rounded-full transition-colors disabled:opacity-50 ${
            isPlaying
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextTrack}
          disabled={loading}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <SkipForward className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const nextMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
            setRepeatMode(nextMode);
          }}
          className={`p-2 rounded-full transition-colors ${
            repeatMode !== 'off' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Repeat className="w-5 h-5" />
        </motion.button>
      </div>

      {/* TODO: Implement volume control */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMute}
          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <span className="text-sm text-gray-500 w-8">
          {isMuted ? 0 : volume}
        </span>
      </div>

      {/* TODO: Implement Spotify connection status */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>Spotify integration coming soon</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Currently playing demo tracks. Connect Spotify for full functionality.
        </p>
      </div>
    </div>
  );
};
