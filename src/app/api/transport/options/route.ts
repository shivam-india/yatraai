// ==============================================================================
// GET /api/transport/options
// Transit schedules, intercity buses, trains, and real-time updates
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { transportService } from '@/services/transport/transportService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || 'Ambala';
    const destination = searchParams.get('destination') || 'Chandigarh';

    const options = await transportService.getTransportOptions({
      origin,
      destination,
    });

    return NextResponse.json({
      success: true,
      options,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error retrieving transport options',
      },
      { status: 500 }
    );
  }
}
