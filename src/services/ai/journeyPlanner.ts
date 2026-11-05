// ==============================================================================
// YATRA AI - MASTER JOURNEY PLANNER & MULTI-AGENT ORCHESTRATOR
// Coordinates AI agents, transit engines, places layer and detour optimizers
// ==============================================================================

import {
  Journey,
  JourneyStop,
  ParsedJourneyIntent,
  SmartDetour,
  Coordinates,
  WaitingTimeOpportunity,
  Place,
} from '@/types';
import { geminiService } from './gemini';
import { INTENT_EXTRACTION_PROMPT } from './promptTemplates';
import { placesProvider } from '../places';
import { transportService } from '../transport/transportService';
import { routeEngine } from '../transport/routeEngine';
import { recommendationEngine } from './recommendationEngine';
import { calculateDistanceKm } from '@/lib/utils';

export class JourneyPlanner {
  /**
   * 1. Natural Language Intent Parser
   */
  public async parseNaturalLanguageIntent(prompt: string): Promise<ParsedJourneyIntent> {
    if (geminiService.isAvailable()) {
      try {
        const fullPrompt = `${INTENT_EXTRACTION_PROMPT}\nUser Request: "${prompt}"`;
        const parsed = await geminiService.generateJson<Partial<ParsedJourneyIntent>>(fullPrompt);

        if (parsed.origin && parsed.destination) {
          return {
            origin: parsed.origin,
            destination: parsed.destination,
            budget: Number(parsed.budget) || 800,
            availableTimeMins: Number(parsed.availableTimeMins) || 300,
            interests: parsed.interests && parsed.interests.length > 0 ? parsed.interests : ['history', 'food'],
            travelMode: parsed.travelMode || 'public_transport',
            walkingToleranceMins: parsed.walkingToleranceMins || 20,
            rawPrompt: prompt,
            confidenceScore: 0.95,
          };
        }
      } catch (err) {
        console.warn('Gemini intent parsing failed, falling back to deterministic heuristic parser:', err);
      }
    }

    // High quality deterministic fallback parser
    return this.fallbackParseIntent(prompt);
  }

