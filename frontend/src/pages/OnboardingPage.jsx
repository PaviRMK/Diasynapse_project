import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Calendar,
  Ruler,
  Utensils,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Heart,
  Scale,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/PageTransition';

export function OnboardingPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Onboarding data state initialized from user or defaults
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('diasynapse_onboarding');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      diabetesType: user?.diabetesType || 'Type 1',
      dob: user?.dob || '1995-05-15',
      heightUnit: 'cm', // 'cm' | 'ft'
      heightCm: 172,
      heightFt: 5,
      heightIn: 8,
      weightUnit: 'kg', // 'kg' | 'lbs'
      weightKg: 68,
      weightLbs: 150,
      dietaryPreference: 'Vegetarian',
      primaryGoal: 'Balance blood sugar',
    };
  });

  const nextStep = () => {
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      finishOnboarding();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const finishOnboarding = async () => {
    try {
      localStorage.setItem('diasynapse_onboarding', JSON.stringify(data));
      // Persist to user profile if user is authenticated
      if (user && updateProfile) {
        await updateProfile({
          diabetesType: data.diabetesType,
          dob: data.dob,
          dietaryPreference: data.dietaryPreference,
          primaryGoal: data.primaryGoal,
          height: data.heightUnit === 'cm' ? `${data.heightCm} cm` : `${data.heightFt}'${data.heightIn}"`,
          weight: data.weightUnit === 'kg' ? `${data.weightKg} kg` : `${data.weightLbs} lbs`,
        });
      }
    } catch (e) {
      console.warn('Could not save profile during onboarding:', e);
    }
    navigate('/dashboard');
  };

  const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <PageTransition className="relative min-h-screen bg-cream-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative Ambient Background Glows */}
      <div className="ambient-glow w-96 h-96 bg-terracotta-400/20 -top-12 -left-20 pointer-events-none" />
      <div className="ambient-glow w-80 h-80 bg-plum-400/20 top-24 -right-16 pointer-events-none" />

      {/* Top Header & Progress */}
      <div className="max-w-xl mx-auto w-full relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-terracotta-500 to-terracotta-600 text-white font-bold text-sm flex items-center justify-center shadow-warm">
              D
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-display">
              Personalized Setup
            </span>
          </div>
          <span className="text-xs font-semibold text-charcoal-500">
            Step {step} of {totalSteps}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-cream-300">
          <motion.div
            className="bg-gradient-to-r from-terracotta-500 to-plum-600 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Main Step Content Card */}
      <div className="max-w-xl mx-auto w-full my-6 relative z-10">
        <div className="card-elevated rounded-3xl p-6 sm:p-8 bg-white border border-cream-300 shadow-warm-lg">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
                    Question 1
                  </span>
                  <h2 className="text-xl font-bold text-charcoal-900 mt-1">
                    Which diabetes diagnosis best describes your clinical journey?
                  </h2>
                  <p className="text-xs text-charcoal-500 mt-1">
                    This helps DiaSynapse adjust insulin sensitivity assumptions and meal target ranges.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {[
                    {
                      id: 'Type 1',
                      title: 'Type 1 Diabetes',
                      desc: 'Autoimmune diagnosis requiring intensive daily insulin management.',
                    },
                    {
                      id: 'Type 2',
                      title: 'Type 2 Diabetes',
                      desc: 'Insulin resistance managed with oral medications, lifestyle, or basal insulin.',
                    },
                    {
                      id: 'Prediabetes',
                      title: 'Prediabetes',
                      desc: 'Elevated glucose levels focused on preventative carbohydrate moderation.',
                    },
                    {
                      id: 'Not sure',
                      title: 'Not sure / In Evaluation',
                      desc: 'Currently undergoing tests or tracking glucose for general metabolic health.',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setData({ ...data, diabetesType: opt.id })}
                      className={`w-full p-4 rounded-xl text-left border transition-all flex items-start justify-between ${
                        data.diabetesType === opt.id
                          ? 'border-terracotta-500 bg-terracotta-50/70 shadow-warm-sm'
                          : 'border-cream-300 bg-cream-50/50 hover:bg-cream-100 hover:border-cream-400'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-charcoal-900">{opt.title}</p>
                        <p className="text-xs text-charcoal-500 mt-0.5">{opt.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          data.diabetesType === opt.id
                            ? 'border-terracotta-500 bg-terracotta-500 text-white'
                            : 'border-charcoal-300'
                        }`}
                      >
                        {data.diabetesType === opt.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
                    Question 2
                  </span>
                  <h2 className="text-xl font-bold text-charcoal-900 mt-1">
                    What is your date of birth?
                  </h2>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Age influences basal metabolic rate, hormonal dawn spikes, and physical activity guidelines.
                  </p>
                </div>

                <div className="pt-4">
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={data.dob}
                    onChange={(e) => setData({ ...data, dob: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-terracotta-500 focus:border-terracotta-500 transition-colors"
                  />
                  <div className="mt-4 p-3.5 rounded-xl bg-cream-50 border border-cream-200 text-xs text-charcoal-600 flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-terracotta-500 shrink-0" />
                    <span>Your clinical data remains private and stored in your authenticated profile.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
                    Question 3
                  </span>
                  <h2 className="text-xl font-bold text-charcoal-900 mt-1">
                    What are your current height and weight?
                  </h2>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Used to compute body surface estimates for carbohydrate disposal rates.
                  </p>
                </div>

                {/* Height input with unit toggle */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-charcoal-700">Height</label>
                    <div className="inline-flex rounded-lg bg-cream-200 p-0.5 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setData({ ...data, heightUnit: 'cm' })}
                        className={`px-2.5 py-0.5 rounded-md transition-all ${
                          data.heightUnit === 'cm' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600'
                        }`}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        onClick={() => setData({ ...data, heightUnit: 'ft' })}
                        className={`px-2.5 py-0.5 rounded-md transition-all ${
                          data.heightUnit === 'ft' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600'
                        }`}
                      >
                        ft/in
                      </button>
                    </div>
                  </div>

                  {data.heightUnit === 'cm' ? (
                    <div className="relative">
                      <input
                        type="number"
                        value={data.heightCm}
                        onChange={(e) => setData({ ...data, heightCm: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-charcoal-400 font-semibold">
                        cm
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type="number"
                          value={data.heightFt}
                          onChange={(e) => setData({ ...data, heightFt: Number(e.target.value) })}
                          placeholder="Feet"
                          className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-900"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-charcoal-400 font-semibold">
                          ft
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={data.heightIn}
                          onChange={(e) => setData({ ...data, heightIn: Number(e.target.value) })}
                          placeholder="Inches"
                          className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-900"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-charcoal-400 font-semibold">
                          in
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Weight input with unit toggle */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-charcoal-700">Weight</label>
                    <div className="inline-flex rounded-lg bg-cream-200 p-0.5 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setData({ ...data, weightUnit: 'kg' })}
                        className={`px-2.5 py-0.5 rounded-md transition-all ${
                          data.weightUnit === 'kg' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600'
                        }`}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setData({ ...data, weightUnit: 'lbs' })}
                        className={`px-2.5 py-0.5 rounded-md transition-all ${
                          data.weightUnit === 'lbs' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600'
                        }`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={data.weightUnit === 'kg' ? data.weightKg : data.weightLbs}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (data.weightUnit === 'kg') {
                          setData({ ...data, weightKg: val, weightLbs: Math.round(val * 2.20462) });
                        } else {
                          setData({ ...data, weightLbs: val, weightKg: Math.round(val / 2.20462) });
                        }
                      }}
                      className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-charcoal-400 font-semibold">
                      {data.weightUnit}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
                    Question 4
                  </span>
                  <h2 className="text-xl font-bold text-charcoal-900 mt-1">
                    What is your primary dietary preference?
                  </h2>
                  <p className="text-xs text-charcoal-500 mt-1">
                    We will automatically pre-filter recipe libraries and meal suggestions based on this.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {[
                    {
                      id: 'I eat everything',
                      title: 'I eat everything',
                      desc: 'Omnivore meal options including lean poultry, seafood, legumes, and dairy.',
                    },
                    {
                      id: 'Vegetarian',
                      title: 'Vegetarian',
                      desc: 'Plant-forward dishes with lentils, paneer, and wholesome milk/yogurt.',
                    },
                    {
                      id: 'Vegan',
                      title: 'Vegan',
                      desc: '100% plant-derived meals with zero animal products or dairy.',
                    },
                    {
                      id: 'Eggetarian',
                      title: 'Eggetarian',
                      desc: 'Vegetarian diet enhanced with whole eggs for low-carb protein density.',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setData({ ...data, dietaryPreference: opt.id })}
                      className={`w-full p-4 rounded-xl text-left border transition-all flex items-start justify-between ${
                        data.dietaryPreference === opt.id
                          ? 'border-terracotta-500 bg-terracotta-50/70 shadow-warm-sm'
                          : 'border-cream-300 bg-cream-50/50 hover:bg-cream-100 hover:border-cream-400'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-charcoal-900">{opt.title}</p>
                        <p className="text-xs text-charcoal-500 mt-0.5">{opt.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          data.dietaryPreference === opt.id
                            ? 'border-terracotta-500 bg-terracotta-500 text-white'
                            : 'border-charcoal-300'
                        }`}
                      >
                        {data.dietaryPreference === opt.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-plum-600">
                    Question 5
                  </span>
                  <h2 className="text-xl font-bold text-charcoal-900 mt-1">
                    What is your primary goal right now?
                  </h2>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Choose what matters most in your daily diabetes management routine.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {[
                    {
                      id: 'Balance blood sugar',
                      title: 'Balance blood sugar spikes',
                      desc: 'Focus on postprandial stability and lowering glycemic volatility.',
                    },
                    {
                      id: 'Manage weight',
                      title: 'Manage weight & carb density',
                      desc: 'Target mindful portion controls and sustained cellular satiety.',
                    },
                    {
                      id: 'Build healthy habits',
                      title: 'Build consistent daily habits',
                      desc: 'Stick to regular meal photography logs, walks, and timing checks.',
                    },
                    {
                      id: 'Just tracking',
                      title: 'Passive logging & tracking',
                      desc: 'Build telemetry history and observe trends over weekly intervals.',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setData({ ...data, primaryGoal: opt.id })}
                      className={`w-full p-4 rounded-xl text-left border transition-all flex items-start justify-between ${
                        data.primaryGoal === opt.id
                          ? 'border-plum-500 bg-plum-50/60 shadow-warm-sm'
                          : 'border-cream-300 bg-cream-50/50 hover:bg-cream-100 hover:border-cream-400'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-charcoal-900">{opt.title}</p>
                        <p className="text-xs text-charcoal-500 mt-0.5">{opt.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          data.primaryGoal === opt.id
                            ? 'border-plum-500 bg-plum-500 text-white'
                            : 'border-charcoal-300'
                        }`}
                      >
                        {data.primaryGoal === opt.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-cream-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-700 bg-cream-100 hover:bg-cream-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={nextStep}
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-warm hover:shadow-warm-md transition-all hover:scale-[1.02]"
            >
              <span>{step === totalSteps ? 'Complete & Enter App' : 'Next Question'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-charcoal-400 max-w-md mx-auto">
        You can always adjust these settings at any time in your Profile and App Settings.
      </div>
    </PageTransition>
  );
}
