import React from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { CountUp } from '../CountUp';
import { BloodFlowVisual } from './BloodFlowVisual';
import { GlucoseStatusGuide } from './GlucoseStatusGuide';

export function GlucoseOutlookHero({
  glucosePrediction,
  heroChartPoints = [],
  targets,
}) {
  const hasValidForecast = Boolean(glucosePrediction?.isValid && glucosePrediction.value !== null);
  const displayVal = hasValidForecast ? glucosePrediction.value : null;

  return (
    <div className="w-full bg-[#071A33] px-6 lg:px-10 py-7 lg:py-8 flex flex-col md:flex-row md:items-center justify-between gap-8 lg:gap-12 relative overflow-hidden">
      {/* LEFT SECTION: Value, Outlook, & Continuous Status Guide */}
      <div className="flex-shrink-0 min-w-[260px] max-w-sm lg:max-w-md z-10">
        <div className="text-[11px] text-[#9fb0c9] tracking-[0.5px] uppercase font-medium">
          GLUCOSE OUTLOOK · {glucosePrediction?.label || 'AI-ESTIMATED'}
        </div>

        {hasValidForecast ? (
          <div>
            <div className="text-[48px] sm:text-[54px] font-medium text-white leading-[1.1] my-1.5 tracking-tight font-sans">
              <CountUp end={displayVal} duration={0.9} />
              <span className="text-base sm:text-[16px] text-[#9fb0c9] font-normal ml-2">
                mg/dL
              </span>
            </div>
            <div className="text-xs text-[#708198] mb-3 sm:mb-4">
              30-minute outlook
            </div>
          </div>
        ) : (
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
              No forecast yet
            </div>
            <p className="text-xs text-[#9fb0c9] mt-1 mb-2">
              Run a prediction to see your 30-minute outlook.
            </p>
            <Link
              to="/predict-glucose"
              className="inline-flex text-xs font-semibold text-[#D95C68] hover:text-white transition-colors mb-3"
            >
              Run prediction →
            </Link>
          </div>
        )}

        {/* Continuous Glucose Status Guide */}
        <GlucoseStatusGuide
          currentGlucose={displayVal}
          isValid={hasValidForecast}
          targets={targets}
        />

        {/* Mobile-only compact chart */}
        {hasValidForecast && heroChartPoints && heroChartPoints.length >= 2 && (
          <div className="block sm:hidden w-full h-[52px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={heroChartPoints} margin={{ top: 2, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="heroCrimsonGradMobile" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B52B3A" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#B52B3A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Area
                  type="monotone"
                  dataKey="glucose"
                  stroke="#D95C68"
                  strokeWidth={1.8}
                  fill="url(#heroCrimsonGradMobile)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* CENTER SECTION (Desktop / Tablet): Continuous Glucose Trajectory Graph spanning space */}
      {hasValidForecast && heroChartPoints && heroChartPoints.length >= 2 && (
        <div className="hidden sm:flex flex-1 flex-col justify-center min-w-[200px] max-w-xl xl:max-w-2xl px-2 lg:px-6 z-10">
          <div className="flex items-center justify-between text-[11px] text-[#9fb0c9] mb-1.5 font-medium">
            <span className="uppercase tracking-wider">Continuous Trajectory</span>
            <span className="text-[#708198] text-[10px]">Real logged readings</span>
          </div>
          <div className="w-full h-[76px] lg:h-[84px] bg-white/[0.02] rounded-lg p-1.5 border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={heroChartPoints}
                margin={{ top: 4, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="heroCrimsonGradWide" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B52B3A" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#B52B3A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#708198"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0B2342] border border-[#B52B3A]/40 px-2.5 py-1 rounded text-[11px] text-white shadow-md">
                          <span className="font-semibold">{payload[0].value} mg/dL</span>
                          {payload[0].payload.time && (
                            <span className="text-[#9fb0c9] text-[10px] ml-1.5">
                              {payload[0].payload.time}
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="glucose"
                  stroke="#D95C68"
                  strokeWidth={2}
                  fill="url(#heroCrimsonGradWide)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#FFFFFF', stroke: '#B52B3A', strokeWidth: 1.8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* RIGHT SECTION: Embedded Biological Erythrocyte Visual with horizontal breathing room */}
      <div className="flex-shrink-0 flex items-center justify-start md:justify-end z-10">
        <BloodFlowVisual />
      </div>
    </div>
  );
}
