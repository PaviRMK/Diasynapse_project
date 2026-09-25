import React, { useState } from 'react';
import {
  Dumbbell,
  Clock,
  Sparkles,
  ShieldAlert,
  HeartPulse,
  Activity,
  ChevronRight,
  Flame,
  CheckCircle2,
  X,
  Play,
  Zap,
  Info,
  ArrowRight,
  Target,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import exercisesData from '../data/exercises.json';
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

export function ExercisePage() {
  const [selectedIntensity, setSelectedIntensity] = useState('All');
  const [activeExercise, setActiveExercise] = useState(null);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const intensities = ['All', 'Gentle', 'Low-Moderate', 'Moderate'];

  const filteredExercises = exercisesData.filter((ex) => {
    if (selectedIntensity === 'All') return true;
    return ex.intensity === selectedIntensity;
  });

  return (
    <PageTransition className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Decorative Ambient Background Glows */}
      <div className="ambient-glow w-96 h-96 bg-plum-400/15 -top-12 -left-20 pointer-events-none" />
      <div className="ambient-glow w-80 h-80 bg-terracotta-400/15 top-24 -right-16 pointer-events-none" />

      {/* Header Banner */}
      <div className="mb-6 pb-6 border-b border-cream-300 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-plum-100 text-plum-800 border border-plum-200 mb-2">
            <Dumbbell className="w-3.5 h-3.5 text-plum-600" />
            <span>Metabolic Movement & Insulin Sensitivity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900 font-display">
            Movement for Glycemic Balance
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-2xl">
            Physical contraction triggers skeletal muscle GLUT4 translocation independent of insulin, accelerating glucose clearance and moderating post-meal surges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-terracotta-50 text-terracotta-800 border border-terracotta-200 shadow-warm-sm">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
            <span>GLUT4 Glucose Translocation</span>
          </span>
        </div>
      </div>

      {/* Clinical Safety & Medical Guidance Callout */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 shadow-warm-sm flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <p className="font-bold text-sm font-display text-amber-950">Clinical Exercise Safety Protocol</p>
          <p className="mt-1 text-amber-800 leading-relaxed">
            Do not engage in physical activity if blood glucose is below <strong>70 mg/dL</strong> (hypoglycemia) or higher than <strong>250 mg/dL</strong> with ketones present. Always ensure you have fast-acting oral carbohydrates (e.g. 15g dextrose tablets or juice) easily accessible, and consult your medical care team prior to altering your physical training regimen.
          </p>
        </div>
      </div>

      {/* 3 Glycemic Physiology Mechanism Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card-elevated rounded-2xl p-4 bg-white border border-cream-300 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-plum-100 flex items-center justify-center text-plum-700 shrink-0 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-charcoal-900 font-display">15–30m Post-Meal</h4>
            <p className="text-[11px] text-charcoal-500 mt-0.5 leading-normal">
              Optimal window to walk or move; blunts insulin peak when food digests.
            </p>
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-4 bg-white border border-cream-300 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-terracotta-100 flex items-center justify-center text-terracotta-700 shrink-0 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-charcoal-900 font-display">Insulin-Free Uptake</h4>
            <p className="text-[11px] text-charcoal-500 mt-0.5 leading-normal">
              Contracting muscles absorb blood sugar directly from circulation.
            </p>
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-4 bg-white border border-cream-300 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage-100 flex items-center justify-center text-sage-800 shrink-0 mt-0.5">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-charcoal-900 font-display">24-Hour Sensitivity</h4>
            <p className="text-[11px] text-charcoal-500 mt-0.5 leading-normal">
              Enhanced cellular insulin responsiveness persists for 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-xs font-semibold text-charcoal-500 mr-1">Intensity Level:</span>
        {intensities.map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => setSelectedIntensity(lvl)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedIntensity === lvl
                ? 'bg-plum-800 text-white shadow-warm-sm'
                : 'bg-white text-charcoal-600 hover:bg-cream-100 border border-cream-300'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Activity Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredExercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="card-elevated rounded-2xl overflow-hidden bg-white border border-cream-300 shadow-warm-sm hover:shadow-warm transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image banner */}
              <div className="relative h-48 w-full overflow-hidden bg-cream-200">
                <img
                  src={exercise.image}
                  alt={exercise.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/20 to-transparent" />

                <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-plum-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-warm-sm border border-cream-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-plum-600" />
                  {exercise.duration}
                </span>

                <span className="absolute top-3 left-3 bg-charcoal-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {exercise.intensity}
                </span>

                <div className="absolute bottom-2.5 left-3 text-[11px] font-medium text-white/95 flex items-center gap-1">
                  <Target className="w-3 h-3 text-terracotta-300" />
                  <span>{exercise.timing}</span>
                </div>
              </div>

              {/* Details Content */}
              <div className="p-5 space-y-3.5">
                <h3 className="text-base font-bold text-charcoal-900 leading-snug group-hover:text-plum-800 transition-colors font-display">
                  {exercise.title}
                </h3>

                {/* Glucose Impact Note */}
                <div className="p-3 rounded-xl bg-plum-50/70 border border-plum-100">
                  <span className="text-[10px] uppercase font-bold text-plum-700 tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3 text-plum-600" />
                    Glycemic Physiological Effect
                  </span>
                  <p className="text-xs text-charcoal-700 font-medium mt-1 leading-relaxed">
                    {exercise.glucoseImpact}
                  </p>
                </div>

                {/* Practical Steps Sneak-peek */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
                    Routine Steps ({exercise.steps.length})
                  </span>
                  <ul className="mt-1.5 space-y-1">
                    {exercise.steps.slice(0, 2).map((st, i) => (
                      <li key={i} className="text-xs text-charcoal-600 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-5 pt-0">
              <button
                type="button"
                onClick={() => setActiveExercise(exercise)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-charcoal-800 bg-cream-50 hover:bg-plum-50 hover:text-plum-800 border border-cream-300 hover:border-plum-200 transition-all text-center flex items-center justify-center gap-1.5 shadow-warm-sm"
              >
                <span>View Full Protocol & Guidance</span>
                <ArrowRight className="w-3.5 h-3.5 text-plum-600" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {activeExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-warm-lg border border-cream-300 p-6 relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveExercise(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-600 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-plum-100 text-plum-800">
                  {activeExercise.intensity}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-charcoal-600 bg-cream-100">
                  {activeExercise.duration}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 font-display">
                {activeExercise.title}
              </h2>
              <p className="text-xs text-charcoal-500 mt-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-terracotta-500" />
                <span>Recommended timing: <strong>{activeExercise.timing}</strong></span>
              </p>

              {/* Clinical Note Quote */}
              {activeExercise.clinicalNote && (
                <div className="mt-4 p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-charcoal-700 leading-relaxed flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-plum-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-plum-900 uppercase text-[10px] tracking-wider block mb-0.5">
                      Clinical Evidence Note
                    </span>
                    <p>{activeExercise.clinicalNote}</p>
                  </div>
                </div>
              )}

              {/* Glycemic Mechanism */}
              <div className="mt-4 p-4 rounded-2xl bg-plum-50/70 border border-plum-100 text-xs">
                <span className="font-bold text-plum-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-plum-600" />
                  Metabolic Mechanism
                </span>
                <p className="text-charcoal-700 leading-relaxed">
                  {activeExercise.glucoseImpact}
                </p>
              </div>

              {/* Routine Instructions */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-3">
                  Step-by-Step Instructions
                </h3>
                <div className="space-y-3">
                  {activeExercise.steps.map((st, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-cream-50/70 border border-cream-200">
                      <div className="w-5 h-5 rounded-full bg-plum-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-xs text-charcoal-800 font-medium leading-relaxed">
                        {st}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Checklist Footer */}
              <div className="mt-6 pt-5 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] text-charcoal-500">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Check CGM/meter reading before starting.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveExercise(null)}
                  className="btn-primary w-full sm:w-auto px-5 py-2 text-xs font-bold"
                >
                  Done Reading
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export default ExercisePage;
