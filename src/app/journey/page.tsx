'use client';

// ==============================================================================
// YATRA AI - JOURNEY RESULT SCREEN
// Desktop: 65% Interactive Map + 35% Dynamic Journey Timeline
// Mobile: Full-width Map with expandable bottom sheet
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Journey,
  JourneyStop,
  SmartDetour,
  WaitingTimeOpportunity,
  Place,
} from '@/types';
import InteractiveMap from '@/components/map';
import JourneyTimeline from '@/components/journey/JourneyTimeline';
import SmartDetourCard from '@/components/journey/SmartDetourCard';
import WaitingTimeModal from '@/components/journey/WaitingTimeModal';
import AskYatraSheet from '@/components/ai/AskYatraSheet';
import {
  Clock,
  Compass,
  Sparkles,
  Bookmark,
  Share2,
  AlertTriangle,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Check,
} from 'lucide-react';
import { formatCurrency, formatMinutes } from '@/lib/utils';
import { journeyPlanner } from '@/services/ai/journeyPlanner';
import { dbService } from '@/lib/supabase/db';

function JourneyResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [journey, setJourney] = useState<Journey | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [activeStopForAI, setActiveStopForAI] = useState<JourneyStop | null>(null);
  const [isAskYatraOpen, setIsAskYatraOpen] = useState(false);

  // Waiting Time Exploration Modal State
  const [waitingModalOpen, setWaitingModalOpen] = useState(false);
  const [waitingOpportunity, setWaitingOpportunity] = useState<WaitingTimeOpportunity | null>(null);

  // Mobile Bottom Sheet Collapse State
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [replanningBannerText, setReplanningBannerText] = useState<string | null>(null);

  // Load journey from sessionStorage or generate Ambala -> Chandigarh demo
  useEffect(() => {
    async function loadJourney() {
      if (typeof window === 'undefined') return;

      const cached = sessionStorage.getItem('yatra_active_journey');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setJourney(parsed);
          return;
        } catch {
          // ignore
        }
      }

      // Generate default Ambala -> Chandigarh discovery route
      const fallback = await journeyPlanner.planJourney({
        origin: 'Ambala',
        destination: 'Chandigarh',
        budget: 800,
        availableTimeMins: 300,
        interests: ['history', 'food'],
        travelMode: 'public_transport',
        walkingToleranceMins: 20,
        rawPrompt: "Ambala to Chandigarh ₹800 5 hours history and food",
        confidenceScore: 1.0,
      });

      setJourney(fallback);
      sessionStorage.setItem('yatra_active_journey', JSON.stringify(fallback));
    }

    loadJourney();
  }, []);

  // Handle adding a Smart Detour dynamically
  const handleAddDetour = (detour: SmartDetour) => {
    if (!journey) return;
    const updated = journeyPlanner.addDetourToJourney(journey, detour);
    setJourney(updated);
    sessionStorage.setItem('yatra_active_journey', JSON.stringify(updated));

    setReplanningBannerText(
      `Added ${detour.place.name}! Itinerary updated (+${detour.detourTimeMins}m travel, ${detour.visitDurationMins}m visit, ₹${detour.estimatedCost}).`
    );

    setTimeout(() => {
      setReplanningBannerText(null);
    }, 6000);
  };

  // Handle removing a stop
  const handleRemoveStop = (stopId: string) => {
    if (!journey) return;
    const updated = journeyPlanner.removeStopFromJourney(journey, stopId);
    setJourney(updated);
    sessionStorage.setItem('yatra_active_journey', JSON.stringify(updated));
  };

  // Trigger Waiting Time Exploration (Simulate delay)
  const handleSimulateDelay = async (delayMinutes = 38) => {
    if (!journey) return;
    const originCoords = journey.origin.coordinates;

    try {
      const res = await fetch('/api/journey/waiting-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: originCoords.lat,
          longitude: originCoords.lng,
          delayMinutes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWaitingOpportunity(data.data);
        setWaitingModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching waiting time options:', err);
    }
  };

  // Save journey to database / storage
  const handleSaveJourney = async () => {
    if (!journey) return;
    const success = await dbService.saveJourney(journey);
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  if (!journey) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20">
        <div className="w-10 h-10 rounded-full border-3 border-yatra-500 border-t-transparent animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Assembling your Yatra journey...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-50 pt-16">
      {/* Top Journey Summary Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 z-30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            title="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {journey.origin.name} → {journey.destination.name}
              </h2>
              <span className="text-[10px] font-bold uppercase bg-yatra-100 text-yatra-800 px-2 py-0.5 rounded-md">
                Active Itinerary
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {formatMinutes(journey.totalDurationMins)}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">
                Est. {formatCurrency(journey.totalBudgetEst)}
              </span>
              <span>•</span>
              <span className="hidden sm:inline capitalize">
                Interests: {journey.interests.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {/* Waiting-Time Exploration Trigger Button */}
          <button
            onClick={() => handleSimulateDelay(38)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
            title="Simulate delay to explore nearby places"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Bus Delayed?</span>
          </button>

          {/* Save Journey */}
          <button
            onClick={handleSaveJourney}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              isSaved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-soft'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Replanning Notification Banner */}
      {replanningBannerText && (
        <div className="bg-yatra-500 text-white text-xs font-medium py-2 px-4 text-center shadow-md animate-in slide-in-from-top-2 duration-200 z-40 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>{replanningBannerText}</span>
        </div>
      )}

      {/* Main Split Layout: 65% Map / 35% Journey Timeline */}
      <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* MAP CONTAINER (approx 65% width on desktop) */}
        <div className="relative w-full lg:w-[65%] h-[45vh] lg:h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
          <InteractiveMap
            origin={journey.origin.coordinates}
            destination={journey.destination.coordinates}
            stops={journey.stops}
            detours={journey.smartDetoursAvailable}
            selectedStopId={selectedStopId}
            onSelectStop={(stop) => {
              setSelectedStopId(stop.id);
              setActiveStopForAI(stop);
            }}
            onSelectDetour={(detour) => {
              handleAddDetour(detour);
            }}
          />
        </div>

        {/* TIMELINE & DETOUR PANEL (approx 35% width on desktop) */}
        <div className="relative w-full lg:w-[35%] h-[55vh] lg:h-full bg-slate-50/60 overflow-y-auto p-4 sm:p-5 flex flex-col gap-6">
          {/* AI Orchestrator Summary Note */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-soft">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-yatra-600" />
              <span>Yatra AI Route Synthesis</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {journey.aiSummary}
            </p>
          </div>

          {/* Section: Journey Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Itinerary Timeline ({journey.stops.length} Stops)
              </h3>
            </div>

            <JourneyTimeline
              journey={journey}
              selectedStopId={selectedStopId}
              onSelectStop={(stop) => {
                setSelectedStopId(stop.id);
                setActiveStopForAI(stop);
              }}
              onRemoveStop={handleRemoveStop}
              onOpenAskYatra={(stop) => {
                setActiveStopForAI(stop);
                setIsAskYatraOpen(true);
              }}
            />
          </div>

          {/* Section: Smart Detours Along Route */}
          {journey.smartDetoursAvailable && journey.smartDetoursAvailable.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yatra-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Smart Detours Along Route ({journey.smartDetoursAvailable.length})
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">1-click dynamic update</span>
              </div>

              <div className="space-y-3">
                {journey.smartDetoursAvailable.map((detour) => (
                  <SmartDetourCard
                    key={detour.id}
                    detour={detour}
                    onAdd={handleAddDetour}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating "Ask Yatra" Action Button (Liquid Glass) */}
      <button
        onClick={() => setIsAskYatraOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-float rounded-full px-4 py-2.5 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
      >
        <Compass className="w-4 h-4 text-yatra-400" />
        <span className="text-xs font-semibold tracking-wide">Ask Yatra AI</span>
      </button>

      {/* Waiting Time Delay Exploration Modal */}
      <WaitingTimeModal
        isOpen={waitingModalOpen}
        onClose={() => setWaitingModalOpen(false)}
        opportunity={waitingOpportunity}
        onSelectPlace={(place) => {
          if (!journey) return;
          const newDetour = journeyPlanner.addDetourToJourney(journey, {
            id: `detour-${place.id}`,
            place,
            detourTimeMins: 10,
            visitDurationMins: place.typicalVisitMins || 25,
            estimatedCost: 0,
            distanceFromRouteKm: 0.8,
            exploreValue: 92,
            relevanceReason: 'Safe waiting-time exploration during transit delay',
            category: place.category,
            openingHoursStatus: 'Open now',
          });
          setJourney(newDetour);
          sessionStorage.setItem('yatra_active_journey', JSON.stringify(newDetour));
        }}
      />

      {/* Ask Yatra AI Drawer */}
      <AskYatraSheet
        isOpen={isAskYatraOpen}
        onClose={() => setIsAskYatraOpen(false)}
        journey={journey}
        activeStop={activeStopForAI}
      />
    </div>
  );
}

export default function JourneyResultPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20">
          <div className="w-10 h-10 rounded-full border-3 border-yatra-500 border-t-transparent animate-spin mb-3" />
          <p className="text-sm text-slate-500 font-medium">Assembling your Yatra journey...</p>
        </div>
      }
    >
      <JourneyResultContent />
    </React.Suspense>
  );
}
