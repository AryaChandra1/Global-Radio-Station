import { useState, useEffect, useCallback, Suspense } from 'react';
import { Globe } from '@/components/Globe';
import { AudioPlayer } from '@/components/AudioPlayer';
import { SearchPanel } from '@/components/SearchPanel';
import { StationList } from '@/components/StationList';
import { CountryInfo } from '@/components/CountryInfo';
import { Header } from '@/components/Header';
import { useRadioPlayer } from '@/hooks/useRadio';
import { countryCoordinates, getCountryByCode } from '@/data/countryCoordinates';
import {
  getStationsByCountry,
  searchStations,
  getTopStations,
  getPopularTags,
} from '@/services/radioApi';
import type { RadioStation, CountryCoordinates, SearchType } from '@/types/radio';
import { Loader2 } from 'lucide-react';

function GlobeLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background/50">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading 3D Globe...</p>
      </div>
    </div>
  );
}

function App() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCoordinates | null>(null);
  const [popularTags, setPopularTags] = useState<{ name: string; stationcount: number }[]>([]);
  const [listTitle, setListTitle] = useState('Popular Stations');

  const {
    currentStation,
    isPlaying,
    isLoading: isPlayerLoading,
    volume,
    error: playerError,
    setVolume,
    playStation,
    togglePlay,
    stop,
  } = useRadioPlayer();

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingStations(true);
      try {
        const [topStations, tags] = await Promise.all([
          getTopStations(50),
          getPopularTags(15),
        ]);
        setStations(topStations);
        setPopularTags(tags);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoadingStations(false);
      }
    }
    loadInitialData();
  }, []);

  // Handle country click on globe
  const handleCountryClick = useCallback(async (country: CountryCoordinates) => {
    setSelectedCountry(country);
    setIsLoadingStations(true);
    setListTitle(`Stations in ${country.name}`);
    
    try {
      const countryStations = await getStationsByCountry(country.code, 50);
      setStations(countryStations);
    } catch (error) {
      console.error('Failed to load stations:', error);
      setStations([]);
    } finally {
      setIsLoadingStations(false);
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(async (query: string, type: SearchType) => {
    setIsLoadingStations(true);
    setSelectedCountry(null);
    
    const typeLabels: Record<SearchType, string> = {
      name: 'Search',
      country: 'Country',
      tag: 'Genre',
    };
    setListTitle(`${typeLabels[type]}: "${query}"`);
    
    try {
      const results = await searchStations(query, type, 50);
      setStations(results);
    } catch (error) {
      console.error('Search failed:', error);
      setStations([]);
    } finally {
      setIsLoadingStations(false);
    }
  }, []);

  // Handle station selection
  const handleStationSelect = useCallback((station: RadioStation) => {
    playStation(station);
  }, [playStation]);

  // Clear selected country
  const handleClearCountry = useCallback(() => {
    setSelectedCountry(null);
    setListTitle('Popular Stations');
    getTopStations(50).then(setStations);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-secondary/20 pointer-events-none" />
      
      {/* Main layout */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left panel - Controls and station list */}
        <div className="w-full lg:w-[400px] xl:w-[450px] p-4 lg:p-6 space-y-4 overflow-y-auto max-h-screen">
          <Header />
          
          <SearchPanel
            onSearch={handleSearch}
            isLoading={isLoadingStations}
            popularTags={popularTags}
          />
          
          {selectedCountry && (
            <CountryInfo
              country={selectedCountry}
              stationCount={stations.length}
              onClose={handleClearCountry}
            />
          )}
          
          <StationList
            stations={stations}
            currentStation={currentStation}
            isPlaying={isPlaying}
            isLoading={isLoadingStations}
            title={listTitle}
            onStationSelect={handleStationSelect}
          />
        </div>

        {/* Right panel - Globe */}
        <div className="flex-1 relative min-h-[500px] lg:min-h-screen">
          <Suspense fallback={<GlobeLoader />}>
            <Globe
              countries={countryCoordinates}
              onCountryClick={handleCountryClick}
              selectedCountry={selectedCountry?.code || null}
            />
          </Suspense>
          
          {/* Instructions overlay */}
          <div className="absolute bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80">
            <div className="glass-panel rounded-xl p-3 text-center lg:text-left">
              <p className="text-xs text-muted-foreground">
                🌍 Click on a marker to explore radio stations from that country.
                Drag to rotate • Scroll to zoom
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed audio player at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-background to-transparent">
        <div className="max-w-3xl mx-auto">
          <AudioPlayer
            station={currentStation}
            isPlaying={isPlaying}
            isLoading={isPlayerLoading}
            volume={volume}
            error={playerError}
            onTogglePlay={togglePlay}
            onStop={stop}
            onVolumeChange={setVolume}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
