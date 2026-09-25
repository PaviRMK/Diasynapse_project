import React from 'react';
import { motion } from 'framer-motion';
import { CountUp } from './CountUp';

export function RadialProgress({
  percentage = 0,
  size = 170,
  strokeWidth = 14,
  label = 'Active Insulin',
  sublabel = 'Remaining activity',
  variant = 'plum', // 'plum' | 'terracotta' | 'sage'
  className = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Number(percentage) || 0));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const gradientColors = {
    plum: {
      from: '#8E4D70',
      to: '#C85A32',
      glow: 'rgba(142, 77, 112, 0.25)',
      text: 'text-plum-700',
    },
    terracotta: {
      from: '#C85A32',
      to: '#D98967',
      glow: 'rgba(200, 90, 50, 0.25)',
      text: 'text-terracotta-700',
    },
    sage: {
      from: '#5E8C70',
      to: '#78A072',
      glow: 'rgba(94, 140, 112, 0.25)',
      text: 'text-sage-700',
    },
  }[variant] || {
    from: '#8E4D70',
    to: '#C85A32',
    glow: 'rgba(142, 77, 112, 0.25)',
    text: 'text-plum-700',
  };

  const gradientId = `radial-grad-${variant}-${Math.round(size)}`;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 origin-center"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors.from} />
              <stop offset="100%" stopColor={gradientColors.to} />
            </linearGradient>
            <filter id={`shadow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={gradientColors.glow} />
            </filter>
          </defs>

          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EAE2D5"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />

          {/* Animated active progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            strokeLinecap="round"
            filter={`url(#shadow-${gradientId})`}
          />
        </svg>

        {/* Center metric content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <div className="flex items-baseline justify-center">
            <CountUp
              value={clamped}
              decimals={clamped % 1 !== 0 ? 1 : 0}
              className={`text-3xl font-bold tracking-tight ${gradientColors.text}`}
            />
            <span className={`text-sm font-semibold ml-0.5 ${gradientColors.text}`}>%</span>
          </div>
          <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider mt-0.5">
            {label}
          </span>
        </div>
      </div>

      {sublabel && (
        <p className="mt-2 text-xs text-charcoal-500 text-center font-medium">
          {sublabel}
        </p>
      )}
    </div>
  );
}
