// ==============================================================================
// YATRA AI - TRANSPORT SERVICE
// Public transit schedules, intercity buses, trains, and local metro
// ==============================================================================

import { TransportOption, TransportType } from '@/types';

export interface TransportSearchParams {
  origin: string;
  destination: string;
  date?: string;
  preferredModes?: TransportType[];
}

export class TransportService {
  /**
   * Discovers realistic transit routes between regional corridors
   */
  public async getTransportOptions(params: TransportSearchParams): Promise<TransportOption[]> {
    const originNorm = params.origin.toLowerCase();
    const destNorm = params.destination.toLowerCase();

    // Northern Corridor: Ambala -> Chandigarh
    if (
      (originNorm.includes('ambala') && destNorm.includes('chandigarh')) ||
      (originNorm.includes('chandigarh') && destNorm.includes('ambala'))
    ) {
      return [
        {
          id: 'transit-haryana-roadways-express',
          type: 'bus',
          operator: 'Haryana Roadways (Kilometer Scheme AC)',
          routeCode: 'HR-104',
          departureLocation: 'Ambala Cantt Inter-State Bus Stand',
          arrivalLocation: 'ISBT Sector 43, Chandigarh',
          scheduledDeparture: '09:00 AM',
          scheduledArrival: '10:15 AM',
          durationMins: 75,
          baseFare: 110,
          status: 'on_time',
          delayMinutes: 0,
          advisory: 'Departs every 20 minutes from Platform 4',
        },
        {
          id: 'transit-punjab-roadways-punbus',
          type: 'bus',
          operator: 'PUNBUS / PRTC Express',
          routeCode: 'PB-221',
          departureLocation: 'Ambala Cantt ISBT',
          arrivalLocation: 'ISBT Sector 17, Chandigarh',
          scheduledDeparture: '09:25 AM',
          scheduledArrival: '10:35 AM',
          durationMins: 70,
          baseFare: 95,
          status: 'delayed',
          delayMinutes: 38,
          advisory: 'Traffic slow near Zirakpur Flyover, 38m delay reported',
        },
        {
          id: 'transit-indian-railways-kalka-shatabdi',
          type: 'train',
          operator: 'Northern Railway (Kalka Shatabdi)',
          routeCode: '12005',
          departureLocation: 'Ambala Cantt Junction (UMB)',
          arrivalLocation: 'Chandigarh Junction (CDG)',
          scheduledDeparture: '09:55 AM',
          scheduledArrival: '10:35 AM',
          durationMins: 40,
          baseFare: 180,
          status: 'on_time',
          delayMinutes: 0,
          advisory: 'Platform 2, reserved chair car available',
        },
      ];
    }

    // Delhi -> Jaipur Corridor
    if (
      (originNorm.includes('delhi') && destNorm.includes('jaipur')) ||
      (originNorm.includes('jaipur') && destNorm.includes('delhi'))
    ) {
      return [
        {
          id: 'transit-rsrtc-volvo-scania',
          type: 'bus',
          operator: 'RSRTC Volvo Super Express',
          routeCode: 'RJ-701',
          departureLocation: 'Bikaner House, New Delhi',
          arrivalLocation: 'Sindhi Camp, Jaipur',
          scheduledDeparture: '07:30 AM',
          scheduledArrival: '12:45 PM',
          durationMins: 315,
          baseFare: 650,
          status: 'on_time',
          delayMinutes: 0,
        },
        {
          id: 'transit-vande-bharat-delhi-ajmer',
          type: 'train',
          operator: 'Indian Railways (Vande Bharat Express)',
          routeCode: '20978',
          departureLocation: 'Delhi Cantt (DEC)',
          arrivalLocation: 'Jaipur Junction (JP)',
          scheduledDeparture: '06:40 AM',
          scheduledArrival: '10:05 AM',
          durationMins: 205,
          baseFare: 890,
          status: 'on_time',
          delayMinutes: 0,
        },
      ];
    }

    // Generic fallback for any other cities entered by user
    return [
      {
        id: `transit-regional-express-${Date.now()}`,
        type: 'bus',
        operator: 'Regional State Transport Corporation',
        routeCode: 'RTC-EXP',
        departureLocation: `${params.origin} Central Transit Station`,
        arrivalLocation: `${params.destination} Inter-City Terminal`,
        scheduledDeparture: '09:00 AM',
        scheduledArrival: '11:00 AM',
        durationMins: 120,
        baseFare: 160,
        status: 'on_time',
        delayMinutes: 0,
        advisory: 'Frequent local connections available',
      },
    ];
  }
}

export const transportService = new TransportService();

