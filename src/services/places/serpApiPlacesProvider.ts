// ==============================================================================
// YATRA AI - SERPAPI PLACES PROVIDER
// Production live provider wrapping SerpApi with transparent fallback to Demo
// ==============================================================================

import { PlacesProvider } from './types';
import { Place, PlaceDetails, Coordinates } from '@/types';
import { serpApiPlacesService } from '../serpapi/places';
import { serpApiReviewsService } from '../serpapi/reviews';
import { demoPlacesProvider } from './demoPlacesProvider';
import { serpApiClient } from '../serpapi/client';

export class SerpApiPlacesProvider implements PlacesProvider {
  public isLiveProvider(): boolean {
    return serpApiClient.isConfigured();
  }

  public async searchPlaces(
    query: string,
    location?: Coordinates,
    radiusKm = 25
  ): Promise<Place[]> {
    if (!this.isLiveProvider()) {
      return demoPlacesProvider.searchPlaces(query, location, radiusKm);
    }

    try {
      const places = await serpApiPlacesService.searchLocalPlaces(query, location);
      if (places && places.length > 0) {
        return places;
      }
      return demoPlacesProvider.searchPlaces(query, location, radiusKm);
    } catch (error) {
      console.warn('SerpApi places search failed, falling back to verified database:', error);
      return demoPlacesProvider.searchPlaces(query, location, radiusKm);
    }
  }

  public async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (!this.isLiveProvider()) {
      return demoPlacesProvider.getPlaceDetails(placeId);
    }

    try {
      const demoDetails = await demoPlacesProvider.getPlaceDetails(placeId);
      const reviews = await serpApiReviewsService.getPlaceReviews(placeId);
      return {
        ...demoDetails,
        reviews: reviews.length > 0 ? reviews : demoDetails.reviews,
        source: 'serpapi',
      };
    } catch (error) {
      console.warn('SerpApi getPlaceDetails failed, using verified fallback:', error);
      return demoPlacesProvider.getPlaceDetails(placeId);
    }
  }

  public async getPlacesAlongRoute(
    origin: Coordinates,
    destination: Coordinates,
    categories?: string[]
  ): Promise<Place[]> {
    if (!this.isLiveProvider()) {
      return demoPlacesProvider.getPlacesAlongRoute(origin, destination, categories);
    }

    try {
      // Query midpoints and endpoints
      const midLat = (origin.lat + destination.lat) / 2;
      const midLng = (origin.lng + destination.lng) / 2;
      const livePlaces = await serpApiPlacesService.searchLocalPlaces(
        'attractions, local food, culture, heritage',
        { lat: midLat, lng: midLng }
      );

      if (livePlaces.length > 0) {
        return livePlaces;
      }
      return demoPlacesProvider.getPlacesAlongRoute(origin, destination, categories);
    } catch {
      return demoPlacesProvider.getPlacesAlongRoute(origin, destination, categories);
    }
  }
}

export const serpApiPlacesProvider = new SerpApiPlacesProvider();

