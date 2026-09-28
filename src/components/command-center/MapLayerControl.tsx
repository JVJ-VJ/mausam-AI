import React from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';

export interface MapLayerState {
  events: boolean;
  reports: boolean;
  rainfall: boolean;
  temperature: boolean;
  wind: boolean;
  floodRisk: boolean;
  stormActivity: boolean;
  radarSweep: boolean;
}

interface MapLayerControlProps {
  layers: MapLayerState;
  onToggleLayer: (layerKey: keyof MapLayerState) => void;
}

export const MapLayerControl: React.FC<MapLayerControlProps> = ({
  layers,
  onToggleLayer,
}) => {
  const layerConfig: Array<{
    key: keyof MapLayerState;
    label: string;
    status: 'ACTIVE' | 'SIMULATED' | 'DEMO';
    color: string;
  }> = [
    { key: 'events', label: 'Weather Events', status: 'ACTIVE', color: 'text-sky-400' },
    { key: 'reports', label: 'Ground Spotters / Sensors', status: 'ACTIVE', color: 'text-teal-400' },
    { key: 'rainfall', label: 'Monsoon Precipitation', status: 'SIMULATED', color: 'text-sky-300' },
    { key: 'temperature', label: 'Thermal Heat Corridor', status: 'SIMULATED', color: 'text-amber-400' },
    { key: 'wind', label: 'Wind Vector Streamlines', status: 'SIMULATED', color: 'text-sky-200' },
    { key: 'floodRisk', label: 'Flood Inundation Risk', status: 'DEMO', color: 'text-emerald-400' },
    { key: 'stormActivity', label: 'Convective Storm Cells', status: 'SIMULATED', color: 'text-rose-400' },
    { key: 'radarSweep', label: 'Meteorological Sweep', status: 'ACTIVE', color: 'text-sky-400' },
  ];

  return (
    <div className="p-3.5 rounded-2xl bg-[#071321]/95 border border-white/20 backdrop-blur-md space-y-2 text-xs text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-wider text-slate-200 font-bold">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Meteorological GIS Layers</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 font-semibold">TOGGLE</span>
      </div>

      <div className="space-y-1">
        {layerConfig.map((item) => {
          const isEnabled = layers[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggleLayer(item.key)}
              className={`w-full flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer text-left ${
                isEnabled
                  ? 'bg-navy-800 border border-sky-500/40 text-white shadow-xs'
                  : 'bg-navy-950/40 border border-navy-800 text-slate-400 hover:text-white hover:bg-navy-850'
              }`}
            >
              <div className="flex items-center gap-2">
                {isEnabled ? (
                  <Eye className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className="text-[11px] font-semibold leading-tight">{item.label}</span>
              </div>

              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                  item.status === 'ACTIVE'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'bg-navy-750 text-slate-400'
                }`}
              >
                {item.status}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