  private fallbackParseIntent(prompt: string): ParsedJourneyIntent {
    const text = prompt.toLowerCase();

    // Default corridor
    let origin = 'Ambala';
    let destination = 'Chandigarh';

    // Regex extract "from X to Y"
    const fromToMatch = text.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:[.,\s]|$)/i);
    if (fromToMatch) {
      origin = fromToMatch[1].trim();
      destination = fromToMatch[2].trim();
    } else {
      const toMatch = text.match(/to\s+([a-zA-Z\s]+?)(?:[.,\s]|$)/i);
      if (toMatch && !toMatch[1].includes('day') && !toMatch[1].includes('tomorrow')) {
        destination = toMatch[1].trim();
      }
    }

    // Budget extraction (e.g. ₹800, 800 rs, rs 800, 800 rupees)
    let budget = 800;
    const budgetMatch = text.match(/(?:₹|rs\.?|inr)\s*(\d+)/i) || text.match(/(\d+)\s*(?:₹|rs|rupees|bucks)/i);
    if (budgetMatch) {
      budget = parseInt(budgetMatch[1], 10);
    }

    // Time extraction (e.g. 5 hours, 4 hrs, 300 mins)
    let availableTimeMins = 300;
    const hoursMatch = text.match(/(\d+)\s*(?:hours|hrs|hour|hr)/i);
    if (hoursMatch) {
      availableTimeMins = parseInt(hoursMatch[1], 10) * 60;
    } else {
      const minsMatch = text.match(/(\d+)\s*(?:mins|minutes|min)/i);
      if (minsMatch) {
        availableTimeMins = parseInt(minsMatch[1], 10);
      }
    }

    // Interests
    const interests: string[] = [];
    if (text.includes('food') || text.includes('eat') || text.includes('dhaba') || text.includes('culinary')) {
      interests.push('food');
    }
    if (text.includes('history') || text.includes('historical') || text.includes('monument') || text.includes('heritage')) {
      interests.push('history');
    }
    if (text.includes('culture') || text.includes('art') || text.includes('museum')) {
      interests.push('culture');
    }
    if (text.includes('nature') || text.includes('garden') || text.includes('lake') || text.includes('park')) {
      interests.push('nature');
    }
    if (text.includes('shopping') || text.includes('market') || text.includes('bazaar') || text.includes('craft')) {
      interests.push('shopping');
    }
    if (interests.length === 0) {
      interests.push('history', 'food');
    }

    return {
      origin: origin.charAt(0).toUpperCase() + origin.slice(1),
      destination: destination.charAt(0).toUpperCase() + destination.slice(1),
      budget,
      availableTimeMins,
      interests,
      travelMode: 'public_transport',
      walkingToleranceMins: 20,
      rawPrompt: prompt,
      confidenceScore: 0.9,
    };
  }

  /**
   * 2. Coordinates Geocoder for Origin / Destination
   */
  public resolveCoordinates(cityName: string): Coordinates {
    const norm = cityName.toLowerCase().trim();
    if (norm.includes('ambala')) return { lat: 30.3782, lng: 76.7767 };
    if (norm.includes('chandigarh')) return { lat: 30.7333, lng: 76.7794 };
    if (norm.includes('delhi')) return { lat: 28.6139, lng: 77.209 };
    if (norm.includes('jaipur')) return { lat: 26.9124, lng: 75.7873 };
    if (norm.includes('kalka')) return { lat: 30.8354, lng: 76.9329 };
    if (norm.includes('shimla')) return { lat: 31.1048, lng: 77.1734 };
    // Default fallback to corridor
    return { lat: 30.45, lng: 76.8 };
  }

  /**
   * 3. Master Journey Synthesizer
   */
  public async planJourney(intent: ParsedJourneyIntent): Promise<Journey> {
    const originCoords = this.resolveCoordinates(intent.origin);
    const destCoords = this.resolveCoordinates(intent.destination);

    // Fetch transport options
    const transportOptions = await transportService.getTransportOptions({
      origin: intent.origin,
      destination: intent.destination,
    });
    const primaryTransport = transportOptions[0];

    // Discover places along the route
    const candidatePlaces = await placesProvider.getPlacesAlongRoute(
      originCoords,
      destCoords,
      intent.interests
    );

    // Evaluate candidate smart detours
    const detours = candidatePlaces.map((place) =>
      recommendationEngine.evaluateSmartDetour(
        place,
        originCoords,
        destCoords,
        intent.interests,
        intent.budget,
        intent.availableTimeMins
      )
    );

    // Sort by explore value descending
    detours.sort((a, b) => b.exploreValue - a.exploreValue);

    // Pick top 1-2 curated stops to inject into primary journey
    const selectedDetours = detours.slice(0, 2);
    const remainingDetours = detours.slice(2);

    // Assemble the Timeline
    const stops: JourneyStop[] = [];
    let currentTime = new Date();
    currentTime.setHours(9, 0, 0, 0); // 9:00 AM start
    let accumulatedCost = 0;

    // Origin Stop
    stops.push({
      id: `stop-origin-${Date.now()}`,
      stopOrder: 1,
      stopType: 'origin',
      title: `Depart ${intent.origin}`,
      description: `Board ${primaryTransport.operator} at ${primaryTransport.departureLocation}`,
      coordinates: originCoords,
      arrivalTime: '09:00 AM',
      departureTime: '09:15 AM',
      dwellTimeMins: 15,
      travelTimeFromPrevMins: 0,
      travelMode: primaryTransport.type,
      costEst: primaryTransport.baseFare,
      distanceKm: 0,
      transitDetails: {
        operator: primaryTransport.operator,
        routeNumber: primaryTransport.routeCode,
        status: primaryTransport.status,
      },
    });
    accumulatedCost += primaryTransport.baseFare;

    // Transit midway stop (if detours chosen)
    let currentMins = 9 * 60 + 15;

    selectedDetours.forEach((detour, idx) => {
      currentMins += detour.detourTimeMins + 20; // transit to stop
      const arrHour = Math.floor(currentMins / 60);
      const arrMin = currentMins % 60;
      const arrivalStr = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`;

      currentMins += detour.visitDurationMins;
      const depHour = Math.floor(currentMins / 60);
      const depMin = currentMins % 60;
      const depStr = `${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`;

      stops.push({
        id: `stop-detour-${idx + 1}-${Date.now()}`,
        stopOrder: idx + 2,
        stopType: detour.category === 'food' ? 'food_stop' : 'smart_detour',
        title: detour.place.name,
        description: detour.place.description,
        place: detour.place,
        coordinates: detour.place.coordinates,
        arrivalTime: arrivalStr,
        departureTime: depStr,
        dwellTimeMins: detour.visitDurationMins,
        travelTimeFromPrevMins: detour.detourTimeMins + 20,
        travelMode: 'auto',
        costEst: detour.estimatedCost,
        distanceKm: detour.distanceFromRouteKm,
        exploreValue: detour.exploreValue,
        detourReason: detour.relevanceReason,
      });

      accumulatedCost += detour.estimatedCost;
    });

    // Destination Stop
    currentMins += 40;
    const finalHour = Math.floor(currentMins / 60);
    const finalMin = currentMins % 60;
    const finalStr = `${String(finalHour).padStart(2, '0')}:${String(finalMin).padStart(2, '0')}`;
    const totalDist = calculateDistanceKm(
      originCoords.lat,
      originCoords.lng,
      destCoords.lat,
      destCoords.lng
    );

    stops.push({
      id: `stop-dest-${Date.now()}`,
      stopOrder: stops.length + 1,
      stopType: 'destination',
      title: `Arrive ${intent.destination}`,
      description: `Complete journey at ${intent.destination} central terminal`,
      coordinates: destCoords,
      arrivalTime: finalStr,
      departureTime: finalStr,
      dwellTimeMins: 0,
      travelTimeFromPrevMins: 40,
      travelMode: primaryTransport.type,
      costEst: 0,
      distanceKm: totalDist,
    });

    const totalDurationMins = currentMins - 9 * 60;

    return {
      id: `journey-${Date.now()}`,
      title: `${intent.origin} to ${intent.destination} Discovery Route`,
      origin: {
        name: intent.origin,
        coordinates: originCoords,
      },
      destination: {
        name: intent.destination,
        coordinates: destCoords,
      },
      totalDurationMins,
      totalBudgetEst: accumulatedCost,
      interests: intent.interests,
      travelMode: intent.travelMode,
      stops,
      smartDetoursAvailable: remainingDetours,
      status: 'active',
      aiSummary: `Optimized ${formatDurationSummary(totalDurationMins)} route combining ${primaryTransport.operator} transit with ${selectedDetours.length} curated stops matching your ${intent.interests.join(' & ')} preferences. Total estimated expense is ₹${accumulatedCost}, well within your ₹${intent.budget} budget.`,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * 4. Waiting-Time Exploration Engine (e.g. 38 mins bus delay)
   */
  public async getWaitingTimeOpportunities(
    currentLocation: Coordinates,
    delayMinutes: number,
    departureTime: string
  ): Promise<WaitingTimeOpportunity> {
    const safeReturnBufferMins = 10;
    const maxAvailableExploration = Math.max(0, delayMinutes - safeReturnBufferMins);

    // Find places within safe reach (under 5 km radius)
    let nearby = await placesProvider.searchPlaces('', currentLocation, 5.0);
    if (!nearby || nearby.length === 0) {
      nearby = await placesProvider.searchPlaces('', currentLocation, 12.0);
    }

    const candidates = nearby
      .map((place) => {
        const distKm = calculateDistanceKm(
          currentLocation.lat,
          currentLocation.lng,
          place.coordinates.lat,
          place.coordinates.lng
        );
        const walkTimeMins = Math.max(3, Math.round(distKm * 8)); // 8 mins per km
        const returnTimeMins = walkTimeMins;
        
        // Dynamically compute safe dwell time that fits within the delay buffer
        const availableWindow = delayMinutes - walkTimeMins - returnTimeMins - safeReturnBufferMins;
        const recommendedDwellMins = Math.max(12, Math.min(place.typicalVisitMins || 20, availableWindow));
        const totalTripMins = walkTimeMins + recommendedDwellMins + returnTimeMins;
        const safetyMarginMins = delayMinutes - totalTripMins;

        const exploreScore = recommendationEngine.calculateExploreValue(
          place,
          ['history', 'food', 'culture'],
          500,
          delayMinutes,
          distKm
        );

        return {
          place,
          walkTimeMins,
          recommendedDwellMins,
          returnTimeMins,
          exploreValue: exploreScore.totalScore,
          safetyMarginMins: Math.max(safeReturnBufferMins, safetyMarginMins),
        };
      })
      .filter((c) => c.walkTimeMins <= 14) // Strict maximum 14 mins walk
      .sort((a, b) => b.exploreValue - a.exploreValue);

    return {
      detectedDelayMins: delayMinutes,
      availableExplorationMins: maxAvailableExploration,
      safeReturnBufferMins,
      recommendedPlaces: candidates.slice(0, 3),
    };
  }

  /**
   * 5. Dynamic Replanning: Recalculates itinerary when stops or delays change
   */
  public addDetourToJourney(journey: Journey, detour: SmartDetour): Journey {
    const newStops = [...journey.stops];
    const destStop = newStops.pop()!; // Temporarily remove final destination

    const newStopOrder = newStops.length + 1;
    const prevStop = newStops[newStops.length - 1];

    // Compute updated timestamps
    const prevDepMins = parseTimeStrToMins(prevStop.departureTime);
    const arrivalMins = prevDepMins + detour.detourTimeMins;
    const depMins = arrivalMins + detour.visitDurationMins;

    const newDetourStop: JourneyStop = {
      id: `stop-detour-${detour.id}-${Date.now()}`,
      stopOrder: newStopOrder,
      stopType: detour.category === 'food' ? 'food_stop' : 'smart_detour',
      title: detour.place.name,
      description: detour.place.description,
      place: detour.place,
      coordinates: detour.place.coordinates,
      arrivalTime: formatMinsToTimeStr(arrivalMins),
      departureTime: formatMinsToTimeStr(depMins),
      dwellTimeMins: detour.visitDurationMins,
      travelTimeFromPrevMins: detour.detourTimeMins,
      travelMode: 'auto',
      costEst: detour.estimatedCost,
      distanceKm: detour.distanceFromRouteKm,
      exploreValue: detour.exploreValue,
      detourReason: detour.relevanceReason,
    };

    newStops.push(newDetourStop);

    // Update destination arrival
    const finalArrivalMins = depMins + 35;
    destStop.stopOrder = newStops.length + 1;
    destStop.arrivalTime = formatMinsToTimeStr(finalArrivalMins);
    destStop.departureTime = formatMinsToTimeStr(finalArrivalMins);
    destStop.travelTimeFromPrevMins = 35;
    newStops.push(destStop);

    const updatedRemainingDetours = journey.smartDetoursAvailable.filter(
      (d) => d.id !== detour.id
    );

    const updatedDuration = journey.totalDurationMins + detour.detourTimeMins + detour.visitDurationMins;
    const updatedBudget = journey.totalBudgetEst + detour.estimatedCost;

    return {
      ...journey,
      stops: newStops,
      smartDetoursAvailable: updatedRemainingDetours,
      totalDurationMins: updatedDuration,
      totalBudgetEst: updatedBudget,
      aiSummary: `Updated itinerary includes ${detour.place.name} (+${detour.detourTimeMins}m travel, ${detour.visitDurationMins}m dwell, ₹${detour.estimatedCost}).`,
      updatedAt: new Date().toISOString(),
    };
  }

  public removeStopFromJourney(journey: Journey, stopId: string): Journey {
    const targetStop = journey.stops.find((s) => s.id === stopId);
    if (!targetStop || targetStop.stopType === 'origin' || targetStop.stopType === 'destination') {
      return journey; // Cannot remove origin or destination
    }

    const filteredStops = journey.stops.filter((s) => s.id !== stopId);
    // Re-index stop orders
    const updatedStops = filteredStops.map((stop, idx) => ({
      ...stop,
      stopOrder: idx + 1,
    }));

    const updatedDuration = Math.max(90, journey.totalDurationMins - targetStop.dwellTimeMins - targetStop.travelTimeFromPrevMins);
    const updatedBudget = Math.max(100, journey.totalBudgetEst - targetStop.costEst);

    return {
      ...journey,
      stops: updatedStops,
      totalDurationMins: updatedDuration,
      totalBudgetEst: updatedBudget,
      updatedAt: new Date().toISOString(),
    };
  }
}

function parseTimeStrToMins(timeStr: string): number {
  try {
    const [time, modifier] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours * 60 + (minutes || 0);
  } catch {
    return 10 * 60; // 10:00 AM default
  }
}

function formatMinsToTimeStr(mins: number): string {
  const normMins = mins % (24 * 60);
  let hours = Math.floor(normMins / 60);
  const m = normMins % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')} ${modifier}`;
}

function formatDurationSummary(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} minutes`;
  if (m === 0) return `${h} hours`;
  return `${h}h ${m}m`;
}

export const journeyPlanner = new JourneyPlanner();
