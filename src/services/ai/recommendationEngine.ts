// ==============================================================================
// YATRA AI - RECOMMENDATION & SMART DETOUR SCORING ENGINE
// Computes transparent Explore Value (0 - 100) and detour feasibility
// ==============================================================================

import { Place, SmartDetour, Coordinates, UserPreference } from '@/types';
import { calculateDistanceKm } from '@/lib/utils';
import { routeEngine } from '../transport/routeEngine';

export interface ScoreBreakdown {
  interestMatch: number; // 0 - 35
  ratingQuality: number; // 0 - 25
  timeEfficiency: number; // 0 - 20
  budgetFit: number; // 0 - 10
  culturalUniqueness: number; // 0 - 10
  totalScore: number; // 0 - 100
}

export class RecommendationEngine {
  /**
   * Computes the transparent Explore Value score (0 - 100)
   */
  public calculateExploreValue(
    place: Place,
    interests: string[] = ['history', 'food'],
    userBudget = 800,
    availableTimeMins = 300,
    distanceFromRouteKm = 2.5
  ): ScoreBreakdown {
    // 1. Interest Match (35 pts max)
    const placeCat = place.category.toLowerCase();
    const tags = place.tags?.map((t) => t.toLowerCase()) || [];
    let interestPoints = 15; // baseline

    const matchesCategory = interests.some((interest) => {
      const i = interest.toLowerCase();
      return (
        placeCat.includes(i) ||
        (i === 'food' && (placeCat === 'food' || place.name.toLowerCase().includes('dhaba'))) ||
        (i === 'history' && (placeCat === 'historical' || placeCat === 'culture')) ||
        (i === 'culture' && (placeCat === 'culture' || placeCat === 'artisan')) ||
        (i === 'nature' && placeCat === 'nature') ||
        (i === 'shopping' && placeCat === 'market') ||
        tags.some((t) => t.includes(i))
      );
    });

    if (matchesCategory) {
      interestPoints = 35;
    } else {
      // Partial match
      interestPoints = 22;
    }

    // 2. Rating & Review Quality (25 pts max)
    // Rating 4.0 to 5.0 scaled
    const normalizedRating = Math.max(0, Math.min(5, place.rating));
    const ratingBase = ((normalizedRating - 3.5) / 1.5) * 20; // up to 20
    const reviewsBonus = Math.min(5, Math.log10(Math.max(10, place.reviewsCount))); // up to 5
    const ratingQuality = Math.round(Math.max(10, Math.min(25, ratingBase + reviewsBonus)));

    // 3. Time Efficiency & Route Deviation (20 pts max)
    // Less detour distance = higher score
    let timePoints = 20;
    if (distanceFromRouteKm > 8) {
      timePoints -= 8;
    } else if (distanceFromRouteKm > 4) {
      timePoints -= 4;
    } else if (distanceFromRouteKm > 2) {
      timePoints -= 2;
    }

    const dwellTime = place.typicalVisitMins || 45;
    if (dwellTime > availableTimeMins * 0.4) {
      timePoints -= 5;
    }
    const timeEfficiency = Math.round(Math.max(5, Math.min(20, timePoints)));

    // 4. Budget Fit (10 pts max)
    let budgetFit = 10;
    const estCost = place.priceLevel === 0 ? 0 : place.priceLevel === 1 ? 120 : place.priceLevel === 2 ? 300 : 700;
    if (estCost > userBudget * 0.5) {
      budgetFit = 4;
    } else if (estCost > userBudget * 0.25) {
      budgetFit = 7;
    }

    // 5. Cultural Uniqueness & Local Artisan Value (10 pts max)
    let culturalUniqueness = 7;
    if (place.isVerified) culturalUniqueness += 1;
    if (place.category === 'artisan' || place.category === 'hidden_gem' || place.category === 'historical') {
      culturalUniqueness += 2;
    }
    culturalUniqueness = Math.min(10, culturalUniqueness);

    const total = Math.min(99, Math.round(interestPoints + ratingQuality + timeEfficiency + budgetFit + culturalUniqueness));

    return {
      interestMatch: interestPoints,
      ratingQuality,
      timeEfficiency,
      budgetFit,
      culturalUniqueness,
      totalScore: total,
    };
  }

  /**
   * Evaluates a candidate place into a structured SmartDetour
   */
  public evaluateSmartDetour(
    place: Place,
    origin: Coordinates,
    destination: Coordinates,
    interests: string[],
    budget: number,
    availableTimeMins: number
  ): SmartDetour {
    const distFromCorridor = routeEngine.distanceFromCorridorKm(
      place.coordinates,
      origin,
      destination
    );

    const detourTravelTimeMins = Math.round(distFromCorridor * 3.5 + 6); // Transit off-corridor
    const visitDurationMins = place.typicalVisitMins || 40;
    const estimatedCost = place.priceLevel === 0 ? 0 : place.priceLevel === 1 ? 95 : 250;

    const score = this.calculateExploreValue(
      place,
      interests,
      budget,
      availableTimeMins,
      distFromCorridor
    );

    let relevanceReason = `Directly aligns with your interest in ${place.category}.`;
    if (place.category === 'food') {
      relevanceReason = `Renowned local culinary landmark along the transit corridor.`;
    } else if (place.category === 'historical' || place.category === 'culture') {
      relevanceReason = `High-yield cultural discovery with only ${detourTravelTimeMins} mins route deviation.`;
    } else if (place.category === 'artisan') {
      relevanceReason = `Independent artisan community preserving heritage crafts.`;
    }

    return {
      id: `detour-${place.id}`,
      place,
      detourTimeMins: detourTravelTimeMins,
      visitDurationMins,
      estimatedCost,
      distanceFromRouteKm: distFromCorridor,
      exploreValue: score.totalScore,
      relevanceReason,
      category: place.category,
      openingHoursStatus: place.openingHours?.text || 'Open now',
      transitSuggestion: 'Take local e-rickshaw or connecting bus 10 mins from highway stop',
    };
  }
}

export const recommendationEngine = new RecommendationEngine();

