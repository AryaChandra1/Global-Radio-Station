import { useState } from 'react';
import { Search, Radio, Globe2, Music, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SearchType } from '@/types/radio';

interface SearchPanelProps {
  onSearch: (query: string, type: SearchType) => void;
  isLoading: boolean;
  popularTags: { name: string; stationcount: number }[];
}

const searchTypes: { value: SearchType; label: string; icon: React.ReactNode }[] = [
  { value: 'name', label: 'Station', icon: <Radio className="w-4 h-4" /> },
  { value: 'country', label: 'Country', icon: <Globe2 className="w-4 h-4" /> },
  { value: 'tag', label: 'Genre', icon: <Music className="w-4 h-4" /> },
];

export function SearchPanel({ onSearch, isLoading, popularTags }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('name');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), searchType);
    }
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    setSearchType('tag');
    onSearch(tag, 'tag');
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <div className="glass-panel rounded-xl p-4 space-y-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search radio stations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search type selector */}
        <div className="flex gap-1">
          {searchTypes.map((type) => (
            <Button
              key={type.value}
              type="button"
              variant={searchType === type.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSearchType(type.value)}
              className={`flex-1 gap-1.5 ${
                searchType === type.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {type.icon}
              <span className="hidden sm:inline">{type.label}</span>
            </Button>
          ))}
        </div>

        {/* Search button */}
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {/* Popular genres */}
      {popularTags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Popular Genres
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {popularTags.slice(0, 10).map((tag) => (
              <Badge
                key={tag.name}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
