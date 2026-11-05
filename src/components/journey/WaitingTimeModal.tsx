'use client';

// ==============================================================================
// YATRA AI - WAITING TIME EXPLORATION MODAL
// Discovers safe experiences during transit delays with guaranteed departure safety buffer
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { WaitingTimeOpportunity, Place } from '@/types';
import { Clock, ShieldAlert, Sparkles, Navigation, X, ExternalLink, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { serpApiMapsService } from '@/services/serpapi/maps';

interface WaitingTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: WaitingTimeOpportunity | null;
  onSelectPlace?: (place: Place) => void;
}

export default function WaitingTimeModal({
  isOpen,
  onClose,
  opportunity,
  onSelectPlace,
}: WaitingTimeModalProps) {
  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-float border border-slate-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-yatra-600 p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 bg-black/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <Clock className="w-3 h-3" />
              Transit Delay Detected
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold tracking-tight">
            Your bus is delayed by {opportunity.detectedDelayMins} minutes.
          </h3>
          <p className="text-xs text-white/90 mt-1">
            You have {opportunity.availableExplorationMins} minutes of safe exploration window before boarding.
          </p>
        </div>

        {/* Safety Guarantee Bar */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-2.5 flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Strict {opportunity.safeReturnBufferMins}-min return safety buffer applied. You won't miss your departure.
          </span>
        </div>

        {/* List of Safe Nearby Opportunities */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {opportunity.recommendedPlaces.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              No exploration spots within safe walking perimeter. Relax at the station lounge!
            </p>
          ) : (
            opportunity.recommendedPlaces.map((rec) => (
              <div
                key={rec.place.id}
                className="group border border-slate-200 hover:border-yatra-400 rounded-2xl p-4 transition-all hover:shadow-soft bg-white"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-yatra-700 bg-yatra-50 px-2 py-0.5 rounded-md">
                      {rec.place.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-yatra-700 transition mt-1">
                      {rec.place.name}
                    </h4>
                  </div>

                  <div className="bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-right">
                    <span className="text-[10px] text-amber-700 font-bold uppercase block">Score</span>
                    <span className="text-xs font-black text-amber-900">{rec.exploreValue}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {rec.place.description}
                </p>

                {/* Timing Breakdown */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2 text-center text-xs text-slate-700 mb-3 border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Walk</span>
                    <span className="font-semibold">{rec.walkTimeMins}m each way</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Visit</span>
                    <span className="font-semibold">{rec.recommendedDwellMins}m stay</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Safety Buffer</span>
                    <span className="font-semibold text-emerald-700">+{rec.safetyMarginMins}m safe</span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <a
                    href={serpApiMapsService.getGoogleMapsNavigationUrl(rec.place.coordinates, rec.place.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Walking directions
                  </a>

                  <button
                    onClick={() => {
                      if (onSelectPlace) onSelectPlace(rec.place);
                      onClose();
                    }}
                    className="bg-yatra-500 hover:bg-yatra-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-soft transition active:scale-95 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Explore While You Wait
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

