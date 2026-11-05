// ==============================================================================
// YATRA AI - CORE TYPES DEFINITION
// ==============================================================================

export type PlaceCategory =
  | 'historical'
  | 'food'
  | 'culture'
  | 'nature'
  | 'market'
  | 'artisan'
  | 'hidden_gem'
  | 'workshop';

export type PlaceSource =
  | 'verified'
  | 'serpapi'
  | 'community'
  | 'ai_suggested';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceReview {
  authorName: string;
  rating: number;
  reviewText: string;
  visitDate?: string;
  source?: string;
}

export interface Place {
  id: string;
  serpapiPlaceId?: string;
  name: string;
  category: PlaceCategory;
  description: string;
  address: string;
  city: string;
  state?: string;
  coordinates: Coordinates;
  rating: number;
  reviewsCount: number;
  priceLevel: number; // 0 (free) to 4 (high)
  typicalVisitMins: number;
  openingHours?: {
    isOpenNow?: boolean;
    text?: string;
    schedule?: Record<string, string>;
  };
  photos: string[];
  isVerified: boolean;
  source: PlaceSource;
  website?: string;
  phone?: string;
  tags?: string[];
}

export interface PlaceDetails extends Place {
  reviews?: PlaceReview[];
  ownerStory?: string;
  specialties?: string[];
  exploreScore?: number;
  bestTimeToVisit?: string;
  isFamilyOwned?: boolean;
}

export interface SmartDetour {
  id: string;
  place: Place;
  detourTimeMins: number; // Additional travel time
  visitDurationMins: number; // Recommended dwell time
  estimatedCost: number; // Entry or meal cost in INR
  distanceFromRouteKm: number;
  exploreValue: number; // 0 - 100 AI score
  relevanceReason: string;
  category: PlaceCategory;
  openingHoursStatus: string;
  transitSuggestion?: string;
}

export type StopType =
  | 'origin'
  | 'transit_hub'
  | 'smart_detour'
  | 'food_stop'
  | 'destination';

export type TransportType =
  | 'bus'
  | 'train'
  | 'metro'
  | 'walk'
  | 'auto'
  | 'shuttle';

export interface JourneyStop {
  id: string;
  stopOrder: number;
  stopType: StopType;
  title: string;
  description: string;
  place?: Place;
  coordinates: Coordinates;
  arrivalTime: string;
  departureTime: string;
  dwellTimeMins: number;
  travelTimeFromPrevMins: number;
  travelMode: TransportType;
  costEst: number;
  distanceKm: number;
  exploreValue?: number;
  detourReason?: string;
  isCompleted?: boolean;
  transitDetails?: {
    operator?: string;
    routeNumber?: string;
    platform?: string;
    status?: 'on_time' | 'delayed' | 'rescheduled' | 'cancelled';
    delayMinutes?: number;
  };
}

export interface Journey {
  id: string;
  userId?: string;
  title: string;
  origin: {
    name: string;
    coordinates: Coordinates;
  };
  destination: {
    name: string;
    coordinates: Coordinates;
  };
  totalDurationMins: number;
  totalBudgetEst: number;
  interests: string[];
  travelMode: string;
  stops: JourneyStop[];
  smartDetoursAvailable: SmartDetour[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  aiSummary: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransportUpdate {
  routeId: string;
  delayMinutes: number;
  status: 'on_time' | 'delayed' | 'cancelled' | 'rescheduled';
  advisoryMessage?: string;
  reportedAt: string;
}

export interface TransportOption {
  id: string;
  type: TransportType;
  operator: string;
  routeCode: string;
  departureLocation: string;
  arrivalLocation: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  durationMins: number;
  baseFare: number;
  status: 'on_time' | 'delayed' | 'cancelled';
  delayMinutes: number;
  advisory?: string;
}

export interface UserPreference {
  preferredTransport: TransportType[];
  interests: string[];
  walkingToleranceMins: number;
  budgetLevel: 'budget' | 'moderate' | 'comfort';
  dietaryPreferences: string[];
  avoidCrowds: boolean;
}

export interface CommunitySubmission {
  id: string;
  userId?: string;
  placeName: string;
  category: PlaceCategory;
  city: string;
  coordinates: Coordinates;
  description: string;
  whySpecial: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface ParsedJourneyIntent {
  origin: string;
  destination: string;
  budget: number;
  availableTimeMins: number;
  travelDate?: string;
  interests: string[];
  travelMode: string;
  walkingToleranceMins: number;
  dietaryPreferences?: string[];
  rawPrompt: string;
  confidenceScore: number;
}

export interface WaitingTimeOpportunity {
  detectedDelayMins: number;
  availableExplorationMins: number;
  safeReturnBufferMins: number;
  recommendedPlaces: {
    place: Place;
    walkTimeMins: number;
    recommendedDwellMins: number;
    returnTimeMins: number;
    exploreValue: number;
    safetyMarginMins: number;
  }[];
}

export interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  modelUsed?: string;
  isDemoFallback?: boolean;
}
