'use client';

// ==============================================================================
// YATRA AI - COMMUNITY LAYER & LOCAL BUSINESS REGISTRY
// Crowdsourced discoveries, local artisans, family dhabas, with moderation status
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { CommunitySubmission, PlaceCategory } from '@/types';
import { dbService } from '@/lib/supabase/db';
import {
  Users,
  Plus,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export default function CommunityPage() {
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Form state
  const [placeName, setPlaceName] = useState('');
  const [city, setCity] = useState('Ambala');
  const [category, setCategory] = useState<PlaceCategory>('food');
  const [description, setDescription] = useState('');
  const [whySpecial, setWhySpecial] = useState('');

  useEffect(() => {
    async function load() {
      const data = await dbService.getCommunitySubmissions();
      setSubmissions(data);
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName.trim() || !description.trim()) return;

    const newSub = await dbService.submitCommunityPlace({
      placeName,
      city,
      category,
      coordinates: { lat: 30.38, lng: 76.78 },
      description,
      whySpecial,
    });

    setSubmissions((prev) => [newSub, ...prev]);
    setIsSubmittedSuccess(true);
    setPlaceName('');
    setDescription('');
    setWhySpecial('');

    setTimeout(() => {
      setIsSubmittedSuccess(false);
      setIsModalOpen(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-yatra-50/40 text-slate-800 pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-yatra-700 bg-yatra-100 px-2.5 py-0.5 rounded-md mb-2">
            <Users className="w-3.5 h-3.5" />
            Verified Community Network
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Community Discoveries
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Recommend hidden artisans, 50-year-old dhabas, and overlooked heritage gems along travel corridors
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-soft flex items-center gap-1.5 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Submit a Local Gem</span>
        </button>
      </div>

      {/* Submissions Feed */}
      <div className="space-y-4">
        {submissions.map((sub) => {
          const isApproved = sub.status === 'approved';

          return (
            <div
              key={sub.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-soft hover:shadow-float transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {sub.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-yatra-600" />
                      {sub.city}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {sub.placeName}
                  </h3>
                </div>

                {/* Moderation Status Badge */}
                <div className="flex items-center gap-1">
                  {isApproved ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Community Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Pending Moderation
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {sub.description}
              </p>

              {sub.whySpecial && (
                <div className="bg-yatra-50/70 border border-yatra-200/60 rounded-xl p-3 text-xs text-yatra-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-yatra-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[11px] uppercase tracking-wide text-yatra-800">
                      Why this place is special
                    </span>
                    <span>{sub.whySpecial}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-float border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Submit a Local Corridor Gem
                </h3>
                <p className="text-xs text-slate-500">
                  Submissions are reviewed by our team to protect factual integrity
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubmittedSuccess ? (
              <div className="py-8 text-center text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-100">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <h4 className="text-sm font-bold">Submission Received!</h4>
                <p className="text-xs text-emerald-600 mt-1">
                  Thank you for keeping local discoveries authentic.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Place or Artisan Name
                  </label>
                  <input
                    type="text"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    required
                    placeholder="e.g. Dera Bassi Terracotta Kilns"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-yatra-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      City / Corridor
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="e.g. Ambala"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-yatra-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as PlaceCategory)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-yatra-500 outline-none"
                    >
                      <option value="food">Local Food / Dhaba</option>
                      <option value="historical">Historical Landmark</option>
                      <option value="artisan">Artisan / Handloom</option>
                      <option value="culture">Cultural Venue</option>
                      <option value="nature">Nature / Lake</option>
                      <option value="market">Traditional Market</option>
                      <option value="hidden_gem">Hidden Gem</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Description & Location
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={2}
                    placeholder="Where is it situated along the transit route and what will visitors experience?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:border-yatra-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Why is this place special?
                  </label>
                  <input
                    type="text"
                    value={whySpecial}
                    onChange={(e) => setWhySpecial(e.target.value)}
                    placeholder="e.g. 4th generation sweetmakers using woodfire clay ovens"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-yatra-500 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-yatra-500 hover:bg-yatra-600 text-white px-5 py-2 text-xs font-semibold rounded-xl shadow-soft transition active:scale-95"
                  >
                    Submit for Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

