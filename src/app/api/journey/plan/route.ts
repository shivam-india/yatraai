// ==============================================================================
// POST /api/journey/plan
// Natural language journey generation endpoint
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { journeyPlanner } from '@/services/ai/journeyPlanner';
import { z } from 'zod';

const planRequestSchema = z.object({
  prompt: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  budget: z.number().optional(),
  availableTimeMins: z.number().optional(),
  interests: z.array(z.string()).optional(),
  travelMode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedInput = planRequestSchema.parse(body);

    let intent;
    if (parsedInput.prompt && parsedInput.prompt.trim().length > 0) {
      intent = await journeyPlanner.parseNaturalLanguageIntent(parsedInput.prompt);
    } else {
      intent = {
        origin: parsedInput.origin || 'Ambala',
        destination: parsedInput.destination || 'Chandigarh',
        budget: parsedInput.budget || 800,
        availableTimeMins: parsedInput.availableTimeMins || 300,
        interests: parsedInput.interests && parsedInput.interests.length > 0 ? parsedInput.interests : ['history', 'food'],
        travelMode: parsedInput.travelMode || 'public_transport',
        walkingToleranceMins: 20,
        rawPrompt: `${parsedInput.origin} to ${parsedInput.destination}`,
        confidenceScore: 1.0,
      };
    }

    // Generate the multi-agent journey
    const journey = await journeyPlanner.planJourney(intent);

    return NextResponse.json({
      success: true,
      data: journey,
      intent,
      isDemoMode: process.env.DEMO_MODE === 'true' || !process.env.GEMINI_API_KEY,
    });
  } catch (error: any) {
    console.error('Error generating journey plan:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unable to plan journey at this moment.',
      },
      { status: 500 }
    );
  }
}

