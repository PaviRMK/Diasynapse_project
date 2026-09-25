import React from 'react';

export function StatCard({
  title,
  value,
  unit,
  badge,
  note,
  action,
  className = '',
  highlight = false,
}) {
  return (
    <div
      className={`bg-white rounded-xl border p-5 shadow-sm transition-all duration-200 ${
        highlight
          ? 'border-terracotta-200 ring-1 ring-terracotta-100'
          : 'border-cream-300 hover:border-cream-400'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
          {title}
        </h3>
        {badge}
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="metric-number text-3xl font-bold tracking-tight text-charcoal-900">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-charcoal-500">{unit}</span>
        )}
      </div>

      {note && (
        <p className="text-xs text-charcoal-600 leading-snug line-clamp-2">
          {note}
        </p>
      )}

      {action && <div className="mt-4 pt-3 border-t border-cream-200">{action}</div>}
    </div>
  );
}
