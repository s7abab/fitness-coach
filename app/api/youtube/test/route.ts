import { NextRequest, NextResponse } from 'next/server';
import { youtubeAPI } from '@/lib/youtube-api';

export async function GET(request: NextRequest) {
  try {
    // Test the YouTube API connection
    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'YouTube API key not configured',
        message: 'Please add YOUTUBE_API_KEY to your environment variables'
      });
    }

    // Test search functionality
    const testSearch = await youtubeAPI.searchExerciseVideos('push ups', 1, 'short');
    
    return NextResponse.json({
      success: true,
      message: 'YouTube API is working correctly',
      testResults: {
        searchWorking: testSearch.videos.length > 0,
        videosFound: testSearch.videos.length,
        totalResults: testSearch.totalResults
      },
      sampleVideo: testSearch.videos[0] || null
    });

  } catch (error: unknown) {
    console.error('YouTube API test failed:', error);
    
    const errorObj = error as { message?: string; status?: number };
    
    return NextResponse.json({
      success: false,
      error: errorObj.message || 'YouTube API test failed',
      message: 'Check your API key and internet connection'
    }, { status: 500 });
  }
}
