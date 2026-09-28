import React, { useState } from 'react';
import { AuroraBackground } from './components/ui/AuroraBackground';
import { Navbar } from './components/layout/Navbar';
import { StatusTicker } from './components/layout/StatusTicker';
import { useTelemetry } from './hooks/useTelemetry';
import {
  CommandCenterHeader,
  TelemetryOverview,
  IndiaWeatherMap,
  IntelligenceFeed,
  ActiveAlerts,
  EventDetails,
  EventExplorer,
  EventTypeChart,
  SeverityChart,
  RegionalDistribution,
  CredibilityDistribution,
} from './components/command-center';
import { GlassCard } from './components/ui/GlassCard';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { AIVerificationPanel } from './components/intelligence';
import { NationalWeatherAnalytics } from './components/analytics';
import { AlertIntelligenceCenter } from './components/alerts';
import { 
  AlertTriangle, 
  Cpu, 
  PlusCircle
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState('overview');
  const [selectedEventId, setSelectedEventId] = useState<string | null>('WW-EVT-001');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Hook into live simulated national telemetry engine
  const {
    metrics,
    events,
    reports,
    alerts,
    isLive,
    lastUpdated,
    toggleLive,
    injectReport,
    resetSimulation,
  } = useTelemetry();

  const handleSelectEvent = (eventId: string | null) => {
    setSelectedEventId(eventId);
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  return (
    <AuroraBackground showRadarGrid={true}>
      {/* Top Command Center Header with live simulation stream controls */}
      <Navbar
        activeView={activeNav}
        onViewChange={(view) => setActiveNav(view)}
        onEmergencyClick={() => setIsEmergencyModalOpen(true)}
        isLive={isLive}
        onToggleLive={toggleLive}
        activeAlertsCount={metrics.activeAlertsCount}
      />

      {/* Live Stream Marquee Ticker connected to simulated alert & event data */}
      <StatusTicker alerts={alerts} events={events} isLive={isLive} />

      {/* Main Container */}
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* Command Center Dashboard Header (Atmospheric Weather Briefing) */}
        <CommandCenterHeader
          isLive={isLive}
          onToggleLive={toggleLive}
          onReset={() => resetSimulation()}
          lastUpdated={lastUpdated}
          monitoredRegions={metrics.monitoredRegions}
          activeEventsCount={metrics.activeEvents}
          meanCredibility={metrics.averageCredibility}
        />

        {/* Real-time Telemetry Metrics KPI Deck (6 equal proportional cards) */}
        <TelemetryOverview metrics={metrics} />

        {/* PRIMARY COMMAND CENTER VIEW */}
        {activeNav === 'overview' && (
          <div key="overview" className="space-y-6 animate-view-fade">
            {/* 1. Command Center Hero: India Map (~68% centerpiece) + Dedicated Information Column (~32%) */}
            <section aria-label="Geospatial Command Center" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Centerpiece: India Weather Map (~68% width) */}
              <div className="lg:col-span-8 flex flex-col w-full min-w-0 overflow-hidden">
                <IndiaWeatherMap
                  events={events}
                  reports={reports}
                  selectedEventId={selectedEventId}
                  onSelectEvent={handleSelectEvent}
                  className="w-full h-[580px] lg:h-[620px] xl:h-[640px]"
                />
              </div>

              {/* Right Hero: Dedicated Information Column (~32% width) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Selected Event Dossier (docked at the top of the column when selected) */}
                {selectedEvent && (
                  <EventDetails
                    event={selectedEvent}
                    onClose={() => handleSelectEvent(null)}
                  />
                )}

                {/* Live Newsroom Intelligence Feed */}
                <IntelligenceFeed
                  events={events}
                  reports={reports}
                  alerts={alerts}
                  selectedEventId={selectedEventId}
                  onSelectEvent={handleSelectEvent}
                  className={selectedEvent ? "max-h-[320px] xl:max-h-[340px]" : "min-h-[320px]"}
                />

                {/* Active Alerts Advisory Cards */}
                <ActiveAlerts
                  alerts={alerts}
                  selectedEventId={selectedEventId}
                  onSelectEvent={handleSelectEvent}
                  className={selectedEvent ? "max-h-[290px]" : "min-h-[300px]"}
                />
              </div>
            </section>

            {/* 2. Event Explorer (Search & Multi-Dimensional Filters) */}
            <section aria-label="Event Explorer">
              <EventExplorer
                events={events}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
              />
            </section>

            {/* 3. Weather Event Distribution & Analytics Grid */}
            <section aria-label="National Weather Analytics" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
                    National Meteorological Analytics &amp; Anomaly Distribution
                  </h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Derived in real-time from active simulated telemetry streams across India
                  </p>
                </div>
                <Badge variant="cyan" size="sm">TELEMETRY SYNCED</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <EventTypeChart events={events} />
                <SeverityChart events={events} />
                <RegionalDistribution events={events} />
                <CredibilityDistribution reports={reports} />
              </div>
            </section>
          </div>
        )}

        {/* LIVE EVENTS / INTELLIGENCE VIEW */}
        {activeNav === 'intelligence' && (
          <div key="intelligence" className="space-y-6 animate-view-fade">
            <EventExplorer
              events={events}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IntelligenceFeed
                events={events}
                reports={reports}
                alerts={alerts}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
              />
              <IndiaWeatherMap
                events={events}
                reports={reports}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
                className="w-full h-[540px] lg:h-[600px]"
              />
            </div>
          </div>
        )}

        {/* AI-ASSISTED VERIFICATION & DEDUPLICATION VIEW */}
        {activeNav === 'verification' && (
          <div key="verification" className="space-y-6 animate-view-fade">
            <AIVerificationPanel
              reports={reports}
              events={events}
              onSelectEvent={(eventId) => {
                handleSelectEvent(eventId);
                setActiveNav('overview');
              }}
            />

            {/* Test Report Injector Strip */}
            <GlassCard glow="teal" className="p-4 border-teal-200/80 bg-white/95">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Live Stream AI Test Injector</h4>
                    <p className="text-xs text-slate-500">
                      Inject simulated reports to observe real-time AI credibility scoring, deduplication, and classification updates.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="glass"
                    size="sm"
                    className="text-xs border-teal-200 bg-teal-50/80 text-teal-800 hover:bg-teal-100"
                    onClick={() => {
                      injectReport({
                        id: `WW-SPOTTER-${Date.now().toString().slice(-4)}`,
                        source: 'trained_spotter',
                        timestamp: new Date().toISOString(),
                        location: { name: 'Puri Coastal Zone', state: 'Odisha', lat: 19.81, lng: 85.83 },
                        rawText: 'Trained spotter: Squall line intensify with sea swell over 4m near Puri coastline.',
                        detectedEventType: 'cyclone',
                        credibilityScore: 94,
                        credibilityTier: 'high',
                        factors: { sourceReliability: 94, crossSourceAgreement: 95, observationConsistency: 96, spatiotemporalCoherence: 92 },
                        associatedEventId: 'WW-EVT-001',
                        status: 'verified',
                      });
                    }}
                    icon={<PlusCircle className="w-3.5 h-3.5 text-teal-600" />}
                  >
                    Inject High-Conf Spotter Report
                  </Button>

                  <Button
                    variant="glass"
                    size="sm"
                    className="text-xs border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100"
                    onClick={() => {
                      injectReport({
                        id: `WW-ANOMALY-${Date.now().toString().slice(-4)}`,
                        source: 'citizen',
                        timestamp: new Date().toISOString(),
                        location: { name: 'Unknown Sector', state: 'Delhi', lat: 28.61, lng: 77.20 },
                        rawText: 'Unconfirmed citizen social report: Sudden localized waterspout sighted over lake.',
                        detectedEventType: 'storm',
                        credibilityScore: 41,
                        credibilityTier: 'flagged_anomaly',
                        factors: { sourceReliability: 35, crossSourceAgreement: 18, observationConsistency: 42, spatiotemporalCoherence: 48 },
                        status: 'raw',
                      });
                    }}
                    icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                  >
                    Inject Low-Conf Citizen Anomaly
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ANALYTICS WORKSPACE VIEW */}
        {activeNav === 'analytics' && (
          <div key="analytics" className="animate-view-fade">
            <NationalWeatherAnalytics
              events={events}
              reports={reports}
              alerts={alerts}
              isLive={isLive}
              onSelectEventType={() => {
                setActiveNav('intelligence');
              }}
              onSelectSeverity={(sev) => {
                if (sev === 'critical') {
                  setActiveNav('alerts');
                } else {
                  setActiveNav('intelligence');
                }
              }}
              onFocusRegion={(_lat, _lng, regionName) => {
                const matchedEvt = events.find(
                  (e) => e.location.region === regionName || e.location.state === regionName
                );
                if (matchedEvt) {
                  handleSelectEvent(matchedEvt.id);
                }
                setActiveNav('overview');
              }}
              onNavigateVerification={() => {
                setActiveNav('verification');
              }}
              onSelectEvent={(eventId) => {
                handleSelectEvent(eventId);
                setActiveNav('overview');
              }}
            />
          </div>
        )}

        {/* ALERT INTELLIGENCE CENTER VIEW */}
        {activeNav === 'alerts' && (
          <div key="alerts" className="animate-view-fade">
            <AlertIntelligenceCenter
              alerts={alerts}
              events={events}
              reports={reports}
              onFocusEvent={(eventId) => {
                handleSelectEvent(eventId);
                setActiveNav('overview');
              }}
            />
          </div>
        )}

      </main>

      {/* Emergency Modal Preview */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-white border border-rose-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  National Weather Emergency Action Broadcast
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">CAP PROTOCOL &bull; LEVEL 1 DISASTER ALERT</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trigger simulated high-priority Common Alerting Protocol (CAP) broadcast across regional state disaster management authorities (NDRF / SDMA).
            </p>
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800">
              ACTIVE SEVERE EVENTS: <strong>{metrics.severeEvents}</strong> &bull; CRITICAL ADVISORIES: <strong>{metrics.criticalAlertsCount}</strong>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setIsEmergencyModalOpen(false)}
              >
                Dismiss
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  alert(`Dispatched simulated emergency bulletin for ${metrics.criticalAlertsCount} active critical zones across India.`);
                  setIsEmergencyModalOpen(false);
                }}
              >
                Dispatch Test Broadcast
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Command Center Footer */}
      <footer className="mt-16 border-t border-slate-200/80 bg-white/90 backdrop-blur-md py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 font-mono shadow-sm">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-slate-700 font-medium">WeatherWatch AI &bull; Smart Automation &amp; Data Analytics &bull; SIH26069</span>
          </div>
          <div className="text-slate-500">National Weather Intelligence Platform &bull; Atmospheric GIS Command Console</div>
        </div>
      </footer>
    </AuroraBackground>
  );
};

export default App;
