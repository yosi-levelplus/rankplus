// @ts-nocheck
// 'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */
type Unit = 'km' | 'mi';
type GridSize = '3x3' | '5x5' | '7x7' | '9x9' | '11x11' | '13x13' | '15x15';
type Platform = 'google' | 'apple' | 'bing';
type Schedule = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
type ScanStatus = 'idle' | 'running' | 'completed' | 'error';

interface GridPoint {
  id: number;
  row: number;
  col: number;
  lat: number;
  lng: number;
  enabled: boolean;
  isCenter: boolean;
}

interface Business {
  id?: string;
  place_id: string;
  title: string;
  name?: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  review_count?: number;
  category?: string;
  latitude: number;
  longitude: number;
  lat?: number;
  lng?: number;
  cid?: string;
}

interface ScanResult {
  scan_id: string;
  keyword: string;
  average_rank: number | null;
  total_points: number;
  ranked_points: number;
  points: Array<{
    grid_row: number;
    grid_col: number;
    lat: number;
    lng: number;
    rank: number | null;
    found_business_name: string | null;
  }>;
}

/* ─── Constants ─── */
const GRID_OPTIONS: { value: GridSize; label: string; size: number; desc: string; badge?: string }[] = [
  { value: '3x3', label: '3×3', size: 3, desc: 'Quick scan', badge: '' },
  { value: '5x5', label: '5×5', size: 5, desc: 'Standard', badge: 'Popular' },
  { value: '7x7', label: '7×7', size: 7, desc: 'Detailed', badge: '' },
  { value: '9x9', label: '9×9', size: 9, desc: 'Comprehensive', badge: '' },
  { value: '11x11', label: '11×11', size: 11, desc: 'Wide area', badge: '' },
  { value: '13x13', label: '13×13', size: 13, desc: 'Extended', badge: '' },
  { value: '15x15', label: '15×15', size: 15, desc: 'Maximum', badge: 'Pro' },
];

const PLATFORMS: { value: Platform; label: string; icon: string; color: string }[] = [
  { value: 'google', label: 'Google Maps', icon: 'G', color: 'text-blue-400' },
  { value: 'apple', label: 'Apple Maps', icon: '', color: 'text-gray-300' },
  { value: 'bing', label: 'Bing Places', icon: 'B', color: 'text-cyan-400' },
];

const SCHEDULE_OPTIONS: { value: Schedule; label: string; scansPerMonth: number }[] = [
  { value: 'once', label: 'One-time', scansPerMonth: 1 },
  { value: 'daily', label: 'Daily', scansPerMonth: 30 },
  { value: 'weekly', label: 'Weekly', scansPerMonth: 4 },
  { value: 'biweekly', label: 'Bi-weekly', scansPerMonth: 2 },
  { value: 'monthly', label: 'Monthly', scansPerMonth: 1 },
];

const CREDIT_PER_POINT = 1;
const USER_CREDITS = 2500;

const SUPABASE_URL = 'https://oroesrdswvolpmsfxoar.supabase.co';

/* ─── Helpers ─── */
function toMiles(km: number) { return km * 0.621371; }
function toKm(mi: number) { return mi / 0.621371; }
function formatRadius(val: number, unit: Unit) {
  return unit === 'km' ? `${val.toFixed(1)} km` : `${toMiles(val).toFixed(1)} mi`;
}

function generateGridPoints(centerLat: number, centerLng: number, gridSize: number, radiusKm: number): GridPoint[] {
  const points: GridPoint[] = [];
  const latOffset = radiusKm / 111.32;
  const lngOffset = radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180));
  const half = Math.floor(gridSize / 2);
  let id = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const lat = centerLat + latOffset * (half - r) / half;
      const lng = centerLng + lngOffset * (c - half) / half;
      const isCenter = r === half && c === half;
      points.push({ id: id++, row: r, col: c, lat, lng, enabled: true, isCenter });
    }
  }
  return points;
}

function getRankColor(rank: number | null): string {
  if (rank === null) return '#6b7280'; // gray - not found
  if (rank <= 3) return '#22c55e'; // green - top 3
  if (rank <= 5) return '#84cc16'; // lime - top 5
  if (rank <= 10) return '#eab308'; // yellow - top 10
  if (rank <= 15) return '#f97316'; // orange
  return '#ef4444'; // red - 15+
}

