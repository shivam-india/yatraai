// ==============================================================================
// YATRA AI - SERPAPI MAPS & NAVIGATION SERVICE
// Generates navigation links and transit routing assistance
// ==============================================================================

import { Coordinates } from '@/types';

export class SerpApiMapsService {
  /**
   * Generates a universal Google Maps navigation URL
   */
  public getGoogleMapsNavigationUrl(destination: Coordinates, placeName?: string): string {
    const query = placeName 
      ? encodeURIComponent(`${placeName}, ${destination.lat},${destination.lng}`)
      : `${destination.lat},${destination.lng}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=transit`;
  }

  /**
   * Generates a Google Maps place viewer link
   */
  public getGoogleMapsPlaceUrl(placeId?: string, query?: string): string {
    if (placeId) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || 'place')}&query_place_id=${placeId}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || 'place')}`;
  }

  /**
   * Builds route bbox or corridor midpoint for geographic filtering
   */
  public getRouteMidpoint(start: Coordinates, end: Coordinates): Coordinates {
    return {
      lat: (start.lat + end.lat) / 2,
      lng: (start.lng + end.lng) / 2,
    };
  }
}

export const serpApiMapsService = new SerpApiMapsService();

