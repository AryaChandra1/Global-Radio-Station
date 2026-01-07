import { MapPin, Radio, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CountryCoordinates } from '@/types/radio';

interface CountryInfoProps {
  country: CountryCoordinates | null;
  stationCount: number;
  onClose: () => void;
}

export function CountryInfo({ country, stationCount, onClose }: CountryInfoProps) {
  if (!country) return null;

  return (
    <div className="glass-panel rounded-xl p-4 animate-slide-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{country.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Radio className="w-4 h-4" />
              <span>{stationCount} stations available</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-mono">
              <span>{country.lat.toFixed(2)}°</span>
              <span>,</span>
              <span>{country.lng.toFixed(2)}°</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
