import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Sparkles, History, Loader2, AlertCircle, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { api } from '../services/api';
import { useData } from '../context/DataContext';
import { AiEstimatedBadge } from '../components/Badge';
import { CountUp } from '../components/CountUp';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function FormField({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-charcoal-700">{label}</label>
        {hint && <span className="text-[10px] text-charcoal-400 font-medium">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (active && payload?.length) {
    return (
      <div className="glass-card rounded-xl px-3 py-2.5 text-xs">
        <p className="font-bold text-charcoal-900 metric-number">{payload[0].value} mg/dL</p>
        <p className="text-charcoal-500">AI Estimated</p>
      </div>
    );
  }
  return null;
}

export function GlucosePredictionPage() {
  const { recordPrediction, activities } = useData();

  const now = new Date();
  const [formData, setFormData] = useState({
    glucose: 150,
    carbs: 20,
    insulin_dose: 2,
    hour: now.getHours(),
    day_of_week: now.getDay(),
    glucose_lag_1: 148,
    glucose_lag_6: 140,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const predictionHistory = activities.filter((a) => a.type === 'prediction');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: parseFloat(value) || 0 }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.predictGlucose(formData);
      setPredictionResult(res);
      recordPrediction(res, formData);
    } catch (err) {
      setError(err.message || 'Glucose prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  const autofillCurrentTime = () => {
    const d = new Date();
    setFormData((p) => ({ ...p, hour: d.getHours(), day_of_week: d.getDay() }));
  };

  // Build a simple curve chart from current + predicted for visualization
  const chartData = predictionResult
    ? [
        { t: '-30m', glucose: formData.glucose_lag_6 },
        { t: '-5m', glucose: formData.glucose_lag_1 },
        { t: 'Now', glucose: formData.glucose },
        { t: '+30m', glucose: predictionResult.predicted_glucose_30min },
      ]
    : [];

  const predicted = predictionResult?.predicted_glucose_30min;
  const isHigh = predicted > 180;
  const isLow = predicted < 70;
  const statusColor = isHigh ? 'text-coral-600' : isLow ? 'text-terracotta-600' : 'text-sage-700';
  const statusLabel = isHigh ? 'Elevated' : isLow ? 'Low' : 'Target Range';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div variants={container} initial="hidden" animate="show" className="mb-8">
        <motion.div variants={item} className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-plum-50 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-plum-600" />
          </div>
          <span className="section-label">XGBoost Model · FastAPI</span>
        </motion.div>
        <motion.h1 variants={item} className="text-3xl font-extrabold text-charcoal-900 tracking-tight mb-2">
          Glucose Prediction
        </motion.h1>
        <motion.p variants={item} className="text-sm text-charcoal-500 max-w-xl">
          Predict your glucose level 30 minutes ahead using our XGBoost model trained on clinical continuous glucose datasets.
        </motion.p>
      </motion.div>

      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* ─ Form Card ─────────────────────────────── */}
        <motion.div variants={item} className="card-elevated rounded-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-cream-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-charcoal-900">Input Parameters</h2>
              <button
                type="button"
                onClick={autofillCurrentTime}
                className="btn-ghost text-terracotta-600 hover:text-terracotta-700 hover:bg-terracotta-50">
                <RefreshCw className="w-3.5 h-3.5" />
                Sync time
              </button>
            </div>
          </div>

          <form onSubmit={handlePredict} className="px-6 py-5 space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Current Glucose" hint="mg/dL">
                <input
                  type="number" name="glucose" value={formData.glucose}
                  onChange={handleChange} step="0.1" required
                  className="input-premium"
                />
              </FormField>
              <FormField label="Carbohydrates" hint="grams">
                <input
                  type="number" name="carbs" value={formData.carbs}
                  onChange={handleChange} step="0.1" required
                  className="input-premium"
                />
              </FormField>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Insulin" hint="units">
                <input
                  type="number" name="insulin_dose" value={formData.insulin_dose}
                  onChange={handleChange} step="0.5" required
                  className="input-premium"
                />
              </FormField>
              <FormField label="Hour" hint="0–23">
                <input
                  type="number" name="hour" min="0" max="23" value={formData.hour}
                  onChange={handleChange} required
                  className="input-premium"
                />
              </FormField>
              <FormField label="Day" hint="0=Sun">
                <input
                  type="number" name="day_of_week" min="0" max="6" value={formData.day_of_week}
                  onChange={handleChange} required
                  className="input-premium"
                />
              </FormField>
            </div>

            {/* Lag values */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Lag 1 Glucose" hint="5 min ago">
                <input
                  type="number" name="glucose_lag_1" value={formData.glucose_lag_1}
                  onChange={handleChange} step="0.1" required
                  className="input-premium"
                />
              </FormField>
              <FormField label="Lag 6 Glucose" hint="30 min ago">
                <input
                  type="number" name="glucose_lag_6" value={formData.glucose_lag_6}
                  onChange={handleChange} step="0.1" required
                  className="input-premium"
                />
              </FormField>
            </div>

            {/* Current context display */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-cream-50 border border-cream-200 text-xs">
              <div className="flex items-center gap-2 text-charcoal-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{DAY_NAMES[formData.day_of_week]}, {String(formData.hour).padStart(2, '0')}:00</span>
              </div>
              <span className="text-charcoal-400 font-medium">Context snapshot</span>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl flex items-start gap-2.5 text-xs"
                style={{ background: '#FBEBEA', border: '1px solid #F6D5D2', color: '#90312A' }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Predicting with XGBoost...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Calculate 30-min Prediction</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* ─ Results Column ────────────────────────── */}
        <div className="space-y-5">
          {/* Forecast Result */}
          <motion.div variants={item} className="card-elevated rounded-2xl overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-cream-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-charcoal-900">Forecast Outcome</h2>
              <AiEstimatedBadge />
            </div>

            <div className="px-6 py-5">
              <AnimatePresence mode="wait">
                {predictionResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4">

                    <div className="flex items-baseline gap-3">
                      <span className={`text-6xl font-black metric-number ${statusColor}`}>
                        <CountUp end={predicted} duration={1.0} />
                      </span>
                      <div>
                        <p className="text-lg font-bold text-charcoal-400">mg/dL</p>
                        <p className={`text-xs font-bold ${statusColor}`}>{statusLabel}</p>
                      </div>
                    </div>

                    {/* Glucose Curve Chart */}
                    <div className="h-28 -mx-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C85A32" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#C85A32" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F4EFE6" />
                          <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#6C757D' }} axisLine={false} tickLine={false} />
                          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#6C757D' }} axisLine={false} tickLine={false} width={40} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={180} stroke="#EDB4AF" strokeDasharray="4 2" label={{ value: 'High', fontSize: 9, fill: '#DC8881' }} />
                          <ReferenceLine y={70} stroke="#C8DEC0" strokeDasharray="4 2" label={{ value: 'Low', fontSize: 9, fill: '#78A072' }} />
                          <Area type="monotone" dataKey="glucose" stroke="#C85A32" strokeWidth={2.5}
                            fill="url(#glucoseGrad)" dot={{ fill: '#C85A32', r: 4, strokeWidth: 2, stroke: '#fff' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-xs text-charcoal-500 leading-relaxed">
                      Estimated blood glucose 30 minutes from now, factoring in carb intake and rapid insulin response.
                    </p>
                    <p className="text-[11px] text-charcoal-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-terracotta-400" />
                      Saved automatically to your clinical Firestore logs.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-10 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-plum-50 flex items-center justify-center mx-auto">
                      <TrendingUp className="w-7 h-7 text-plum-400" />
                    </div>
                    <p className="text-xs font-semibold text-charcoal-700">No prediction yet</p>
                    <p className="text-xs text-charcoal-400 max-w-xs mx-auto">
                      Fill in the parameters and click Calculate to see your 30-minute glucose forecast.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* History */}
          <motion.div variants={item} className="card-elevated rounded-2xl overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-charcoal-900">Recent Forecasts</h3>
              <History className="w-4 h-4 text-charcoal-400" />
            </div>
            <div className="px-6 py-4">
              {predictionHistory.length === 0 ? (
                <p className="text-xs text-charcoal-400 text-center py-4 font-medium">
                  No forecasts yet in this session.
                </p>
              ) : (
                <div className="space-y-1">
                  {predictionHistory.slice(0, 5).map((p, i) => (
                    <div key={p.id}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-cream-50 transition-colors">
                      <div>
                        <span className="text-xs font-bold text-charcoal-800 metric-number">
                          {p.glucose ? `${p.glucose} mg/dL` : p.details}
                        </span>
                        <p className="text-[10px] text-charcoal-400 mt-0.5">
                          {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <AiEstimatedBadge />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
