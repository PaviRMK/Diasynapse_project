import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ChevronRight, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Badge } from '../Badge';

export function GlucoseTrendSection({ glucoseTrend }) {
  const hasData = glucoseTrend?.hasEnoughData;

  const chartData = hasData
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
      className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E8EDF3] shadow-[0_4px_16px_rgba(7,26,51,0.03)] flex flex-col justify-between"
      aria-labelledby="glucose-trend-heading"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 id="glucose-trend-heading" className="text-base sm:text-lg font-bold text-[#071A33]">
              Glucose trend
            </h2>
            <p className="text-xs text-[#708198] mt-0.5">
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

        {hasData ? (
          <div>
            {/* Period Comparison Metric Row */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E8EDF3] my-4">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#708198] tracking-wider block">
                  Period 1 Average
                </span>
                <span className="text-lg font-bold text-[#071A33] font-mono">
                  {glucoseTrend.period1} <span className="text-xs text-[#708198] font-sans">mg/dL</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#708198] tracking-wider block">
                  Period 2 Average
                </span>
                <span className="text-lg font-bold text-[#071A33] font-mono">
                  {glucoseTrend.period2} <span className="text-xs text-[#708198] font-sans">mg/dL</span>
                </span>
              </div>
            </div>

            {/* Clean Medical Chart: Deep Navy main line, crimson latest point, subtle area fill */}
            <div className="h-32 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="trendSectionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B52B3A" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#B52B3A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#708198" fontSize={11} tickLine={false} />
                  <YAxis stroke="#708198" fontSize={10} domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-[#E8EDF3] p-2 rounded-lg shadow-md text-xs">
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
                    strokeWidth={2.4}
                    fill="url(#trendSectionGradient)"
                    dot={{ r: 4, fill: '#B52B3A', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Honest Empty State: Never fabricate data */
          <div className="my-6 py-6 px-4 rounded-xl bg-[#F7F9FC] border border-dashed border-[#E8EDF3] text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E8EDF3] flex items-center justify-center mx-auto text-[#B52B3A]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#071A33]">
                Your glucose story starts here.
              </h3>
              <p className="text-xs text-[#708198] max-w-xs mx-auto mt-1">
                Log a few readings to see your trend over time.
              </p>
            </div>
            <Link
              to="/predict-glucose"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#071A33] hover:bg-[#0B2342] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span>Log a reading</span>
            </Link>
          </div>
        )}
      </div>

      {/* Footer link to full progress page */}
      <div className="pt-4 border-t border-[#E8EDF3] flex items-center justify-between">
        <span className="text-xs text-[#708198]">
          {hasData
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
    </motion.section>
  );
}
