'use client';

// ==============================================================================
// YATRA AI - FLOATING MINIMAL NAVIGATION BAR
// Liquid glass effect, restrained branding, and responsive mobile tabs
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  MapPin,
  Bookmark,
  User,
  Sparkles,
  Route,
  Menu,
  X,
  Users,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Compass },
  { href: '/planner', label: 'Plan a Journey', icon: Route },
  { href: '/explore', label: 'Explore Along Route', icon: MapPin },
  { href: '/saved', label: 'My Journeys', icon: Bookmark },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/profile', label: 'Preferences', icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 inset-x-0 z-40 max-w-5xl mx-auto px-4 pointer-events-none">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-float rounded-3xl px-4 py-2.5 flex items-center justify-between pointer-events-auto">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-yatra-600 to-yatra-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-slate-900 text-sm">YATRA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-yatra-600 bg-yatra-50 px-1.5 py-0.2 rounded-md border border-yatra-200/50">
                AI
              </span>
            </div>
            <p className="text-[9px] text-slate-400 hidden sm:block -mt-0.5 tracking-tight font-medium">
              Turn every journey into an experience
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-soft'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Demo Indicator & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 border border-slate-200/70 text-slate-600 px-2.5 py-1 rounded-xl text-[10px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready for SerpApi + Gemini</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-3xl p-3 pointer-events-auto animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

