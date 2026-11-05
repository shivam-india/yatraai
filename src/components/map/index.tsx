'use client';

// ==============================================================================
// YATRA AI - MAP COMPONENT EXPORT (SSR SAFE)
// ==============================================================================

import dynamic from 'next/dynamic';
import React from 'react';

const DynamicMap = dynamic(() => import('./MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2">
      <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-yatra-500 animate-spin" />
      <span className="text-xs font-medium tracking-wide">Rendering Map Canvas...</span>
    </div>
  ),
});

export default DynamicMap;

