// ==============================================================================
// GET /api/places/search
// Place discovery endpoint supporting SerpApi Google Maps and Demo fallback
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { placesProvider } from '@/services/places';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusKm = Number(searchParams.get('radius')) || 25;

    let location = undefined;
    if (latStr && lngStr) {
      location = {
        lat: parseFloat(latStr),
        lng: parseFloat(lngStr),
      };
    }

    const searchQuery = [query, category].filter(Boolean).join(' ');
    const places = await placesProvider.searchPlaces(searchQuery, location, radiusKm);

    return NextResponse.json({
      success: true,
      count: places.length,
      isLive: placesProvider.isLiveProvider(),
      data: places,
    });
  } catch (error: any) {
    console.error('Error discovering places:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error fetching places',
      },
      { status: 500 }
    );
  }
}
