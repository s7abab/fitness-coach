# YouTube API Integration for Fitness Coach

This document explains how to set up and use the YouTube Data API v3 integration in the Fitness Coach application.

## Features

- **Automatic Video Discovery**: Automatically finds relevant exercise demonstration videos
- **Smart Video Selection**: Searches for high-quality, short-duration videos
- **Video Metadata**: Displays video titles, descriptions, thumbnails, duration, and view counts
- **Interactive Video Player**: Embedded YouTube player with fallback options
- **Manual Search**: Users can search for alternative videos
- **API Rate Limiting**: Built-in error handling and retry logic

## Setup

### 1. Get YouTube API Key

1. Go to the [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Copy your API key

### 2. Configure Environment Variables

Add your YouTube API key to your environment variables:

```bash
# .env.local
YOUTUBE_API_KEY=your-youtube-api-key-here
```

### 3. API Quotas

The YouTube Data API v3 has quotas:
- **Daily Quota**: 10,000 units per day (default)
- **Search Request**: 100 units
- **Video Details Request**: 1 unit per video

**Important**: Monitor your usage in the Google Cloud Console to avoid hitting quotas.

## API Endpoints

### Search Videos
```
GET /api/youtube/search?exercise={exerciseName}&maxResults={number}&duration={duration}
```

**Parameters:**
- `exercise`: Exercise name to search for
- `maxResults`: Number of results (1-50, default: 5)
- `duration`: Video duration filter (`short`, `medium`, `long`, `any`)

**Example:**
```bash
curl "http://localhost:3000/api/youtube/search?exercise=push%20ups&maxResults=5&duration=short"
```

### Get Video Details
```
GET /api/youtube/video?videoId={videoId}
```

**Parameters:**
- `videoId`: YouTube video ID

**Example:**
```bash
curl "http://localhost:3000/api/youtube/video?videoId=dQw4w9WgXcQ"
```

## Components

### VideoPlayer Component

Enhanced video player with YouTube API integration:

```tsx
import VideoPlayer from '@/components/workout/VideoPlayer';

<VideoPlayer
  videoUrl={exercise.videoUrl}
  videoThumbnail={exercise.videoThumbnail}
  exerciseName={exercise.name}
  autoSearch={true} // Enable automatic video search
  className="mb-4"
/>
```

**Props:**
- `videoUrl`: Optional existing video URL
- `videoThumbnail`: Optional thumbnail URL
- `exerciseName`: Exercise name for search
- `autoSearch`: Enable automatic video search if no URL provided
- `className`: Additional CSS classes

### YouTubeSearch Component

Standalone search component:

```tsx
import YouTubeSearch from '@/components/youtube/YouTubeSearch';

<YouTubeSearch
  onVideoSelect={(video) => console.log('Selected:', video)}
  placeholder="Search for exercise videos..."
  className="mb-4"
/>
```

**Props:**
- `onVideoSelect`: Callback when a video is selected
- `placeholder`: Search input placeholder
- `className`: Additional CSS classes

## Usage in Workout Generation

The workout generation API automatically enhances exercises with YouTube videos:

1. **AI generates workout plan** with exercise names
2. **YouTube API searches** for relevant videos for each exercise
3. **Videos are matched** based on exercise names
4. **Enhanced workout plan** is returned with video URLs and thumbnails

## Error Handling

The integration includes comprehensive error handling:

- **API Key Missing**: Graceful fallback without YouTube features
- **Rate Limiting**: Automatic retry with exponential backoff
- **Video Not Found**: Fallback to manual search options
- **Network Errors**: User-friendly error messages

## Best Practices

### 1. Video Selection Criteria

The API searches for videos with these criteria:
- **Duration**: Prefers short videos (under 4 minutes) for exercises
- **Quality**: High definition videos only
- **Embeddable**: Only videos that can be embedded
- **Relevance**: Sorted by relevance to exercise name

### 2. Caching

Consider implementing caching for:
- Search results (cache for 1 hour)
- Video metadata (cache for 24 hours)
- Thumbnail images (browser caching)

### 3. Performance Optimization

- **Lazy Loading**: Load videos only when needed
- **Thumbnail Optimization**: Use appropriate thumbnail sizes
- **Batch Requests**: Group video detail requests when possible

## Troubleshooting

### Common Issues

1. **"YouTube API key not configured"**
   - Check your `.env.local` file
   - Ensure `YOUTUBE_API_KEY` is set correctly
   - Restart your development server

2. **"Quota exceeded"**
   - Check your API usage in Google Cloud Console
   - Consider upgrading your quota
   - Implement caching to reduce API calls

3. **"Video not found"**
   - The video may be private or deleted
   - Try searching for alternative videos
   - Check if the video ID is correct

4. **"Search returns no results"**
   - Try different search terms
   - Check if the exercise name is too specific
   - Verify your API key has proper permissions

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will log API requests and responses to the console.

## Security Considerations

1. **API Key Protection**: Never expose your API key in client-side code
2. **Rate Limiting**: Implement proper rate limiting on your API endpoints
3. **Input Validation**: Sanitize search queries to prevent injection attacks
4. **CORS**: Configure CORS properly for your domain

## Future Enhancements

Potential improvements for the YouTube integration:

1. **Video Categories**: Categorize videos by exercise type
2. **User Preferences**: Remember user's video preferences
3. **Offline Support**: Cache videos for offline viewing
4. **Analytics**: Track which videos are most helpful
5. **Custom Playlists**: Create exercise-specific playlists
6. **Video Ratings**: Allow users to rate video quality
7. **Multi-language**: Support for videos in different languages

## Support

For issues related to:
- **YouTube API**: Check [YouTube API Documentation](https://developers.google.com/youtube/v3)
- **Google Cloud**: Check [Google Cloud Console](https://console.developers.google.com/)
- **This Integration**: Check the application logs and error messages
