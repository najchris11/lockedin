// Custom hook for music player functionality
import { useState, useEffect, useCallback } from 'react';
import { UseMusicReturn, MusicTrack, MusicPlaylist } from '@/types';
import { SpotifyClient, getSpotifyAuthUrl } from '@/lib/spotify';

// TODO: Implement default focus playlists
const DEFAULT_FOCUS_PLAYLISTS: MusicPlaylist[] = [
  {
    id: 'focus_classical',
    name: 'Classical Focus',
    description: 'Instrumental classical music for deep focus',
    isFocusPlaylist: true,
    tracks: [
      {
        id: 'track_1',
        title: 'Piano Sonata No. 14',
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
        id: 'track_3',
        title: 'Rain Sounds',
        artist: 'Nature Sounds',
        duration: 600,
        spotifyId: 'placeholder_id_3'
      }
    ]
  }
];

export const useMusic = (userId: string): UseMusicReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<MusicPlaylist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spotifyClient, setSpotifyClient] = useState<SpotifyClient | null>(null);

  // TODO: Implement Spotify authentication
  useEffect(() => {
    const initializeSpotify = async () => {
      try {
        // TODO: Check for existing Spotify token in localStorage
        const token = localStorage.getItem('spotify_access_token');
        
        if (token) {
          setSpotifyClient(new SpotifyClient(token));
        } else {
          // TODO: Redirect to Spotify auth if no token
          console.log('No Spotify token found. Redirect to:', getSpotifyAuthUrl());
        }
      } catch (err) {
        console.error('Error initializing Spotify:', err);
        setError('Failed to initialize music player');
      }
    };

    initializeSpotify();
  }, []);

  // TODO: Implement play functionality
  const play = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      if (spotifyClient && currentTrack) {
        await spotifyClient.playTrack(currentTrack.spotifyId || '');
        setIsPlaying(true);
      } else {
        // TODO: Implement fallback audio player for non-Spotify tracks
        console.log('Playing track:', currentTrack?.title);
        setIsPlaying(true);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error playing track:', err);
      setError('Failed to play track');
      setLoading(false);
    }
  }, [spotifyClient, currentTrack]);

  // TODO: Implement pause functionality
  const pause = useCallback(async () => {
    try {
      setError(null);

      if (spotifyClient) {
        await spotifyClient.pausePlayback();
      } else {
        // TODO: Implement fallback pause
        console.log('Pausing track');
      }

      setIsPlaying(false);
    } catch (err) {
      console.error('Error pausing track:', err);
      setError('Failed to pause track');
    }
  }, [spotifyClient]);

  // TODO: Implement next track functionality
  const nextTrack = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      if (spotifyClient) {
        await spotifyClient.nextTrack();
      } else if (currentPlaylist) {
        // TODO: Implement playlist navigation
        const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack?.id);
        const nextIndex = (currentIndex + 1) % currentPlaylist.tracks.length;
        setCurrentTrack(currentPlaylist.tracks[nextIndex]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error skipping to next track:', err);
      setError('Failed to skip track');
      setLoading(false);
    }
  }, [spotifyClient, currentPlaylist, currentTrack]);

  // TODO: Implement previous track functionality
  const previousTrack = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      if (spotifyClient) {
        await spotifyClient.previousTrack();
      } else if (currentPlaylist) {
        // TODO: Implement playlist navigation
        const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack?.id);
        const prevIndex = currentIndex === 0 ? currentPlaylist.tracks.length - 1 : currentIndex - 1;
        setCurrentTrack(currentPlaylist.tracks[prevIndex]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error skipping to previous track:', err);
      setError('Failed to skip track');
      setLoading(false);
    }
  }, [spotifyClient, currentPlaylist, currentTrack]);

  // TODO: Implement playlist selection
  const setPlaylist = useCallback(async (playlistId: string) => {
    try {
      setError(null);
      setLoading(true);

      // TODO: Fetch playlist from Spotify or use default playlists
      const playlist = DEFAULT_FOCUS_PLAYLISTS.find(p => p.id === playlistId);
      
      if (playlist) {
        setCurrentPlaylist(playlist);
        setCurrentTrack(playlist.tracks[0] || null);
      } else {
        throw new Error('Playlist not found');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error setting playlist:', err);
      setError('Failed to load playlist');
      setLoading(false);
    }
  }, []);

  // TODO: Implement auto-play for focus sessions
  useEffect(() => {
    // This will be called when a focus session starts
    // TODO: Integrate with Pomodoro hook to auto-play focus music
  }, []);

  // TODO: Implement volume control
  const setVolume = useCallback((volume: number) => {
    // TODO: Implement volume control
    console.log('Setting volume to:', volume);
  }, []);

  // TODO: Implement shuffle and repeat modes
  const toggleShuffle = useCallback(() => {
    // TODO: Implement shuffle functionality
    console.log('Toggling shuffle');
  }, []);

  const toggleRepeat = useCallback(() => {
    // TODO: Implement repeat functionality
    console.log('Toggling repeat');
  }, []);

  return {
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
  };
};
