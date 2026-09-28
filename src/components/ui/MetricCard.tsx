import React from 'react';
import type { GlassGlowVariant } from './GlassCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  change?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon: React.ReactNode;
  glow?: GlassGlowVariant;
  sparklineColor?: 'cyan' | 'teal' | 'amber' | 'rose';
  className?: string;
}

const envCardStyleMap: Record<
  GlassGlowVariant,
  {
    bgClass: string;
    iconBg: string;
    iconBorder: string;
    iconText: string;
    radialColor: string;
    accentDot: string;
  }
> = {
  none: {
    bgClass: 'bg-white/90 border-slate-200/80',
    iconBg: 'bg-slate-100',
    iconBorder: 'border-slate-200',
    iconText: 'text-slate-600',
    radialColor: 'rgba(148, 163, 184, 0.08)',
    accentDot: 'bg-slate-400',
  },
  cyan: {
    bgClass: 'card-env-cyan',
    iconBg: 'bg-sky-100/90',
    iconBorder: 'border-sky-300/60',
    iconText: 'text-sky-700',
    radialColor: 'rgba(56, 189, 248, 0.18)',
    accentDot: 'bg-sky-500',
  },
  sky: {
    bgClass: 'card-env-cyan',
    iconBg: 'bg-sky-100/90',
    iconBorder: 'border-sky-300/60',
    iconText: 'text-sky-700',
    radialColor: 'rgba(56, 189, 248, 0.18)',
    accentDot: 'bg-sky-500',
  },
  teal: {
    bgClass: 'card-env-teal',
    iconBg: 'bg-teal-100/90',
    iconBorder: 'border-teal-300/60',
    iconText: 'text-teal-700',
    radialColor: 'rgba(20, 184, 166, 0.18)',
    accentDot: 'bg-teal-500',
  },
  emerald: {
    bgClass: 'card-env-emerald',
    iconBg: 'bg-emerald-100/90',
    iconBorder: 'border-emerald-300/60',
    iconText: 'text-emerald-700',
    radialColor: 'rgba(16, 185, 129, 0.18)',
    accentDot: 'bg-emerald-500',
  },
  rose: {
    bgClass: 'card-env-rose',
    iconBg: 'bg-rose-100/90',
    iconBorder: 'border-rose-300/60',
    iconText: 'text-rose-700',
    radialColor: 'rgba(239, 68, 68, 0.16)',
    accentDot: 'bg-rose-500',
  },
  amber: {
    bgClass: 'card-env-amber',
    iconBg: 'bg-amber-100/90',
    iconBorder: 'border-amber-300/60',
    iconText: 'text-amber-700',
    radialColor: 'rgba(245, 158, 11, 0.16)',
    accentDot: 'bg-amber-500',
  },
  indigo: {
    bgClass: 'bg-gradient-to-br from-white via-indigo-50/40 to-white border-indigo-200/60',
    iconBg: 'bg-indigo-100/90',
    iconBorder: 'border-indigo-300/60',
    iconText: 'text-indigo-700',
    radialColor: 'rgba(99, 102, 241, 0.16)',
    accentDot: 'bg-indigo-500',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  change,
  icon,
  glow = 'cyan',
  className = '',
}) => {
  const config = envCardStyleMap[glow] || envCardStyleMap.cyan;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-300 backdrop-blur-sm shadow-xs hover:shadow-md hover:-translate-y-1 group ${config.bgClass} ${className}`}
    >
      {/* Top-Right Soft Radial Bloom */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none transition-opacity duration-300 opacity-70 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 85% 15%, ${config.radialColor} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-1.5 h-1.5 rounded-full ${config.accentDot} shrink-0`} />
            <span className="text-[11px] uppercase tracking-wider text-slate-600 font-bold truncate">
              {title}
            </span>
          </div>
          <div className={`w-7 h-7 rounded-lg ${config.iconBg} border ${config.iconBorder} ${config.iconText} flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            {value}
          </span>
          {unit && (
            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">
              {unit}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {change && (
        <div className="relative z-10 flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-200/50 text-[11px]">
          {change.direction === 'up' && (
            <span className="flex items-center gap-0.5 text-emerald-700 font-bold font-mono">
              <TrendingUp className="w-3 h-3" />
              {change.value}
            </span>
          )}
          {change.direction === 'down' && (
            <span className="flex items-center gap-0.5 text-rose-700 font-bold font-mono">
              <TrendingDown className="w-3 h-3" />
              {change.value}
            </span>
          )}
          {change.direction === 'neutral' && (
            <span className="flex items-center gap-1 text-slate-600 font-semibold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              {change.value}
            </span>
          )}
          {change.label && (
            <span className="text-slate-500 font-normal truncate">{change.label}</span>
          )}
        </div>
      )}
    </div>
  );
};
