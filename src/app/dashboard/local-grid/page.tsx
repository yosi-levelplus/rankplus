'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  MapPin,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Play,
  Pencil,
  Copy,
  Trash2,
  Grid3X3,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'

// Demo data - will be replaced with real DB queries
const demoCampaigns = [
  {
    id: '1',
    name: 'Ducts All Done',
    gridSize: 5,
    radius: 9.0,
    platforms: ['google', 'apple'],
    locations: 1,
    keywords: 4,
    scans: 4,
    arp: { value: 6.51, change: 1.09, direction: 'up' as const },
    atrp: { value: 8.63, change: 1.17, direction: 'down' as const },
    solv: { value: 11.00, change: 13, direction: 'down' as const },
    lastRun: '4/12/2026, 10:35 AM',
    nextRun: '4/19/2026, 10:35 AM',
    status: 'Scheduled' as const,
  },
  {
    id: '2',
    name: 'On Time Elite',
    gridSize: 9,
    radius: 6.0,
    platforms: ['google', 'apple'],
    locations: 1,
    keywords: 6,
    scans: 6,
    arp: { value: 3.31, change: null, direction: 'neutral' as const },
    atrp: { value: 7.20, change: null, direction: 'neutral' as const },
    solv: { value: 4.57, change: null, direction: 'neutral' as const },
    lastRun: '4/12/2026, 8:41 AM',
    nextRun: '4/19/2026, 8:41 AM',
    status: 'Scheduled' as const,
  },
  {
    id: '3',
    name: 'Nuna Harvest',
    gridSize: 9,
    radius: 7.0,
    platforms: ['google', 'apple'],
    locations: 1,
    keywords: 13,
    scans: 13,
    arp: { value: 11.99, change: 0.15, direction: 'up' as const },
    atrp: { value: 15.65, change: 0.05, direction: 'down' as const },
    solv: { value: 9.78, change: 0.1, direction: 'down' as const },
    lastRun: '4/12/2026, 7:33 AM',
    nextRun: '4/19/2026, 7:33 AM',
    status: 'Scheduled' as const,
  },
  {
    id: '4',
    name: 'My Flooring Expert',
    gridSize: 7,
    radius: 5.0,
    platforms: ['google', 'apple'],
    locations: 1,
    keywords: 14,
    scans: 14,
    arp: { value: 7.68, change: 0.25, direction: 'down' as const },
    atrp: { value: 8.82, change: 0.17, direction: 'down' as const },
    solv: { value: 26.51, change: 2.19, direction: 'down' as const },
    lastRun: '4/12/2026, 5:02 AM',
    nextRun: '4/19/2026, 5:02 AM',
    status: 'Scheduled' as const,
  },
  {
    id: '5',
    name: 'OverHead Roofing Inc',
    gridSize: 9,
    radius: 6.0,
    platforms: ['google', 'apple'],
    locations: 2,
    keywords: 13,
    scans: 19,
    arp: { value: 9.32, change: 0.06, direction: 'up' as const },
    atrp: { value: 13.12, change: 0.22, direction: 'down' as const },
    solv: { value: 14.82, change: 7.15, direction: 'down' as const },
    lastRun: '4/12/2026, 4:50 AM',
    nextRun: '4/19/2026, 4:50 AM',
    status: 'Scheduled' as const,
  },
  {
    id: '6',
    name: 'Security Screen Doors',
    gridSize: 7,
    radius: 11.0,
    platforms: ['google', 'apple'],
    locations: 1,
    keywords: 5,
    scans: 5,
    arp: { value: 1.81, change: 0.03, direction: 'down' as const },
    atrp: { value: 1.81, change: 0.09, direction: 'down' as const },
    solv: { value: 74.29, change: null, direction: 'neutral' as const },
    lastRun: '4/12/2026, 3:31 AM',
    nextRun: '4/19/2026, 3:31 AM',
    status: 'Scheduled' as const,
  },
]

function MetricBadge({ value, change, direction }: { value: number; change: number | null; direction: 'up' | 'down' | 'neutral' }) {
  const getBgColor = (val: number) => {
    if (val <= 3) return 'bg-emerald-500'
    if (val <= 7) return 'bg-yellow-500'
    if (val <= 13) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`${getBgColor(value)} text-white text-xs font-semibold px-2.5 py-1 rounded`}>
        {value.toFixed(2)}
      </span>
      {change !== null && (
        <span className={`text-[10px] flex items-center gap-0.5 ${direction === 'up' ? 'text-emerald-400' : direction === 'down' ? 'text-red-400' : 'text-gray-500'}`}>
          {direction === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : direction === 'down' ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
          {change}
        </span>
      )}
      {change === null && <span className="text-[10px] text-gray-600">--</span>}
    </div>
  )
}

