import React from 'react';

export type ButtonVariant = 'primary' | 'glass' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-xs hover:shadow-sm active:scale-[0.98] border border-sky-700/20',
  glass:
    'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-sky-300 hover:text-sky-700 shadow-xs active:scale-[0.98]',
  outline:
    'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400 active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-700 active:scale-[0.98]',
  danger:
    'bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs hover:shadow-sm active:scale-[0.98] border border-red-700/20',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2 rounded-xl gap-2',
  lg: 'text-base px-6 py-2.5 rounded-xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'glass',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
