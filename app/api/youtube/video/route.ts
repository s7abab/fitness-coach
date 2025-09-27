import { NextRequest, NextResponse } from 'next/server';
import { youtubeAPI } from '@/lib/youtube-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      );
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    const video = await youtubeAPI.getVideoById(videoId);

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: video
    });

  } catch (error: unknown) {
    console.error('Error getting video details:', error);
    
    const errorObj = error as { message?: string; status?: number };
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorObj.message || 'Failed to get video details'
      },
      { status: errorObj.status || 500 }
    );
  }
}
