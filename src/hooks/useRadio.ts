import { useState, useCallback, useRef, useEffect } from 'react';
import type { RadioStation } from '@/types/radio';
import { clickStation } from '@/services/radioApi';

export function useRadioPlayer() {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    const audio = audioRef.current;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Failed to load stream. Try another station.');
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playStation = useCallback(async (station: RadioStation) => {
    if (!audioRef.current) return;
    
    setError(null);
    setIsLoading(true);
    
    // Stop current playback
    audioRef.current.pause();
    
    // Set new station
    setCurrentStation(station);
    
    // Use resolved URL if available
    const streamUrl = station.url_resolved || station.url;
    audioRef.current.src = streamUrl;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      // Track click for API stats
      clickStation(station.stationuuid);
    } catch {
      setError('Failed to play stream. Try another station.');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentStation) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setError('Failed to resume playback.');
      });
    }
  }, [isPlaying, currentStation]);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = '';
    setIsPlaying(false);
    setCurrentStation(null);
    setError(null);
  }, []);

  return {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    error,
    setVolume,
    playStation,
    togglePlay,
    stop,
  };
}
