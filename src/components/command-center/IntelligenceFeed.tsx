import React, { useState } from 'react';
import type { WeatherEvent, WeatherReport, WeatherAlert } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { SeverityBadge } from '../ui/SeverityBadge';
import { 
  Radio, 
  Clock, 
  MapPin, 
  ExternalLink,
  Wind,
  CloudRain,
  Sun,
  Waves,
  CloudLightning,
  Mountain,
  Snowflake,
  AlertTriangle
} from 'lucide-react';

const getFeedItemIcon = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('cyclone') || lower.includes('wind') || lower.includes('squall')) return Wind;
  if (lower.includes('rain') || lower.includes('monsoon') || lower.includes('shower')) return CloudRain;
  if (lower.includes('heat') || lower.includes('temperature') || lower.includes('dry')) return Sun;
  if (lower.includes('flood') || lower.includes('water') || lower.includes('inundat')) return Waves;
  if (lower.includes('thunder') || lower.includes('lightning') || lower.includes('storm')) return CloudLightning;
  if (lower.includes('landslide') || lower.includes('rockfall')) return Mountain;
  if (lower.includes('snow') || lower.includes('cold') || lower.includes('frost')) return Snowflake;
  return AlertTriangle;
};

interface IntelligenceFeedProps {
  events: WeatherEvent[];
  reports: WeatherReport[];
  alerts: WeatherAlert[];
  onSelectEvent?: (eventId: string) => void;
  selectedEventId?: string | null;
  className?: string;
}

type FeedFilter = 'all' | 'events' | 'reports' | 'alerts' | 'critical';

