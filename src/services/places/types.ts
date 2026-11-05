// ==============================================================================
// YATRA AI - PLACES PROVIDER INTERFACE
// Abstract discovery provider decoupling SerpApi from Demo & future providers
// ==============================================================================

import { Place, PlaceDetails, Coordinates } from '@/types';

export interface PlacesProvider {
  searchPlaces(query: string, location?: Coordinates, radiusKm?: number): Promise<Place[]>;
  getPlaceDetails(placeId: string): Promise<PlaceDetails>;
  getPlacesAlongRoute(origin: Coordinates, destination: Coordinates, categories?: string[]): Promise<Place[]>;
  isLiveProvider(): boolean;
}

