'use client';

// ==============================================================================
// YATRA AI - SMART DETOUR CARD
// Key differentiator: Discovers meaningful stops along route with calculated Explore Value
// ==============================================================================

import React from 'react';
import { SmartDetour } from '@/types';
import { Sparkles, Clock, Navigation, Plus, Check, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SmartDetourCardProps {
  detour: SmartDetour;
  onAdd: (detour: SmartDetour) => void;
  isAdded?: boolean;
}

export default function SmartDetourCard({
  detour,
  onAdd,
  isAdded = false,
}: SmartDetourCardProps) {
  const { place, detourTimeMins, visitDurationMins, estimatedCost, exploreValue, relevanceReason } = detour;

  return (
    <div className={`group relative bg-white border rounded-2xl p-4 transition-all duration-300 shadow-soft hover:shadow-float ${
      isAdded ? 'border-yatra-400 bg-yatra-50/30' : 'border-slate-200 hover:border-yatra-300'
    }`}>
      {/* Top Meta Bar */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-yatra-100/70 text-yatra-800">
            <Sparkles className="w-3 h-3 text-yatra-600" />
            Smart Detour
          </span>
          <h4 className="text-sm font-semibold text-slate-900 mt-1 leading-snug group-hover:text-yatra-700 transition">
            {place.name}
          </h4>
        </div>

        {/* Explore Value Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Explore Value</span>
            <span className="text-sm font-black text-amber-900">{exploreValue}</span>
          </div>
          <div className="flex items-center gap-0.5 text-[11px] text-slate-500 mt-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{place.rating} ({place.reviewsCount.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* Snippet / Description */}
      <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
        {place.description}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50/80 rounded-xl p-2.5 text-xs text-slate-600 mb-3 border border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Deviation</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-yatra-600" />
            +{detourTimeMins}m
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Recommended</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {visitDurationMins}m visit
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Est. Cost</span>
          <span className="font-semibold text-slate-800">
            {estimatedCost === 0 ? 'Free' : formatCurrency(estimatedCost)}
          </span>
        </div>
      </div>

      {/* Relevance Reason */}
      <div className="text-[11px] text-slate-500 mb-3.5 italic flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-yatra-500" />
        <span>{relevanceReason}</span>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onAdd(detour)}
        disabled={isAdded}
        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] ${
          isAdded
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
            : 'bg-yatra-500 hover:bg-yatra-600 text-white shadow-soft hover:shadow-glow'
        }`}
      >
        {isAdded ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Added to Journey
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" />
            Add to Journey (+{detourTimeMins} min)
          </>
        )}
      </button>
    </div>
  );
}

