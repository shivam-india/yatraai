'use client';

// ==============================================================================
// YATRA AI - PREMIUM INTERACTIVE MAP (LEAFLET / POSITRON)
// Clean, minimal tile design (Apple Maps / Positron aesthetic)
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Coordinates, JourneyStop, Place, SmartDetour } from '@/types';
import { MapPin, Navigation, Compass, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  origin?: Coordinates;
  destination?: Coordinates;
  stops?: JourneyStop[];
  detours?: SmartDetour[];
  selectedStopId?: string | null;
  onSelectStop?: (stop: JourneyStop) => void;
  onSelectDetour?: (detour: SmartDetour) => void;
  interactive?: boolean;
  className?: string;
}

export default function InteractiveMap({
  origin = { lat: 30.3782, lng: 76.7767 }, // Ambala default
  destination = { lat: 30.7333, lng: 76.7794 }, // Chandigarh default
  stops = [],
  detours = [],
  selectedStopId,
  onSelectStop,
  onSelectDetour,
  className = '',
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const routeLayer = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'clean' | 'detailed'>('clean');

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapRef.current || leafletMap.current) return;
      const L = (await import('leaflet')).default;

      // Center midpoint
      const centerLat = (origin.lat + destination.lat) / 2;
      const centerLng = (origin.lng + destination.lng) / 2;

      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Positron Tiles (minimal, gorgeous, Apple-Maps like)
      const tileUrl =
        mapStyle === 'clean'
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      markersLayer.current = L.layerGroup().addTo(map);
      routeLayer.current = L.layerGroup().addTo(map);

      leafletMap.current = map;
      if (isMounted) setIsLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update Markers & Polylines when stops / detours change
  useEffect(() => {
    if (!leafletMap.current || !isLoaded) return;

    import('leaflet').then((LModule) => {
      const L = LModule.default;
      const map = leafletMap.current;

      markersLayer.current.clearLayers();
      routeLayer.current.clearLayers();

      const allCoords: [number, number][] = [];

      // Draw Main Route Line connecting the stops
      if (stops.length > 0) {
        stops.forEach((stop) => {
          allCoords.push([stop.coordinates.lat, stop.coordinates.lng]);
        });

        // Soft glow outer route polyline
        const glowLine = L.polyline(allCoords, {
          color: '#d97736',
          weight: 6,
          opacity: 0.25,
          lineCap: 'round',
          lineJoin: 'round',
        });
        routeLayer.current.addLayer(glowLine);

        // Core sharp route polyline
        const coreLine = L.polyline(allCoords, {
          color: '#cb5c26',
          weight: 3.5,
          opacity: 0.9,
          dashArray: '2, 6',
          lineCap: 'round',
          lineJoin: 'round',
        });
        routeLayer.current.addLayer(coreLine);
      }

      // 1. Plot Journey Stops
      stops.forEach((stop, index) => {
        const isSelected = selectedStopId === stop.id;
        const isOrigin = stop.stopType === 'origin';
        const isDest = stop.stopType === 'destination';
        const isDetour = stop.stopType === 'smart_detour' || stop.stopType === 'food_stop';

        const markerColor = isOrigin
          ? '#1e293b'
          : isDest
          ? '#059669'
          : isDetour
          ? '#d97736'
          : '#475569';

        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="
              width: ${isSelected ? '36px' : '28px'};
              height: ${isSelected ? '36px' : '28px'};
              background: ${markerColor};
              border: 3px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: ${isSelected ? '12px' : '10px'};
              font-weight: 700;
              transition: all 0.2s ease-in-out;
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            ">
              ${isOrigin ? 'A' : isDest ? 'B' : index + 1}
            </div>
          `,
          iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
          iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
        });

        const marker = L.marker([stop.coordinates.lat, stop.coordinates.lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1000 : 500,
        });

        marker.on('click', () => {
          if (onSelectStop) onSelectStop(stop);
        });

        // Popup tooltip
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 13px; padding: 2px;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${stop.title}</div>
            <div style="color: #64748b; font-size: 11px;">${stop.arrivalTime} • ${stop.dwellTimeMins > 0 ? `${stop.dwellTimeMins}m visit` : 'Transit stop'}</div>
          </div>
        `);

        markersLayer.current.addLayer(marker);
      });

      // 2. Plot Smart Detour Opportunities along route (Pulsating amber badges)
      detours.forEach((detour) => {
        const detourIcon = L.divIcon({
          className: 'detour-opportunity-pin',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background: #fbf0e8;
              border: 2px solid #d97736;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(217, 119, 54, 0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <span style="width: 8px; height: 8px; background: #d97736; border-radius: 50%;"></span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const detourMarker = L.marker([detour.place.coordinates.lat, detour.place.coordinates.lng], {
          icon: detourIcon,
          zIndexOffset: 300,
        });

        detourMarker.on('click', () => {
          if (onSelectDetour) onSelectDetour(detour);
        });

        detourMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 13px; max-width: 200px;">
            <div style="color: #cb5c26; font-size: 10px; font-weight: 700; text-transform: uppercase;">Smart Detour • Score ${detour.exploreValue}</div>
            <div style="font-weight: 700; color: #0f172a; margin: 2px 0;">${detour.place.name}</div>
            <div style="color: #64748b; font-size: 11px;">+${detour.detourTimeMins}m travel • ₹${detour.estimatedCost}</div>
          </div>
        `);

        markersLayer.current.addLayer(detourMarker);
      });

      // Fit map bounds smoothly
      if (allCoords.length >= 2) {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    });
  }, [stops, detours, selectedStopId, isLoaded]);

  // Focus on selected stop
  useEffect(() => {
    if (!leafletMap.current || !selectedStopId) return;
    const target = stops.find((s) => s.id === selectedStopId);
    if (target) {
      leafletMap.current.flyTo([target.coordinates.lat, target.coordinates.lng], 13, {
        duration: 0.8,
      });
    }
  }, [selectedStopId, stops]);

  const handleZoomIn = () => leafletMap.current?.zoomIn();
  const handleZoomOut = () => leafletMap.current?.zoomOut();
  const handleRecenter = () => {
    if (stops.length > 0 && leafletMap.current) {
      import('leaflet').then((L) => {
        const bounds = L.latLngBounds(stops.map((s) => [s.coordinates.lat, s.coordinates.lng]));
        leafletMap.current.fitBounds(bounds, { padding: [40, 40] });
      });
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[350px] overflow-hidden bg-slate-100 ${className}`}>
      {/* Map Canvas */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Floating Minimal Controls (Liquid Glass Effect) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-white/85 backdrop-blur-md border border-white/60 shadow-soft rounded-2xl p-1 flex flex-col">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-100/80 rounded-xl transition text-slate-700"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-[1px] bg-slate-200/60 my-0.5 mx-1" />
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-100/80 rounded-xl transition text-slate-700"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleRecenter}
          className="bg-white/85 backdrop-blur-md border border-white/60 shadow-soft rounded-2xl p-2.5 hover:bg-white text-slate-700 transition"
          title="Recenter corridor"
          aria-label="Recenter corridor"
        >
          <Navigation className="w-4 h-4 text-yatra-600" />
        </button>
      </div>

      {/* Floating Route Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md border border-white/60 shadow-soft rounded-2xl px-3 py-2 text-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          <span className="text-slate-600 font-medium">Origin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yatra-500" />
          <span className="text-slate-600 font-medium">Smart Detour</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span className="text-slate-600 font-medium">Destination</span>
        </div>
      </div>
    </div>
  );
}