export default function LocalGridPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filteredCampaigns = demoCampaigns.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <Link
            href="/dashboard/local-grid/campaigns/new"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Campaign
          </Link>
        </div>
        <Link
          href="/dashboard/local-grid/businesses"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Manage Businesses
        </Link>
      </div>

      <p className="text-gray-400 mb-1">
        Group locations and keywords for a unified view of local ranking. Track everything in one place!
      </p>
      <p className="text-gray-500 text-sm mb-6">
        Need help creating a Campaign? Try this <span className="text-indigo-400 underline cursor-pointer">guided tour</span>.
      </p>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">Show:</span>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-gray-400 text-sm">Per Page</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{filteredCampaigns.length} Records</span>
          <div className="flex gap-1">
            <button className="bg-red-500/20 text-red-400 p-1.5 rounded" disabled><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button className="bg-red-500/20 text-red-400 p-1.5 rounded" disabled><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="text-gray-300 text-sm px-2 py-1">1 of 1</span>
            <button className="bg-red-500/20 text-red-400 p-1.5 rounded" disabled><ChevronRight className="w-3.5 h-3.5" /></button>
            <button className="bg-red-500/20 text-red-400 p-1.5 rounded" disabled><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-300 text-sm border border-gray-700 rounded px-3 py-1.5">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3">
                <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
              </th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">NAME</th>
              <th className="text-center px-3 py-3 text-gray-400 font-medium text-sm">ARP</th>
              <th className="text-center px-3 py-3 text-gray-400 font-medium text-sm">ATRP</th>
              <th className="text-center px-3 py-3 text-gray-400 font-medium text-sm">SOLV / SAIV</th>
              <th className="text-center px-3 py-3 text-gray-400 font-medium text-sm">LAST RUN</th>
              <th className="text-center px-3 py-3 text-gray-400 font-medium text-sm">NEXT RUN</th>
              <th className="text-center px-3 py-3 text-gray-400 font-medium text-sm">STATUS</th>
              <th className="text-center px-3 py-3 text-gray-400 font-medium text-sm"></th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-4">
                  <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                </td>
                <td className="px-4 py-4">
                  <Link href={`/dashboard/local-grid/campaigns/${campaign.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm underline">
                    {campaign.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
                    <span className="flex items-center gap-1">
                      <Grid3X3 className="w-3 h-3" />
                      {campaign.gridSize} x {campaign.gridSize} grid
                    </span>
                    <span>{campaign.radius}mi radius</span>
                    <span className="flex gap-1">
                      {campaign.platforms.includes('google') && <span className="text-blue-400">G</span>}
                      {campaign.platforms.includes('apple') && <span className="text-gray-300">ð</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="bg-gray-800 text-gray-400 text-[11px] px-2 py-0.5 rounded-full border border-gray-700">
                      {campaign.locations} location{campaign.locations > 1 ? 's' : ''}
                    </span>
                    <span className="bg-gray-800 text-gray-400 text-[11px] px-2 py-0.5 rounded-full border border-gray-700">
                      {campaign.keywords} keywords
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[11px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {campaign.scans} scans
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4 text-center">
                  <MetricBadge {...campaign.arp} />
                </td>
                <td className="px-3 py-4 text-center">
                  <MetricBadge {...campaign.atrp} />
                </td>
                <td className="px-3 py-4 text-center">
                  <MetricBadge {...campaign.solv} />
                </td>
                <td className="px-3 py-4 text-center text-gray-400 text-xs">{campaign.lastRun}</td>
                <td className="px-3 py-4 text-center text-gray-400 text-xs">{campaign.nextRun}</td>
                <td className="px-3 py-4 text-center">
                  <span className="text-indigo-400 text-xs">{campaign.status}</span>
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-1">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded transition-colors" title="Run Scan">
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded transition-colors" title="Duplicate">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded transition-colors" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-16">
          <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-gray-400 text-lg font-medium mb-2">No campaigns yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first campaign to start tracking local rankings</p>
          <Link
            href="/dashboard/local-grid/campaigns/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Campaign
          </Link>
        </div>
      )}
    </div>
  )
}
