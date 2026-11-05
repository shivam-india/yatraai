'use client';

// ==============================================================================
// YATRA AI - JOURNEY TIMELINE COMPONENT
// Beautiful step-by-step itinerary combining transport, timing, budget & detours
// ==============================================================================

import React from 'react';
import { Journey, JourneyStop } from '@/types';
import {
  Bus,
  Train,
  Clock,
  Compass,
  MapPin,
  ExternalLink,
  Trash2,
  Utensils,
  Landmark,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { serpApiMapsService } from '@/services/serpapi/maps';

interface JourneyTimelineProps {
  journey: Journey;
  selectedStopId?: string | null;
  onSelectStop?: (stop: JourneyStop) => void;
  onRemoveStop?: (stopId: string) => void;
  onOpenAskYatra?: (stop: JourneyStop) => void;
}

export default function JourneyTimeline({
  journey,
  selectedStopId,
  onSelectStop,
  onRemoveStop,
  onOpenAskYatra,
}: JourneyTimelineProps) {
  const { stops } = journey;

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-[17px] before:top-3 before:bottom-4 before:w-[2px] before:bg-slate-200">
      {stops.map((stop, index) => {
        const isSelected = selectedStopId === stop.id;
        const isOrigin = stop.stopType === 'origin';
        const isDest = stop.stopType === 'destination';
        const isDetour = stop.stopType === 'smart_detour';
        const isFood = stop.stopType === 'food_stop';

        return (
          <div
            key={stop.id}
            onClick={() => onSelectStop && onSelectStop(stop)}
            className={`group relative bg-white border rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'border-yatra-500 shadow-float ring-2 ring-yatra-100'
                : 'border-slate-200/80 shadow-soft hover:border-slate-300'
            }`}
          >
            {/* Timeline Node Badge */}
            <div
              className={`absolute -left-[31px] top-4 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm transition ${
                isOrigin
                  ? 'bg-slate-800 text-white'
                  : isDest
                  ? 'bg-emerald-600 text-white'
                  : isDetour || isFood
                  ? 'bg-yatra-500 text-white ring-2 ring-yatra-200'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              {isOrigin ? (
                <Bus className="w-3.5 h-3.5" />
              ) : isDest ? (
                <MapPin className="w-3.5 h-3.5" />
              ) : isFood ? (
                <Utensils className="w-3.5 h-3.5" />
              ) : isDetour ? (
                <Sparkles className="w-3.5 h-3.5" />
              ) : (
                index + 1
              )}
            </div>

            {/* Header: Time & Category */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {stop.arrivalTime}
                </span>

                {isDetour && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-yatra-100 text-yatra-800">
                    Smart Detour
                  </span>
                )}
                {isFood && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                    Local Food
                  </span>
                )}
                {stop.transitDetails?.status === 'delayed' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" />
                    +{stop.transitDetails.delayMinutes}m delay
                  </span>
                )}
              </div>

              {/* Cost & Dwell */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {stop.dwellTimeMins > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {stop.dwellTimeMins}m visit
                  </span>
                )}
                {stop.costEst > 0 && (
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(stop.costEst)}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Reason */}
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-yatra-700 transition">
              {stop.title}
            </h3>

            <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
              {stop.description}
            </p>

            {/* Detour Reason or Transit Details */}
            {stop.detourReason && (
              <div className="mt-2 text-[11px] text-yatra-800 bg-yatra-50/70 border border-yatra-200/50 rounded-lg p-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yatra-600 shrink-0" />
                <span>{stop.detourReason}</span>
              </div>
            )}

            {stop.transitDetails?.operator && (
              <div className="mt-2 text-[11px] text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center justify-between">
                <span>{stop.transitDetails.operator} ({stop.transitDetails.routeNumber || 'Transit'})</span>
                <span className="text-slate-500">Scheduled departure: {stop.departureTime}</span>
              </div>
            )}

            {/* Actions Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <a
                  href={serpApiMapsService.getGoogleMapsNavigationUrl(stop.coordinates, stop.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-500 hover:text-yatra-600 font-medium flex items-center gap-1 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  Navigation
                </a>

                {onOpenAskYatra && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAskYatra(stop);
                    }}
                    className="text-yatra-600 hover:text-yatra-700 font-medium flex items-center gap-1 transition"
                  >
                    <Compass className="w-3 h-3" />
                    Ask AI Guide
                  </button>
                )}
              </div>

              {/* Remove Stop if it's a detour */}
              {(isDetour || isFood) && onRemoveStop && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStop(stop.id);
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"
                  title="Remove stop from route"
                  aria-label="Remove stop"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

