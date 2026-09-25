import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Scale,
  Bell,
  Trash2,
  Check,
  ShieldAlert,
  Save,
  RotateCcw,
  Sparkles,
  Sliders,
  Server,
  Activity,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/PageTransition';
import { api } from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('diasynapse_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      glucoseUnit: 'mg/dL', // 'mg/dL' | 'mmol/L'
      weightUnit: 'kg',     // 'kg' | 'lbs'
      heightUnit: 'cm',     // 'cm' | 'ft'
      carbPrecision: 'decimal', // 'decimal' | 'round'
      remindMealCheck: true,
      remindMedication: true,
      remindEveningReview: false,
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    api.getStatus()
      .then((data) => {
        if (data?.status === 'ok') setBackendStatus('connected');
        else setBackendStatus('online');
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('diasynapse_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setShowDeleteModal(false);
    logout();
    navigate('/auth');
  };

  return (
    <PageTransition className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Decorative Ambient Background Glows */}
      <div className="ambient-glow w-96 h-96 bg-terracotta-400/15 -top-12 -left-20 pointer-events-none" />
      <div className="ambient-glow w-80 h-80 bg-plum-400/15 top-24 -right-16 pointer-events-none" />

      {/* Header */}
      <div className="mb-6 pb-6 border-b border-cream-300 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cream-200 text-charcoal-700 border border-cream-300 mb-2">
            <Sliders className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Preferences & Data Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900 font-display">
            Application Settings
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-xl">
            Configure clinical measurement standards, automated reminders, and local client storage parameters.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-100 text-sage-800 text-xs font-semibold border border-sage-200 shadow-warm-sm animate-fade-in self-start sm:self-auto">
            <Check className="w-3.5 h-3.5 text-sage-600" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="show"
        onSubmit={handleSave}
        className="space-y-6"
      >
        {/* Backend & Diagnostics Live Card */}
        <motion.div variants={itemVariants} className="card-elevated rounded-2xl p-5 bg-white border border-cream-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-plum-50 flex items-center justify-center text-plum-700 shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal-900 font-display">FastAPI Clinical Agent Engine</p>
              <p className="text-[11px] text-charcoal-500">Connected to 127.0.0.1:8000 via REST microservice</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {backendStatus === 'connected' || backendStatus === 'online' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sage-50 text-sage-800 border border-sage-200">
                <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                Active & Connected
              </span>
            ) : backendStatus === 'checking' ? (
              <span className="text-xs text-charcoal-400">Pinging engine...</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Offline Mode
              </span>
            )}
          </div>
        </motion.div>

        {/* Unit Preferences Card */}
        <motion.div variants={itemVariants} className="card-elevated rounded-2xl p-6 bg-white border border-cream-300">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cream-200">
            <Scale className="w-4 h-4 text-terracotta-600" />
            <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider font-display">
              Clinical Units & Display Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Glucose Units */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Glucose Measurement Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'mg/dL', label: 'mg/dL (Standard US/IN)' },
                  { id: 'mmol/L', label: 'mmol/L (International)' },
                ].map((unit) => (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, glucoseUnit: unit.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                      settings.glucoseUnit === unit.id
                        ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-800 shadow-warm-sm'
                        : 'border-cream-300 bg-cream-50 text-charcoal-600 hover:bg-cream-100'
                    }`}
                  >
                    {unit.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Units */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Weight Display Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['kg', 'lbs'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setSettings({ ...settings, weightUnit: u })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                      settings.weightUnit === u
                        ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-800 shadow-warm-sm'
                        : 'border-cream-300 bg-cream-50 text-charcoal-600 hover:bg-cream-100'
                    }`}
                  >
                    {u.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Height Units */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Height Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cm', label: 'Centimeters (cm)' },
                  { id: 'ft', label: 'Feet / Inches (ft)' },
                ].map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, heightUnit: h.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                      settings.heightUnit === h.id
                        ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-800 shadow-warm-sm'
                        : 'border-cream-300 bg-cream-50 text-charcoal-600 hover:bg-cream-100'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Carbohydrate Precision */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Carb Calculation Precision
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'decimal', label: 'Single Decimal (32.5g)' },
                  { id: 'round', label: 'Nearest Whole (33g)' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, carbPrecision: p.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                      settings.carbPrecision === p.id
                        ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-800 shadow-warm-sm'
                        : 'border-cream-300 bg-cream-50 text-charcoal-600 hover:bg-cream-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Local Notification Reminders Card */}
        <motion.div variants={itemVariants} className="card-elevated rounded-2xl p-6 bg-white border border-cream-300">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cream-200">
            <Bell className="w-4 h-4 text-plum-600" />
            <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider font-display">
              Care Reminders & In-App Alerts
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                key: 'remindMealCheck',
                title: 'Post-Meal Glucose Reminder',
                desc: 'Alert me to check blood sugar or observe predictions 60-90 minutes following a meal log.',
              },
              {
                key: 'remindMedication',
                title: 'Medication Situational Window',
                desc: 'Prompt situational awareness before peak active-insulin decay completes.',
              },
              {
                key: 'remindEveningReview',
                title: 'Evening Progress Snapshot',
                desc: 'Summary alert to review daily glycemic time-in-range and logged carb balance.',
              },
            ].map((alert) => (
              <div
                key={alert.key}
                className="flex items-center justify-between p-3.5 rounded-xl bg-cream-50/60 border border-cream-200"
              >
                <div className="pr-4">
                  <p className="text-xs font-bold text-charcoal-900">{alert.title}</p>
                  <p className="text-[11px] text-charcoal-500 mt-0.5">{alert.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, [alert.key]: !settings[alert.key] })
                  }
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings[alert.key] ? 'bg-terracotta-500' : 'bg-charcoal-300'
                  }`}
                  role="switch"
                  aria-checked={settings[alert.key]}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      settings[alert.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data & Privacy Controls */}
        <motion.div variants={itemVariants} className="card-elevated rounded-2xl p-6 bg-white border border-cream-300">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-cream-200">
            <Trash2 className="w-4 h-4 text-coral-600" />
            <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider font-display">
              Privacy & Local Storage Control
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-coral-50/60 border border-coral-200">
            <div>
              <p className="text-xs font-bold text-charcoal-900">Reset Local Client Cache</p>
              <p className="text-[11px] text-charcoal-600 mt-0.5 max-w-lg">
                Clears locally stored meal drafts, activity cache, and local preferences on this browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-coral-700 bg-white border border-coral-300 hover:bg-coral-100 hover:text-coral-800 transition-colors shrink-0 shadow-warm-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Data</span>
            </button>
          </div>
        </motion.div>

        {/* Save Bar */}
        <motion.div variants={itemVariants} className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-warm hover:shadow-warm-md transition-all hover:scale-[1.02]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </motion.div>
      </motion.form>

      {/* Confirmation Modal for Delete My Data */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-cream-300 p-6 shadow-warm-lg max-w-md w-full space-y-4"
            >
              <div className="flex items-center gap-3 text-coral-700">
                <div className="w-10 h-10 rounded-2xl bg-coral-100 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-coral-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal-900 font-display">Delete Local Data & Sign Out?</h3>
                  <p className="text-[11px] text-charcoal-500">This action cannot be undone on this device.</p>
                </div>
              </div>

              <p className="text-xs text-charcoal-600 leading-relaxed">
                This will completely wipe your locally cached preferences, stored offline activity logs, and active session tokens from this browser. You will need to sign in again.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-cream-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-coral-600 hover:bg-coral-700 transition-colors shadow-warm-sm"
                >
                  Yes, Delete and Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export default SettingsPage;
