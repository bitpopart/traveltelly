import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedSearch, useSearchSuggestions } from '@/hooks/useUnifiedSearch';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Search,
  Star,
  BookOpen,
  Camera,
  MapPin,
  Calendar,
  DollarSign,
  Hash,
  TrendingUp,
  X,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nip19 } from 'nostr-tools';
import type { SearchResult } from '@/hooks/useUnifiedSearch';

interface SearchResultItemProps {
  result: SearchResult;
  onSelect: () => void;
  onTagClick?: (tag: string) => void;
  isNavigating?: boolean;
}

function SearchResultItem({ result, onSelect, onTagClick, isNavigating }: SearchResultItemProps) {
  const author = useAuthor(result.author);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(result.author);
  const profileImage = metadata?.picture;

  const getTypeIcon = () => {
    switch (result.type) {
      case 'review':
        return <Star className="h-4 w-4 text-orange-500" />;
      case 'story':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'media':
        return <Camera className="h-4 w-4 text-green-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (result.type) {
      case 'review':
        return 'Review';
      case 'story':
        return 'Story';
      case 'media':
        return 'Media';
    }
  };

  const handleClick = () => {
    console.log('SearchResultItem handleClick called', { isNavigating, result: result.title });

    if (!isNavigating) {
      console.log('Calling onSelect for:', result.title);
      onSelect();
    } else {
      console.log('Navigation in progress, ignoring click');
    }
  };



  return (
    <div
      className="p-0 cursor-pointer border-b border-border/50 last:border-b-0"
    >
      <button
        type="button"
        className={`p-4 w-full hover:bg-muted/30 hover:shadow-sm transition-all duration-200 rounded-sm group text-left ${isNavigating ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        onClick={handleClick}
        disabled={isNavigating}
      >
      <div className="flex items-start space-x-3 w-full">
        <div className="flex-shrink-0">
          {getTypeIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-medium truncate">{result.title}</h4>
            <Badge variant="outline" className="text-xs">
              {getTypeLabel()}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {result.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-4 w-4">
                <AvatarImage src={profileImage} alt={displayName} />
                <AvatarFallback className="text-xs">
                  {displayName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{displayName}</span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {result.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{result.rating}</span>
                </div>
              )}
              {result.price && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{result.price} {result.currency}</span>
                </div>
              )}
              {result.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-20">{result.location}</span>
                </div>
              )}
              <Calendar className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(result.createdAt * 1000), { addSuffix: true })}</span>
            </div>
          </div>

          {result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {result.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`text-xs ${onTagClick ? 'cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors duration-200 hover:shadow-sm' : ''}`}
                  onClick={onTagClick ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onTagClick(tag);
                  } : undefined}
                  title={onTagClick ? `Click to search for #${tag}` : undefined}
                >
                  #{tag}
                </Badge>
              ))}
              {result.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{result.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Clickable indicator */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isNavigating ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      </button>
    </div>
  );
}

interface UnifiedSearchBarProps {
  className?: string;
  placeholder?: string;
}

