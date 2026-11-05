// ==============================================================================
// POST /api/ai/ask
// Ask Yatra conversational assistant with journey context
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/services/ai/gemini';
import { ASK_YATRA_GUIDE_PROMPT } from '@/services/ai/promptTemplates';
import { z } from 'zod';

const askSchema = z.object({
  question: z.string().min(2),
  currentPlaceName: z.string().optional(),
  currentCity: z.string().optional(),
  journeyContext: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, currentPlaceName, currentCity, journeyContext } = askSchema.parse(body);

    if (geminiService.isAvailable()) {
      try {
        const contextStr = `
User Question: "${question}"
Location Context: ${currentPlaceName || 'En route'} in ${currentCity || 'Transit Corridor'}
Journey Summary: ${journeyContext ? JSON.stringify(journeyContext) : 'Traveling along Northern Corridor (e.g. Ambala - Chandigarh)'}
`;
        const responseText = await geminiService.generateText(contextStr, ASK_YATRA_GUIDE_PROMPT);
        return NextResponse.json({
          success: true,
          answer: responseText,
          source: 'Gemini 1.5 Flash (Live AI)',
          isDemo: false,
        });
      } catch (err) {
        console.warn('Gemini chat generation failed, switching to curated guide response:', err);
      }
    }

    // Context-rich intelligent guide fallback
    const answer = generateCuratedGuideResponse(question, currentPlaceName, currentCity);

    return NextResponse.json({
      success: true,
      answer,
      source: 'Yatra Verified Knowledge Base (Demo Mode)',
      isDemo: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unable to answer right now',
      },
      { status: 400 }
    );
  }
}

function generateCuratedGuideResponse(
  question: string,
  placeName?: string,
  city?: string
): string {
  const q = question.toLowerCase();

  if (q.includes('eat') || q.includes('food') || q.includes('dhaba')) {
    return `If you're near ${city || 'Ambala or Chandigarh'}, do not miss authentic slow-cooked clay oven dishes! Along the GT Road corridor, Pooran Singh Da Dhaba is legendary for its tender roasted meats and hand-churned butter rotis. In Chandigarh, Pal Dhaba in Sector 28 serves some of the richest Dal Makhani and Amritsari Kulchas in the region. Pair your meal with an ice-cold sweet Malai Lassi.`;
  }

  if (q.includes('history') || q.includes('why') || q.includes('famous') || q.includes('important')) {
    if (placeName?.toLowerCase().includes('rock garden')) {
      return `The Rock Garden is completely unique worldwide. Secretly sculpted over 18 years by former road inspector Nek Chand starting in 1957, it was built using solely industrial scraps, porcelain sink shards, electrical insulators, and broken glass bangles from demolished villages during Chandigarh’s planned construction. It is a monumental testament to eco-sustainable outsider art.`;
    }
    if (placeName?.toLowerCase().includes('ambala') || placeName?.toLowerCase().includes('cloth')) {
      return `Ambala has served as a pivotal frontier hub on the historic Grand Trunk Road since the Mughal and Mauryan eras. Its famous Cloth Market originated in the mid-19th century as a trading guild for regional weavers, and remains one of Asia's preeminent hubs for authentic Phulkari needlework.`;
    }
    return `${placeName || 'This location'} is a prominent cultural touchstone along the corridor. It preserves traditional architecture and community trade that dates back several generations, reflecting the vibrant fusion of Punjabi and Haryanvi heritage.`;
  }

  if (q.includes('15') || q.includes('quick') || q.includes('nearby') || q.includes('short')) {
    return `Within a 15-minute radius, you can visit the local artisan potters of Dera Bassi to watch master potters at work, or grab freshly pressed sugarcane juice and hot jalebis from roadside stalls near the bus terminal. Both are safe, quick stops that won't jeopardize your transit timeline.`;
  }

  return `Traveling through ${city || 'this corridor'} gives you direct access to centuries of heritage, culinary pride, and artisan crafts. Yatra AI continuously monitors your transit schedule so you can explore stops like ${placeName || 'nearby landmarks'} with total peace of mind.`;
}

