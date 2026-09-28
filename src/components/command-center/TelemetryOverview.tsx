import React from 'react';
import { MetricCard } from '../ui/MetricCard';
import type { TelemetryMetrics } from '../../types';
import { 
  CloudRain, 
  Activity, 
  ShieldCheck, 
  MapPin, 
  AlertTriangle,
  Flame
} from 'lucide-react';

interface TelemetryOverviewProps {
  metrics: TelemetryMetrics;
}

export const TelemetryOverview: React.FC<TelemetryOverviewProps> = ({ metrics }) => {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5" aria-label="National Weather Environmental Snapshot">
      <MetricCard
        title="Active Events"
        value={metrics.activeEvents}
        unit="Total"
        subtitle="Across India"
        change={{
          value: 'Real-time',
          direction: 'neutral',
          label: 'Tracked',
        }}
        icon={<CloudRain className="w-4 h-4" />}
        glow="cyan"
      />

      <MetricCard
        title="Severe Events"
        value={metrics.severeEvents}
        unit="Critical/High"
        subtitle="Critical / High"
        change={{
          value: `${metrics.eventsBySeverity.critical} critical`,
          direction: metrics.severeEvents > 3 ? 'up' : 'neutral',
          label: 'Priority',
        }}
        icon={<Flame className="w-4 h-4" />}
        glow="rose"
      />

      <MetricCard
        title="Reports Processed"
        value={metrics.processedReports.toLocaleString('en-IN')}
        unit="Raw"
        subtitle="Live ingestion"
        change={{
          value: `+${metrics.totalReports} buffer`,
          direction: 'up',
          label: 'Ingested',
        }}
        icon={<Activity className="w-4 h-4" />}
        glow="teal"
      />

      <MetricCard
        title="Mean Credibility"
        value={`${metrics.averageCredibility}%`}
        unit="Score"
        subtitle="High-confidence intelligence"
        change={{
          value: `${metrics.verifiedReports} verified`,
          direction: 'neutral',
          label: 'High conf',
        }}
        icon={<ShieldCheck className="w-4 h-4" />}
        glow="emerald"
      />

      <MetricCard
        title="Monitored Zones"
        value={metrics.monitoredRegions}
        unit="States/UTs"
        subtitle="States / UTs"
        change={{
          value: '100% Pan-India',
          direction: 'neutral',
          label: 'Coverage',
        }}
        icon={<MapPin className="w-4 h-4" />}
        glow="amber"
      />

      <MetricCard
        title="Active Alerts"
        value={metrics.activeAlertsCount}
        unit="Advisories"
        subtitle="Early-warning advisories"
        change={{
          value: `${metrics.criticalAlertsCount} red alerts`,
          direction: metrics.criticalAlertsCount > 0 ? 'up' : 'neutral',
          label: 'Emergency',
        }}
        icon={<AlertTriangle className="w-4 h-4" />}
        glow="rose"
      />
    </section>
  );
};
