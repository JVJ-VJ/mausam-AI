import React from 'react';
import type { SeverityLevel, EventType, AlertSortOption } from '../../types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface AlertFilterBarProps {
  selectedSeverity: SeverityLevel | 'all' | 'resolved';
  onSelectSeverity: (severity: SeverityLevel | 'all' | 'resolved') => void;
  selectedEventType: EventType | 'all';
  onSelectEventType: (eventType: EventType | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: AlertSortOption;
  onSortChange: (sort: AlertSortOption) => void;
  totalAlertsCount: number;
  filteredCount: number;
  className?: string;
}

export const AlertFilterBar: React.FC<AlertFilterBarProps> = ({
  selectedSeverity,
  onSelectSeverity,
  selectedEventType,
  onSelectEventType,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalAlertsCount,
  filteredCount,
  className = '',
}) => {
  const severityTabs: Array<{ id: SeverityLevel | 'all' | 'resolved'; label: string }> = [
    { id: 'all', label: 'All Advisories' },
    { id: 'critical', label: 'Critical' },
    { id: 'high', label: 'High' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'informational', label: 'Informational' },
    { id: 'resolved', label: 'Resolved' },
  ];

  const eventTypes: Array<{ id: EventType | 'all'; label: string }> = [
    { id: 'all', label: 'All Event Types' },
    { id: 'cyclone', label: 'Cyclone' },
    { id: 'flood', label: 'Flood' },
    { id: 'heavy_rainfall', label: 'Heavy Rain' },
    { id: 'heatwave', label: 'Heatwave' },
    { id: 'thunderstorm', label: 'Thunderstorm' },
    { id: 'landslide', label: 'Landslide' },
    { id: 'coldwave', label: 'Coldwave' },
    { id: 'high_wind', label: 'High Wind' },
    { id: 'drought', label: 'Drought' },
  ];

  return (
    <div className={`p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-card-soft space-y-3 ${className}`}>
      {/* Top Search & Sort Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search advisory title, region, keyword, or alert ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-colors"
          />
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as AlertSortOption)}
            aria-label="Sort Advisories By"
            className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-sky-700 font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-colors"
          >
            <option value="severity">Severity (Critical First)</option>
            <option value="newest">Newest Issued</option>
            <option value="oldest">Oldest Issued</option>
            <option value="credibility">Highest Confidence</option>
            <option value="reports">Most Supporting Sources</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs & Dropdowns Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
          {severityTabs.map((tab) => {
            const isSelected = selectedSeverity === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectSeverity(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap ${
                  isSelected
                    ? tab.id === 'critical'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold shadow-sm'
                      : 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100/70 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Event Type selector & count */}
        <div className="flex items-center gap-3 ml-auto font-mono text-[11px]">
          <select
            value={selectedEventType}
            onChange={(e) => onSelectEventType(e.target.value as EventType | 'all')}
            aria-label="Filter by Event Category"
            className="py-1 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-sky-500"
          >
            {eventTypes.map((et) => (
              <option key={et.id} value={et.id}>
                {et.label}
              </option>
            ))}
          </select>

          <span className="text-slate-500">
            Showing <strong className="text-slate-800">{filteredCount}</strong> of {totalAlertsCount}
          </span>
        </div>
      </div>
    </div>
  );
};
