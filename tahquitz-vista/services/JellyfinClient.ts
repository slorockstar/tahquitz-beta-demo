export interface JellyfinItem {
  Id: string;
  Name: string;
  Type: 'Movie' | 'Series' | 'Episode' | 'Audio';
  ProductionYear?: number;
  RunTimeTicks?: number; // 1 tick = 100ns
  ImageTags?: {
    Primary?: string;
  };
}

export class JellyfinClient {
  private baseUrl: string;
  private apiKey: string;
  private userId: string;

  constructor(baseUrl: string = 'http://localhost:8096', apiKey: string = '', userId: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.userId = userId;
  }

  // Generate the URL for a primary image (poster)
  public getImageUrl(itemId: string, imageTag?: string): string {
    if (!imageTag) return ''; // Fallback placeholder logic handles empty strings
    if (imageTag.startsWith('/')) return imageTag; // It's a local mock asset
    return `${this.baseUrl}/Items/${itemId}/Images/Primary?tag=${imageTag}&maxWidth=400`;
  }

  // Fetch items. Includes mock fallback if the server isn't reachable yet.
  public async getLatestMedia(type: 'Movie' | 'Series' = 'Movie'): Promise<JellyfinItem[]> {
    if (!this.apiKey || !this.userId) {
      console.warn('[JellyfinClient] No API Key provided. Returning Mock Data for Demo.');
      return this.getMockData(type);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/Users/${this.userId}/Items?IncludeItemTypes=${type}&SortBy=DateCreated&SortOrder=Descending&Limit=10`,
        {
          headers: {
            'X-Emby-Token': this.apiKey
          }
        }
      );
      
      if (!response.ok) throw new Error('Jellyfin API response not OK');
      
      const data = await response.json();
      return data.Items || [];
    } catch (error) {
      console.error('[JellyfinClient] Connection failed, falling back to mock data.', error);
      return this.getMockData(type);
    }
  }

  // High-fidelity mock data matching the user's provided mockups
  private getMockData(type: 'Movie' | 'Series'): JellyfinItem[] {
    if (type === 'Series') {
      return [
        { Id: 'mock-s1', Name: 'Yellowstone', Type: 'Series', ProductionYear: 2018, ImageTags: { Primary: '/assets/poster_drama.png' } },
        { Id: 'mock-s2', Name: 'The Handmaid\'s Tale', Type: 'Series', ProductionYear: 2017 },
        { Id: 'mock-s3', Name: 'The Sopranos', Type: 'Series', ProductionYear: 1999 },
        { Id: 'mock-s4', Name: 'Game of Thrones', Type: 'Series', ProductionYear: 2011 },
      ];
    }
    
    return [
      { Id: 'mock-m1', Name: 'Velocity Rising', Type: 'Movie', ProductionYear: 2024, ImageTags: { Primary: '/assets/poster_action.png' } },
      { Id: 'mock-m2', Name: 'Dune', Type: 'Movie', ProductionYear: 2021, ImageTags: { Primary: '/assets/poster_scifi.png' } },
      { Id: 'mock-m3', Name: 'Paw-ty Time', Type: 'Movie', ProductionYear: 2023, ImageTags: { Primary: '/assets/poster_comedy.png' } },
      { Id: 'mock-m4', Name: 'Shadow Protocol', Type: 'Movie', ProductionYear: 2024, ImageTags: { Primary: '/assets/poster_thriller.png' } },
      { Id: 'mock-m5', Name: 'Fatima', Type: 'Movie', ProductionYear: 2020 },
    ];
  }
}

// Export a singleton instance for the app to use
export const jellyfin = new JellyfinClient();
