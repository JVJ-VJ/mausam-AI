import React from 'react';
import { CloudSun, RefreshCw, Play, Pause, ShieldCheck, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';

interface CommandCenterHeaderProps {
  isLive: boolean;
  onToggleLive: () => void;
  onReset: () => void;
  lastUpdated: string;
  monitoredRegions: number;
  activeEventsCount?: number;
  meanCredibility?: number;
}

export const CommandCenterHeader: React.FC<CommandCenterHeaderProps> = ({
  isLive,
  onToggleLive,
  onReset,
  lastUpdated,
  monitoredRegions,
  activeEventsCount = 10,
  meanCredibility = 89.7,
}) => {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  return (
    <section 
      aria-label="National Weather Intelligence Briefing"
      className="relative overflow-hidden rounded-3xl transition-all duration-300 p-6 sm:p-8 lg:p-10 border border-sky-200/50 bg-white/75 backdrop-blur-md shadow-sm"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 249, 255, 0.85) 50%, rgba(255, 255, 255, 0.90) 100%)',
      }}
    >
      {/* Sunlight atmosphere glow drifting inside briefing banner */}
      <div 
        className="absolute -top-24 right-1/4 w-96 h-96 rounded-full pointer-events-none animate-sunlight-drift opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.25) 0%, rgba(125, 211, 252, 0.08) 50%, transparent 75%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Cloud atmosphere silhouette */}
      <div 
        className="absolute -bottom-16 -left-16 w-80 h-44 rounded-full pointer-events-none opacity-30 animate-cloud-layer-1"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, rgba(224, 242, 254, 0.35) 60%, transparent 85%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Side: National Weather Intelligence Briefing */}
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100/80 border border-sky-300/60 text-sky-800 text-[11px] font-bold tracking-wider uppercase font-sans">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-sky-500 beacon-dot' : 'bg-slate-400'}`} />
              <span>LIVE WEATHER INTELLIGENCE</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              SIH26069 &bull; Meteorological Operations
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-sans leading-tight">
            National Weather Intelligence
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            Real-time atmospheric monitoring, multi-sensor corroboration, weather-event classification and early-warning analytics across India.
          </p>

          {/* Operational status & action strip */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-3 text-xs font-mono px-3.5 py-2 rounded-xl bg-white/90 border border-sky-100 shadow-2xs text-slate-700">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-bold text-slate-900">{monitoredRegions} Zones</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Updated <strong className="text-slate-900 font-bold">{formattedTime} IST</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isLive ? 'glass' : 'primary'}
                size="sm"
                onClick={onToggleLive}
                icon={isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                className="font-semibold shadow-xs"
              >
                {isLive ? 'Pause Stream' : 'Resume'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                title="Reset to deterministic seed"
                icon={<RefreshCw className="w-4 h-4" />}
                className="font-semibold bg-white/80"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Atmospheric Weather Visualization & Open Weather Statistics */}
        <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8 shrink-0 lg:pl-6">
          {/* Large Floating Weather Atmosphere Symbol */}
          <div className="relative flex items-center justify-center shrink-0">
            <div 
              className="absolute inset-0 w-28 h-28 rounded-full pointer-events-none animate-pulse-slow"
              style={{
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(56, 189, 248, 0.12) 50%, transparent 75%)',
                filter: 'blur(20px)',
              }}
            />
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/90 to-sky-50/80 border border-sky-200/60 shadow-sm flex items-center justify-center animate-float-slow">
              <CloudSun className="w-13 h-13 text-sky-500 drop-shadow-xs" />
            </div>
          </div>

          {/* Open Weather-Stat Typography (Prompt Section 6: Floating weather information inside the environment) */}
          <div className="flex items-center gap-6 sm:gap-8 divide-x divide-sky-200/60">
            <div className="text-left">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
                {monitoredRegions}
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Monitored Zones
              </div>
            </div>

            <div className="pl-6 sm:pl-8 text-left">
              <div className="text-3xl sm:text-4xl font-extrabold text-sky-600 font-sans tracking-tight">
                {activeEventsCount}
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Active Events
              </div>
            </div>

            <div className="pl-6 sm:pl-8 text-left">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-sans tracking-tight">
                {typeof meanCredibility === 'number' ? `${meanCredibility.toFixed(1)}%` : `${meanCredibility}%`}
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Mean Credibility
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
