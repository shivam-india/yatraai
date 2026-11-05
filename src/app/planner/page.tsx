'use client';

// ==============================================================================
// YATRA AI - STRUCTURED TRIP PLANNER
// Configure origin, destination, transit mode, budget, time & interest parameters
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  Clock,
  Wallet,
  Sparkles,
  Bus,
  Train,
  Check,
  MapPin,
} from 'lucide-react';
import AIThinkingModal from '@/components/journey/AIThinkingModal';
import { formatCurrency } from '@/lib/utils';

const INTERESTS_OPTIONS = [
  { id: 'history', label: 'History & Heritage', icon: '🏛️' },
  { id: 'food', label: 'Local Food & Dhabas', icon: '🍛' },
  { id: 'culture', label: 'Art & Cultural Centres', icon: '🎨' },
  { id: 'nature', label: 'Nature & Sanctuaries', icon: '🌿' },
  { id: 'market', label: 'Bazaars & Crafts', icon: '🛍️' },
  { id: 'artisan', label: 'Local Artisans', icon: '🏺' },
];

const POPULAR_CORRIDORS = [
  { origin: 'Ambala', destination: 'Chandigarh' },
  { origin: 'Delhi', destination: 'Jaipur' },
  { origin: 'Chandigarh', destination: 'Kalka' },
  { origin: 'Delhi', destination: 'Ambala' },
];

export default function PlannerPage() {
  const router = useRouter();

  const [origin, setOrigin] = useState('Ambala');
  const [destination, setDestination] = useState('Chandigarh');
  const [budget, setBudget] = useState(800);
  const [availableTimeMins, setAvailableTimeMins] = useState(300); // 5 hours
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['history', 'food']);
  const [travelMode, setTravelMode] = useState<string>('public_transport');
  const [walkingTolerance, setWalkingTolerance] = useState(20);

  const [isThinking, setIsThinking] = useState(false);
  const [targetJourneyId, setTargetJourneyId] = useState<string | null>(null);

  // Check if a prompt was forwarded from Explore page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const forwarded = sessionStorage.getItem('yatra_plan_prompt');
      if (forwarded) {
        sessionStorage.removeItem('yatra_plan_prompt');
      }
    }
  }, []);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsThinking(true);

    try {
      const res = await fetch('/api/journey/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          budget,
          availableTimeMins,
          interests: selectedInterests,
          travelMode,
          walkingToleranceMins: walkingTolerance,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        sessionStorage.setItem('yatra_active_journey', JSON.stringify(data.data));
        setTargetJourneyId(data.data.id);
      } else {
        setTargetJourneyId('demo');
      }
    } catch {
      setTargetJourneyId('demo');
    }
  };

  const handleThinkingDone = () => {
    setIsThinking(false);
    router.push(`/journey?id=${targetJourneyId || 'demo'}`);
  };

  return (
    <div className="min-h-screen bg-yatra-50/40 text-slate-800 pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-yatra-700 bg-yatra-100 px-2.5 py-0.5 rounded-md mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Intelligent Mobility Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
          Design Your Journey
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Specify your transit stations, available time, and passions. Yatra AI optimizes the stops in between.
        </p>
      </div>

      {/* Corridor Quick Select */}
      <div className="mb-6 bg-white/70 border border-slate-200/80 rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
          Popular Corridors:
        </span>
        {POPULAR_CORRIDORS.map((c) => (
          <button
            key={`${c.origin}-${c.destination}`}
            onClick={() => {
              setOrigin(c.origin);
              setDestination(c.destination);
            }}
            className="text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 hover:border-yatra-400 text-slate-700 px-3 py-1.5 rounded-xl transition shadow-2xs"
          >
            {c.origin} → {c.destination}
          </button>
        ))}
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200/90 shadow-float rounded-3xl p-6 sm:p-8 space-y-6"
      >
        {/* Origin & Destination Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Starting Station / City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                placeholder="e.g. Ambala Cantt"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-yatra-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-semibold outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Final Destination
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                placeholder="e.g. Chandigarh ISBT"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-yatra-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-semibold outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Time & Budget Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-yatra-600" />
                Available Travel Time
              </label>
              <span className="text-sm font-black text-slate-900">
                {Math.floor(availableTimeMins / 60)}h {availableTimeMins % 60 > 0 ? `${availableTimeMins % 60}m` : ''}
              </span>
            </div>
            <input
              type="range"
              min={90}
              max={600}
              step={30}
              value={availableTimeMins}
              onChange={(e) => setAvailableTimeMins(Number(e.target.value))}
              className="w-full accent-yatra-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1.5 Hours</span>
              <span>5 Hours (Default)</span>
              <span>10 Hours</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                Estimated Travel Budget
              </label>
              <span className="text-sm font-black text-slate-900">
                {formatCurrency(budget)}
              </span>
            </div>
            <input
              type="range"
              min={200}
              max={3000}
              step={100}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-yatra-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹200 (Budget)</span>
              <span>₹800 (Standard)</span>
              <span>₹3,000</span>
            </div>
          </div>
        </div>

        {/* Interests Selection Chips */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            What are you excited to discover along the way?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {INTERESTS_OPTIONS.map((opt) => {
              const isSelected = selectedInterests.includes(opt.id);
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => toggleInterest(opt.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-yatra-500 bg-yatra-50 text-yatra-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-yatra-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-float hover:shadow-glow transition-all active:scale-[0.99] flex items-center justify-center gap-2 group"
          >
            <span>Generate Optimized Discovery Route</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>

      <AIThinkingModal isOpen={isThinking} onComplete={handleThinkingDone} />
    </div>
  );
}

