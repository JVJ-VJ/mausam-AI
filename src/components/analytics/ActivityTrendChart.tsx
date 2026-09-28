import React, { useMemo } from 'react';
import type { ActivityTrendPoint } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { LineChart, Clock } from 'lucide-react';

interface ActivityTrendChartProps {
  trend: ActivityTrendPoint[];
  isLive: boolean;
  className?: string;
}

export const ActivityTrendChart: React.FC<ActivityTrendChartProps> = ({
  trend,
  isLive,
  className = '',
}) => {
  // Compute SVG polyline paths
  const chartData = useMemo(() => {
    if (trend.length < 2) return null;

    const width = 600;
    const height = 140;
    const padding = 20;

    const maxReports = Math.max(...trend.map((p) => p.totalReports), 10);
    const maxEvents = Math.max(...trend.map((p) => p.activeEvents), 5);

    const getX = (idx: number) =>
      padding + (idx / (trend.length - 1)) * (width - 2 * padding);

    const getYReports = (val: number) =>
      height - padding - (val / maxReports) * (height - 2 * padding);

    const getYEvents = (val: number) =>
      height - padding - (val / maxEvents) * (height - 2 * padding);

    const reportsPoints = trend.map((p, idx) => `${getX(idx)},${getYReports(p.totalReports)}`).join(' ');
    const eventsPoints = trend.map((p, idx) => `${getX(idx)},${getYEvents(p.activeEvents)}`).join(' ');

    const baseY = height - padding;
    const reportsAreaPoints = `${reportsPoints} ${getX(trend.length - 1)},${baseY} ${getX(0)},${baseY}`;
    const eventsAreaPoints = `${eventsPoints} ${getX(trend.length - 1)},${baseY} ${getX(0)},${baseY}`;

    const lastPoint = trend[trend.length - 1];

    return {
      width,
      height,
      reportsPoints,
      eventsPoints,
      reportsAreaPoints,
      eventsAreaPoints,
      lastPoint,
      sampleCount: trend.length,
    };
  }, [trend]);

  return (
    <GlassCard glow="cyan" className={`flex flex-col shadow-atmospheric ${className}`}>
      <GlassCardHeader>
        <GlassCardTitle
          icon={<LineChart className="w-4 h-4 text-sky-600" />}
          subtitle="Rolling chronological stream of telemetry volume and active weather events"
        >
          Activity Trend (Rolling Window)
        </GlassCardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isLive ? 'emerald' : 'amber'} size="sm" pulse={isLive}>
            {isLive ? 'LIVE STREAM' : 'STREAM PAUSED'}
          </Badge>
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
            SIMULATED ACTIVITY TREND
          </span>
        </div>
      </GlassCardHeader>

      <GlassCardContent className="flex-1 space-y-3 pt-1">
        {!chartData || chartData.sampleCount < 2 ? (
          <div className="h-36 flex flex-col items-center justify-center text-xs text-slate-400 font-mono space-y-1">
            <Clock className="w-6 h-6 text-slate-400 animate-pulse" />
            <span>Accumulating telemetry stream samples ({trend.length}/2)...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* SVG Visual Area */}
            <div className="w-full h-36 bg-gradient-to-b from-sky-50/40 via-white to-sky-50/20 rounded-xl p-2 border border-slate-200 relative overflow-hidden">
              <svg
                viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="reportsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="eventsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="20" y1="20" x2="580" y2="20" stroke="rgba(15, 23, 42, 0.08)" strokeDasharray="3 3" />
                <line x1="20" y1="70" x2="580" y2="70" stroke="rgba(15, 23, 42, 0.08)" strokeDasharray="3 3" />
                <line x1="20" y1="120" x2="580" y2="120" stroke="rgba(15, 23, 42, 0.08)" strokeDasharray="3 3" />

                {/* Area Fills under Lines */}
                <polygon
                  fill="url(#reportsAreaGrad)"
                  points={chartData.reportsAreaPoints}
                />
                <polygon
                  fill="url(#eventsAreaGrad)"
                  points={chartData.eventsAreaPoints}
                />

                {/* Reports Volume Line (Azure Blue) */}
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartData.reportsPoints}
                />

                {/* Active Events Line (Warm Amber) */}
                <polyline
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartData.eventsPoints}
                />
              </svg>

              {/* Chart Legend Overlay */}
              <div className="absolute top-2 right-3 flex items-center gap-3 text-[10px] font-mono bg-white/95 px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                <span className="flex items-center gap-1.5 text-sky-800 font-bold">
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                  Reports ({chartData.lastPoint.totalReports})
                </span>
                <span className="flex items-center gap-1.5 text-amber-800 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  Active Events ({chartData.lastPoint.activeEvents})
                </span>
              </div>
            </div>

            {/* Subtitle / sample status */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
              <span>
                Window: <strong className="text-slate-700">{chartData.sampleCount} ticks</strong> (bounded at 120)
              </span>
              <span>
                Latest sample: <strong className="text-slate-700">{chartData.lastPoint.displayTime}</strong>
              </span>
            </div>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};
