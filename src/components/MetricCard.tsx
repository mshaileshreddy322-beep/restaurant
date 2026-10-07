import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'purple';
  };
  footnote?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  footnote,
  className = '',
}) => {
  const badgeClasses = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };

  return (
    <div
      className={`bg-slate-800/80 border border-slate-700/70 rounded-xl p-5 shadow-lg backdrop-blur-sm hover:border-slate-600 transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {title}
        </span>
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-indigo-400">
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </span>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeClasses[badge.variant]}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      {footnote && (
        <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center text-[11px] text-slate-500">
          <span>{footnote}</span>
        </div>
      )}
    </div>
  );
};
