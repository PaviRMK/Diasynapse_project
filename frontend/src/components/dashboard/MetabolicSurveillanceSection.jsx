import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Pill, ChevronRight, Info, TrendingUp, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { CountUp } from '../CountUp';
import { Badge } from '../Badge';

export function MetabolicSurveillanceSection({ activeInsulin, glucoseTrend }) {
  const prefersReducedMotion = useReducedMotion();

  // Medication source of truth
  const insulinPercent = activeInsulin?.percent ?? 0;
  const clampedPercent = Math.max(0, Math.min(100, insulinPercent));

  // Circular ring geometry
  const radius = 38;
  const strokeWidth = 6.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  // Trend data
  const hasTrendData = glucoseTrend?.hasEnoughData;
  const chartData = hasTrendData
    ? [
        { name: 'Period 1', value: glucoseTrend.period1 },
        {
          name: 'Midpoint',
          value: Math.round(((glucoseTrend.period1 + glucoseTrend.period2) / 2) * 10) / 10,
        },
        { name: 'Period 2', value: glucoseTrend.period2 },
      ]
    : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
      className="bg-white rounded-[24px] border border-[#E7ECF2] shadow-[0_4px_20px_rgba(7,26,51,0.03)] overflow-hidden"
      aria-label="Metabolic Awareness and Glucose Trend Surveillance"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E7ECF2]">
        
        {/* ── LEFT PANE: MEDICATION AWARENESS (6 cols) ── */}
        <div className="lg:col-span-6 p-6 sm:p-7 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#B52B3A]/10 border border-[#B52B3A]/20 flex items-center justify-center text-[#B52B3A] shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#071A33]">
                    Medication awareness
                  </h2>
                  <p className="text-xs text-[#718096] mt-0.5">
                    Situational awareness based on your logged timing.
                  </p>
                </div>
              </div>

              <Link
                to="/medication"
                className="text-xs font-semibold text-[#B52B3A] hover:text-[#8F1D2C] transition-colors flex items-center gap-1 shrink-0 pt-0.5"
              >
                <span>Timing details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Content: Circular Progress Ring & Administration Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center py-1">
              {/* Circular Gauge */}
              <div className="sm:col-span-5 flex items-center justify-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#E7ECF2"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#B52B3A"
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: prefersReducedMotion ? strokeDashoffset : circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: prefersReducedMotion ? 0 : 1.1, ease: 'easeOut' }}
                      fill="transparent"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-[#071A33] font-mono leading-none">
                      <CountUp end={clampedPercent} duration={1.1} suffix="%" />
                    </span>
                    <span className="text-[9px] font-semibold text-[#718096] uppercase tracking-wider mt-1">
                      Active insulin
                    </span>
                  </div>
                </div>
              </div>

              {/* Timing & Notes */}
              <div className="sm:col-span-7 space-y-2">
                <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E7ECF2]">
                  <span className="text-[10px] font-bold text-[#071A33] block mb-0.5 uppercase tracking-wider">
                    Scheduled Administration Window
                  </span>
                  <p className="text-xs text-[#718096] leading-relaxed">
                    {activeInsulin?.timingNote}
                  </p>
                </div>
                <p className="text-[11px] text-[#718096] leading-relaxed px-0.5">
                  {activeInsulin?.riskNote}
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Disclaimer Notice */}
          <div className="mt-5 pt-3.5 border-t border-[#E7ECF2]">
            <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E7ECF2] flex items-start gap-2.5">
              <Info className="w-3.5 h-3.5 text-[#718096] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#718096] leading-relaxed">
                <span className="font-semibold text-[#0B2342] block mb-0.5">
                  Clinical Notice
                </span>
                {activeInsulin?.disclaimer}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANE: GLUCOSE TREND (6 cols) ── */}
        <div className="lg:col-span-6 p-6 sm:p-7 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#071A33]">
                  Glucose trend
                </h2>
                <p className="text-xs text-[#718096] mt-0.5">
                  Based on your logged history
                </p>
              </div>

              <Badge
                variant={
                  glucoseTrend?.trend === 'Improving'
                    ? 'improving'
                    : glucoseTrend?.trend === 'Worsening'
                    ? 'worsening'
                    : 'stable'
                }
                size="sm"
              >
                {glucoseTrend?.trend || 'Stable'}
              </Badge>
            </div>

            {hasTrendData ? (
              <div>
                {/* Period Metric Comparison */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F5F7FA] border border-[#E7ECF2] my-3">
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-[#718096] tracking-wider block">
                      Period 1 Average
                    </span>
                    <span className="text-base sm:text-lg font-bold text-[#071A33] font-mono">
                      {glucoseTrend.period1} <span className="text-xs text-[#718096] font-sans">mg/dL</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-[#718096] tracking-wider block">
                      Period 2 Average
                    </span>
                    <span className="text-base sm:text-lg font-bold text-[#071A33] font-mono">
                      {glucoseTrend.period2} <span className="text-xs text-[#718096] font-sans">mg/dL</span>
                    </span>
                  </div>
                </div>

                {/* Clean Medical Chart: Deep Navy line, crimson latest point, subtle area fill */}
                <div className="h-28 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 8, right: 10, left: -24, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="connectedTrendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#B52B3A" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#B52B3A" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#718096" fontSize={10} tickLine={false} />
                      <YAxis stroke="#718096" fontSize={10} domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white border border-[#E7ECF2] p-2 rounded-lg shadow-md text-xs">
                                <span className="font-bold text-[#071A33]">
                                  {payload[0].value} mg/dL
                                </span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#071A33"
                        strokeWidth={2.2}
                        fill="url(#connectedTrendGradient)"
                        dot={{ r: 4, fill: '#B52B3A', stroke: '#FFFFFF', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              /* Honest Empty State */
              <div className="my-4 py-5 px-4 rounded-xl bg-[#F5F7FA] border border-dashed border-[#E7ECF2] text-center space-y-2.5">
                <div className="w-9 h-9 rounded-full bg-white border border-[#E7ECF2] flex items-center justify-center mx-auto text-[#B52B3A]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#071A33]">
                    Your glucose story starts here.
                  </h3>
                  <p className="text-[11px] text-[#718096] max-w-xs mx-auto mt-0.5">
                    Log a few readings to see your trend over time.
                  </p>
                </div>
                <Link
                  to="/predict-glucose"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#071A33] hover:bg-[#0B2342] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Log a reading</span>
                </Link>
              </div>
            )}
          </div>

          {/* Footer link to full progress page */}
          <div className="pt-3.5 border-t border-[#E7ECF2] flex items-center justify-between">
            <span className="text-xs text-[#718096]">
              {hasTrendData
                ? `${glucoseTrend.totalReadings} readings evaluated`
                : 'Requires 2+ readings'}
            </span>
            <Link
              to="/progress"
              className="text-xs font-semibold text-[#071A33] hover:text-[#B52B3A] transition-colors flex items-center gap-1"
            >
              <span>Full report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </motion.section>
  );
}
