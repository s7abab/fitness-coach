export interface YouTubeVideo {
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

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  totalResults: number;
}

export interface YouTubeVideoDetails {
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

class YouTubeAPI {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('YouTube API key not found. YouTube features will be limited.');
    }
  }

  /**
   * Search for exercise videos on YouTube
   */
  async searchExerciseVideos(
    exerciseName: string,
    maxResults: number = 5,
    duration: 'short' | 'medium' | 'long' | 'any' = 'short'
  ): Promise<YouTubeSearchResult> {
    if (!this.apiKey) {
      return { videos: [], totalResults: 0 };
    }

    try {
      // Create search query for exercise videos
      const query = `${exerciseName} exercise tutorial how to`;
      
      // Build duration filter
      let durationFilter = '';
      if (duration === 'short') {
        durationFilter = '&videoDuration=short'; // Under 4 minutes
      } else if (duration === 'medium') {
        durationFilter = '&videoDuration=medium'; // 4-20 minutes
      } else if (duration === 'long') {
        durationFilter = '&videoDuration=long'; // Over 20 minutes
      }

      const url = `${this.baseUrl}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=${maxResults}&order=relevance&videoDefinition=high&videoEmbeddable=true${durationFilter}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const videos: YouTubeVideo[] = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        duration: '', // Will be filled by getVideoDetails
        viewCount: '', // Will be filled by getVideoDetails
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      })) || [];

      // Get additional details for each video
      const videoDetails = await this.getVideoDetails(videos.map(v => v.id));
      
      // Merge search results with detailed information
      const enrichedVideos = videos.map(video => {
        const details = videoDetails.find(d => d.id === video.id);
        return {
          ...video,
          duration: details?.duration || '',
          viewCount: details?.viewCount || ''
        };
      });

      return {
        videos: enrichedVideos,
        totalResults: data.pageInfo?.totalResults || 0
      };
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      return { videos: [], totalResults: 0 };
    }
  }

  /**
   * Get detailed information about specific videos
   */
  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideoDetails[]> {
    if (!this.apiKey || videoIds.length === 0) {
      return [];
    }

    try {
      const url = `${this.baseUrl}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${this.apiKey}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return data.items?.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        duration: this.formatDuration(item.contentDetails.duration),
        viewCount: this.formatViewCount(item.statistics.viewCount),
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id}`
      })) || [];
    } catch (error) {
      console.error('Error getting video details:', error);
      return [];
    }
  }

  /**
   * Get a single video by ID
   */
  async getVideoById(videoId: string): Promise<YouTubeVideoDetails | null> {
    const videos = await this.getVideoDetails([videoId]);
    return videos[0] || null;
  }

  /**
   * Search for videos by a specific channel
   */
  async searchChannelVideos(
    channelId: string,
    query: string,
    maxResults: number = 10
  ): Promise<YouTubeSearchResult> {
    if (!this.apiKey) {
      return { videos: [], totalResults: 0 };
    }

    try {
      const url = `${this.baseUrl}/search?part=snippet&type=video&channelId=${channelId}&q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=${maxResults}&order=relevance&videoDefinition=high&videoEmbeddable=true`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const videos: YouTubeVideo[] = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        duration: '',
        viewCount: '',
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      })) || [];

      return {
        videos,
        totalResults: data.pageInfo?.totalResults || 0
      };
    } catch (error) {
      console.error('Error searching channel videos:', error);
      return { videos: [], totalResults: 0 };
    }
  }

  /**
   * Format ISO 8601 duration to readable format
   */
  private formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Format view count to readable format
   */
  private formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    } else {
      return `${count} views`;
    }
  }

  /**
   * Extract video ID from YouTube URL
   */
  static extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  /**
   * Generate YouTube thumbnail URL
   */
  static getThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string {
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
  }

  /**
   * Generate YouTube embed URL
   */
  static getEmbedUrl(videoId: string, autoplay: boolean = false): string {
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;
  }
}

// Export singleton instance
export const youtubeAPI = new YouTubeAPI();
export default youtubeAPI;
