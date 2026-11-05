// ==============================================================================
// YATRA AI - SERPAPI CLIENT LAYER
// Secure, typed SerpApi client reading from SERPAPI_API_KEY
// ==============================================================================

export interface SerpApiSearchParams {
  engine?: string;
  q?: string;
  ll?: string; // Coordinates e.g. "@30.3782,76.7767,14z"
  google_domain?: string;
  hl?: string;
  gl?: string;
  type?: string;
  data_id?: string;
  place_id?: string;
  [key: string]: unknown;
}

export class SerpApiClient {
  private apiKey: string;
  private baseUrl = 'https://serpapi.com/search.json';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SERPAPI_API_KEY || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async fetchSearch<T = Record<string, unknown>>(params: SerpApiSearchParams): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('SERPAPI_API_KEY is not configured in environment variables.');
    }

    const searchParams = new URLSearchParams();
    searchParams.append('api_key', this.apiKey);

    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });

    const url = `${this.baseUrl}?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache 1 hour
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SerpApi request failed with status ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }
}

export const serpApiClient = new SerpApiClient();

