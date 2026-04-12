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
