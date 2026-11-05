// ==============================================================================
// YATRA AI - SERPAPI GENERAL SEARCH SERVICE
// Retrieves web discovery, history snippets & local blogs
// ==============================================================================

import { serpApiClient } from './client';

export interface SerpApiSearchOrganicResult {
  position?: number;
  title: string;
  link: string;
  snippet?: string;
  source?: string;
}

export class SerpApiSearchService {
  public async searchLocalStories(query: string, city: string): Promise<SerpApiSearchOrganicResult[]> {
    const fullQuery = `${city} ${query} history heritage hidden gems guide`;
    
    try {
      const response = await serpApiClient.fetchSearch<{ organic_results?: SerpApiSearchOrganicResult[] }>({
        engine: 'google',
        q: fullQuery,
        hl: 'en',
        gl: 'in',
        num: 5,
      });

      return response.organic_results || [];
    } catch {
      return [];
    }
  }
}

export const serpApiSearchService = new SerpApiSearchService();

