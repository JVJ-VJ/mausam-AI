import React from 'react';
import { 
  CloudRain, 
  Waves, 
  Wind, 
  Zap, 
  Flame, 
  Snowflake, 
  Mountain, 
  Droplets,
  HelpCircle 
} from 'lucide-react';

export const MapLegend: React.FC = () => {
  const severities = [
    { label: 'Critical', color: 'bg-red-500 border-red-400', text: 'text-red-300' },
    { label: 'High', color: 'bg-orange-500 border-orange-400', text: 'text-orange-300' },
    { label: 'Moderate', color: 'bg-amber-500 border-amber-400', text: 'text-amber-300' },
    { label: 'Low', color: 'bg-emerald-500 border-emerald-400', text: 'text-emerald-300' },
    { label: 'Informational', color: 'bg-sky-500 border-sky-400', text: 'text-sky-300' },
  ];

  const types = [
    { label: 'Rainfall', icon: CloudRain, color: 'text-sky-400' },
    { label: 'Cyclone', icon: Wind, color: 'text-red-400' },
    { label: 'Flood', icon: Waves, color: 'text-sky-300' },
    { label: 'Storm', icon: Zap, color: 'text-amber-400' },
    { label: 'Heatwave', icon: Flame, color: 'text-orange-400' },
    { label: 'Landslide', icon: Mountain, color: 'text-emerald-400' },
    { label: 'Coldwave', icon: Snowflake, color: 'text-indigo-300' },
    { label: 'Drought', icon: Droplets, color: 'text-yellow-400' },
  ];

  return (
    <div className="p-3.5 rounded-2xl bg-[#071321]/95 border border-white/20 backdrop-blur-md space-y-2.5 text-xs text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-sans text-[11px] uppercase tracking-wider text-slate-300 font-bold">
          Weather Activity Legend
        </span>
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
      </div>

      {/* Severities */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Severity Levels</span>
        <div className="flex flex-wrap items-center gap-2">
          {severities.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-[11px] text-slate-200">
              <span className={`w-2 h-2 rounded-full border ${s.color}`} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Types */}
      <div className="space-y-1 pt-1.5 border-t border-navy-750">
        <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Meteorological Types</span>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-200">
          {types.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                <span>{t.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
