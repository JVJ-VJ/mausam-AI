import React from 'react';
import type { CorrelationAnalytics, WeatherEvent } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { Network, Activity, ArrowUpRight, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface CorrelationNetworkAnalyticsProps {
  data: CorrelationAnalytics;
  events: WeatherEvent[];
  onSelectEvent?: (eventId: string) => void;
  className?: string;
}

export const CorrelationNetworkAnalytics: React.FC<CorrelationNetworkAnalyticsProps> = ({
  data,
  events,
  onSelectEvent,
  className = '',
}) => {
  return (
    <GlassCard glow="indigo" className={`flex flex-col shadow-atmospheric ${className}`}>
      <GlassCardHeader>
        <GlassCardTitle
          icon={<Network className="w-4 h-4 text-indigo-600" />}
          subtitle="Multi-modal incident correlation linking reports to active weather systems"
        >
          Incident Correlation Topology &amp; Network
        </GlassCardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="indigo" dot pulse>
            {data.correlationRate}% Correlated
          </Badge>
        </div>
      </GlassCardHeader>

      <GlassCardContent className="flex-1 space-y-4 pt-1">
        {/* Strength breakdown bar */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-[11px] mb-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Strong (≥ 75%)</span>
            </div>
            <span className="text-lg font-black text-slate-900 block">
              {data.strengthCounts.strong}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Confirmed match</span>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200">
            <div className="flex items-center justify-center gap-1.5 text-indigo-700 text-[11px] mb-1 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Possible (60-74%)</span>
            </div>
            <span className="text-lg font-black text-slate-900 block">
              {data.strengthCounts.possible}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Likely related</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-center gap-1.5 text-slate-600 text-[11px] mb-1 font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Standalone (&lt; 60%)</span>
            </div>
            <span className="text-lg font-black text-slate-900 block">
              {data.strengthCounts.none}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Uncorrelated</span>
          </div>
        </div>

        {/* Active Events Correlation Topology Cards */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">
            Active Event Incident Nodes ({events.length})
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
            {events.map((evt) => {
              const reportCount = evt.supportingReports ? evt.supportingReports.length : 0;

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent?.(evt.id)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      {evt.id}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {evt.confidence}% Conf
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                    {evt.title}
                  </h5>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 pt-1.5 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-sky-600" />
                      {reportCount} Correlated reports
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};