export function UnifiedSearchBar({
  className = "",
  placeholder = "Search reviews, stories, and media..."
}: UnifiedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [pendingSuggestionNavigation, setPendingSuggestionNavigation] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading } = useUnifiedSearch(query);
  const { data: suggestions } = useSearchSuggestions();

  const handleSelectResult = useCallback((result: SearchResult) => {
    if (navigating) {
      console.log('Already navigating, ignoring click');
      return; // Prevent multiple clicks
    }

    console.log('Search result clicked:', result);
    setNavigating(true);
    setIsOpen(false);
    setQuery('');

    try {
      switch (result.type) {
        case 'review': {
          const dTag = result.event.tags.find(([name]) => name === 'd')?.[1];
          if (!dTag) {
            console.warn('Review missing d tag, navigating to reviews page');
            navigate('/reviews');
            return;
          }
          const naddr = nip19.naddrEncode({
            identifier: dTag,
            pubkey: result.author,
            kind: 34879,
          });
          console.log('Navigating to review:', `/review/${naddr}`);
          navigate(`/review/${naddr}`);
          break;
        }
        case 'story': {
          const dTag = result.event.tags.find(([name]) => name === 'd')?.[1];
          console.log('Navigating to stories:', dTag ? `/stories#${dTag}` : '/stories');
          navigate(dTag ? `/stories#${dTag}` : '/stories');
          break;
        }
        case 'media': {
          const dTag = result.event.tags.find(([name]) => name === 'd')?.[1];
          console.log('Navigating to marketplace:', dTag ? `/marketplace#${dTag}` : '/marketplace');
          navigate(dTag ? `/marketplace#${dTag}` : '/marketplace');
          break;
        }
        default:
          console.log('Unknown result type, navigating to home');
          navigate('/');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation based on type
      switch (result.type) {
        case 'review':
          navigate('/reviews');
          break;
        case 'story':
          navigate('/stories');
          break;
        case 'media':
          navigate('/marketplace');
          break;
        default:
          navigate('/');
      }
    } finally {
      // Reset navigating state after a short delay
      setTimeout(() => setNavigating(false), 500);
    }
  }, [navigate, navigating]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;

    setIsOpen(false);
    // Navigate to a search results page or show results in a modal
    // For now, we'll navigate to the most relevant section
    if (searchResults && searchResults.length > 0) {
      handleSelectResult(searchResults[0]);
    }
  }, [query, searchResults, handleSelectResult]);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle automatic navigation after suggestion click
  useEffect(() => {
    if (pendingSuggestionNavigation && searchResults && searchResults.length > 0 && !isLoading) {
      console.log('Auto-navigating to first search result:', searchResults[0]);
      setPendingSuggestionNavigation(false);
      handleSelectResult(searchResults[0]);
    }
  }, [pendingSuggestionNavigation, searchResults, isLoading, handleSelectResult]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev =>
            prev < (searchResults?.length || 0) - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && searchResults?.[selectedIndex]) {
            handleSelectResult(searchResults[selectedIndex]);
          } else if (query.trim()) {
            handleSearch();
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchResults, query, handleSearch, handleSelectResult]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(value.length >= 2);
  };

  const handleSuggestionClick = useCallback((suggestion: string) => {
    console.log('Suggestion clicked - navigating to first result for:', suggestion);
    setQuery(suggestion);
    setSelectedIndex(-1);
    setIsOpen(false); // Close dropdown since we're navigating
    setPendingSuggestionNavigation(true); // Flag for auto-navigation
    inputRef.current?.focus();
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    console.log('Tag clicked - navigating to first result for:', tag);
    setQuery(tag);
    setSelectedIndex(-1);
    setIsOpen(false); // Close dropdown since we're navigating
    setPendingSuggestionNavigation(true); // Flag for auto-navigation
    inputRef.current?.focus();
  }, []);

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          className="pl-10 pr-20 h-12 text-base rounded-full cursor-pointer"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="h-8 rounded-full"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                <div>
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className={`${selectedIndex === index ? 'bg-muted/50' : ''}`}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onMouseLeave={() => setSelectedIndex(-1)}
                    >
                      <SearchResultItem
                        result={result}
                        onSelect={() => handleSelectResult(result)}
                        onTagClick={handleTagClick}
                        isNavigating={navigating}
                      />
                    </div>
                  ))}
                </div>
                {searchResults.length > 0 && (
                  <div className="p-2 text-center text-xs text-muted-foreground/70 border-t border-border/50">
                    💡 Click any result to view • Click tags to search
                  </div>
                )}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
                <p className="text-sm">Try searching for tags, locations, or titles</p>
              </div>
            ) : (
              suggestions && suggestions.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Popular tags</span>
                    <span className="text-xs text-muted-foreground/70 bg-muted/50 px-2 py-1 rounded">(👆 click to go to item)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(showAllSuggestions ? suggestions : suggestions.slice(0, 12)).map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="h-7 text-xs rounded-full hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200 hover:shadow-sm hover:scale-105 cursor-pointer"
                        title={`Click to go to first result for #${suggestion}`}
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                    {suggestions.length > 12 && !showAllSuggestions && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllSuggestions(true)}
                        className="h-7 text-xs rounded-full text-muted-foreground hover:text-primary"
                      >
                        +{suggestions.length - 12} more
                      </Button>
                    )}
                    {showAllSuggestions && suggestions.length > 12 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllSuggestions(false)}
                        className="h-7 text-xs rounded-full text-muted-foreground hover:text-primary"
                      >
                        Show less
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground/70 text-center bg-muted/30 p-2 rounded">
                    💡 <strong>Tip:</strong> Click any tag above to go directly to the first matching item, or type to browse results
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}