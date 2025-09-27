'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Play, ExternalLink, Loader2 } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  url: string;
}

interface YouTubeSearchProps {
  onVideoSelect?: (video: YouTubeVideo) => void;
  placeholder?: string;
  className?: string;
}

export default function YouTubeSearch({ 
  onVideoSelect, 
  placeholder = "Search for exercise videos...",
  className = ""
}: YouTubeSearchProps) {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchVideos = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(`/api/youtube/search?exercise=${encodeURIComponent(query)}&maxResults=10&duration=short`);
      const data = await response.json();
      
      if (data.success) {
        setVideos(data.data.videos);
      } else {
        console.error('Search failed:', data.error);
        setVideos([]);
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      setVideos([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchVideos();
    }
  };

  const handleVideoClick = (video: YouTubeVideo) => {
    if (onVideoSelect) {
      onVideoSelect(video);
    } else {
      // Default behavior: open in new tab
      window.open(video.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>YouTube Exercise Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex space-x-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="flex-1"
              />
              <Button 
                onClick={searchVideos} 
                disabled={isSearching || !query.trim()}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {hasSearched && (
              <div className="space-y-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Searching for videos...</span>
                  </div>
                ) : videos.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => handleVideoClick(video)}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border"
                      >
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-20 h-15 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                          <p className="text-xs text-muted-foreground mb-1">{video.channelTitle}</p>
                          <p className="text-xs text-muted-foreground">{video.duration} • {video.viewCount}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVideoClick(video);
                            }}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Play
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(video.url, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No videos found for "{query}"</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
