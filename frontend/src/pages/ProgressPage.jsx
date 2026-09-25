import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, RefreshCw, AlertCircle, Info, Sparkles, BarChart3, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from 'recharts';
import { useData } from '../context/DataContext';
import { Badge } from '../components/Badge';
import { CountUp } from '../components/CountUp';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function CustomBarTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="glass-card rounded-xl px-3.5 py-2.5 text-xs shadow-warm">
        <p className="font-bold text-charcoal-700 mb-0.5">{label}</p>
        <p className="text-lg font-black text-charcoal-900 metric-number">{payload[0].value} mg/dL</p>
      </div>
    );
  }
  return null;
}

export function ProgressPage() {
  const { progressReport, progressLoading, progressError, fetchProgressReport } = useData();

  useEffect(() => { fetchProgressReport(); }, []);

  const getTrendVariant = (trend) => {
    if (trend === 'Improving') return 'improving';
    if (trend === 'Worsening') return 'worsening';
    return 'stable';
  };

  const TrendIcon = progressReport?.glucose_trend === 'Improving'
    ? ArrowDown
    : progressReport?.glucose_trend === 'Worsening'
    ? ArrowUp
    : Minus;

  const barData = progressReport && !progressReport.error
    ? [
        { label: 'Period 1', value: progressReport.avg_glucose_period1, period: 1 },
        { label: 'Period 2', value: progressReport.avg_glucose_period2, period: 2 },
      ]
    : [];

  const improvement = progressReport && !progressReport.error
    ? progressReport.avg_glucose_period1 - progressReport.avg_glucose_period2
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div variants={container} initial="hidden" animate="show" className="mb-8">
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-sage-50 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-sage-700" />
              </div>
              <span className="section-label">Progress Agent · Firestore Analytics</span>
            </div>
            <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight mb-2">
              Glucose Progress & Trends
            </h1>
            <p className="text-sm text-charcoal-500 max-w-xl">
              Comparative analysis based on your real logged glucose predictions over time.
            </p>
          </div>
          <button
            onClick={fetchProgressReport}
            disabled={progressLoading}
            className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${progressLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </motion.div>
      </motion.div>

      {/* Loading */}
      {progressLoading && (
        <div className="card-elevated rounded-2xl p-16 text-center space-y-4">
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.span key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                className="w-2.5 h-2.5 rounded-full bg-terracotta-400"
              />
            ))}
          </div>
          <p className="text-xs text-charcoal-500 font-medium">Loading your clinical progress report...</p>
        </div>
      )}

      {/* Error */}
      {!progressLoading && progressError && (
        <div className="p-5 rounded-2xl flex items-start gap-3 text-xs"
          style={{ background: '#FBEBEA', border: '1px solid #F6D5D2', color: '#90312A' }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Unable to load progress data</p>
            <p>{progressError}</p>
          </div>
        </div>
      )}

      {/* Empty / Insufficient data */}
      {!progressLoading && !progressError && progressReport?.error && (
        <div className="card-elevated rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-terracotta-50 flex items-center justify-center mx-auto">
            <Info className="w-8 h-8 text-terracotta-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-charcoal-900 mb-2">More Data Needed</h3>
            <p className="text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed">
              {progressReport.error}
            </p>
          </div>
          <a href="/predict-glucose"
            className="btn-primary inline-flex">
            Log a glucose reading now
          </a>
        </div>
      )}

      {/* Real Data */}
      {!progressLoading && !progressError && progressReport && !progressReport.error && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Trend */}
            <motion.div variants={item} className="card-elevated rounded-2xl p-6 relative overflow-hidden">
              <div className={`ambient-glow w-20 h-20 ${progressReport.glucose_trend === 'Improving' ? 'bg-sage-300/30' : progressReport.glucose_trend === 'Worsening' ? 'bg-coral-300/30' : 'bg-plum-300/20'}`}
                style={{ top: '-20%', right: '-10%' }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="section-label">Overall Trend</span>
                  <Badge variant={getTrendVariant(progressReport.glucose_trend)} size="xs">
                    {progressReport.glucose_trend}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    progressReport.glucose_trend === 'Improving' ? 'bg-sage-50 text-sage-700' :
                    progressReport.glucose_trend === 'Worsening' ? 'bg-coral-50 text-coral-600' :
                    'bg-plum-50 text-plum-600'
                  }`}>
                    <TrendIcon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-charcoal-900">{progressReport.glucose_trend}</p>
                </div>
                <p className="text-xs text-charcoal-500 mt-2">
                  {progressReport.label || 'Based on your logged history'}
                </p>
              </div>
            </motion.div>

            {/* Change */}
            <motion.div variants={item} className="card-elevated rounded-2xl p-6 relative overflow-hidden">
              <div className="ambient-glow w-20 h-20 bg-terracotta-300/20" style={{ top: '-20%', right: '-10%' }} />
              <div className="relative z-10">
                <span className="section-label block mb-3">Period Change</span>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-4xl font-black metric-number ${
                    improvement > 0 ? 'text-sage-700' : improvement < 0 ? 'text-coral-600' : 'text-charcoal-600'
                  }`}>
                    <CountUp
                      end={Math.abs(progressReport.glucose_change)}
                      prefix={progressReport.glucose_change > 0 ? '-' : '+'}
                      duration={1}
                    />
                  </span>
                  <span className="text-lg font-bold text-charcoal-400">mg/dL</span>
                </div>
                <p className="text-xs text-charcoal-500">Second half vs first half comparison</p>
              </div>
            </motion.div>

            {/* Sample Size */}
            <motion.div variants={item} className="card-elevated rounded-2xl p-6 relative overflow-hidden">
              <div className="ambient-glow w-20 h-20 bg-plum-300/20" style={{ top: '-20%', right: '-10%' }} />
              <div className="relative z-10">
                <span className="section-label block mb-3">Sample Size</span>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black metric-number text-charcoal-900">
                    <CountUp end={progressReport.total_readings} duration={1} />
                  </span>
                </div>
                <p className="text-xs text-charcoal-500">Total continuous log entries</p>
              </div>
            </motion.div>
          </div>

          {/* Bar Chart */}
          <motion.div variants={item} className="card-elevated rounded-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-cream-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-charcoal-900">Period-over-Period Glucose Averages</h3>
                <p className="text-xs text-charcoal-400 mt-0.5">{progressReport.total_readings} readings recorded</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: '#D98967' }} />
                  <span className="text-[11px] text-charcoal-500">Period 1</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: '#5E8C70' }} />
                  <span className="text-[11px] text-charcoal-500">Period 2</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barCategoryGap="35%" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F4EFE6" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 600, fill: '#495057' }} axisLine={false} tickLine={false} />
                    <YAxis
                      domain={[Math.min(progressReport.avg_glucose_period1, progressReport.avg_glucose_period2) - 20, 'auto']}
                      tick={{ fontSize: 11, fill: '#6C757D' }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${v}`} width={45}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(200,90,50,0.05)' }} />
                    <ReferenceLine y={180} stroke="#EDB4AF" strokeDasharray="4 2" />
                    <ReferenceLine y={70} stroke="#C8DEC0" strokeDasharray="4 2" />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell
                          key={entry.period}
                          fill={entry.period === 1 ? '#D98967' : '#5E8C70'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Period Labels */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-cream-100">
                <div className="text-center">
                  <p className="section-label mb-1">Period 1 Average</p>
                  <p className="text-2xl font-black text-charcoal-800 metric-number">
                    {progressReport.avg_glucose_period1}
                    <span className="text-sm font-bold text-charcoal-400 ml-1">mg/dL</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="section-label mb-1">Period 2 Average</p>
                  <p className={`text-2xl font-black metric-number ${improvement > 0 ? 'text-sage-700' : 'text-coral-600'}`}>
                    {progressReport.avg_glucose_period2}
                    <span className="text-sm font-bold text-charcoal-400 ml-1">mg/dL</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Clinical Note */}
            <div className="mx-6 mb-6 p-4 rounded-xl" style={{ background: '#FAF8F5', border: '1px solid #EAE2D5' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
                <p className="text-xs font-bold text-charcoal-800">Clinical Note</p>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">{progressReport.note}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
