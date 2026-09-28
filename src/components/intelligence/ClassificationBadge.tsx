import React from 'react';
import type { EventType } from '../../types';
import {
  CloudRain,
  Waves,
  Wind,
  Sun,
  Snowflake,
  Mountain,
  Zap,
  CloudLightning,
  AlertTriangle,
  Flame,
} from 'lucide-react';

interface ClassificationBadgeProps {
  eventType: EventType;
  confidence?: number;
  showConfidence?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const eventStyles: Record<
  EventType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; border: string; bg: string }
> = {
  heavy_rainfall: {
    label: 'Heavy Rainfall',
    icon: CloudRain,
    color: 'text-sky-700',
    border: 'border-sky-200',
    bg: 'bg-sky-50',
  },
  flood: {
    label: 'Flood System',
    icon: Waves,
    color: 'text-blue-700',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
  },
  cyclone: {
    label: 'Cyclone System',
    icon: Wind,
    color: 'text-red-700',
    border: 'border-red-200',
    bg: 'bg-red-50',
  },
  thunderstorm: {
    label: 'Thunderstorm',
    icon: CloudLightning,
    color: 'text-amber-800',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
  storm: {
    label: 'Atmospheric Storm',
    icon: Zap,
    color: 'text-amber-800',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
  heatwave: {
    label: 'Heatwave',
    icon: Sun,
    color: 'text-orange-700',
    border: 'border-orange-200',
    bg: 'bg-orange-50',
  },
  coldwave: {
    label: 'Coldwave',
    icon: Snowflake,
    color: 'text-sky-700',
    border: 'border-sky-200',
    bg: 'bg-sky-50',
  },
  landslide: {
    label: 'Landslide Risk',
    icon: Mountain,
    color: 'text-emerald-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
  },
  high_wind: {
    label: 'High Gale Wind',
    icon: Wind,
    color: 'text-teal-700',
    border: 'border-teal-200',
    bg: 'bg-teal-50',
  },
  wind: {
    label: 'Wind Anomaly',
    icon: Wind,
    color: 'text-teal-700',
    border: 'border-teal-200',
    bg: 'bg-teal-50',
  },
  drought: {
    label: 'Drought Stress',
    icon: Flame,
    color: 'text-amber-800',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
};

export const ClassificationBadge: React.FC<ClassificationBadgeProps> = ({
  eventType,
  confidence,
  showConfidence = true,
  size = 'md',
  className = '',
}) => {
  const config = eventStyles[eventType] || {
    label: eventType.replace('_', ' '),
    icon: AlertTriangle,
    color: 'text-slate-700',
    border: 'border-slate-200',
    bg: 'bg-slate-100',
  };

  const IconComponent = config.icon;

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1.5'
      : size === 'lg'
      ? 'text-sm px-3.5 py-1.5 gap-2 font-bold'
      : 'text-xs px-2.5 py-1 gap-1.5 font-semibold';

  const iconSizes = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-lg border ${config.bg} ${config.border} ${config.color} ${sizeClasses} ${className}`}
    >
      <IconComponent className={iconSizes} />
      <span>{config.label}</span>
      {showConfidence && confidence !== undefined && (
        <span className="font-mono text-[10px] font-bold opacity-90 pl-1.5 border-l border-slate-300 ml-0.5">
          {confidence}%
        </span>
      )}
    </span>
  );
};
