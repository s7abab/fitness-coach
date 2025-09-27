'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  videoThumbnail?: string;
  exerciseName: string;
  className?: string;
}

export default function VideoPlayer({ 
  videoUrl, 
  videoThumbnail, 
  exerciseName, 
  className = "" 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoUrl) {
    return null;
  }

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);
  
  if (!videoId) {
    return (
      <div className={`${className}`}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm hover:text-primary transition-colors"
              >
                Watch {exerciseName} demonstration
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate YouTube thumbnail URL
  const thumbnailUrl = videoThumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  // Generate YouTube embed URL
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleOpenInNewTab = () => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };

  const handleVideoError = () => {
    console.log('Video unavailable, showing fallback message');
  };

  const searchExerciseOnYouTube = () => {
    const searchQuery = encodeURIComponent(`${exerciseName} exercise tutorial`);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank', 'noopener,noreferrer');
  };

  if (isPlaying) {
    return (
      <div className={`${className}`}>
        <Card>
          <CardContent className="p-0">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={embedUrl}
                title={`${exerciseName} demonstration`}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={handleVideoError}
              />
              {/* Fallback for unavailable videos */}
              <div className="absolute inset-0 bg-muted/90 flex items-center justify-center rounded-lg hidden" id="video-fallback">
                <div className="text-center p-4">
                  <div className="text-muted-foreground mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Video unavailable</p>
                  </div>
                  <Button onClick={searchExerciseOnYouTube} size="sm">
                    Search on YouTube
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Card className="overflow-hidden">
        <div className="relative group">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <img
              src={thumbnailUrl}
              alt={`${exerciseName} video thumbnail`}
              className="absolute top-0 left-0 w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default thumbnail if maxresdefault fails
                const target = e.target as HTMLImageElement;
                if (target.src.includes('maxresdefault')) {
                  target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }
              }}
            />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <Button
                onClick={handlePlay}
                size="lg"
                className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <Play className="h-6 w-6 ml-1" fill="currentColor" />
              </Button>
            </div>
          </div>
          
          {/* Video title and actions */}
          <div className="p-4">
            <h4 className="font-medium text-sm mb-2">Watch {exerciseName} demonstration</h4>
            <div className="flex space-x-2">
              <Button
                onClick={handlePlay}
                size="sm"
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Play Video
              </Button>
              <Button
                onClick={handleOpenInNewTab}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2">
              <Button
                onClick={searchExerciseOnYouTube}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Search on YouTube
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
