'use client';

// ==============================================================================
// YATRA AI - AI THINKING EXPERIENCE MODAL
// Multi-stage animated thinking experience reflecting actual agent orchestration
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Compass, Bus, MapPin, Clock, Route } from 'lucide-react';

interface AIThinkingModalProps {
  isOpen: boolean;
  onComplete?: () => void;
}

const STAGES = [
  { label: 'Analyzing your journey intent', icon: Sparkles },
  { label: 'Finding public transport options & schedules', icon: Bus },
  { label: 'Discovering local experiences & heritage along corridor', icon: MapPin },
  { label: 'Checking dwell timings & departure buffers', icon: Clock },
  { label: 'Optimizing route & computing Explore Values', icon: Route },
  { label: 'Building your personalized journey', icon: Compass },
];

export default function AIThinkingModal({ isOpen, onComplete }: AIThinkingModalProps) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onComplete) {
            setTimeout(onComplete, 400);
          }
          return prev;
        }
      });
    }, 600); // 600ms per agent stage

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-float text-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-yatra-100 flex items-center justify-center">
            <Compass className="w-4 h-4 text-yatra-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Yatra AI Orchestrator</h3>
            <p className="text-[11px] text-slate-500">Synthesizing transit + local discovery</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yatra-500 to-amber-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
          />
        </div>

        {/* Stages list */}
        <div className="space-y-3">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStage;
            const isCurrent = idx === currentStage;
            const Icon = stage.icon;

            return (
              <div
                key={stage.label}
                className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                  isCurrent
                    ? 'text-slate-900 font-semibold scale-[1.02] pl-1'
                    : isCompleted
                    ? 'text-slate-400 font-medium'
                    : 'text-slate-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : isCurrent
                      ? 'bg-yatra-500 text-white shadow-glow'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                <span>{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

