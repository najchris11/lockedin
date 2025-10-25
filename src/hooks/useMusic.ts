// Custom hook for music player functionality
import { useState, useEffect, useCallback, useRef } from 'react';
import { UseMusicReturn, MusicTrack, MusicPlaylist } from '@/types';
import { SpotifyClient, getSpotifyAuthUrl } from '@/lib/spotify';

// Cache for Spotify data to reduce API calls
const spotifyCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for Spotify data

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
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  // Optimized Spotify authentication with caching
  useEffect(() => {
    const initializeSpotify = async () => {
      // Prevent multiple initializations
      if (initializationRef.current) return;
      initializationRef.current = true;

      try {
        // Check for existing Spotify token in localStorage
        const token = localStorage.getItem('spotify_access_token');
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        
        if (token) {
          const client = new SpotifyClient(token, refreshToken || undefined);
          setSpotifyClient(client);
          
          // Try to get user's playlists with caching
          try {
            const cacheKey = `playlists_${userId}`;
            const cached = spotifyCache.get(cacheKey);
            const now = Date.now();
            
            if (cached && (now - cached.timestamp) < CACHE_DURATION) {
              console.log('Using cached playlists');
            } else {
              const playlists = await client.getPlaylists();
              spotifyCache.set(cacheKey, { data: playlists, timestamp: now });
              console.log('User playlists:', playlists);
            }
          } catch (err) {
            console.error('Failed to fetch playlists:', err);
          }
        } else {
          console.log('No Spotify token found. Redirect to:', getSpotifyAuthUrl());
        }
      } catch (err) {
        console.error('Error initializing Spotify:', err);
        setError('Failed to initialize music player');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeSpotify();
  }, [userId]);

  // Implement play functionality
  const play = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      if (spotifyClient && currentTrack?.spotifyId) {
        await spotifyClient.playTrack(currentTrack.spotifyId);
        setIsPlaying(true);
      } else if (spotifyClient) {
        // Resume playback if no specific track
        await spotifyClient.resumePlayback();
        setIsPlaying(true);
      } else {
        // Fallback for demo tracks
        console.log('Playing track:', currentTrack?.title);
        setIsPlaying(true);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error playing track:', err);
      setError('Failed to play track. Make sure Spotify is open and a device is selected.');
      setLoading(false);
    }
  }, [spotifyClient, currentTrack]);

  // Implement pause functionality
  const pause = useCallback(async () => {
    try {
      setError(null);

      if (spotifyClient) {
        await spotifyClient.pausePlayback();
      } else {
        // Fallback pause
        console.log('Pausing track');
      }

      setIsPlaying(false);
    } catch (err) {
      console.error('Error pausing track:', err);
      setError('Failed to pause track');
    }
  }, [spotifyClient]);

  // Implement next track functionality
  const nextTrack = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      if (spotifyClient) {
        await spotifyClient.nextTrack();
        // Get updated playback state
        const playback = await spotifyClient.getCurrentPlayback();
        if (playback?.item) {
          setCurrentTrack({
            id: playback.item.id,
            title: playback.item.name,
            artist: playback.item.artists[0]?.name || 'Unknown Artist',
            duration: Math.floor(playback.item.duration_ms / 1000),
            spotifyId: playback.item.id
          });
        }
      } else if (currentPlaylist) {
        // Fallback playlist navigation
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

  // Implement previous track functionality
  const previousTrack = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      if (spotifyClient) {
        await spotifyClient.previousTrack();
        // Get updated playback state
        const playback = await spotifyClient.getCurrentPlayback();
        if (playback?.item) {
          setCurrentTrack({
            id: playback.item.id,
            title: playback.item.name,
            artist: playback.item.artists[0]?.name || 'Unknown Artist',
            duration: Math.floor(playback.item.duration_ms / 1000),
            spotifyId: playback.item.id
          });
        }
      } else if (currentPlaylist) {
        // Fallback playlist navigation
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

  // Optimized playlist selection with caching
  const setPlaylist = useCallback(async (playlistId: string) => {
    try {
      setError(null);
      setLoading(true);

      if (spotifyClient) {
        // Check cache first
        const cacheKey = `playlists_${userId}`;
        const cached = spotifyCache.get(cacheKey);
        const now = Date.now();
        
        let playlists;
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          playlists = cached.data;
        } else {
          playlists = await spotifyClient.getPlaylists();
          spotifyCache.set(cacheKey, { data: playlists, timestamp: now });
        }

        const userPlaylist = playlists.find((p: any) => p.id === playlistId);
        
        if (userPlaylist) {
          // Convert Spotify playlist to our format
          const tracks = userPlaylist.tracks.items.map((item: any) => ({
            id: item.track.id,
            title: item.track.name,
            artist: item.track.artists[0]?.name || 'Unknown Artist',
            duration: Math.floor(item.track.duration_ms / 1000),
            spotifyId: item.track.id
          }));

          const playlist: MusicPlaylist = {
            id: userPlaylist.id,
            name: userPlaylist.name,
            description: userPlaylist.description,
            isFocusPlaylist: true,
            tracks
          };

          setCurrentPlaylist(playlist);
          setCurrentTrack(tracks[0] || null);
        } else {
          throw new Error('Playlist not found');
        }
      } else {
        // Use default playlists when not connected to Spotify
        const playlist = DEFAULT_FOCUS_PLAYLISTS.find(p => p.id === playlistId);
        if (playlist) {
          setCurrentPlaylist(playlist);
          setCurrentTrack(playlist.tracks[0] || null);
        } else {
          throw new Error('Playlist not found');
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error setting playlist:', err);
      setError('Failed to load playlist');
      setLoading(false);
    }
  }, [spotifyClient, userId]);

  // TODO: Implement auto-play for focus sessions
  useEffect(() => {
    // This will be called when a focus session starts
    // TODO: Integrate with Pomodoro hook to auto-play focus music
  }, []);

  // TODO: Implement volume control
  const setVolume = useCallback(async (volume: number) => {
    try {
      if (spotifyClient) {
        await spotifyClient.setVolume(volume);
        console.log('Volume set to:', volume);
      } else {
        console.log('Setting volume to:', volume);
      }
    } catch (err) {
      console.error('Error setting volume:', err);
    }
  }, [spotifyClient]);

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