export const IntelligenceFeed: React.FC<IntelligenceFeedProps> = ({
  events,
  reports,
  alerts,
  onSelectEvent,
  selectedEventId,
  className = '',
}) => {
  const [filter, setFilter] = useState<FeedFilter>('all');

  // Build unified chronological stream of items
  const streamItems: Array<{
    id: string;
    kind: 'event' | 'report' | 'alert';
    title: string;
    subtitle: string;
    location: string;
    timestamp: string;
    severity?: WeatherEvent['severity'];
    credibilityScore?: number;
    eventId?: string;
    source?: string;
  }> = [];

  // 1. Map events
  events.forEach((evt) => {
    streamItems.push({
      id: `evt-${evt.id}`,
      kind: 'event',
      title: evt.title,
      subtitle: `${evt.type.toUpperCase().replace('_', ' ')} • ${evt.status.toUpperCase()}`,
      location: `${evt.location.region}, ${evt.location.state}`,
      timestamp: evt.detectedAt,
      severity: evt.severity,
      eventId: evt.id,
      source: `${evt.sourceCount} sources`,
    });
  });

  // 2. Map reports
  reports.slice(0, 30).forEach((rpt) => {
    const classification = rpt.detectedEventType.replace('_', ' ');
    streamItems.push({
      id: `rpt-${rpt.id}`,
      kind: 'report',
      title: rpt.rawText,
      subtitle: `VERIFIED: ${classification.toUpperCase()} • ${rpt.source.replace('_', ' ').toUpperCase()}`,
      location: `${rpt.location.name}, ${rpt.location.state}`,
      timestamp: rpt.timestamp,
      credibilityScore: rpt.credibilityScore,
      eventId: rpt.associatedEventId,
      source: rpt.source,
    });
  });

  // 3. Map alerts
  alerts.forEach((alt) => {
    streamItems.push({
      id: `alt-${alt.id}`,
      kind: 'alert',
      title: alt.title,
      subtitle: alt.headline,
      location: alt.affectedRegions[0] || 'India',
      timestamp: alt.issuedAt,
      severity: alt.severity,
      eventId: alt.eventId,
      source: 'National Warning',
    });
  });

  // Sort newest first
  streamItems.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Apply active filter
  const filteredItems = streamItems.filter((item) => {
    if (filter === 'events') return item.kind === 'event';
    if (filter === 'reports') return item.kind === 'report';
    if (filter === 'alerts') return item.kind === 'alert';
    if (filter === 'critical') return item.severity === 'critical';
    return true;
  });

  const filterButtons: Array<{ id: FeedFilter; label: string; count?: number }> = [
    { id: 'all', label: 'All Stream', count: streamItems.length },
    { id: 'events', label: 'Events', count: events.length },
    { id: 'reports', label: 'Reports', count: reports.length },
    { id: 'alerts', label: 'Alerts', count: alerts.length },
    { id: 'critical', label: 'Critical' },
  ];

  return (
    <GlassCard glow="cyan" className={`h-full flex flex-col shadow-atmospheric ${className}`}>
      <GlassCardHeader>
        <GlassCardTitle
          icon={<Radio className="w-4 h-4 text-sky-600" />}
          subtitle="Real-time multi-source intelligence ingestion feed"
        >
          Live Intelligence Feed
        </GlassCardTitle>
        <Badge variant="cyan" dot pulse>
          INGESTING
        </Badge>
      </GlassCardHeader>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100">
        {filterButtons.map((btn) => {
          const isActive = filter === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => setFilter(btn.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                isActive
                  ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>{btn.label}</span>
              {btn.count !== undefined && (
                <span className="ml-1 text-[10px] opacity-75 font-mono">({btn.count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable Feed Container */}
      <GlassCardContent className="flex-1 overflow-y-auto max-h-[480px] space-y-2.5 pr-1 pt-3 no-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No items match active filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = item.eventId && selectedEventId === item.eventId;
            const isCrit = item.severity === 'critical';
            const isHigh = item.severity === 'high';
            const timeAgo = Math.max(
              0,
              Math.round((Date.now() - new Date(item.timestamp).getTime()) / 60000)
            );
            const IconComponent = getFeedItemIcon(item.title + ' ' + item.subtitle);

            const cardBg = isCrit
              ? 'bg-gradient-to-r from-red-50/70 via-white to-red-50/20 border-red-200/80 hover:border-red-300'
              : isHigh
              ? 'bg-gradient-to-r from-orange-50/60 via-white to-orange-50/20 border-orange-200/80 hover:border-orange-300'
              : 'bg-gradient-to-r from-sky-50/50 via-white to-sky-50/20 border-slate-200/80 hover:border-sky-300';

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.eventId && onSelectEvent) {
                    onSelectEvent(item.eventId);
                  }
                }}
                className={`p-3 rounded-xl border transition-all duration-200 hover:translate-x-1 hover:shadow-sm cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/95 border-sky-400 shadow-xs ring-1 ring-sky-300'
                    : cardBg
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="p-1 rounded-md bg-white border border-slate-200/80 text-sky-600 shadow-2xs">
                      <IconComponent className="w-3 h-3" />
                    </span>

                    {item.kind === 'event' && (
                      <Badge variant="cyan" size="sm">EVENT</Badge>
                    )}
                    {item.kind === 'report' && (
                      <Badge variant="teal" size="sm">REPORT</Badge>
                    )}
                    {item.kind === 'alert' && (
                      <Badge variant="rose" size="sm" pulse>ALERT</Badge>
                    )}

                    {item.severity && (
                      <SeverityBadge severity={item.severity} showIcon={false} className="py-0 px-1.5 text-[10px]" />
                    )}

                    {item.credibilityScore !== undefined && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700">
                        {item.credibilityScore}% Conf
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 shrink-0">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{timeAgo === 0 ? 'Just now' : `${timeAgo}m ago`}</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-900 mt-1.5 leading-snug line-clamp-2">
                  {item.title}
                </p>

                <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-600">
                  <span className="flex items-center gap-1 truncate font-medium">
                    <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </span>

                  {item.eventId && (
                    <span className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800 font-bold shrink-0">
                      <span>View Map</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </GlassCardContent>
    </GlassCard>
  );
};
