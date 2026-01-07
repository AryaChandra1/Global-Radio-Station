import { Play, Pause, Square, Volume2, VolumeX, Radio, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { RadioStation } from '@/types/radio';

interface AudioPlayerProps {
  station: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  error: string | null;
  onTogglePlay: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
}

export function AudioPlayer({
  station,
  isPlaying,
  isLoading,
  volume,
  error,
  onTogglePlay,
  onStop,
  onVolumeChange,
}: AudioPlayerProps) {
  if (!station) {
    return (
      <div className="glass-panel rounded-xl p-4 animate-fade-in">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Radio className="w-5 h-5" />
          <span className="text-sm">Select a station to start listening</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-4 animate-fade-in">
      <div className="flex items-center gap-4">
        {/* Station info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {station.favicon ? (
            <img
              src={station.favicon}
              alt={station.name}
              className="w-12 h-12 rounded-lg object-cover bg-secondary"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Radio className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{station.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{station.country}</span>
              {station.bitrate > 0 && (
                <>
                  <span>•</span>
                  <span>{station.bitrate} kbps</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onStop}
            className="text-muted-foreground hover:text-foreground"
          >
            <Square className="w-4 h-4" />
          </Button>
          
          <Button
            size="icon"
            onClick={onTogglePlay}
            disabled={isLoading}
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Volume control */}
        <div className="hidden sm:flex items-center gap-2 w-32">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onVolumeChange(volume === 0 ? 0.7 : 0)}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[volume * 100]}
            onValueChange={([value]) => onVolumeChange(value / 100)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
      
      {/* Now playing indicator */}
      {isPlaying && !isLoading && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${8 + Math.random() * 12}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-primary font-medium">Now Playing</span>
        </div>
      )}
    </div>
  );
}
