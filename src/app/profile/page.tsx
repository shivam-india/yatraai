'use client';

// ==============================================================================
// YATRA AI - USER PREFERENCES & TRAVEL STYLE PROFILE
// Personalization engine tuning recommendations to walking tolerance, diet & transit
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { UserPreference, TransportType } from '@/types';
import { dbService, defaultPreferences } from '@/lib/supabase/db';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  User,
  Settings,
  Sparkles,
  Footprints,
  ShieldCheck,
  Check,
  Save,
  Bus,
  Train,
  Heart,
  Utensils,
  LogOut,
} from 'lucide-react';

export default function ProfilePage() {
  const [prefs, setPrefs] = useState<UserPreference>(defaultPreferences);
  const [isSaved, setIsSaved] = useState(false);
  const [supabaseActive, setSupabaseActive] = useState(false);

  useEffect(() => {
    async function load() {
      const stored = await dbService.getUserPreferences();
      setPrefs(stored);
      setSupabaseActive(isSupabaseConfigured());
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.updateUserPreferences(prefs);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const toggleInterest = (interest: string) => {
    setPrefs((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleTransport = (mode: TransportType) => {
    setPrefs((prev) => ({
      ...prev,
      preferredTransport: prev.preferredTransport.includes(mode)
        ? prev.preferredTransport.filter((m) => m !== mode)
        : [...prev.preferredTransport, mode],
    }));
  };

  return (
    <div className="min-h-screen bg-yatra-50/40 text-slate-800 pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-yatra-700 bg-yatra-100 px-2.5 py-0.5 rounded-md mb-2">
            <User className="w-3.5 h-3.5" />
            Traveler Preferences
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Your Travel Profile
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Yatra customizes every detour, walk recommendation, and dhaba stop to your personal habits
          </p>
        </div>

        {/* Account Status Pill */}
        <div className="self-start sm:self-auto bg-white border border-slate-200/80 shadow-soft px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">
            {supabaseActive ? 'Supabase Connected' : 'Guest Explorer (Local Sync)'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Core Interests */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            What do you love exploring?
          </h3>
          <p className="text-xs text-slate-500">
            Smart Detour uses these to compute your personalized Explore Value scores
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'history', label: 'History & Heritage' },
              { id: 'food', label: 'Local Food & Dhabas' },
              { id: 'culture', label: 'Art & Architecture' },
              { id: 'nature', label: 'Gardens & Sanctuaries' },
              { id: 'market', label: 'Old City Bazaars' },
              { id: 'artisan', label: 'Handicraft Guilds' },
            ].map((item) => {
              const active = prefs.interests.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleInterest(item.id)}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition ${
                    active
                      ? 'border-yatra-500 bg-yatra-50 text-yatra-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && <Check className="w-3.5 h-3.5 text-yatra-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Walking Tolerance & Transit Preferences */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Footprints className="w-4 h-4 text-yatra-600" />
            Transit Modes & Walking Tolerance
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Maximum comfortable walking duration from transit stop
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 30].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setPrefs({ ...prefs, walkingToleranceMins: mins })}
                  className={`py-2 px-3 rounded-2xl border text-xs font-semibold transition ${
                    prefs.walkingToleranceMins === mins
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Preferred transit connections
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'bus', label: 'Intercity Bus', icon: Bus },
                { id: 'train', label: 'Express Train', icon: Train },
                { id: 'metro', label: 'Metro', icon: Train },
                { id: 'auto', label: 'Local Auto / E-Rickshaw', icon: Bus },
              ].map((mode) => {
                const active = prefs.preferredTransport.includes(mode.id as TransportType);
                const Icon = mode.icon;
                return (
                  <button
                    type="button"
                    key={mode.id}
                    onClick={() => toggleTransport(mode.id as TransportType)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition ${
                      active
                        ? 'bg-yatra-500 text-white border-yatra-500 shadow-soft'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Dietary & Budget */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600" />
            Dietary & Comfort
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Food preference
              </label>
              <select
                value={prefs.dietaryPreferences[0] || 'vegetarian_friendly'}
                onChange={(e) => setPrefs({ ...prefs, dietaryPreferences: [e.target.value] })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="vegetarian_friendly">Vegetarian Friendly (Standard)</option>
                <option value="pure_veg">Strict Pure Vegetarian (No Onion/Garlic option)</option>
                <option value="regional_specialist">Regional Specialties (Tandoori, Biryani, Mutton Curry)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Budget Tier
              </label>
              <select
                value={prefs.budgetLevel}
                onChange={(e) => setPrefs({ ...prefs, budgetLevel: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="budget">Budget Explorer (Under ₹500)</option>
                <option value="moderate">Moderate / Standard (₹500 - ₹1,500)</option>
                <option value="comfort">Comfort & Heritage (₹1,500+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {isSaved ? 'Preferences saved successfully!' : 'Settings persist in your active browser session'}
          </span>

          <button
            type="submit"
            className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-soft hover:shadow-glow transition flex items-center gap-2 active:scale-95"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}

