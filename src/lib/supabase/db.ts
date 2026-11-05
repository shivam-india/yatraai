// ==============================================================================
// YATRA AI - DATABASE ADAPTER & STORAGE LAYER
// Transparent persistence for Journeys, Places, Preferences & Community
// Supports Supabase PostgreSQL when credentials exist, with local storage fallback
// ==============================================================================

import { Journey, Place, UserPreference, CommunitySubmission } from '@/types';
import { createClient, isSupabaseConfigured } from './client';
import { DEMO_PLACES } from '@/services/places/demoData';

const LOCAL_JOURNEYS_KEY = 'yatra_saved_journeys';
const LOCAL_PLACES_KEY = 'yatra_saved_places';
const LOCAL_PREFS_KEY = 'yatra_user_preferences';
const LOCAL_COMMUNITY_KEY = 'yatra_community_submissions';

export const defaultPreferences: UserPreference = {
  preferredTransport: ['bus', 'train'],
  interests: ['history', 'food', 'culture'],
  walkingToleranceMins: 20,
  budgetLevel: 'moderate',
  dietaryPreferences: ['vegetarian_friendly'],
  avoidCrowds: false,
};

export class DatabaseService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // --- SAVED JOURNEYS ---
  public async getSavedJourneys(): Promise<Journey[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.from('saved_journeys').select('*, journeys(*)');
        if (!error && data) {
          return data.map((d: any) => d.journeys).filter(Boolean);
        }
      }
    }

    if (this.isBrowser()) {
      try {
        const raw = localStorage.getItem(LOCAL_JOURNEYS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  public async saveJourney(journey: Journey): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.from('journeys').upsert({
          id: journey.id,
          title: journey.title,
          origin_name: journey.origin.name,
          destination_name: journey.destination.name,
          origin_lat: journey.origin.coordinates.lat,
          origin_lng: journey.origin.coordinates.lng,
          dest_lat: journey.destination.coordinates.lat,
          dest_lng: journey.destination.coordinates.lng,
          total_duration_mins: journey.totalDurationMins,
          total_budget_est: journey.totalBudgetEst,
          interests: journey.interests,
          ai_summary: journey.aiSummary,
        });
        if (!error) return true;
      }
    }

    if (this.isBrowser()) {
      try {
        const existing = await this.getSavedJourneys();
        const updated = [journey, ...existing.filter((j) => j.id !== journey.id)];
        localStorage.setItem(LOCAL_JOURNEYS_KEY, JSON.stringify(updated));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  public async deleteSavedJourney(journeyId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.from('journeys').delete().eq('id', journeyId);
      }
    }

    if (this.isBrowser()) {
      try {
        const existing = await this.getSavedJourneys();
        const updated = existing.filter((j) => j.id !== journeyId);
        localStorage.setItem(LOCAL_JOURNEYS_KEY, JSON.stringify(updated));
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  // --- SAVED PLACES ---
  public async getSavedPlaces(): Promise<Place[]> {
    if (this.isBrowser()) {
      try {
        const raw = localStorage.getItem(LOCAL_PLACES_KEY);
        return raw ? JSON.parse(raw) : [DEMO_PLACES[0], DEMO_PLACES[1]];
      } catch {
        return [DEMO_PLACES[0]];
      }
    }
    return [DEMO_PLACES[0]];
  }

  public async toggleSavePlace(place: Place): Promise<boolean> {
    if (this.isBrowser()) {
      try {
        const existing = await this.getSavedPlaces();
        const exists = existing.some((p) => p.id === place.id);
        const updated = exists
          ? existing.filter((p) => p.id !== place.id)
          : [...existing, place];
        localStorage.setItem(LOCAL_PLACES_KEY, JSON.stringify(updated));
        return !exists; // true if added, false if removed
      } catch {
        return false;
      }
    }
    return false;
  }

  // --- USER PREFERENCES ---
  public async getUserPreferences(): Promise<UserPreference> {
    if (this.isBrowser()) {
      try {
        const raw = localStorage.getItem(LOCAL_PREFS_KEY);
        return raw ? JSON.parse(raw) : defaultPreferences;
      } catch {
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  }

  public async updateUserPreferences(prefs: UserPreference): Promise<boolean> {
    if (this.isBrowser()) {
      try {
        localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(prefs));
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  // --- COMMUNITY SUBMISSIONS ---
  public async getCommunitySubmissions(): Promise<CommunitySubmission[]> {
    const defaultSubmissions: CommunitySubmission[] = [
      {
        id: 'comm-1',
        placeName: 'Old City Jalebi Wala (Since 1928)',
        category: 'food',
        city: 'Ambala',
        coordinates: { lat: 30.375, lng: 76.772 },
        description: 'Crisp, hot saffron-infused desi ghee jalebis served with thick clotted rabri.',
        whySpecial: 'Third generation sweetmakers still using century-old brass kadhais.',
        status: 'approved',
        submittedAt: '2026-10-14T10:00:00Z',
      },
      {
        id: 'comm-2',
        placeName: 'Sukhna Backwater Birdwatchers Hideout',
        category: 'nature',
        city: 'Chandigarh',
        coordinates: { lat: 30.749, lng: 76.825 },
        description: 'Quiet nature reserve trail hidden beyond the regulated promenade with migratory Siberian ducks.',
        whySpecial: 'Zero crowds, pure serenity at sunrise.',
        status: 'approved',
        submittedAt: '2026-10-22T14:30:00Z',
      },
    ];

    if (this.isBrowser()) {
      try {
        const raw = localStorage.getItem(LOCAL_COMMUNITY_KEY);
        return raw ? JSON.parse(raw) : defaultSubmissions;
      } catch {
        return defaultSubmissions;
      }
    }
    return defaultSubmissions;
  }

  public async submitCommunityPlace(submission: Omit<CommunitySubmission, 'id' | 'status' | 'submittedAt'>): Promise<CommunitySubmission> {
    const newSubmission: CommunitySubmission = {
      ...submission,
      id: `comm-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    if (this.isBrowser()) {
      try {
        const existing = await this.getCommunitySubmissions();
        const updated = [newSubmission, ...existing];
        localStorage.setItem(LOCAL_COMMUNITY_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return newSubmission;
  }
}

export const dbService = new DatabaseService();

