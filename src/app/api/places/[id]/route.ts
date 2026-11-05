// ==============================================================================
// GET /api/places/[id]
// Retrieves place details, artisan stories, and review sentiments
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { placesProvider } from '@/services/places';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const placeId = params.id;
    const details = await placesProvider.getPlaceDetails(placeId);

    return NextResponse.json({
      success: true,
      data: details,
      isLive: placesProvider.isLiveProvider(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Place not found',
      },
      { status: 404 }
    );
  }
}

