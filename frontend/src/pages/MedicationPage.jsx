import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Clock, AlertCircle, Loader2, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';
import { RadialProgress } from '../components/RadialProgress';
import { api } from '../services/api';
import { useData } from '../context/DataContext';
import { Disclaimer } from '../components/Disclaimer';
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

export function MedicationPage() {
  const { recordMedication, latestMedication } = useData();

  const [formData, setFormData] = useState({
    last_dose_time: new Date(Date.now() - 75 * 60 * 1000).toISOString().slice(0, 16),
    next_scheduled_dose_time: new Date(Date.now() + 165 * 60 * 1000).toISOString().slice(0, 16),
    meal_carbs: 30,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(latestMedication || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fmt = (dt) => dt?.length === 16 ? `${dt}:00` : dt;
      const payload = {
        last_dose_time: fmt(formData.last_dose_time),
        next_scheduled_dose_time: fmt(formData.next_scheduled_dose_time),
        meal_carbs: parseFloat(formData.meal_carbs) || 0,
      };
      const data = await api.checkMedication(payload);
      setResult(data);
      recordMedication(data);
    } catch (err) {
      setError(err.message || 'Medication check failed.');
    } finally {
      setLoading(false);
    }
  };

  const pct = result?.insulin_active_percent || 0;
  const riskLevel = pct > 60 ? 'high' : pct > 30 ? 'moderate' : 'low';
  const riskColors = {
    high: { track: '#F9EAE1', fill: '#C85A32', text: 'text-terracotta-700' },
    moderate: { track: '#E5EFE8', fill: '#5E8C70', text: 'text-sage-700' },
    low: { track: '#F5EBF0', fill: '#AC6D8D', text: 'text-plum-700' },
  };
  const rc = riskColors[riskLevel];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div variants={container} initial="hidden" animate="show" className="mb-8">
        <motion.div variants={item} className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-sage-50 flex items-center justify-center">
            <Pill className="w-4 h-4 text-sage-700" />
          </div>
          <span className="section-label">Situational Awareness Agent · FastAPI</span>
        </motion.div>
        <motion.h1 variants={item} className="text-3xl font-extrabold text-charcoal-900 tracking-tight mb-2">
          Medication & Insulin Awareness
        </motion.h1>
        <motion.p variants={item} className="text-sm text-charcoal-500 max-w-xl">
          Monitor your rapid-acting insulin decay curve to understand remaining active insulin before your next meal.
        </motion.p>
      </motion.div>

      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* ─ Form ─────────────────────────────────── */}
        <motion.div variants={item} className="card-elevated rounded-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-cream-200">
            <h2 className="text-sm font-bold text-charcoal-900">Dose Timing Inputs</h2>
            <p className="text-xs text-charcoal-500 mt-1">
              Enter your last and next scheduled dose times along with meal carbs to calculate insulin activity.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                Last Dose Time
              </label>
              <input
                type="datetime-local"
                value={formData.last_dose_time}
                onChange={(e) => setFormData({ ...formData, last_dose_time: e.target.value })}
                required
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                Next Scheduled Dose Time
              </label>
              <input
                type="datetime-local"
                value={formData.next_scheduled_dose_time}
                onChange={(e) => setFormData({ ...formData, next_scheduled_dose_time: e.target.value })}
                required
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Planned Meal Carbs (g)
              </label>
              <input
                type="number"
                value={formData.meal_carbs}
                onChange={(e) => setFormData({ ...formData, meal_carbs: e.target.value })}
                step="1"
                required
                className="input-premium"
              />
              <p className="text-[10px] text-charcoal-400 mt-1.5">
                Used to contextualize insulin load vs planned carb intake.
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 rounded-xl flex items-start gap-2.5 text-xs"
                  style={{ background: '#FBEBEA', border: '1px solid #F6D5D2', color: '#90312A' }}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Evaluating Insulin Decay...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Check Medication Status
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* ─ Results ─────────────────────────────── */}
        <div className="space-y-5">
          <motion.div variants={item} className="card-elevated rounded-2xl overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-charcoal-900">Current Insulin Status</h3>
              <Badge variant="neutral" size="xs">Situational Awareness</Badge>
            </div>

            <div className="px-6 py-6">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6">

                    {/* Radial gauge + number */}
                    <div className="flex items-center justify-center gap-8">
                      <RadialProgress
                        value={pct}
                        max={100}
                        size={120}
                        strokeWidth={12}
                        color={rc.fill}
                        trackColor={rc.track}
                      />
                      <div>
                        <p className="section-label mb-1">Active Insulin</p>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-5xl font-black metric-number ${rc.text}`}>
                            <CountUp end={pct} duration={1.2} />
                          </span>
                          <span className="text-xl font-bold text-charcoal-400">%</span>
                        </div>
                        <p className="text-xs text-charcoal-500 mt-1">
                          {riskLevel === 'high' ? '⚠ High activity — caution before meals' :
                           riskLevel === 'moderate' ? '↓ Declining — monitor closely' :
                           '✓ Low activity — approaching safe zone'}
                        </p>
                      </div>
                    </div>

                    {/* Risk Note */}
                    <div className="p-4 rounded-xl" style={{ background: '#FAF8F5', border: '1px solid #EAE2D5' }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <ShieldAlert className="w-4 h-4 text-terracotta-500" />
                        <h4 className="text-xs font-bold text-charcoal-800">Activity Context</h4>
                      </div>
                      <p className="text-xs text-charcoal-700 leading-relaxed">{result.risk_note}</p>
                    </div>

                    {/* Timing */}
                    <div className="p-4 rounded-xl" style={{ background: '#F4F8F5', border: '1px solid #C8DEC0' }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock className="w-4 h-4 text-sage-600" />
                        <h4 className="text-xs font-bold text-charcoal-800">Schedule Status</h4>
                      </div>
                      <p className="text-xs text-charcoal-700 leading-relaxed">{result.timing_note}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-sage-50 flex items-center justify-center mx-auto">
                      <Pill className="w-8 h-8 text-sage-300" />
                    </div>
                    <p className="text-xs font-semibold text-charcoal-700">No status yet</p>
                    <p className="text-xs text-charcoal-400 max-w-xs mx-auto leading-relaxed">
                      Enter your dose times and planned carbs to calculate active insulin status.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <Disclaimer text={result?.disclaimer} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
