import React from 'react';

export type GlassGlowVariant = 'none' | 'cyan' | 'sky' | 'teal' | 'rose' | 'amber' | 'indigo' | 'emerald';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'interactive';
  glow?: GlassGlowVariant;
  className?: string;
}

const glowStyles: Record<GlassGlowVariant, string> = {
  none: '',
  cyan: 'border-sky-200/80 hover:border-sky-300',
  sky: 'border-sky-200/80 hover:border-sky-300',
  teal: 'border-teal-200/80 hover:border-teal-300',
  rose: 'border-red-200/80 hover:border-red-300',
  amber: 'border-amber-200/80 hover:border-amber-300',
  indigo: 'border-indigo-200/80 hover:border-indigo-300',
  emerald: 'border-emerald-200/80 hover:border-emerald-300',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  glow = 'none',
  className = '',
  ...props
}) => {
  const baseClass =
    variant === 'interactive'
      ? 'glass-panel-interactive'
      : variant === 'subtle'
      ? 'glass-panel-subtle'
      : 'glass-panel';

  const glowClass = glowStyles[glow];

  return (
    <div
      className={`rounded-2xl p-5 ${baseClass} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassCardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between pb-3 mb-3 border-b border-slate-100 ${className}`}>
    {children}
  </div>
);

export const GlassCardTitle: React.FC<{
  children: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
}> = ({ children, icon, subtitle, className = '' }) => (
  <div>
    <div className={`flex items-center gap-2.5 font-bold text-slate-900 tracking-tight text-base font-sans ${className}`}>
      {icon && <span className="text-sky-600">{icon}</span>}
      <span>{children}</span>
    </div>
    {subtitle && (
      <p className="text-xs text-slate-500 font-normal mt-0.5">{subtitle}</p>
    )}
  </div>
);

export const GlassCardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);
