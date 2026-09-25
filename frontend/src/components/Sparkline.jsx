import React from 'react';

export function Sparkline({
  data = [],
  width = 240,
  height = 60,
  color = '#C85A32',
  fillColor = '#FDF6F2',
  className = '',
}) {
  if (!data || data.length < 2) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-charcoal-400 bg-cream-50 rounded-lg border border-dashed border-cream-300 ${className}`}
        style={{ width, height }}
      >
        Waiting for more readings
      </div>
    );
  }

  const values = data.map((d) => (typeof d === 'number' ? d : d.value));
  const min = Math.min(...values) - 10;
  const max = Math.max(...values) + 10;
  const range = max - min || 1;

  const points = values.map((val, idx) => {
    const x = (idx / (values.length - 1)) * (width - 16) + 8;
    const y = height - 8 - ((val - min) / range) * (height - 16);
    return { x, y, val };
  });

  const pathD = points.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`,
    ''
  );

  const fillD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  return (
    <div className={`relative ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={fillD} fill="url(#sparkline-grad)" />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Highlight latest point */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill={color}
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        )}
      </svg>
    </div>
  );
}
