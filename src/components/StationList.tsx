import { Radio, Play, Signal, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { RadioStation } from '@/types/radio';

interface StationListProps {
  stations: RadioStation[];
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  title: string;
  onStationSelect: (station: RadioStation) => void;
}

export function StationList({
  stations,
  currentStation,
  isPlaying,
  isLoading,
  title,
  onStationSelect,
}: StationListProps) {
  if (isLoading) {
    return (
      <div className="glass-panel rounded-xl p-6 animate-fade-in">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading stations...</span>
        </div>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <Radio className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No stations found</p>
          <p className="text-sm mt-1">Try selecting a country on the globe</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {stations.length} stations
          </Badge>
        </div>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="p-2 space-y-1">
          {stations.map((station) => {
            const isCurrentStation = currentStation?.stationuuid === station.stationuuid;
            const isThisPlaying = isCurrentStation && isPlaying;
            
            return (
              <button
                key={station.stationuuid}
                onClick={() => onStationSelect(station)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left group ${
                  isCurrentStation
                    ? 'bg-primary/20 border border-primary/30'
                    : 'hover:bg-secondary/50'
                }`}
              >
                {/* Station icon/favicon */}
                <div className="relative shrink-0">
                  {station.favicon ? (
                    <img
                      src={station.favicon}
                      alt={station.name}
                      className="w-10 h-10 rounded-lg object-cover bg-secondary"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '';
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ${station.favicon ? 'hidden' : ''}`}>
                    <Radio className="w-5 h-5 text-primary" />
                  </div>
                  {/* Playing indicator */}
                  {isThisPlaying && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <div className="flex gap-0.5">
                        {[...Array(3)].map((_, i) => (
                          <span
                            key={i}
                            className="w-0.5 bg-primary-foreground rounded-full animate-pulse"
                            style={{
                              height: `${3 + Math.random() * 4}px`,
                              animationDelay: `${i * 0.15}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Station info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium truncate ${isCurrentStation ? 'text-primary' : 'text-foreground'}`}>
                    {station.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {station.tags && (
                      <span className="truncate max-w-[150px]">
                        {station.tags.split(',').slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Station metadata */}
                <div className="flex items-center gap-2 shrink-0">
                  {station.bitrate > 0 && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Signal className="w-3 h-3" />
                      {station.bitrate}k
                    </Badge>
                  )}
                  {station.votes > 0 && (
                    <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Heart className="w-3 h-3" />
                      {station.votes > 1000 ? `${(station.votes / 1000).toFixed(1)}k` : station.votes}
                    </div>
                  )}
                </div>

                {/* Play button (visible on hover) */}
                <Button
                  size="icon"
                  variant="ghost"
                  className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isCurrentStation ? 'opacity-100' : ''
                  }`}
                >
                  <Play className={`w-4 h-4 ${isThisPlaying ? 'text-primary' : ''}`} />
                </Button>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
