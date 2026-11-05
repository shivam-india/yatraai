// ==============================================================================
// YATRA AI - ROUTE ENGINE
// Calculates transit paths, corridor waypoints and polyline trajectories
// ==============================================================================

import { Coordinates, TransportType } from '@/types';
import { calculateDistanceKm } from '@/lib/utils';

export interface RouteGeometry {
  coordinates: Coordinates[];
  totalDistanceKm: number;
  estimatedTransitMins: number;
}

export class RouteEngine {
  /**
   * Generates realistic corridor waypoints between origin and destination
   */
  public generateRoutePoints(origin: Coordinates, destination: Coordinates): Coordinates[] {
    const points: Coordinates[] = [origin];
    const steps = 8;

    for (let i = 1; i < steps; i++) {
      const ratio = i / steps;
      // Introduce slight natural highway curvature
      const jitterLat = (Math.sin(ratio * Math.PI) * 0.02) * (origin.lat > destination.lat ? -1 : 1);
      const jitterLng = (Math.cos(ratio * Math.PI * 0.5) * 0.015);

      points.push({
        lat: origin.lat + (destination.lat - origin.lat) * ratio + jitterLat,
        lng: origin.lng + (destination.lng - origin.lng) * ratio + jitterLng,
      });
    }

    points.push(destination);
    return points;
  }

  /**
   * Estimates transit duration given distance and travel mode
   */
  public estimateDurationMins(distanceKm: number, mode: TransportType): number {
    switch (mode) {
      case 'train':
        return Math.round((distanceKm / 65) * 60); // 65 km/h avg
      case 'bus':
        return Math.round((distanceKm / 42) * 60 + 15); // 42 km/h avg + stops
      case 'metro':
        return Math.round((distanceKm / 35) * 60 + 5);
      case 'auto':
        return Math.round((distanceKm / 28) * 60 + 8);
      case 'walk':
        return Math.round((distanceKm / 4.5) * 60); // 4.5 km/h
      default:
        return Math.round((distanceKm / 40) * 60);
    }
  }

  /**
   * Calculates perpendicular or closest distance from a point to a line segment
   */
  public distanceFromCorridorKm(point: Coordinates, start: Coordinates, end: Coordinates): number {
    const d1 = calculateDistanceKm(point.lat, point.lng, start.lat, start.lng);
    const d2 = calculateDistanceKm(point.lat, point.lng, end.lat, end.lng);
    const dBase = calculateDistanceKm(start.lat, start.lng, end.lat, end.lng);

    if (dBase === 0) return d1;
    // Heron's formula for triangle height
    const s = (d1 + d2 + dBase) / 2;
    const area = Math.sqrt(Math.max(0, s * (s - d1) * (s - d2) * (s - dBase)));
    return Math.round(((2 * area) / dBase) * 10) / 10;
  }
}

export const routeEngine = new RouteEngine();

