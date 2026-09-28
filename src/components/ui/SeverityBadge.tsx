import React from 'react';
import type { SeverityLevel } from '../../types';
import { AlertTriangle, AlertCircle, ShieldAlert, Info, ShieldCheck } from 'lucide-react';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
}

const severityConfig: Record<
  SeverityLevel,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
    dotColor: string;
  }
> = {
  critical: {
    label: 'CRITICAL',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: ShieldAlert,
    dotColor: 'bg-red-500',
  },
  high: {
    label: 'HIGH SEVERITY',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: AlertTriangle,
    dotColor: 'bg-orange-500',
  },
  moderate: {
    label: 'MODERATE',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: AlertCircle,
    dotColor: 'bg-amber-500',
  },
  low: {
    label: 'LOW / STABLE',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: ShieldCheck,
    dotColor: 'bg-emerald-500',
  },
  informational: {
    label: 'INFORMATIONAL',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    icon: Info,
    dotColor: 'bg-sky-500',
  },
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showIcon = true,
  pulse = true,
  className = '',
}) => {
  const config = severityConfig[severity];
  const Icon = config.icon;
  const isHighAlert = severity === 'critical' || severity === 'high';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold tracking-wider rounded-md border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${
          pulse && isHighAlert ? 'beacon-dot' : ''
        }`}
      />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
};
