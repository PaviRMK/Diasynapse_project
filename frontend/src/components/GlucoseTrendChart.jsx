import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isElevated = value > 140;
    const isLow = value < 70;
    const statusText = isElevated ? 'Elevated' : isLow ? 'Low' : 'In Range';
    const statusBadge = isElevated
      ? 'bg-coral-100 text-coral-800 border-coral-200'
      : isLow
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-sage-100 text-sage-800 border-sage-200';

    return (
      <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-warm-md border border-cream-300 text-xs">
        <p className="font-semibold text-charcoal-700 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-charcoal-900 metric-number">
            {value} <span className="text-xs font-normal text-charcoal-500">mg/dL</span>
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge}`}>
            {statusText}
          </span>
        </div>
        {payload[0].payload.note && (
          <p className="text-[11px] text-charcoal-400 mt-1 italic">
            {payload[0].payload.note}
          </p>
        )}
      </div>
    );
  }
  return null;
}

export function GlucoseTrendChart({
  data = [],
  height = 220,
  compact = false,
  showTargetZone = true,
  stroke = '#C85A32',
  gradientId = 'glucoseGradient',
  emptyMessage = 'Not enough glucose readings logged yet.',
}) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl bg-cream-50/60 border border-dashed border-cream-300 p-6 text-center"
        style={{ height }}
      >
        <div className="w-10 h-10 rounded-full bg-cream-200/80 flex items-center justify-center text-charcoal-400 mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-xs text-charcoal-600 font-medium max-w-xs">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Calculate domain boundaries
  const values = data.map((d) => Number(d.glucose) || 0).filter(Boolean);
  const minVal = values.length ? Math.min(...values) : 80;
  const maxVal = values.length ? Math.max(...values) : 180;
  const domainMin = Math.max(50, Math.floor((minVal - 15) / 10) * 10);
  const domainMax = Math.ceil((maxVal + 20) / 10) * 10;

  return (
    <div className="w-full relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={
            compact
              ? { top: 8, right: 6, left: -24, bottom: 0 }
              : { top: 12, right: 12, left: -10, bottom: 6 }
          }
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.28} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {showTargetZone && (
            <ReferenceArea
              y1={70}
              y2={140}
              fill="#E5EFE8"
              fillOpacity={0.55}
              stroke="transparent"
            />
          )}

          {!compact && (
            <>
              <ReferenceLine y={140} stroke="#9EBF96" strokeDasharray="3 3" strokeOpacity={0.7} />
              <ReferenceLine y={70} stroke="#E7B297" strokeDasharray="3 3" strokeOpacity={0.7} />
            </>
          )}

          <XAxis
            dataKey="time"
            tick={{ fill: '#6C757D', fontSize: compact ? 10 : 11 }}
            axisLine={{ stroke: '#EAE2D5' }}
            tickLine={false}
            dy={4}
          />
          <YAxis
            domain={[domainMin, domainMax]}
            tick={{ fill: '#6C757D', fontSize: compact ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
            width={compact ? 30 : 36}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="glucose"
            stroke={stroke}
            strokeWidth={2.4}
            fill={`url(#${gradientId})`}
            dot={compact ? false : { r: 3.5, fill: stroke, stroke: '#FFFFFF', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: stroke, stroke: '#FFFFFF', strokeWidth: 2.5 }}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
