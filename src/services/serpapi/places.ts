// ==============================================================================
// YATRA AI - SERPAPI PLACES SERVICE
// Discovers attractions, food, heritage, markets along coordinates & queries
// ==============================================================================

import { serpApiClient } from './client';
import { Place, PlaceCategory, Coordinates } from '@/types';

export interface SerpApiLocalResult {
  position?: number;
  title: string;
  place_id?: string;
  data_id?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  rating?: number;
  reviews?: number;
  price?: string;
  type?: string;
  types?: string[];
  description?: string;
  thumbnail?: string;
  open_state?: string;
  hours?: string;
  phone?: string;
  website?: string;
}

export interface SerpApiMapsResponse {
  local_results?: SerpApiLocalResult[];
  place_results?: SerpApiLocalResult & {
    reviews_link?: string;
    photos_link?: string;
    user_reviews?: Array<{
      name?: string;
      rating?: number;
      snippet?: string;
      date?: string;
    }>;
  };
}

export class SerpApiPlacesService {
  /**
   * Search places near a coordinate or query
   */
  public async searchLocalPlaces(
    query: string,
    location?: Coordinates,
    zoom = 13
  ): Promise<Place[]> {
    const params: Record<string, unknown> = {
      engine: 'google_maps',
      q: query,
      hl: 'en',
      gl: 'in',
    };

    if (location) {
      params.ll = `@${location.lat},${location.lng},${zoom}z`;
    }

    const data = await serpApiClient.fetchSearch<SerpApiMapsResponse>(params);
    const results = data.local_results || [];

    return results.map((item, idx) => this.normalizeLocalResult(item, idx, query));
  }

  /**
   * Normalize SerpApi Google Maps local result into internal Place schema
   */
  public normalizeLocalResult(
    item: SerpApiLocalResult,
    index: number,
    searchedQuery?: string
  ): Place {
    const lat = item.gps_coordinates?.latitude || 30.3782;
    const lng = item.gps_coordinates?.longitude || 76.7767;

    const category = this.inferCategory(item.types || [item.type || ''], searchedQuery);
    const priceLevel = item.price ? item.price.length : 1;

    return {
      id: item.place_id || item.data_id || `serpapi-${index}-${Date.now()}`,
      serpapiPlaceId: item.place_id,
      name: item.title,
      category,
      description: item.description || `${item.type || 'Local landmark'} located in the area.`,
      address: item.address || 'Address available via Google Maps',
      city: this.extractCityFromAddress(item.address),
      coordinates: { lat, lng },
      rating: item.rating || 4.2,
      reviewsCount: item.reviews || 0,
      priceLevel,
      typicalVisitMins: this.estimateTypicalVisit(category),
      openingHours: {
        isOpenNow: item.open_state?.toLowerCase().includes('open') ?? true,
        text: item.hours || item.open_state || 'Open daily',
      },
      photos: item.thumbnail ? [item.thumbnail] : [],
      isVerified: true,
      source: 'serpapi',
      website: item.website,
      phone: item.phone,
      tags: item.types || [category],
    };
  }

  private inferCategory(types: string[], query?: string): PlaceCategory {
    const combined = [...types, query || ''].join(' ').toLowerCase();

    if (combined.includes('food') || combined.includes('restaurant') || combined.includes('dhaba') || combined.includes('bakery') || combined.includes('cafe')) {
      return 'food';
    }
    if (combined.includes('monument') || combined.includes('historical') || combined.includes('fort') || combined.includes('heritage') || combined.includes('tomb') || combined.includes('temple') || combined.includes('gurdwara')) {
      return 'historical';
    }
    if (combined.includes('museum') || combined.includes('art') || combined.includes('cultural') || combined.includes('gallery')) {
      return 'culture';
    }
    if (combined.includes('garden') || combined.includes('park') || combined.includes('lake') || combined.includes('nature') || combined.includes('sanctuary')) {
      return 'nature';
    }
    if (combined.includes('artisan') || combined.includes('craft') || combined.includes('handloom') || combined.includes('pottery')) {
      return 'artisan';
    }
    if (combined.includes('bazaar') || combined.includes('market') || combined.includes('shopping')) {
      return 'market';
    }
    return 'hidden_gem';
  }

  private extractCityFromAddress(address?: string): string {
    if (!address) return 'Northern Corridor';
    const parts = address.split(',').map((s) => s.trim());
    return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || 'Local';
  }

  private estimateTypicalVisit(category: PlaceCategory): number {
    switch (category) {
      case 'food': return 45;
      case 'historical': return 60;
      case 'culture': return 50;
      case 'nature': return 40;
      case 'market': return 45;
      case 'artisan': return 35;
      case 'hidden_gem': return 30;
      default: return 40;
    }
  }
}

export const serpApiPlacesService = new SerpApiPlacesService();

