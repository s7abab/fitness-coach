import { NextRequest, NextResponse } from 'next/server';
import { youtubeAPI } from '@/lib/youtube-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseName = searchParams.get('exercise');
    const maxResults = parseInt(searchParams.get('maxResults') || '5');
    const duration = searchParams.get('duration') as 'short' | 'medium' | 'long' | 'any' || 'short';

    if (!exerciseName) {
      return NextResponse.json(
        { success: false, error: 'Exercise name is required' },
        { status: 400 }
      );
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    const result = await youtubeAPI.searchExerciseVideos(exerciseName, maxResults, duration);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: unknown) {
    console.error('Error searching YouTube videos:', error);
    
    const errorObj = error as { message?: string; status?: number };
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorObj.message || 'Failed to search YouTube videos'
      },
      { status: errorObj.status || 500 }
    );
  }
}
