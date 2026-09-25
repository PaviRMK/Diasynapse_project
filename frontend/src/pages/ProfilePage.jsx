import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Activity,
  ShieldCheck,
  Check,
  Save,
  LogOut,
  HeartPulse,
  Sparkles,
  Phone,
  Lock,
  Scale,
  Ruler,
  AlertCircle,
  Clock,
  Pill,
  Award,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/PageTransition';

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
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function ProfilePage() {
  const { user, updateProfile, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Load clinical profile from localStorage if existing, else use defaults
  const savedClinical = (() => {
    try {
      const data = localStorage.getItem('diasynapse_clinical_profile');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  })();

  const savedOnboarding = (() => {
    try {
      const data = localStorage.getItem('diasynapse_onboarding');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  })();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    diabetesType: user?.diabetesType || 'Type 1',
    dob: user?.dob || '1995-05-15',
    phone: savedClinical.phone || '+1 (555) 019-2834',
    emergencyContact: savedClinical.emergencyContact || 'Dr. Sarah Lin (Endocrinology)',
    regimen: savedClinical.regimen || (user?.diabetesType === 'Type 2' ? 'Oral Antidiabetic Agents' : 'Multiple Daily Injections (MDI)'),
    cgmDevice: savedClinical.cgmDevice || 'Dexcom G7 CGM',
    targetMin: savedClinical.targetMin || 70,
    targetMax: savedClinical.targetMax || 180,
    dietaryPattern: savedOnboarding.dietaryPreference || savedClinical.dietaryPattern || 'Vegetarian / Low-GI',
    dailyCarbTarget: savedClinical.dailyCarbTarget || 135,
    height: savedOnboarding.height || savedClinical.height || '172 cm',
    weight: savedOnboarding.weight || savedClinical.weight || '68 kg',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync if user object updates from backend
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        diabetesType: user.diabetesType || prev.diabetesType,
        dob: user.dob || prev.dob,
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      // 1. Update backend user profile (name, diabetesType, dob)
      await updateProfile({
        name: formData.name,
        diabetesType: formData.diabetesType,
        dob: formData.dob,
      });

      // 2. Persist extended clinical settings locally
      const clinicalProfile = {
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        regimen: formData.regimen,
        cgmDevice: formData.cgmDevice,
        targetMin: Number(formData.targetMin),
        targetMax: Number(formData.targetMax),
        dietaryPattern: formData.dietaryPattern,
        dailyCarbTarget: Number(formData.dailyCarbTarget),
        height: formData.height,
        weight: formData.weight,
      };
      localStorage.setItem('diasynapse_clinical_profile', JSON.stringify(clinicalProfile));

      // Also update onboarding profile sync
      const onboardingData = {
        ...savedOnboarding,
        diabetesType: formData.diabetesType,
        dob: formData.dob,
        dietaryPreference: formData.dietaryPattern,
      };
      localStorage.setItem('diasynapse_onboarding', JSON.stringify(onboardingData));

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to update clinical profile.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const initials = formData.name
    ? formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'DS';

  return (
    <PageTransition className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Decorative Ambient Background Glows */}
      <div className="ambient-glow w-96 h-96 bg-terracotta-400/15 -top-12 -left-20 pointer-events-none" />
      <div className="ambient-glow w-80 h-80 bg-plum-400/20 top-24 -right-16 pointer-events-none" />

      {/* Page Header */}
      <div className="mb-6 pb-6 border-b border-cream-300 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-plum-100 text-plum-800 border border-plum-200 mb-2">
            <HeartPulse className="w-3.5 h-3.5 text-plum-600" />
            <span>Patient Identity & Clinical Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900 font-display">
            Clinical Profile & Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-2xl">
            Configure your biometric parameters, diabetes protocol classification, and authenticated personal credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-sage-50 text-sage-800 border border-sage-200 shadow-warm-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
            <span>Firebase Secure Session</span>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="mb-6 p-4 rounded-2xl bg-sage-50 border border-sage-200 text-sage-900 shadow-warm-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700 shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">Profile Synchronized</p>
                <p className="text-[11px] text-sage-700">
                  Your clinical profile, personal credentials, and preferences have been updated.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded-md border border-sage-200">
              Live
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-coral-50 border border-coral-200 text-coral-900 shadow-warm-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-coral-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Update Failed</p>
            <p className="mt-0.5 text-coral-700">{errorMessage}</p>
          </div>
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Top Hero Patient Identity Card */}
        <motion.div
          variants={itemVariants}
          className="card-elevated rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-cream-50/40 to-plum-50/20 border border-cream-300 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              {/* Patient Initials Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-terracotta-500 via-terracotta-600 to-plum-700 text-white font-bold text-2xl sm:text-3xl shadow-warm flex items-center justify-center border-2 border-white ring-4 ring-terracotta-100">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sage-500 border-2 border-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 font-display">
                    {formData.name || 'Patient'}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-plum-100 text-plum-800 border border-plum-200 shadow-warm-sm">
                    {formData.diabetesType}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-charcoal-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-charcoal-400" />
                  <span>{formData.email || 'patient@diasynapse.local'}</span>
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-charcoal-600">
                  <span className="inline-flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-terracotta-500" />
                    <span>Regimen: <strong>{formData.regimen}</strong></span>
                  </span>
                  <span className="hidden sm:inline text-cream-400">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-plum-600" />
                    <span>Device: <strong>{formData.cgmDevice}</strong></span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick KPI Stat Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-cream-200/80 shadow-warm-sm">
              <div className="px-3 py-1.5 border-r border-cream-200">
                <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                  Target Range
                </span>
                <span className="text-sm font-bold text-plum-900 font-display">
                  {formData.targetMin}-{formData.targetMax} <span className="text-[10px] text-charcoal-500 font-normal">mg/dL</span>
                </span>
              </div>
              <div className="px-3 py-1.5">
                <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                  Daily Carbs
                </span>
                <span className="text-sm font-bold text-terracotta-600 font-display">
                  ~{formData.dailyCarbTarget} <span className="text-[10px] text-charcoal-500 font-normal">g/day</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Personal & Account Identity */}
          <motion.div variants={itemVariants} className="card-elevated rounded-2xl p-6 bg-white border border-cream-300">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cream-200">
              <User className="w-4 h-4 text-terracotta-600" />
              <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider font-display">
                Personal & Credential Identification
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Full Name <span className="text-terracotta-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter full legal or preferred name"
                  className="input-premium w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 flex items-center justify-between">
                  <span>Registered Email Address</span>
                  <span className="text-[10px] text-charcoal-400 font-normal flex items-center gap-1">
                    <Lock className="w-3 h-3 text-charcoal-400" /> Linked to Firebase Auth
                  </span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  title="Email cannot be changed directly to protect clinical records"
                  className="input-premium w-full text-xs bg-cream-100/60 text-charcoal-500 cursor-not-allowed border-cream-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="input-premium w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Primary Contact Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="input-premium w-full text-xs"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Clinical Protocol & Diabetes Classification */}
          <motion.div variants={itemVariants} className="card-elevated rounded-2xl p-6 bg-white border border-cream-300">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cream-200">
              <Activity className="w-4 h-4 text-plum-600" />
              <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider font-display">
                Clinical Diabetes Classification & Regimen
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Diabetes Classification <span className="text-terracotta-600">*</span>
                </label>
                <select
                  value={formData.diabetesType}
                  onChange={(e) => setFormData({ ...formData, diabetesType: e.target.value })}
                  className="input-premium w-full text-xs bg-white"
                >
                  <option value="Type 1">Type 1 Diabetes (Insulin Dependent)</option>
                  <option value="Type 2">Type 2 Diabetes (Insulin Resistant / Oral / Lifestyle)</option>
                  <option value="LADA">LADA (Latent Autoimmune Diabetes in Adults)</option>
                  <option value="Gestational">Gestational Diabetes</option>
                  <option value="Prediabetes">Prediabetes / Metabolic Risk</option>
                </select>
                <p className="text-[10px] text-charcoal-500 mt-1">
                  Adjusts the biological insulin sensitivity weighting in glucose forecast algorithms.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Therapy Regimen
                </label>
                <select
                  value={formData.regimen}
                  onChange={(e) => setFormData({ ...formData, regimen: e.target.value })}
                  className="input-premium w-full text-xs bg-white"
                >
                  <option value="Multiple Daily Injections (MDI)">Multiple Daily Injections (MDI)</option>
                  <option value="Automated Insulin Delivery (AID/Pump)">Automated Insulin Delivery (AID/Pump)</option>
                  <option value="Continuous Subcutaneous Insulin Infusion (CSII)">Continuous Insulin Infusion (CSII)</option>
                  <option value="Oral Antidiabetic Agents">Oral Antidiabetic Agents (Metformin / SGLT2i / GLP-1)</option>
                  <option value="Lifestyle & Nutritional Therapy">Lifestyle & Nutritional Therapy Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Continuous Glucose Monitor (CGM) / Meter
                </label>
                <select
                  value={formData.cgmDevice}
                  onChange={(e) => setFormData({ ...formData, cgmDevice: e.target.value })}
                  className="input-premium w-full text-xs bg-white"
                >
                  <option value="Dexcom G7 CGM">Dexcom G7 Continuous Glucose Monitor</option>
                  <option value="Dexcom G6 CGM">Dexcom G6 Continuous Glucose Monitor</option>
                  <option value="Abbott FreeStyle Libre 3">Abbott FreeStyle Libre 3 Flash Monitor</option>
                  <option value="Abbott FreeStyle Libre 2">Abbott FreeStyle Libre 2 Flash Monitor</option>
                  <option value="Medtronic Guardian 4">Medtronic Guardian 4 Sensor</option>
                  <option value="Traditional Capillary BGM">Traditional Blood Glucose Meter (Fingerstick)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Primary Endocrinologist / Care Checkpoint
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="e.g. Dr. Sarah Lin (Endocrinology Clinic)"
                  className="input-premium w-full text-xs"
                />
              </div>
            </div>

            {/* Target Glucose Window */}
            <div className="mt-5 pt-4 border-t border-cream-200">
              <label className="block text-xs font-semibold text-charcoal-700 mb-2">
                Clinical Target Glucose Range (mg/dL)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-charcoal-500 font-medium block mb-1">
                    Lower Target Bound (Hypo threshold)
                  </span>
                  <div className="relative">
                    <input
                      type="number"
                      min="50"
                      max="110"
                      value={formData.targetMin}
                      onChange={(e) => setFormData({ ...formData, targetMin: e.target.value })}
                      className="input-premium w-full text-xs pr-12"
                    />
                    <span className="absolute right-3 top-2 text-[11px] text-charcoal-400 font-medium">
                      mg/dL
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-charcoal-500 font-medium block mb-1">
                    Upper Target Bound (Hyper threshold)
                  </span>
                  <div className="relative">
                    <input
                      type="number"
                      min="130"
                      max="250"
                      value={formData.targetMax}
                      onChange={(e) => setFormData({ ...formData, targetMax: e.target.value })}
                      className="input-premium w-full text-xs pr-12"
                    />
                    <span className="absolute right-3 top-2 text-[11px] text-charcoal-400 font-medium">
                      mg/dL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Biometric & Dietary Preferences */}
          <motion.div variants={itemVariants} className="card-elevated rounded-2xl p-6 bg-white border border-cream-300">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cream-200">
              <Scale className="w-4 h-4 text-sage-600" />
              <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider font-display">
                Biometric & Nutritional Target Preferences
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Height
                </label>
                <input
                  type="text"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="e.g. 172 cm"
                  className="input-premium w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Weight
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g. 68 kg"
                  className="input-premium w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Nutritional Pattern
                </label>
                <select
                  value={formData.dietaryPattern}
                  onChange={(e) => setFormData({ ...formData, dietaryPattern: e.target.value })}
                  className="input-premium w-full text-xs bg-white"
                >
                  <option value="Vegetarian / Low-GI">Vegetarian / Low-GI</option>
                  <option value="Balanced Mediterranean">Balanced Mediterranean</option>
                  <option value="Low-Carb High-Protein">Low-Carb High-Protein</option>
                  <option value="Ketogenic (<30g carbs)">Ketogenic (&lt;30g carbs)</option>
                  <option value="Vegan Plant-Based">Vegan Plant-Based</option>
                  <option value="No Specific Restriction">No Specific Restriction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Daily Carb Budget (g)
                </label>
                <input
                  type="number"
                  min="20"
                  max="400"
                  value={formData.dailyCarbTarget}
                  onChange={(e) => setFormData({ ...formData, dailyCarbTarget: e.target.value })}
                  className="input-premium w-full text-xs"
                />
              </div>
            </div>
          </motion.div>

          {/* Card 4: Action Footer */}
          <motion.div
            variants={itemVariants}
            className="card-elevated rounded-2xl p-5 bg-white border border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl border border-coral-200 text-coral-700 text-xs font-bold hover:bg-coral-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Session</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary px-4 py-2.5 text-xs font-semibold"
              >
                Back to Dashboard
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-warm hover:shadow-warm-md disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{loading ? 'Saving Profile...' : 'Save Changes'}</span>
              </button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </PageTransition>
  );
}

export default ProfilePage;
