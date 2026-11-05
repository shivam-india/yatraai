// ==============================================================================
// YATRA AI - REAL-TIME TRANSPORT UPDATES SERVICE
// Manages transit advisories, dynamic delays and layover notifications
// ==============================================================================

import { TransportUpdate } from '@/types';

export class RealtimeUpdatesService {
  private updates: Map<string, TransportUpdate> = new Map();

  constructor() {
    // Seed initial realistic updates
    this.updates.set('transit-punjab-roadways-punbus', {
      routeId: 'transit-punjab-roadways-punbus',
      delayMinutes: 38,
      status: 'delayed',
      advisoryMessage: 'Zirakpur flyover congestion has delayed departures by ~38 mins.',
      reportedAt: new Date().toISOString(),
    });
  }

  public getUpdateForRoute(routeId: string): TransportUpdate | null {
    return this.updates.get(routeId) || null;
  }

  public simulateDelay(routeId: string, delayMinutes: number, reason?: string): TransportUpdate {
    const update: TransportUpdate = {
      routeId,
      delayMinutes,
      status: delayMinutes > 0 ? 'delayed' : 'on_time',
      advisoryMessage: reason || `Transit adjusted by ${delayMinutes} minutes due to traffic flow.`,
      reportedAt: new Date().toISOString(),
    };
    this.updates.set(routeId, update);
    return update;
  }
}

export const realtimeUpdatesService = new RealtimeUpdatesService();

