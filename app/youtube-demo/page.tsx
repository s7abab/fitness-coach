'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import YouTubeSearch from '@/components/youtube/YouTubeSearch';
import VideoPlayer from '@/components/workout/VideoPlayer';
import { Play, ExternalLink, TestTube } from 'lucide-react';

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

export default function YouTubeDemoPage() {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testYouTubeAPI = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/youtube/test');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ success: false, error: 'Test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">YouTube API Integration Demo</h1>
        <p className="text-muted-foreground">
          Test the YouTube Data API v3 integration for finding exercise videos
        </p>
      </div>

      {/* API Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>API Connection Test</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={testYouTubeAPI} disabled={isTesting}>
              {isTesting ? 'Testing...' : 'Test YouTube API'}
            </Button>
            
            {testResults && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={testResults.success ? 'default' : 'destructive'}>
                    {testResults.success ? 'Connected' : 'Failed'}
                  </Badge>
                  <span className="text-sm">{testResults.message}</span>
                </div>
                
                {testResults.testResults && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Search Working</div>
                      <div className={testResults.testResults.searchWorking ? 'text-green-600' : 'text-red-600'}>
                        {testResults.testResults.searchWorking ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Videos Found</div>
                      <div>{testResults.testResults.videosFound}</div>
                    </div>
                    <div>
                      <div className="font-medium">Total Results</div>
                      <div>{testResults.testResults.totalResults}</div>
                    </div>
                    <div>
                      <div className="font-medium">API Status</div>
                      <div className="text-green-600">Active</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* YouTube Search Component */}
      <YouTubeSearch
        onVideoSelect={setSelectedVideo}
        placeholder="Search for exercise videos (e.g., 'push ups', 'squats', 'yoga')"
      />

      {/* Selected Video Display */}
      {selectedVideo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Selected Video</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <img
                  src={selectedVideo.thumbnailUrl}
                  alt={selectedVideo.title}
                  className="w-32 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{selectedVideo.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{selectedVideo.channelTitle}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{selectedVideo.duration}</span>
                    <span>{selectedVideo.viewCount}</span>
                    <span>{new Date(selectedVideo.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  onClick={() => window.open(selectedVideo.url, '_blank', 'noopener,noreferrer')}
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-3">
                {selectedVideo.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Player Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Video Player Component</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This is how the VideoPlayer component works with the selected video:
            </p>
            
            <VideoPlayer
              videoUrl={selectedVideo?.url}
              videoThumbnail={selectedVideo?.thumbnailUrl}
              exerciseName={selectedVideo?.title || 'Exercise Demo'}
              autoSearch={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">1. Get YouTube API Key</h4>
              <p>Go to <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a> and create an API key for YouTube Data API v3.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. Configure Environment</h4>
              <p>Add your API key to <code className="bg-muted px-1 rounded">.env.local</code>:</p>
              <pre className="bg-muted p-2 rounded mt-1">
                YOUTUBE_API_KEY=your-api-key-here
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. Restart Development Server</h4>
              <p>Restart your Next.js development server to load the new environment variable.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
