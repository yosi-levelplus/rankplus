'use client';

import { useState, useMemo, useCallback } from 'react';

/* âââ Types âââ */
type Unit = 'km' | 'mi';
type GridSize = '3x3' | '5x5' | '7x7' | '9x9' | '11x11' | '13x13' | '15x15';
type Platform = 'google' | 'apple' | 'bing';
type Schedule = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

interface GridPoint {
  id: number;
  row: number;
  col: number;
  lat: number;
  lng: number;
  enabled: boolean;
  isCenter: boolean;
}

/* âââ Constants âââ */
const GRID_OPTIONS: { value: GridSize; label: string; size: number; desc: string; badge?: string }[] = [
  { value: '3x3', label: '3Ã3', size: 3, desc: 'Quick scan', badge: '' },
  { value: '5x5', label: '5Ã5', size: 5, desc: 'Standard', badge: 'Popular' },
  { value: '7x7', label: '7Ã7', size: 7, desc: 'Detailed', badge: '' },
  { value: '9x9', label: '9Ã9', size: 9, desc: 'Comprehensive', badge: '' },
  { value: '11x11', label: '11Ã11', size: 11, desc: 'Wide area', badge: '' },
  { value: '13x13', label: '13Ã13', size: 13, desc: 'Extended', badge: '' },
  { value: '15x15', label: '15Ã15', size: 15, desc: 'Maximum', badge: 'Pro' },
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

const DEMO_BUSINESSES = [
  { id: '1', name: 'Downtown Coffee House', address: '123 Main St, Austin, TX', placeId: 'ChIJ_abc1', lat: 30.2672, lng: -97.7431 },
  { id: '2', name: 'Riverside Auto Repair', address: '456 River Rd, Austin, TX', placeId: 'ChIJ_abc2', lat: 30.2500, lng: -97.7400 },
  { id: '3', name: 'Peak Fitness Studio', address: '789 Elm Ave, Austin, TX', placeId: 'ChIJ_abc3', lat: 30.2800, lng: -97.7500 },
  { id: '4', name: 'Golden Thai Kitchen', address: '321 Oak Blvd, Austin, TX', placeId: 'ChIJ_abc4', lat: 30.2650, lng: -97.7300 },
  { id: '5', name: 'BrightSmile Dental', address: '654 Pine St, Austin, TX', placeId: 'ChIJ_abc5', lat: 30.2730, lng: -97.7550 },
];

const CREDIT_PER_POINT = 1;
const USER_CREDITS = 2500; // Demo balance

/* âââ Helpers âââ */
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

/* âââ Components âââ */

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

function GridMapPreview({ points, gridSize, radiusKm, unit, onTogglePoint, businessName }: {
  points: GridPoint[]; gridSize: number; radiusKm: number; unit: Unit;
  onTogglePoint: (id: number) => void; businessName: string;
}) {
  const enabledCount = points.filter(p => p.enabled).length;
  const totalCount = points.length;

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl overflow-hidden">
      {/* Map Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-gray-300">Grid Preview</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{enabledCount}/{totalCount} points active</span>
          <span>{formatRadius(radiusKm, unit)} radius</span>
        </div>
      </div>

      {/* Simulated Map Area */}
      <div className="relative bg-gray-900/80" style={{ minHeight: '340px' }}>
        {/* Map Tile Background - simulated satellite/map look */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 30% 40%, rgba(34,85,34,0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, rgba(34,85,34,0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(30,60,90,0.2) 0%, transparent 70%),
              linear-gradient(180deg, rgba(40,40,40,0.5) 0%, rgba(20,20,20,0.8) 100%)
            `,
            backgroundSize: '100% 100%',
          }}
        />

        {/* Grid roads simulation */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(0deg, rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: `${100 / gridSize}% ${100 / gridSize}%`,
          }}
        />

        {/* Radius circle */}
        <div className="absolute inset-4 border-2 border-dashed border-blue-500/20 rounded-full" />
        <div className="absolute inset-8 border border-blue-500/10 rounded-full" />

        {/* Grid Points on Map */}
        <div className="absolute inset-0 p-6">
          <div className="relative w-full h-full" style={{ minHeight: '290px' }}>
            {points.map((point) => {
              const x = (point.col / (gridSize - 1)) * 100;
              const y = (point.row / (gridSize - 1)) * 100;
              return (
                <button
                  key={point.id}
                  onClick={() => !point.isCenter && onTogglePoint(point.id)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 group ${
                    point.isCenter ? 'cursor-default z-20' : 'cursor-pointer z-10 hover:z-30'
                  }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={point.isCenter ? `${businessName} (center)` : point.enabled ? 'Click to disable this scan point' : 'Click to enable this scan point'}
                >
                  {point.isCenter ? (
                    /* Center pin - business location */
                    <div className="relative">
                      <div className="absolute -inset-3 bg-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="absolute -inset-2 bg-blue-500/10 rounded-full" />
                      <div className="w-5 h-5 bg-blue-500 rounded-full ring-2 ring-white/90 shadow-lg shadow-blue-500/50 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ) : point.enabled ? (
                    /* Active scan point */
                    <div className="relative">
                      <div className={`w-4 h-4 rounded-full bg-emerald-500/90 ring-1 ring-emerald-400/50 shadow-md shadow-emerald-500/30 group-hover:ring-2 group-hover:ring-white/60 group-hover:scale-125 transition-all duration-150 flex items-center justify-center ${
                        gridSize <= 7 ? 'w-5 h-5' : gridSize <= 11 ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
                      }`}>
                        {gridSize <= 9 && (
                          <span className="text-[8px] font-bold text-white/90">{point.id + 1}</span>
                        )}
                      </div>
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-gray-900 text-[10px] text-gray-300 px-2 py-1 rounded-md whitespace-nowrap border border-gray-700">
                          Click to disable
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Disabled scan point */
                    <div className="relative">
                      <div className={`rounded-full bg-gray-600/40 ring-1 ring-gray-600/30 group-hover:ring-red-400/50 group-hover:bg-gray-500/50 transition-all duration-150 flex items-center justify-center ${
                        gridSize <= 7 ? 'w-5 h-5' : gridSize <= 11 ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
                      }`}>
                        {gridSize <= 9 && (
                          <svg className="w-2 h-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-gray-900 text-[10px] text-gray-300 px-2 py-1 rounded-md whitespace-nowrap border border-gray-700">
                          Click to enable
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-gray-900/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/50 text-[10px]">
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

        {/* Google Maps attribution placeholder */}
        <div className="absolute bottom-3 right-3 text-[9px] text-gray-600 bg-gray-900/70 px-2 py-1 rounded">
          Google Maps integration
        </div>
      </div>
    </div>
  );
}

/* âââ Main Page âââ */
export default function NewCampaignPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [platform, setPlatform] = useState<Platform>('google');
  const [grid, setGrid] = useState<GridSize>('5x5');
  const [radiusKm, setRadiusKm] = useState(8);
  const [unit, setUnit] = useState<Unit>('km');
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [schedule, setSchedule] = useState<Schedule>('weekly');
  const [gridPoints, setGridPoints] = useState<GridPoint[]>([]);

  const selectedBiz = DEMO_BUSINESSES.find(b => b.id === businessId);
  const selectedGrid = GRID_OPTIONS.find(g => g.value === grid)!;
  const selectedSchedule = SCHEDULE_OPTIONS.find(s => s.value === schedule)!;

  const gridSize = selectedGrid.size;
  const totalPoints = gridSize * gridSize;
  const enabledPoints = gridPoints.filter(p => p.enabled).length;
  const validKeywords = keywords.filter(k => k.trim()).length;
  const creditsPerScan = enabledPoints * CREDIT_PER_POINT * Math.max(validKeywords, 1);
  const monthlyCredits = creditsPerScan * selectedSchedule.scansPerMonth;

  // Generate grid points when grid size or business changes
  useMemo(() => {
    if (selectedBiz) {
      setGridPoints(generateGridPoints(selectedBiz.lat, selectedBiz.lng, gridSize, radiusKm));
    }
  }, [selectedBiz, gridSize, radiusKm]);

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

  const canProceed1 = name.trim() && businessId;
  const canProceed2 = enabledPoints > 0;
  const canProceed3 = validKeywords > 0;
  const canLaunch = creditsPerScan <= USER_CREDITS;

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

      {/* âââ Step 1: Business & Platform âââ */}
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Location</label>
                <select value={businessId} onChange={e => setBusinessId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all">
                  <option value="">Select a business...</option>
                  {DEMO_BUSINESSES.map(b => (
                    <option key={b.id} value={b.id}>{b.name} â {b.address}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Don&apos;t see your business? <a href="/dashboard/local-grid/businesses" className="text-blue-400 hover:text-blue-300">Add it first</a>
                </p>
              </div>
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
                    <div className={`w-8 h-8 rounded-lg ${platform === p.value ? 'bg-blue-500/20' : 'bg-gray-700/50'} flex item rounded-md whitespace-nowrap border border-gray-700">
                          Click to disable
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Disabled scan point */
                    <div className="relative">
                      <div className={`rounded-full bg-gray-600/40 ring-1 ring-gray-600/30 group-hover:ring-red-400/50 group-hover:bg-gray-500/50 transition-all duration-150 flex items-center justify-center ${
                        gridSize <= 7 ? 'w-5 h-5' : gridSize <= 11 ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
                      }`}>
                        {gridSize <= 9 && (
                          <svg className="w-2 h-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-gray-900 text-[10px] text-gray-300 px-2 py-1 rounded-md whitespace-nowrap border border-gray-700">
                          Click to enable
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-gray-900/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/50 text-[10px]">
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

        {/* Google Maps attribution placeholder */}
        <div className="absolute bottom-3 right-3 text-[9px] text-gray-600 bg-gray-900/70 px-2 py-1 rounded">
          Google Maps integration
        </div>
      </div>
    </div>
  );
}

/* âââ Main Page âââ */
export default function NewCampaignPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [platform, setPlatform] = useState<Platform>('google');
  const [grid, setGrid] = useState<GridSize>('5x5');
  const [radiusKm, setRadiusKm] = useState(8);
  const [unit, setUnit] = useState<Unit>('km');
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [schedule, setSchedule] = useState<Schedule>('weekly');
  const [gridPoints, setGridPoints] = useState<GridPoint[]>([]);

  const selectedBiz = DEMO_BUSINESSES.find(b => b.id === businessId);
  const selectedGrid = GRID_OPTIONS.find(g => g.value === grid)!;
  const selectedSchedule = SCHEDULE_OPTIONS.find(s => s.value === schedule)!;

  const gridSize = selectedGrid.size;
  const totalPoints = gridSize * gridSize;
  const enabledPoints = gridPoints.filter(p => p.enabled).length;
  const validKeywords = keywords.filter(k => k.trim()).length;
  const creditsPerScan = enabledPoints * CREDIT_PER_POINT * Math.max(validKeywords, 1);
  const monthlyCredits = creditsPerScan * selectedSchedule.scansPerMonth;

  // Generate grid points when grid size or business changes
  useMemo(() => {
    if (selectedBiz) {
      setGridPoints(generateGridPoints(selectedBiz.lat, selectedBiz.lng, gridSize, radiusKm));
    }
  }, [selectedBiz, gridSize, radiusKm]);

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

  const canProceed1 = name.trim() && businessId;
  const canProceed2 = enabledPoints > 0;
  const canProceed3 = validKeywords > 0;
  const canLaunch = creditsPerScan <= USER_CREDITS;

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
          <h1 className="3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Actions</h3>
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
                    <span className="text-gray-400">Ã {CREDIT_PER_POINT} credit per point</span>
                    <span className="text-white font-medium">{enabledPoints * CREDIT_PER_POINT}</span>
                  </div>
                  <div className="border-t border-gray-700/50 pt-1.5 flex justify-between">
                    <span className="text-gray-300 font-medium">Per scan (per keyword)</span>
                    <span className="text-blue-400 font-bold">{enabledPoints} credits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Map Preview */}
            <div className="lg:col-span-3">
              <GridMapPreview
                points={gridPoints}
                gridSize={gridSize}
                radiusKm={radiusKm}
                unit={unit}
                onTogglePoint={togglePoint}
                businessName={selectedBiz?.name || 'Business'}
              />
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

      {/* âââ Step 3: Keywords & Schedule âââ */}
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

      {/* âââ Step 4: Review & Launch âââ */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Summary */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white">Campaign Summary</h2>
              <div className="space-y-4">
                {[
                  { label: 'Campaign', value: name },
                  { label: 'Business', value: selectedBiz?.name || '' },
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

            {/* Credit Breakdown */}
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">Credit Breakdown</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{enabledPoints} points Ã {validKeywords} keywords Ã {CREDIT_PER_POINT} credit</span>
                    <span className="text-white font-medium">{creditsPerScan} credits</span>
                  </div>
                  {schedule !== 'once' && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{selectedSchedule.scansPerMonth}Ã per month</span>
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

              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
                <GridMapPreview
                  points={gridPoints}
                  gridSize={gridSize}
                  radiusKm={radiusKm}
                  unit={unit}
                  onTogglePoint={() => {}}
                  businessName={selectedBiz?.name || 'Business'}
                />
              </div>
            </div>
          </div>

          {/* Launch Actions */}
          <div className="flex justify-between items-center">
            <button onClick={() => setStep(3)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors">
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
            <div className="flex gap-3">
              <button className="px-6 py-3 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors">
                Save as Draft
              </button>
              <button disabled={!canLaunch}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Launch Campaign â {creditsPerScan} credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';

const demoBiz = [
  { id: 1, name: 'Downtown Coffee House', placeId: 'ChIJ_abc1' },
  { id: 2, name: 'Riverside Auto Repair', placeId: 'ChIJ_abc2' },
  { id: 3, name: 'Peak Fitness Studio', placeId: 'ChIJ_abc3' },
  { id: 4, name: 'Golden Thai Kitchen', placeId: 'ChIJ_abc4' },
  { id: 5, name: 'BrightSmile Dental', placeId: 'ChIJ_abc5' },
  { id: 6, name: 'Summit Legal Group', placeId: 'ChIJ_abc6' },
  { id: 7, name: 'Lakeside Pet Clinic', placeId: 'ChIJ_abc7' },
];

const gridOptions = [
  { value: '3x3', label: '3x3', points: 9, desc: 'Quick scan' },
  { value: '5x5', label: '5x5', points: 25, desc: 'Standard' },
  { value: '7x7', label: '7x7', points: 49, desc: 'Detailed' },
  { value: '9x9', label: '9x9', points: 81, desc: 'Comprehensive' },
];

const platforms = [
  { value: 'google', label: 'Google Maps', icon: 'G' },
  { value: 'bing', label: 'Bing Places', icon: 'B' },
  { value: 'apple', label: 'Apple Maps', icon: 'A' },
];

const scheduleOptions = [
  { value: 'once', label: 'One-time scan' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
];

export default function NewCampaignPage() {
  const [name, setName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [grid, setGrid] = useState('5x5');
  const [radius, setRadius] = useState(8);
  const [platform, setPlatform] = useState('google');
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [schedule, setSchedule] = useState('weekly');
  const [step, setStep] = useState(1);

  const selectedGrid = gridOptions.find(g => g.value === grid);
  const costPerScan = (selectedGrid?.points || 25) * keywords.filter(k => k.trim()).length * 0.02;

  const addKeyword = () => setKeywords([...keywords, '']);
  const removeKeyword = (i: number) => setKeywords(keywords.filter((_, idx) => idx !== i));
  const updateKeyword = (i: number, v: string) => {
    const copy = [...keywords];
    copy[i] = v;
    setKeywords(copy);
  };

  const validKeywords = keywords.filter(k => k.trim()).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <a href="/dashboard/local-grid" className="hover:text-white transition-colors">Local Grid</a>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white">New Campaign</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Create New Campaign</h1>
        <p className="text-gray-400 mt-1">Set up a local grid scan to track your rankings across the map</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'
            }`}>{s}</div>
            <span className={`text-sm ${step >= s ? 'text-white' : 'text-gray-500'}`}>
              {s === 1 ? 'Basics' : s === 2 ? 'Grid Setup' : 'Keywords & Schedule'}
            </span>
            {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-blue-600' : 'bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basics */}
      {step === 1 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Downtown Coffee - Main Keywords"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Business Location</label>
            <select value={businessId} onChange={e => setBusinessId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
              <option value="">Select a business...</option>
              {demoBiz.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.placeId})</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1.5">
              Don&apos;t see your business? <a href="/dashboard/local-grid/businesses" className="text-blue-400 hover:text-blue-300">Add it first</a>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
            <div className="flex gap-3">
              {platforms.map(p => (
                <button key={p.value} onClick={() => setPlatform(p.value)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    platform === p.value
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}>
                  <span className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-xs font-bold">{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => setStep(2)} disabled={!name || !businessId}
              className="px-6 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Next: Grid Setup
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Grid Configuration */}
      {step === 2 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Grid Size</label>
            <div className="grid grid-cols-4 gap-3">
              {gridOptions.map(g => (
                <button key={g.value} onClick={() => setGrid(g.value)}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    grid === g.value
                      ? 'bg-blue-600/10 border-blue-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}>
                  <div className={`text-lg font-bold ${grid === g.value ? 'text-blue-400' : 'text-white'}`}>{g.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{g.points} points</div>
                  <div className="text-xs text-gray-500">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Scan Radius: <span className="text-blue-400">{radius} km</span>
            </label>
            <input type="range" min={1} max={50} value={radius} onChange={e => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 km</span><span>25 km</span><span>50 km</span>
            </div>
          </div>
          {/* Grid Preview */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-3">Grid Preview</p>
            <div className="flex items-center justify-center">
              <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${parseInt(grid)}, 1fr)` }}>
                {Array.from({ length: selectedGrid?.points || 25 }).map((_, i) => {
                  const mid = Math.floor((selectedGrid?.points || 25) / 2);
                  return (
                    <div key={i} className={`w-4 h-4 rounded-sm ${i === mid ? 'bg-blue-500' : 'bg-gray-600'}`} />
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              {selectedGrid?.points} scan points over {radius} km radius
            </p>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white transition-colors">Back</button>
            <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 transition-colors">
              Next: Keywords
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Keywords & Schedule */}
      {step === 3 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Keywords</label>
            <p className="text-xs text-gray-500 mb-3">Add the search terms you want to track rankings for</p>
            <div className="space-y-2">
              {keywords.map((kw, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={kw} onChange={e => updateKeyword(i, e.target.value)}
                    placeholder={`Keyword ${i + 1}, e.g. "best coffee near me"`}
                    className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                  {keywords.length > 1 && (
                    <button onClick={() => removeKeyword(i)} className="px-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-800 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addKeyword} className="mt-2 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add another keyword
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Schedule</label>
            <div className="grid grid-cols-5 gap-2">
              {scheduleOptions.map(s => (
                <button key={s.value} onClick={() => setSchedule(s.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    schedule === s.value
                      ? 'bg-blue-600/10 border border-blue-500 text-blue-400'
                      : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cost Estimate */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Scan Cost Estimate</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Grid points</span>
                <span className="text-white">{selectedGrid?.points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Keywords</span>
                <span className="text-white">{validKeywords}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total queries per scan</span>
                <span className="text-white">{(selectedGrid?.points || 0) * validKeywords}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between">
                <span className="text-gray-300 font-medium">Cost per scan</span>
                <span className="text-blue-400 font-bold">${costPerScan.toFixed(2)}</span>
              </div>
              {schedule !== 'once' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. monthly cost</span>
                  <span className="text-white">
                    ${(costPerScan * (schedule === 'daily' ? 30 : schedule === 'weekly' ? 4 : schedule === 'biweekly' ? 2 : 1)).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white transition-colors">Back</button>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                Save as Draft
              </button>
              <button disabled={validKeywords === 0}
                className="px-6 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Create & Run First Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