/* ─── Components ─── */

function StepIndicator({ step, total }: { step: number; total: number }) {
  const labels = ['Business & Platform', 'Grid Configuration', 'Keywords & Schedule', 'Review & Launch'];
  return (
    <div className="flex items-center gap-1 mb-8">
      {labels.slice(0, total).map((label, i) => {
        const s = i + 1;
        const active = step === s;
        const done = step > s;
        return (
          <div key={s} className="flex items-center flex-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all duration-300 ${
                done ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/30' :
                active ? 'bg-blue-600 text-white ring-2 ring-blue-400/40 shadow-lg shadow-blue-500/20' :
                'bg-gray-800/80 text-gray-500 ring-1 ring-gray-700'
              }`}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : s}
              </div>
              <span className={`text-xs font-medium truncate hidden lg:block ${active ? 'text-white' : done ? 'text-green-400/80' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
            {s < total && (
              <div className={`flex-1 h-px mx-3 transition-colors duration-300 ${done ? 'bg-green-500/40' : 'bg-gray-700/60'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CreditBadge({ used, total }: { used: number; total: number }) {
  const pct = Math.min((used / total) * 100, 100);
  const color = pct > 80 ? 'text-red-400' : pct > 50 ? 'text-yellow-400' : 'text-green-400';
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.38 5.38 0 01-.491-.521h.755a1 1 0 000-2H7.938a7.35 7.35 0 010-1H10a1 1 0 100-2h-.755c.13-.183.308-.364.491-.521z" />
        </svg>
        <span className={`text-sm font-bold ${color}`}>{(total - used).toLocaleString()}</span>
        <span className="text-xs text-gray-500">credits left</span>
      </div>
      <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${100 - pct}%` }} />
      </div>
    </div>
  );
}

/* ─── Business Search Component ─── */
function BusinessSearch({ onSelect, selectedBusiness }: { onSelect: (biz: Business) => void; selectedBusiness: Business | null }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const supabase = createClient();

  const searchBusinesses = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setShowResults(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/search-business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ query: query.trim(), location: location.trim() || undefined, limit: 10 }),
      });
      const data = await res.json();
      if (data.businesses) {
        setResults(data.businesses);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300 mb-2">Search Business on Google Maps</label>
      <div className="flex gap-2">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchBusinesses()}
          placeholder="Business name (e.g. Joe's Pizza)"
          className="flex-1 px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
        <input type="text" value={location} onChange={e => setLocation(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchBusinesses()}
          placeholder="City or location"
          className="w-48 px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
        <button onClick={searchBusinesses} disabled={loading || !query.trim()}
          className="px-5 py-3 bg-blue-600 rounded-xl text-white font-medium hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          )}
          Search
        </button>
      </div>

      {/* Selected Business Display */}
      {selectedBusiness && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{selectedBusiness.title || selectedBusiness.name}</p>
            <p className="text-sm text-gray-400 truncate">{selectedBusiness.address}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {selectedBusiness.rating && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {selectedBusiness.rating} ({selectedBusiness.review_count})
                </span>
              )}
              {selectedBusiness.category && <span>{selectedBusiness.category}</span>}
              <span>{selectedBusiness.latitude.toFixed(4)}, {selectedBusiness.longitude.toFixed(4)}</span>
            </div>
          </div>
          <button onClick={() => onSelect(null as any)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Search Results */}
      {showResults && !selectedBusiness && (
        <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <svg className="w-6 h-6 animate-spin mx-auto text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-gray-400 mt-2">Searching Google Maps...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No businesses found. Try a different search term.
            </div>
          ) : (
            results.map((biz, i) => (
              <button key={i} onClick={() => { onSelect(biz); setShowResults(false); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-800/60 transition-colors border-b border-gray-800/50 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold text-gray-400">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">{biz.title}</p>
                    <p className="text-xs text-gray-500 truncate">{biz.address}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-600">
                      {biz.rating && (
                        <span className="flex items-center gap-0.5">
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          {biz.rating}
                        </span>
                      )}
                      {biz.category && <span>{biz.category}</span>}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Real Map Component (Leaflet/OpenStreetMap) ─── */
function RealMapPreview({ points, gridSize, radiusKm, unit, onTogglePoint, businessName, centerLat, centerLng }: {
  points: GridPoint[]; gridSize: number; radiusKm: number; unit: Unit;
  onTogglePoint: (id: number) => void; businessName: string;
  centerLat: number; centerLng: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const enabledCount = points.filter(p => p.enabled).length;
  const totalCount = points.length;

  useEffect(() => {
    if (!mapRef.current || !centerLat || !centerLng) return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).L) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then(() => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Destroy existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add radius circle
      const radiusMeters = radiusKm * 1000;
      L.circle([centerLat, centerLng], {
        radius: radiusMeters,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.05,
        weight: 2,
        dashArray: '8, 4',
      }).addTo(map);

      // Fit bounds to show the entire grid
      const latOffset = radiusKm / 111.32;
      const lngOffset = radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180));
      map.fitBounds([
        [centerLat - latOffset * 1.15, centerLng - lngOffset * 1.15],
        [centerLat + latOffset * 1.15, centerLng + lngOffset * 1.15],
      ]);

      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Add grid point markers
      points.forEach((point) => {
        const size = point.isCenter ? 14 : (gridSize <= 7 ? 12 : gridSize <= 11 ? 10 : 8);
        const color = point.isCenter ? '#3b82f6' : point.enabled ? '#22c55e' : '#4b5563';
        const borderColor = point.isCenter ? '#ffffff' : point.enabled ? '#86efac' : '#6b7280';
        const zIndex = point.isCenter ? 1000 : point.enabled ? 500 : 100;

        const icon = L.divIcon({
          className: 'custom-grid-marker',
          html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid ${borderColor};border-radius:50%;cursor:${point.isCenter ? 'default' : 'pointer'};box-shadow:0 2px 4px rgba(0,0,0,0.3);transition:transform 0.15s;z-index:${zIndex};" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'">${point.isCenter ? '<div style="position:absolute;inset:-6px;border:2px solid rgba(59,130,246,0.3);border-radius:50%;animation:ping 2s infinite;"></div>' : ''}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([point.lat, point.lng], { icon, zIndexOffset: zIndex })
          .addTo(map);

        if (!point.isCenter) {
          marker.on('click', () => onTogglePoint(point.id));
          marker.bindTooltip(
            point.enabled ? `Point ${point.id + 1} — Click to disable` : `Point ${point.id + 1} — Click to enable`,
            { direction: 'top', offset: [0, -8] }
          );
        } else {
          marker.bindTooltip(`${businessName} (center)`, { direction: 'top', offset: [0, -10], permanent: false });
        }

        markersRef.current.push(marker);
      });

      mapInstanceRef.current = map;

      // Force a resize after render
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLng, points, gridSize, radiusKm, businessName, onTogglePoint]);

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-gray-300">Live Map Preview</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{enabledCount}/{totalCount} points active</span>
          <span>{formatRadius(radiusKm, unit)} radius</span>
        </div>
      </div>
      <div ref={mapRef} style={{ height: '400px', width: '100%', background: '#1a1a2e' }} />
      <div className="flex items-center gap-4 px-4 py-2.5 bg-gray-900/60 border-t border-gray-700/50 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ring-1 ring-white/60" />
          <span className="text-gray-400">Business</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          <span className="text-gray-400">Active point</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-gray-600/60 rounded-full" />
          <span className="text-gray-400">Disabled</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Scan Results Heatmap ─── */
function ScanResultsView({ scanResults, gridSize }: { scanResults: ScanResult[]; gridSize: number }) {
  if (!scanResults.length) return null;

  return (
    <div className="space-y-6">
      {scanResults.map((result, idx) => (
        <div key={idx} className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">&ldquo;{result.keyword}&rdquo;</h3>
              <p className="text-xs text-gray-500 mt-1">
                Found in {result.ranked_points}/{result.total_points} grid points
                {result.average_rank !== null && ` — Average rank: ${result.average_rank.toFixed(1)}`}
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
              result.average_rank !== null && result.average_rank <= 3 ? 'bg-green-500/20 text-green-400' :
              result.average_rank !== null && result.average_rank <= 10 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {result.average_rank !== null ? `#${result.average_rank.toFixed(1)}` : 'N/A'}
            </div>
          </div>

          {/* Grid Heatmap */}
          <div className="flex justify-center">
            <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
              {result.points
                .sort((a, b) => a.grid_row * gridSize + a.grid_col - (b.grid_row * gridSize + b.grid_col))
                .map((point, i) => {
                  const color = getRankColor(point.rank);
                  const isCenter = point.grid_row === Math.floor(gridSize / 2) && point.grid_col === Math.floor(gridSize / 2);
                  return (
                    <div key={i} className={`flex items-center justify-center rounded-md transition-all hover:scale-110 ${
                      isCenter ? 'ring-2 ring-blue-400' : ''
                    }`}
                    style={{
                      width: gridSize <= 7 ? 44 : gridSize <= 9 ? 36 : gridSize <= 11 ? 28 : 22,
                      height: gridSize <= 7 ? 44 : gridSize <= 9 ? 36 : gridSize <= 11 ? 28 : 22,
                      backgroundColor: color + '30',
                      border: `1px solid ${color}60`,
                    }}
                    title={point.rank !== null ? `Rank #${point.rank}${point.found_business_name ? ` — ${point.found_business_name}` : ''}` : 'Not found in top 20'}>
                      <span className="font-bold" style={{
                        color,
                        fontSize: gridSize <= 7 ? 14 : gridSize <= 9 ? 12 : 10,
                      }}>
                        {point.rank !== null ? point.rank : '–'}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Rank Legend */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: '#22c55e30', border: '1px solid #22c55e60' }} /><span>1-3</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: '#84cc1630', border: '1px solid #84cc1660' }} /><span>4-5</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: '#eab30830', border: '1px solid #eab30860' }} /><span>6-10</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: '#f9731630', border: '1px solid #f9731660' }} /><span>11-15</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: '#ef444430', border: '1px solid #ef444460' }} /><span>16+</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: '#6b728030', border: '1px solid #6b728060' }} /><span>Not found</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ─── */
export default function NewCampaignPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [platform, setPlatform] = useState<Platform>('google');
  const [grid, setGrid] = useState<GridSize>('5x5');
  const [radiusKm, setRadiusKm] = useState(8);
  const [unit, setUnit] = useState<Unit>('km');
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [schedule, setSchedule] = useState<Schedule>('weekly');
  const [gridPoints, setGridPoints] = useState<GridPoint[]>([]);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [scanError, setScanError] = useState('');
  const [scanProgress, setScanProgress] = useState('');

  const supabase = createClient();

  const selectedGrid = GRID_OPTIONS.find(g => g.value === grid)!;
  const selectedSchedule = SCHEDULE_OPTIONS.find(s => s.value === schedule)!;

  const gridSize = selectedGrid.size;
  const totalPoints = gridSize * gridSize;
  const enabledPoints = gridPoints.filter(p => p.enabled).length;
  const validKeywords = keywords.filter(k => k.trim()).length;
  const creditsPerScan = enabledPoints * CREDIT_PER_POINT * Math.max(validKeywords, 1);
  const monthlyCredits = creditsPerScan * selectedSchedule.scansPerMonth;

  const bizLat = selectedBusiness?.latitude || selectedBusiness?.lat || 0;
  const bizLng = selectedBusiness?.longitude || selectedBusiness?.lng || 0;

  // Generate grid points when grid size or business changes
  useMemo(() => {
    if (bizLat && bizLng) {
      setGridPoints(generateGridPoints(bizLat, bizLng, gridSize, radiusKm));
    }
  }, [bizLat, bizLng, gridSize, radiusKm]);

  const togglePoint = useCallback((id: number) => {
    setGridPoints(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  }, []);

  const enableAllPoints = () => setGridPoints(prev => prev.map(p => ({ ...p, enabled: true })));
  const disableEdgePoints = () => {
    setGridPoints(prev => prev.map(p => {
      if (p.isCenter) return p;
      const isEdge = p.row === 0 || p.row === gridSize - 1 || p.col === 0 || p.col === gridSize - 1;
      return { ...p, enabled: !isEdge };
    }));
  };

  const addKeyword = () => setKeywords(prev => [...prev, '']);
  const removeKeyword = (i: number) => setKeywords(prev => prev.filter((_, idx) => idx !== i));
  const updateKeyword = (i: number, v: string) => {
    setKeywords(prev => { const c = [...prev]; c[i] = v; return c; });
  };

  const radiusDisplay = unit === 'km' ? radiusKm : parseFloat(toMiles(radiusKm).toFixed(1));
  const radiusMax = unit === 'km' ? 100 : 62;
  const radiusMin = unit === 'km' ? 0.5 : 0.3;
  const setRadiusFromDisplay = (v: number) => {
    setRadiusKm(unit === 'km' ? v : toKm(v));
  };

  const canProceed1 = name.trim() && selectedBusiness;
  const canProceed2 = enabledPoints > 0;
  const canProceed3 = validKeywords > 0;
  const canLaunch = creditsPerScan <= USER_CREDITS;

  /* ─── Launch Campaign ─── */
  const launchCampaign = async () => {
    if (!selectedBusiness || !canLaunch) return;

    setScanStatus('running');
    setScanError('');
    setScanProgress('Creating campaign...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const userId = session?.user?.id || '';
      const bizName = selectedBusiness.title || selectedBusiness.name || '';
      const placeId = selectedBusiness.place_id || selectedBusiness.cid || '';
      const radiusMiles = toMiles(radiusKm);
      const validKws = keywords.filter(k => k.trim());

      // 0. Get user's organization
      setScanProgress('Loading organization...');
      const { data: membership } = await supabase
        .from('organization_members')
        .select('org_id')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (!membership) throw new Error('No organization found. Please join an organization first.');
      const orgId = (membership as any).org_id;

      // 0b. Find or create client for this business
      setScanProgress('Setting up business client...');
      let clientId: string;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('org_id', orgId)
        .eq('business_name', bizName)
        .limit(1)
        .single();

      if (existingClient) {
        clientId = (existingClient as any).id;
      } else {
        const { data: newClient, error: clientErr } = await supabase
          .from('clients')
          .insert({
            org_id: orgId,
            business_name: bizName,
            website_url: selectedBusiness.website || '',
            google_place_id: placeId || null,
            business_address: selectedBusiness.address || null,
            business_lat: bizLat || null,
            business_lng: bizLng || null,
          })
          .select()
          .single();
        if (clientErr) throw new Error(`Client creation failed: ${clientErr.message}`);
        clientId = (newClient as any).id;
      }

      // 1. Create campaign in DB
      setScanProgress('Saving campaign to database...');
      const { data: campaign, error: campaignErr } = await supabase
        .from('campaigns')
        .insert({
          org_id: orgId,
          client_id: clientId,
          name,
          grid_size: gridSize,
          radius_miles: radiusMiles,
          scan_frequency: schedule === 'once' ? 'manual' : schedule,
          status: 'active',
        })
        .select()
        .single();

      if (campaignErr) throw new Error(`Campaign creation failed: ${campaignErr.message}`);

      // 2. Add keywords
      setScanProgress('Adding keywords...');
      if (validKws.length > 0) {
        await supabase.from('campaign_keywords').insert(
          validKws.map(kw => ({ campaign_id: campaign.id, keyword: kw.trim() }))
        );
      }

      // 3. Run the scan via edge function
      setScanProgress(`Running scan... 0/${enabledPoints * validKws.length} API calls`);

      const res = await fetch(`${SUPABASE_URL}/functions/v1/run-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaign_id: campaign.id,
          business_name: bizName,
          place_id: placeId,
          center_lat: bizLat,
          center_lng: bizLng,
          radius_miles: radiusMiles,
          grid_size: gridSize,
          keywords: validKws,
        }),
      });

      const scanData = await res.json();

      if (scanData.error) throw new Error(scanData.error);

      setScanResults(scanData.scans || []);
      setScanStatus('completed');
      setScanProgress('Scan completed!');

      // Update campaign with next_run_at
      if (schedule !== 'once') {
        const nextRun = new Date();
        if (schedule === 'daily') nextRun.setDate(nextRun.getDate() + 1);
        else if (schedule === 'weekly') nextRun.setDate(nextRun.getDate() + 7);
        else if (schedule === 'biweekly') nextRun.setDate(nextRun.getDate() + 14);
        else if (schedule === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1);

        await supabase.from('campaigns').update({ next_run_at: nextRun.toISOString() }).eq('id', campaign.id);
      }

    } catch (err: any) {
      console.error('Launch error:', err);
      setScanError(err.message || 'Something went wrong');
      setScanStatus('error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/dashboard/local-grid" className="hover:text-white transition-colors">Local Grid</a>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-300">New Campaign</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Campaign</h1>
          <p className="text-gray-400 text-sm mt-1">Configure your local grid scan to track map rankings</p>
        </div>
        <CreditBadge used={0} total={USER_CREDITS} />
      </div>

      <StepIndicator step={step} total={4} />

      {/* ═══ Step 1: Business & Platform ═══ */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white">Campaign Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Downtown Coffee - Main Keywords"
                  className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
              </div>
              <BusinessSearch
                onSelect={setSelectedBusiness}
                selectedBusiness={selectedBusiness}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white">Search Platform</h2>
              <div className="grid grid-cols-1 gap-3">
                {PLATFORMS.map(p => (
                  <button key={p.value} onClick={() => setPlatform(p.value)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                      platform === p.value
                        ? 'bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/20'
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                    }`}>
                    <div className={`w-8 h-8 rounded-lg ${platform === p.value ? 'bg-blue-500/20' : 'bg-gray-700/50'} flex items-center justify-center`}>
                      {p.icon === '' ? (
                        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                      ) : (
                        <span className={`text-sm font-bold ${p.color}`}>{p.icon}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <div className={`text-sm font-medium ${platform === p.value ? 'text-white' : 'text-gray-300'}`}>{p.label}</div>
                    </div>
                    {platform === p.value && (
                      <svg className="w-5 h-5 text-blue-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mini Map Preview when business is selected */}
            {selectedBusiness && bizLat && bizLng && (
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-2">Business Location Preview</p>
                <div className="rounded-xl overflow-hidden" style={{ height: '180px' }}>
                  <iframe
                    width="100%"
                    height="180"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${bizLng - 0.01},${bizLat - 0.008},${bizLng + 0.01},${bizLat + 0.008}&layer=mapnik&marker=${bizLat},${bizLng}`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <button onClick={() => { if (canProceed1) setStep(2); }} disabled={!canProceed1}
              className="px-8 py-3 bg-blue-600 rounded-xl text-white font-medium hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
              Continue to Grid Setup
              <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ═══ Step 2: Grid Configuration ═══ */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Controls */}
            <div className="lg:col-span-2 space-y-5">
              {/* Grid Size */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Grid Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {GRID_OPTIONS.map(g => (
                    <button key={g.value} onClick={() => setGrid(g.value)}
                      className={`relative p-2.5 rounded-xl border text-center transition-all duration-200 ${
                        grid === g.value
                          ? 'bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/20'
                          : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                      }`}>
                      {g.badge && (
                        <span className={`absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          g.badge === 'Popular' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                        }`}>{g.badge}</span>
                      )}
                      <div className={`text-sm font-bold ${grid === g.value ? 'text-blue-400' : 'text-white'}`}>{g.label}</div>
                      <div className="text-[10px] text-gray-500">{g.size * g.size} pts</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius + Units */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Scan Radius</h3>
                  <div className="flex bg-gray-800 rounded-lg p-0.5">
                    <button onClick={() => setUnit('km')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${unit === 'km' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>KM</button>
                    <button onClick={() => setUnit('mi')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${unit === 'mi' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Miles</button>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-3xl font-bold text-blue-400">{radiusDisplay}</span>
                    <span className="text-sm text-gray-500">{unit === 'km' ? 'kilometers' : 'miles'}</span>
                  </div>
                  <input type="range" min={radiusMin} max={radiusMax} step={0.1} value={radiusDisplay}
                    onChange={e => setRadiusFromDisplay(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                    <span>{radiusMin} {unit}</span>
                    <span className="text-gray-500">Recommended: {unit === 'km' ? '3-15 km' : '2-10 mi'}</span>
                    <span>{radiusMax} {unit}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={enableAllPoints}
                    className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Enable All Points
                  </button>
                  <button onClick={disableEdgePoints}
                    className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Disable Edge Points
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">Click any point on the map to toggle it. Disabled points won&apos;t be scanned and won&apos;t use credits.</p>
              </div>

              {/* Credits Summary */}
              <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-semibold text-white">Credit Cost</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active scan points</span>
                    <span className="text-white font-medium">{enabledPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">&times; {CREDIT_PER_POINT} credit per point</span>
                    <span className="text-white font-medium">{enabledPoints * CREDIT_PER_POINT}</span>
                  </div>
                  <div className="border-t border-gray-700/50 pt-1.5 flex justify-between">
                    <span className="text-gray-300 font-medium">Per scan (per keyword)</span>
                    <span className="text-blue-400 font-bold">{enabledPoints} credits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Real Map Preview */}
            <div className="lg:col-span-3">
              {bizLat && bizLng ? (
                <RealMapPreview
                  points={gridPoints}
                  gridSize={gridSize}
                  radiusKm={radiusKm}
                  unit={unit}
                  onTogglePoint={togglePoint}
                  businessName={selectedBusiness?.title || selectedBusiness?.name || 'Business'}
                  centerLat={bizLat}
                  centerLng={bizLng}
                />
              ) : (
                <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl flex items-center justify-center" style={{ height: '450px' }}>
                  <p className="text-gray-500">Select a business to see map preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors">
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
            <button onClick={() => { if (canProceed2) setStep(3); }} disabled={!canProceed2}
              className="px-8 py-3 bg-blue-600 rounded-xl text-white font-medium hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20">
              Continue to Keywords
              <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ═══ Step 3: Keywords & Schedule ═══ */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Keywords */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Keywords</h2>
                <p className="text-xs text-gray-500 mt-1">Add the search terms you want to track. Each keyword multiplies the credit cost per scan.</p>
              </div>
              <div className="space-y-2.5">
                {keywords.map((kw, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="flex items-center justify-center w-8 h-10 text-xs font-medium text-gray-500">{i + 1}.</div>
                    <input type="text" value={kw} onChange={e => updateKeyword(i, e.target.value)}
                      placeholder={i === 0 ? 'e.g. best coffee near me' : i === 1 ? 'e.g. coffee shop downtown' : `Keyword ${i + 1}`}
                      className="flex-1 px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
                    {keywords.length > 1 && (
                      <button onClick={() => removeKeyword(i)} className="px-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addKeyword} className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add keyword
              </button>
            </div>

            {/* Schedule */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Scan Schedule</h2>
              <div className="grid grid-cols-5 gap-2">
                {SCHEDULE_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => setSchedule(s.value)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      schedule === s.value
                        ? 'bg-blue-500/10 border border-blue-500/50 text-blue-400 ring-1 ring-blue-500/20'
                        : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:border-gray-600'
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Summary Sidebar */}
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 sticky top-6">
              <h3 className="text-lg font-semibold text-white">Cost Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Grid points</span>
                  <span className="text-white">{enabledPoints} active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Keywords</span>
                  <span className="text-white">{validKeywords}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Queries per scan</span>
                  <span className="text-white">{enabledPoints * Math.max(validKeywords, 1)}</span>
                </div>
                <div className="border-t border-gray-700/50 pt-3 flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Credits per scan</span>
                  <span className="text-xl font-bold text-blue-400">{creditsPerScan}</span>
                </div>
                {schedule !== 'once' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Est. monthly</span>
                    <span className="text-white font-medium">{monthlyCredits.toLocaleString()} credits</span>
                  </div>
                )}
              </div>

              {!canLaunch && creditsPerScan > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-xs text-red-400">Not enough credits. You need {creditsPerScan} but have {USER_CREDITS}.</p>
                </div>
              )}

              <div className="pt-2">
                <CreditBadge used={creditsPerScan} total={USER_CREDITS} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex justify-between">
            <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors">
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
            <button onClick={() => { if (canProceed3) setStep(4); }} disabled={!canProceed3}
              className="px-8 py-3 bg-blue-600 rounded-xl text-white font-medium hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20">
              Review Campaign
              <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ═══ Step 4: Review & Launch ═══ */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Scan Running / Results */}
          {scanStatus === 'running' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-8 text-center space-y-4">
              <svg className="w-10 h-10 animate-spin mx-auto text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-white">Scan in Progress</h3>
                <p className="text-sm text-blue-300 mt-1">{scanProgress}</p>
                <p className="text-xs text-gray-500 mt-2">This may take a few minutes depending on grid size and keywords...</p>
              </div>
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-400 font-medium">Scan Error</p>
                  <p className="text-sm text-red-300/80 mt-1">{scanError}</p>
                  <button onClick={launchCampaign} className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300 hover:bg-red-500/30 transition-colors">
                    Retry Scan
                  </button>
                </div>
              </div>
            </div>
          )}

          {scanStatus === 'completed' && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-400">Scan Complete!</h3>
                  <p className="text-sm text-gray-400">{scanResults.length} keyword(s) scanned across {gridSize * gridSize} grid points</p>
                </div>
              </div>
              <ScanResultsView scanResults={scanResults} gridSize={gridSize} />
            </div>
          )}

          {/* Review Panel (show when idle or completed) */}
          {(scanStatus === 'idle' || scanStatus === 'completed') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Summary */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-lg font-semibold text-white">Campaign Summary</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Campaign', value: name },
                    { label: 'Business', value: selectedBusiness?.title || selectedBusiness?.name || '' },
                    { label: 'Platform', value: PLATFORMS.find(p => p.value === platform)?.label || '' },
                    { label: 'Grid', value: `${selectedGrid.label} (${enabledPoints} active points)` },
                    { label: 'Radius', value: formatRadius(radiusKm, unit) },
                    { label: 'Schedule', value: selectedSchedule.label },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-800/50 last:border-0">
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <span className="text-sm text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <span className="text-sm text-gray-400">Keywords</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keywords.filter(k => k.trim()).map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-300">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Credit Breakdown + Map */}
              <div className="space-y-5">
                <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-white">Credit Breakdown</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{enabledPoints} points &times; {validKeywords} keywords &times; {CREDIT_PER_POINT} credit</span>
                      <span className="text-white font-medium">{creditsPerScan} credits</span>
                    </div>
                    {schedule !== 'once' && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedSchedule.scansPerMonth}&times; per month</span>
                        <span className="text-white font-medium">{monthlyCredits.toLocaleString()} credits/mo</span>
                      </div>
                    )}
                    <div className="border-t border-gray-700/50 pt-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-gray-300 font-medium">First scan cost</span>
                        <span className="text-2xl font-bold text-blue-400">{creditsPerScan}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-500 text-xs">Balance after scan</span>
                        <span className="text-gray-400 text-xs">{(USER_CREDITS - creditsPerScan).toLocaleString()} credits remaining</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Preview */}
                {bizLat && bizLng && (
                  <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden">
                    <RealMapPreview
                      points={gridPoints}
                      gridSize={gridSize}
                      radiusKm={radiusKm}
                      unit={unit}
                      onTogglePoint={() => {}}
                      businessName={selectedBusiness?.title || selectedBusiness?.name || 'Business'}
                      centerLat={bizLat}
                      centerLng={bizLng}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Launch Actions */}
          <div className="flex justify-between items-center">
            <button onClick={() => setStep(3)} disabled={scanStatus === 'running'}
              className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors disabled:opacity-40">
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
            <div className="flex gap-3">
              {scanStatus === 'idle' && (
                <>
                  <button className="px-6 py-3 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors">
                    Save as Draft
                  </button>
                  <button onClick={launchCampaign} disabled={!canLaunch}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Launch Campaign — {creditsPerScan} credits
                  </button>
                </>
              )}
              {scanStatus === 'completed' && (
                <a href="/dashboard/local-grid"
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white font-semibold hover:from-green-500 hover:to-green-400 transition-all shadow-lg shadow-green-500/25">
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  View All Campaigns
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
