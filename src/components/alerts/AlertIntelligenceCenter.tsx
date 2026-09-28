import React, { useState, useMemo } from 'react';
import type {
  WeatherAlert,
  WeatherEvent,
  WeatherReport,
  SeverityLevel,
  EventType,
  AlertSortOption,
} from '../../types';
import { AlertCard } from './AlertCard';
import { AlertDetailInspector } from './AlertDetailInspector';
import { AlertFilterBar } from './AlertFilterBar';
import { Badge } from '../ui/Badge';
import { GlassCard } from '../ui/GlassCard';
import { Bell, ShieldAlert, AlertTriangle } from 'lucide-react';

interface AlertIntelligenceCenterProps {
  alerts: WeatherAlert[];
  events: WeatherEvent[];
  reports: WeatherReport[];
  onFocusEvent?: (eventId: string) => void;
  className?: string;
}

const SEVERITY_RANK: Record<SeverityLevel, number> = {
  critical: 5,
  high: 4,
  moderate: 3,
  low: 2,
  informational: 1,
};

export const AlertIntelligenceCenter: React.FC<AlertIntelligenceCenterProps> = ({
  alerts,
  events,
  reports,
  onFocusEvent,
  className = '',
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all' | 'resolved'>('all');
  const [selectedEventType, setSelectedEventType] = useState<EventType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<AlertSortOption>('severity');

  // Map events by ID for O(1) lookup
  const eventMap = useMemo(() => {
    const map = new Map<string, WeatherEvent>();
    events.forEach((e) => map.set(e.id, e));
    return map;
  }, [events]);

  // Filter and Sort Alerts
  const filteredAlerts = useMemo(() => {
    const result = alerts.filter((alert) => {
      // Severity filter
      if (selectedSeverity === 'resolved') {
        if (alert.status !== 'cleared') return false;
      } else if (selectedSeverity !== 'all') {
        if (alert.severity !== selectedSeverity || alert.status === 'cleared') return false;
      }

      // Event Type filter
      if (selectedEventType !== 'all') {
        const evt = alert.eventId ? eventMap.get(alert.eventId) : undefined;
        if (!evt || evt.type !== selectedEventType) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(query);
        const matchesHeadline = alert.headline.toLowerCase().includes(query);
        const matchesId = alert.id.toLowerCase().includes(query);
        const matchesRegion = alert.affectedRegions.some((r) => r.toLowerCase().includes(query));
        const evt = alert.eventId ? eventMap.get(alert.eventId) : undefined;
        const matchesEventTitle = evt ? evt.title.toLowerCase().includes(query) : false;

        if (!matchesTitle && !matchesHeadline && !matchesId && !matchesRegion && !matchesEventTitle) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'severity') {
        const rankA = SEVERITY_RANK[a.severity] || 0;
        const rankB = SEVERITY_RANK[b.severity] || 0;
        if (rankB !== rankA) return rankB - rankA;
        return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
      }
      if (sortBy === 'credibility') {
        return b.confidence - a.confidence;
      }
      if (sortBy === 'reports') {
        const countA = a.eventId ? eventMap.get(a.eventId)?.sourceCount || 0 : 0;
        const countB = b.eventId ? eventMap.get(b.eventId)?.sourceCount || 0 : 0;
        return countB - countA;
      }
      return 0;
    });
  }, [alerts, selectedSeverity, selectedEventType, searchQuery, sortBy, eventMap]);

  // Active selected alert & context
  const selectedAlert = useMemo(() => {
    return alerts.find((a) => a.id === selectedAlertId) || filteredAlerts[0] || alerts[0];
  }, [alerts, selectedAlertId, filteredAlerts]);

  const selectedEvent = selectedAlert?.eventId ? eventMap.get(selectedAlert.eventId) : undefined;

  const supportingReports = useMemo(() => {
    if (!selectedEvent) return [];
    return reports.filter(
      (r) =>
        r.associatedEventId === selectedEvent.id ||
        (selectedEvent.supportingReports && selectedEvent.supportingReports.includes(r.id))
    );
  }, [selectedEvent, reports]);

  // Statistics
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status !== 'cleared').length;
  const highCount = alerts.filter((a) => a.severity === 'high' && a.status !== 'cleared').length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner & Simulation Disclosure */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-atmospheric">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-wide font-sans">
              Weather Alert Intelligence Center
            </h1>
            <Badge variant="rose" size="sm">
              EARLY-WARNING PROTOCOLS
            </Badge>
          </div>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed font-normal">
            Prioritized multi-source early-warning advisories, severity triage, and automated civil emergency action guidance for disaster management authorities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block font-mono">
            <div className="flex items-center justify-end gap-1.5 text-xs text-red-700 font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>{criticalCount} CRITICAL ADVISORIES</span>
            </div>
            <span className="text-[10px] text-slate-500 block uppercase mt-0.5 font-medium">
              DEMO ALERTS • NOT AN OFFICIAL GOVERNMENT WARNING
            </span>
          </div>
        </div>
      </div>

      {/* KPI Chips Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <GlassCard variant="subtle" className="p-3.5 border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Advisories</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{alerts.length}</span>
          <span className="text-[10px] text-slate-400 font-sans">Tracked in grid</span>
        </GlassCard>

        <GlassCard variant="subtle" className="p-3.5 border-red-200 bg-red-50/40 shadow-xs">
          <span className="text-[10px] text-red-700 uppercase block font-semibold">Critical Priority</span>
          <span className="text-xl font-black text-red-600 mt-1 block">{criticalCount}</span>
          <span className="text-[10px] text-red-600/80 font-sans">Immediate response</span>
        </GlassCard>

        <GlassCard variant="subtle" className="p-3.5 border-orange-200 bg-orange-50/40 shadow-xs">
          <span className="text-[10px] text-orange-700 uppercase block font-semibold">High Escalation</span>
          <span className="text-xl font-black text-orange-600 mt-1 block">{highCount}</span>
          <span className="text-[10px] text-orange-600/80 font-sans">Active monitoring</span>
        </GlassCard>

        <GlassCard variant="subtle" className="p-3.5 border-sky-200 bg-sky-50/40 shadow-xs">
          <span className="text-[10px] text-sky-700 uppercase block font-semibold">Resolved / Cleared</span>
          <span className="text-xl font-black text-sky-700 mt-1 block">
            {alerts.filter((a) => a.status === 'cleared').length}
          </span>
          <span className="text-[10px] text-slate-400 font-sans">Historical archive</span>
        </GlassCard>
      </div>

      {/* Filter and Search Bar */}
      <AlertFilterBar
        selectedSeverity={selectedSeverity}
        onSelectSeverity={setSelectedSeverity}
        selectedEventType={selectedEventType}
        onSelectEventType={setSelectedEventType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalAlertsCount={alerts.length}
        filteredCount={filteredAlerts.length}
      />

      {/* Main Split Section: Alert Cards List & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Alerts List (6 cols) */}
        <div className="lg:col-span-6 space-y-3.5">
          {filteredAlerts.length === 0 ? (
            <GlassCard className="p-12 text-center text-slate-400 border-slate-200 bg-white shadow-xs">
              <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-mono font-medium text-slate-600">
                No advisories match the selected filters or search query.
              </p>
            </GlassCard>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                event={alert.eventId ? eventMap.get(alert.eventId) : undefined}
                isSelected={selectedAlert?.id === alert.id}
                onSelectAlert={(a) => setSelectedAlertId(a.id)}
                onFocusMap={onFocusEvent}
              />
            ))
          )}
        </div>

        {/* Right Column: Selected Alert Detail Inspector (6 cols) */}
        <div className="lg:col-span-6">
          {selectedAlert ? (
            <AlertDetailInspector
              alert={selectedAlert}
              event={selectedEvent}
              supportingReports={supportingReports}
              onFocusMap={onFocusEvent}
            />
          ) : (
            <GlassCard className="p-12 text-center text-slate-400 text-xs font-mono border-slate-200 bg-white">
              Select an advisory card from the list to inspect operational details.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
