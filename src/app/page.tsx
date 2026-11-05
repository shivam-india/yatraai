'use client';

// ==============================================================================
// YATRA AI - HOME PAGE
// Ultra-clean, intentional hero experience with natural language journey input
// ==============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Compass,
  Utensils,
  Landmark,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import AIThinkingModal from '@/components/journey/AIThinkingModal';
import { DEMO_PLACES } from '@/services/places/demoData';

const SAMPLE_PROMPTS = [
  "I'm going from Ambala to Chandigarh tomorrow. I have ₹800 and around 5 hours. I like history and local food.",
  "I have 4 hours and ₹500 in Chandigarh. Find me authentic dhabas and peaceful gardens.",
  "Travelling from Delhi to Jaipur. What historical stepwells and artisan workshops can I visit near my route?",
  "My bus is delayed by 38 minutes at Ambala. What can I explore within safe walking distance?",
];

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState(
    "I'm going from Ambala to Chandigarh tomorrow. I have ₹800 and around 5 hours. I like history and local food."
  );
  const [isThinking, setIsThinking] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);

  const handlePlanJourney = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsThinking(true);
    try {
      const res = await fetch('/api/journey/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        // Cache current journey in sessionStorage so /journey screen opens instantly
        sessionStorage.setItem('yatra_active_journey', JSON.stringify(data.data));
        setPendingDestination(`/journey?id=${data.data.id}`);
      } else {
        // Fallback default
        setPendingDestination('/journey?id=demo');
      }
    } catch {
      setPendingDestination('/journey?id=demo');
    }
  };

  const handleThinkingComplete = () => {
    setIsThinking(false);
    if (pendingDestination) {
      router.push(pendingDestination);
    }
  };

  return (
    <div className="relative min-h-screen bg-yatra-50/40 text-slate-800 flex flex-col justify-between pt-24 pb-16 px-4 sm:px-6">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-amber-100/60 via-yatra-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Container */}
      <div className="max-w-3xl mx-auto w-full text-center mt-8 sm:mt-12">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-soft text-xs font-semibold text-slate-700 mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-yatra-500 animate-pulse" />
          <span>Public Transit + Local Discovery Intelligence</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 mb-3">
          Where to next?
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal leading-relaxed mb-8">
          You were already taking the bus or train. Yatra discovers what you would have otherwise missed.
        </p>

        {/* Natural Language Journey Input Box */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-float rounded-3xl p-3 sm:p-4 text-left transition-all hover:border-yatra-300">
          <form onSubmit={handlePlanJourney} className="flex flex-col gap-3">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Tell Yatra where you're going, budget, available time, and what you love..."
                className="w-full text-sm sm:text-base text-slate-900 placeholder-slate-400 bg-transparent resize-none outline-none font-medium p-2 leading-relaxed"
              />
            </div>

            {/* Input Action Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-yatra-600" />
                <span>Understands timing, budgets, food & heritage</span>
              </div>

              <button
                type="submit"
                disabled={isThinking || !prompt.trim()}
                className="bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-soft hover:shadow-glow transition-all active:scale-98 flex items-center justify-center gap-2 group"
              >
                <span>Plan My Journey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>

        {/* Example Prompt Chips */}
        <div className="mt-5 text-left">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2 px-1">
            Try a real-world scenario
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PROMPTS.map((sample) => (
              <button
                key={sample}
                onClick={() => setPrompt(sample)}
                className="text-xs text-slate-600 bg-white/70 hover:bg-white border border-slate-200/60 hover:border-yatra-300 rounded-xl px-3 py-1.5 transition text-left shadow-2xs hover:shadow-soft"
              >
                {sample.slice(0, 52)}...
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Quick Access Bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-soft hover:shadow-float transition"
          >
            <MapPin className="w-3.5 h-3.5 text-yatra-600" />
            <span>Explore Along My Route</span>
          </Link>

          <Link
            href="/planner"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-soft hover:shadow-float transition"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Structured Trip Planner</span>
          </Link>

          <Link
            href="/saved"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-soft hover:shadow-float transition"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>My Journeys</span>
          </Link>
        </div>
      </div>

      {/* Curated Corridor Highlights Section */}
      <div className="max-w-5xl mx-auto w-full mt-16 sm:mt-24">
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Featured Discovery Corridors
            </h2>
            <p className="text-xs text-slate-500">
              Verified local artisans, iconic dhabas, and UNESCO monuments along regular bus routes
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-semibold text-yatra-600 hover:text-yatra-700 flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_PLACES.slice(0, 3).map((place) => (
            <div
              key={place.id}
              onClick={() => {
                setPrompt(`I'm travelling to ${place.name} in ${place.city} with ₹600 and 4 hours.`);
              }}
              className="group bg-white border border-slate-200/80 hover:border-yatra-300 rounded-3xl p-4 shadow-soft hover:shadow-float transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="uppercase text-[10px] font-bold text-yatra-700 bg-yatra-100/60 px-2 py-0.5 rounded-md">
                    {place.category}
                  </span>
                  <span className="text-slate-500 font-medium">{place.city}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-yatra-700 transition line-clamp-1">
                  {place.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {place.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{place.typicalVisitMins}m visit</span>
                <span className="font-semibold text-slate-700">Explore Value: {place.exploreScore || 90}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Thinking Experience Modal */}
      <AIThinkingModal isOpen={isThinking} onComplete={handleThinkingComplete} />
    </div>
  );
}

