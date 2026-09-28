import React, { useState, useMemo } from 'react';
import type { WeatherEvent, EventType } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';

interface EventExplorerProps {
  events: WeatherEvent[];
  selectedEventId?: string | null;
  onSelectEvent: (eventId: string) => void;
}

export const EventExplorer: React.FC<EventExplorerProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(query);
        const matchState = evt.location.state.toLowerCase().includes(query);
        const matchRegion = evt.location.region.toLowerCase().includes(query);
        if (!matchTitle && !matchState && !matchRegion) return false;
      }

      // Severity
      if (severityFilter !== 'all' && evt.severity !== severityFilter) {
        return false;
      }

      // Type
      if (typeFilter !== 'all' && evt.type !== typeFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'all' && evt.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [events, searchTerm, severityFilter, typeFilter, statusFilter]);

  const uniqueTypes = useMemo(() => {
    const set = new Set<EventType>();
    events.forEach((e) => set.add(e.type));
    return Array.from(set);
  }, [events]);

  return (
    <GlassCard glow="cyan" className="space-y-4 shadow-atmospheric">
      <GlassCardHeader>
        <GlassCardTitle
          icon={<SlidersHorizontal className="w-4 h-4 text-sky-600" />}
          subtitle="Explore, filter and inspect simulated national weather events"
        >
          National Weather Event Explorer ({filteredEvents.length}/{events.length})
        </GlassCardTitle>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700">
          FILTER ACTIVE
        </span>
      </GlassCardHeader>

      {/* Filter Controls Row */}
      <div className="space-y-3 pt-1">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by state, region, event name (e.g. Mandi, Cyclone, Vidarbha)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Severity selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-lg">
            <span className="text-[10px] font-mono font-semibold text-slate-500 px-1 uppercase">Severity:</span>
            {['all', 'critical', 'high', 'moderate'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {sev.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Type selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-lg overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono font-semibold text-slate-500 px-1 uppercase">Type:</span>
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              ALL
            </button>
            {uniqueTypes.slice(0, 5).map((t: EventType) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  typeFilter === t
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {t.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-lg">
            <span className="text-[10px] font-mono font-semibold text-slate-500 px-1 uppercase">Status:</span>
            {['all', 'active', 'escalating', 'monitoring'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event Cards Grid */}
      <GlassCardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredEvents.map((event: WeatherEvent) => {
            const isSelected = selectedEventId === event.id;
            return (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <SeverityBadge severity={event.severity} />
                  <span className="text-[10px] font-mono font-semibold text-slate-500">
                    {event.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
                  {event.title}
                </h3>

                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-600">
                  <span className="flex items-center gap-1 truncate font-medium">
                    <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">{event.location.state}</span>
                  </span>

                  <span className="text-sky-700 font-bold shrink-0">
                    {event.confidence}% Conf &bull; {event.sourceCount} Rpts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};
