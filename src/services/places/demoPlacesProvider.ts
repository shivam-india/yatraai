// ==============================================================================
// YATRA AI - DEMO PLACES PROVIDER
// Robust in-memory mock provider with authentic geographic corridors
// ==============================================================================

import { PlacesProvider } from './types';
import { Place, PlaceDetails, Coordinates } from '@/types';
import { DEMO_PLACES } from './demoData';
import { calculateDistanceKm } from '@/lib/utils';

export class DemoPlacesProvider implements PlacesProvider {
  public isLiveProvider(): boolean {
    return false;
  }

  public async searchPlaces(
    query: string,
    location?: Coordinates,
    radiusKm = 25
  ): Promise<Place[]> {
    const q = query.toLowerCase().trim();

    return DEMO_PLACES.filter((p) => {
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)));

      if (!location) return matchQuery;

      const dist = calculateDistanceKm(
        location.lat,
        location.lng,
        p.coordinates.lat,
        p.coordinates.lng
      );
      return matchQuery && dist <= radiusKm;
    });
  }

  public async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const found = DEMO_PLACES.find((p) => p.id === placeId || p.serpapiPlaceId === placeId);
    if (found) return found;

    // Fallback default
    return DEMO_PLACES[0];
  }

  public async getPlacesAlongRoute(
    origin: Coordinates,
    destination: Coordinates,
    categories?: string[]
  ): Promise<Place[]> {
    // A place is along the route if its perpendicular distance from the corridor line is small
    // Corridor bounding box with buffer
    const minLat = Math.min(origin.lat, destination.lat) - 0.25;
    const maxLat = Math.max(origin.lat, destination.lat) + 0.25;
    const minLng = Math.min(origin.lng, destination.lng) - 0.25;
    const maxLng = Math.max(origin.lng, destination.lng) + 0.25;

    return DEMO_PLACES.filter((p) => {
      const inBox =
        p.coordinates.lat >= minLat &&
        p.coordinates.lat <= maxLat &&
        p.coordinates.lng >= minLng &&
        p.coordinates.lng <= maxLng;

      return inBox;
    });
  }
}

export const demoPlacesProvider = new DemoPlacesProvider();
