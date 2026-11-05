// ==============================================================================
// POST /api/journey/waiting-time
// Waiting-time exploration calculator with strict departure safety buffers
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { journeyPlanner } from '@/services/ai/journeyPlanner';
import { z } from 'zod';

const waitingTimeSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  delayMinutes: z.number().min(5),
  departureTime: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = waitingTimeSchema.parse(body);

    const opportunity = await journeyPlanner.getWaitingTimeOpportunities(
      { lat: data.latitude, lng: data.longitude },
      data.delayMinutes,
      data.departureTime || 'In transit'
    );

    return NextResponse.json({
      success: true,
      data: opportunity,
    });
  } catch (error: any) {
    console.error('Error computing waiting time exploration:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unable to compute waiting time options.',
      },
      { status: 400 }
    );
  }
}

