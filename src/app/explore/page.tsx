'use client';

// ==============================================================================
// YATRA AI - EXPLORE ALONG ROUTE
// Discover attractions, heritage, dhabas, markets & artisan workshops
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Place,
  PlaceCategory,
} from '@/types';
import {
  Search,
  Filter,
  Star,
  Clock,
  Navigation,
  MapPin,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { serpApiMapsService } from '@/services/serpapi/maps';

const CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'food', label: 'Food & Dhabas', icon: '🍛' },
  { id: 'historical', label: 'History & Forts', icon: '🏛️' },
  { id: 'culture', label: 'Culture & Art', icon: '🎨' },
  { id: 'nature', label: 'Nature & Lakes', icon: '🌿' },
  { id: 'market', label: 'Bazaars & Crafts', icon: '🛍️' },
  { id: 'artisan', label: 'Artisans & Guilds', icon: '🏺' },
  { id: 'hidden_gem', label: 'Hidden Gems', icon: '💎' },
];

export default function ExplorePage() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch places
  useEffect(() => {
    async function fetchPlaces() {
      setIsLoading(true);
      try {
        const catParam = selectedCategory !== 'all' ? selectedCategory : '';
        const url = `/api/places/search?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(catParam)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          setPlaces(json.data);
        }
      } catch (err) {
        console.error('Failed to load places:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchPlaces, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const filteredPlaces = places.filter((p) => {
    if (cityFilter !== 'All' && !p.city.toLowerCase().includes(cityFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-yatra-50/30 text-slate-800 pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Page Title & Search Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-yatra-700 bg-yatra-100/70 px-2.5 py-0.5 rounded-md mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Corridor Discovery Engine
            </div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Explore Along My Route
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Curated dhabas, artisan communities, and centuries of heritage near Indian transit corridors
            </p>
          </div>

          {/* City Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['All', 'Ambala', 'Chandigarh', 'Delhi', 'Jaipur'].map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                  cityFilter === city
                    ? 'bg-slate-900 text-white shadow-soft'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by monument name, dish (e.g. Dal Makhani, Phulkari), or neighborhood..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-soft focus:outline-none focus:border-yatra-400 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-yatra-500 text-white shadow-soft'
                  : 'bg-white border border-slate-200/80 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Places */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200/60 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium">No places found matching your filter.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setCityFilter('All');
            }}
            className="mt-3 text-xs text-yatra-600 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="group bg-white border border-slate-200/80 hover:border-yatra-300 rounded-3xl overflow-hidden shadow-soft hover:shadow-float transition-all flex flex-col justify-between"
            >
              {/* Photo Header */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                {place.photos && place.photos.length > 0 ? (
                  <img
                    src={place.photos[0]}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <MapPin className="w-8 h-8" />
                  </div>
                )}

                {/* Badges Overlay */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-slate-800 shadow-sm">
                    {place.category}
                  </span>

                  <span className="text-xs font-bold bg-slate-950/80 backdrop-blur-md text-white px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{place.rating}</span>
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
                    <MapPin className="w-3 h-3 text-yatra-600" />
                    <span>{place.city}, {place.state || 'India'}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-yatra-700 transition leading-snug">
                    {place.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {place.description}
                  </p>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {place.typicalVisitMins}m visit
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={serpApiMapsService.getGoogleMapsPlaceUrl(place.serpapiPlaceId, place.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => {
                        sessionStorage.setItem(
                          'yatra_plan_prompt',
                          `Plan a journey to ${place.name} in ${place.city} with ₹800 and 5 hours.`
                        );
                        router.push('/planner');
                      }}
                      className="bg-slate-900 hover:bg-yatra-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      Plan to Stop Here
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

