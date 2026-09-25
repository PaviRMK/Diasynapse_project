import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Pill, ChevronRight, Info } from 'lucide-react';
import { CountUp } from '../CountUp';

export function MedicationAwareness({ activeInsulin }) {
  const prefersReducedMotion = useReducedMotion();

  // Consistent source of truth
  const insulinPercent = activeInsulin?.percent ?? 0;
  const clampedPercent = Math.max(0, Math.min(100, insulinPercent));

  // Circular ring geometry
  const radius = 40;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
      className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E8EDF3] shadow-[0_4px_16px_rgba(7,26,51,0.03)] flex flex-col justify-between"
      aria-labelledby="medication-awareness-heading"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B52B3A]/10 border border-[#B52B3A]/20 flex items-center justify-center text-[#B52B3A] shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 id="medication-awareness-heading" className="text-base sm:text-lg font-bold text-[#071A33]">
                Medication awareness
              </h2>
              <p className="text-xs text-[#708198] mt-0.5">
                Situational awareness based on your logged timing.
              </p>
            </div>
          </div>

          <Link
            to="/medication"
            className="text-xs font-semibold text-[#B52B3A] hover:text-[#8F1D2C] transition-colors flex items-center gap-1 shrink-0 pt-1"
          >
            <span>View timing details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Split: Circular Progress Ring & Administration Timing */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-2">
          
          {/* Circular Progress Ring */}
          <div className="sm:col-span-5 flex items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Light gray inactive track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#E8EDF3"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Animated crimson active progress */}
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
                <span className="text-2xl font-black text-[#071A33] font-mono leading-none">
                  <CountUp end={clampedPercent} duration={1.1} suffix="%" />
                </span>
                <span className="text-[10px] font-semibold text-[#708198] uppercase tracking-wider mt-1">
                  Active insulin
                </span>
              </div>
            </div>
          </div>

          {/* Administration Window & Pharmacokinetics Note */}
          <div className="sm:col-span-7 space-y-2.5">
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E8EDF3]">
              <span className="text-[11px] font-bold text-[#071A33] block mb-1 uppercase tracking-wider">
                Scheduled Administration Window
              </span>
              <p className="text-xs text-[#708198] leading-relaxed">
                {activeInsulin?.timingNote}
              </p>
            </div>

            <p className="text-[11px] text-[#708198] leading-relaxed px-1">
              {activeInsulin?.riskNote}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Disclaimer Notice (Calm information panel, never frightening red box) */}
      <div className="mt-6 pt-4 border-t border-[#E8EDF3]">
        <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E8EDF3] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#708198] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#708198] leading-relaxed">
            <span className="font-semibold text-[#0B2342] block mb-0.5">
              Clinical Situational Notice
            </span>
            {activeInsulin?.disclaimer}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
