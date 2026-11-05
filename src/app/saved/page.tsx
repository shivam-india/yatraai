'use client';

// ==============================================================================
// YATRA AI - SAVED JOURNEYS & FAVORITE PLACES
// Reopen, duplicate, edit, and organize itineraries and places
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Journey, Place } from '@/types';
import { dbService } from '@/lib/supabase/db';
import {
  Bookmark,
  Clock,
  MapPin,
  Trash2,
  ExternalLink,
  Plus,
  Play,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatMinutes } from '@/lib/utils';

export default function SavedPage() {
  const router = useRouter();
  const [savedJourneys, setSavedJourneys] = useState<Journey[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<'journeys' | 'places'>('journeys');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const journeys = await dbService.getSavedJourneys();
        const places = await dbService.getSavedPlaces();
        setSavedJourneys(journeys);
        setSavedPlaces(places);
      } catch (err) {
        console.error('Error loading saved items:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteJourney = async (id: string) => {
    await dbService.deleteSavedJourney(id);
    setSavedJourneys((prev) => prev.filter((j) => j.id !== id));
  };

  const handleOpenJourney = (journey: Journey) => {
    sessionStorage.setItem('yatra_active_journey', JSON.stringify(journey));
    router.push(`/journey?id=${journey.id}`);
  };

  const handleDuplicateJourney = async (journey: Journey) => {
    const cloned: Journey = {
      ...journey,
      id: `journey-${Date.now()}`,
      title: `${journey.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    await dbService.saveJourney(cloned);
    setSavedJourneys((prev) => [cloned, ...prev]);
  };

  return (
    <div className="min-h-screen bg-yatra-50/40 text-slate-800 pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            My Journeys & Collections
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Access your curated itineraries, custom detours, and bookmarked local gems
          </p>
        </div>

        <button
          onClick={() => router.push('/planner')}
          className="self-start sm:self-auto bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-soft flex items-center gap-1.5 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Journey</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('journeys')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'journeys'
              ? 'text-slate-950 border-b-2 border-yatra-500'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Saved Journeys ({savedJourneys.length})
        </button>
        <button
          onClick={() => setActiveTab('places')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'places'
              ? 'text-slate-950 border-b-2 border-yatra-500'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Bookmarked Places ({savedPlaces.length})
        </button>
      </div>

      {/* Tab 1: Saved Journeys */}
      {activeTab === 'journeys' && (
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-slate-200/60 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : savedJourneys.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-soft">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No saved journeys yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                When you plan an itinerary, click the bookmark icon to save it for offline transit access.
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 bg-yatra-500 hover:bg-yatra-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-soft transition"
              >
                Plan Ambala → Chandigarh
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedJourneys.map((j) => (
                <div
                  key={j.id}
                  className="bg-white border border-slate-200 hover:border-yatra-300 rounded-3xl p-5 shadow-soft hover:shadow-float transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-yatra-100 text-yatra-800 px-2 py-0.5 rounded-md">
                        {j.stops.length} Stops
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(j.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {j.origin.name} → {j.destination.name}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatMinutes(j.totalDurationMins)}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        Est. {formatCurrency(j.totalBudgetEst)}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{j.interests.join(', ')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleDuplicateJourney(j)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                      title="Duplicate journey"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteJourney(j.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete journey"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenJourney(j)}
                      className="bg-slate-900 hover:bg-yatra-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-soft transition flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Open Itinerary</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bookmarked Places */}
      {activeTab === 'places' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-white border border-slate-200 rounded-3xl p-4 shadow-soft flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-yatra-700 bg-yatra-50 px-2 py-0.5 rounded-md">
                  {place.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                  {place.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {place.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">{place.city}</span>
                <button
                  onClick={() => router.push(`/explore?q=${encodeURIComponent(place.name)}`)}
                  className="text-yatra-600 font-semibold hover:underline flex items-center gap-1"
                >
                  View Details
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

