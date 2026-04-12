'use client';

import { useState } from 'react';

const demoBiz = [
  { id: 1, name: 'Downtown Coffee House', address: '123 Main St, Austin, TX', placeId: 'ChIJ_abc1', rating: 4.6, reviews: 312, status: 'active', campaigns: 3 },
  { id: 2, name: 'Riverside Auto Repair', address: '456 River Rd, Austin, TX', placeId: 'ChIJ_abc2', rating: 4.2, reviews: 187, status: 'active', campaigns: 2 },
  { id: 3, name: 'Peak Fitness Studio', address: '789 Elm Ave, Austin, TX', placeId: 'ChIJ_abc3', rating: 4.8, reviews: 524, status: 'active', campaigns: 4 },
  { id: 4, name: 'Golden Thai Kitchen', address: '321 Oak Blvd, Austin, TX', placeId: 'ChIJ_abc4', rating: 4.5, reviews: 203, status: 'active', campaigns: 1 },
  { id: 5, name: 'BrightSmile Dental', address: '654 Pine St, Austin, TX', placeId: 'ChIJ_abc5', rating: 4.9, reviews: 89, status: 'paused', campaigns: 0 },
  { id: 6, name: 'Summit Legal Group', address: '987 Cedar Ln, Austin, TX', placeId: 'ChIJ_abc6', rating: 4.3, reviews: 42, status: 'active', campaigns: 2 },
  { id: 7, name: 'Lakeside Pet Clinic', address: '147 Lake Dr, Austin, TX', placeId: 'ChIJ_abc7', rating: 4.7, reviews: 156, status: 'active', campaigns: 1 },
];

const countries = [
  { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' }, { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'IL', name: 'Israel' }, { code: 'ES', name: 'Spain' },
];

type SearchMode = 'name' | 'placeId' | 'url';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-yellow-400 text-sm">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'fill-current' : 'fill-gray-600'}`} viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
      <span className="text-gray-400 ml-1">{rating}</span>
    </span>
  );
}

export default function BusinessesPage() {
  const [search, setSearch] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('name');
  const [country, setCountry] = useState('US');
  const [businesses, _setBiz] = useState(demoBiz);
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', address: '', placeId: '', phone: '', website: '', category: '' });

  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.address.toLowerCase().includes(search.toLowerCase())
  );

  const placeholders: Record<SearchMode, string> = {
    name: 'Search by business name...',
    placeId: 'Enter Google Place ID (e.g. ChIJ...)',
    url: 'Paste Google Maps URL...',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Locations</h1>
          <p className="text-gray-400 mt-1">Manage your business locations for Local Grid tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Import from GBP
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Business
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex bg-gray-800 rounded-lg p-0.5">
            {(['name', 'placeId', 'url'] as SearchMode[]).map(mode => (
              <button key={mode} onClick={() => setSearchMode(mode)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${searchMode === mode ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'}`}>
                {mode === 'name' ? 'Business Name' : mode === 'placeId' ? 'Place ID' : 'Place URL'}
              </button>
            ))}
          </div>
          <select value={country} onChange={e => setCountry(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500">
            {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={placeholders[searchMode]}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          </div>
          <button className="px-5 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Locations', value: businesses.length, icon: 'ð' },
          { label: 'Active', value: businesses.filter(b => b.status === 'active').length, icon: 'â' },
          { label: 'Total Campaigns', value: businesses.reduce((s, b) => s + b.campaigns, 0), icon: 'ð' },
          { label: 'Avg Rating', value: (businesses.reduce((s, b) => s + b.rating, 0) / businesses.length).toFixed(1), icon: 'â­' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{stat.label}</span>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Map Placeholder */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg">
          <div className="text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-sm font-medium">Map View</p>
            <p className="text-xs mt-1">Google Maps integration coming soon</p>
          </div>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Business</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Place ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reviews</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Campaigns</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map(biz => (
              <tr key={biz.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-white font-medium">{biz.name}</p>
                  <p className="text-gray-500 text-sm">{biz.address}</p>
                </td>
                <td className="px-5 py-4 text-gray-400 text-sm font-mono">{biz.placeId}</td>
                <td className="px-5 py-4"><StarRating rating={biz.rating} /></td>
                <td className="px-5 py-4 text-center text-gray-300">{biz.reviews}</td>
                <td className="px-5 py-4 text-center text-gray-300">{biz.campaigns}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${biz.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {biz.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="View on Map">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors" title="Remove">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No businesses found</p>
            <p className="text-sm mt-1">Try adjusting your search or add a new business</p>
          </div>
        )}
      </div>

      {/* Add Business Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Add Business Manually</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Business Name', placeholder: 'e.g. Downtown Coffee House' },
                { key: 'address', label: 'Address', placeholder: 'Full street address' },
                { key: 'placeId', label: 'Google Place ID (optional)', placeholder: 'ChIJ...' },
                { key: 'phone', label: 'Phone (optional)', placeholder: '+1 (555) 123-4567' },
                { key: 'website', label: 'Website (optional)', placeholder: 'https://example.com' },
                { key: 'category', label: 'Category', placeholder: 'e.g. Restaurant, Dentist, Auto Repair' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{field.label}</label>
                  <input type="text" placeholder={field.placeholder}
                    value={manualForm[field.key as keyof typeof manualForm]}
                    onChange={e => setManualForm({ ...manualForm, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button className="px-5 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 transition-colors">Add Business</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
