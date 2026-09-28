import React from 'react';
import type { WeatherAlert, WeatherEvent } from '../../types';
import { Wind, CloudRain, Sun, CloudLightning, AlertTriangle } from 'lucide-react';

interface StatusTickerProps {
  alerts?: WeatherAlert[];
  events?: WeatherEvent[];
  isLive?: boolean;
}

export const StatusTicker: React.FC<StatusTickerProps> = ({
  alerts = [],
  events = [],
  isLive = true,
}) => {
  // Combine active alerts and top active events into live stream items
  const tickerItems = alerts.length > 0
    ? alerts.map((alt) => ({
        id: alt.id,
        severity: alt.severity,
        type: alt.title.split(':')[0] || 'WEATHER ALERT',
        headline: alt.headline,
        location: alt.affectedRegions[0] || 'India Subcontinent',
        status: alt.status,
      }))
    : events.slice(0, 6).map((evt) => ({
        id: evt.id,
        severity: evt.severity,
        type: evt.type.toUpperCase().replace('_', ' '),
        headline: evt.title,
        location: `${evt.location.state} (${evt.location.region})`,
        status: evt.status,
      }));

  return (
    <div className="w-full bg-gradient-to-r from-white via-[#F4FAFF] to-white border-b border-sky-100 h-11 flex items-center overflow-hidden backdrop-blur-md shadow-xs">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        {/* Fixed Weather Warning Ribbon Label */}
        <div className="shrink-0 flex items-center gap-2 pr-3 border-r border-sky-200/60 text-xs font-mono font-semibold">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-sky-500 beacon-dot' : 'bg-slate-400'}`} />
          <span className={`${isLive ? 'text-sky-700' : 'text-slate-500'} tracking-wider uppercase font-sans font-bold text-[11px]`}>
            {isLive ? 'LIVE WEATHER WARNING RIBBON' : 'SIMULATION PAUSED'}
          </span>
        </div>

        {/* Scrollable feed items */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {tickerItems.map((item) => {
            const isCrit = item.severity === 'critical';
            const isHigh = item.severity === 'high';
            const isMod = item.severity === 'moderate';

            return (
              <div
                key={item.id}
                className={`shrink-0 flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all duration-200 ${
                  isCrit
                    ? 'bg-gradient-to-r from-rose-50/90 to-white border-rose-200/80 text-rose-700 shadow-2xs'
                    : isHigh
                    ? 'bg-gradient-to-r from-orange-50/90 to-white border-orange-200/80 text-orange-700 shadow-2xs'
                    : isMod
                    ? 'bg-gradient-to-r from-amber-50/90 to-white border-amber-200/80 text-amber-800 shadow-2xs'
                    : 'bg-gradient-to-r from-sky-50/90 to-white border-sky-200/80 text-sky-800 shadow-2xs'
                }`}
              >
                {/* Visual Meteorological Icon based on type */}
                {item.type.includes('CYCLONE') || item.type.includes('WIND') ? (
                  <Wind className="w-3.5 h-3.5 text-rose-500" />
                ) : item.type.includes('RAIN') || item.type.includes('FLOOD') ? (
                  <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                ) : item.type.includes('HEAT') ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                ) : item.type.includes('THUNDER') || item.type.includes('STORM') ? (
                  <CloudLightning className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                )}

                <span className="font-mono font-bold text-[10px] uppercase tracking-wider">
                  {item.severity.toUpperCase()}
                </span>
                <span className="text-slate-300 font-sans">•</span>
                <span className="text-slate-900 font-semibold text-[11px]">{item.location}:</span>
                <span className="text-slate-600 text-[11px] max-w-[280px] truncate">{item.headline}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
