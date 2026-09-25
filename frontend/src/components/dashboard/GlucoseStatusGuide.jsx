import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function GlucoseStatusGuide({
  currentGlucose = null,
  isValid = false,
  targets = { lowThreshold: 70, highThreshold: 180 },
}) {
  const prefersReducedMotion = useReducedMotion();
  const { lowThreshold = 70, highThreshold = 180 } = targets;

  // Calculate dynamic pin position along the 3-zone scale:
  // Low zone: 0% - 22%
  // In-range zone: 22% - 68% (span of 46%)
  // High zone: 68% - 100% (span of 32%)
  let pinPercent = null;
  if (isValid && currentGlucose !== null && !isNaN(currentGlucose)) {
    const val = Number(currentGlucose);
    if (val <= lowThreshold) {
      pinPercent = Math.max(3, Math.min(22, 3 + ((val - 40) / (lowThreshold - 40)) * 19));
    } else if (val <= highThreshold) {
      pinPercent = 22 + ((val - lowThreshold) / (highThreshold - lowThreshold)) * 46;
    } else {
      pinPercent = Math.min(97, 68 + ((val - highThreshold) / (280 - highThreshold)) * 29);
    }
  }

  return (
    <div className="w-full max-w-[340px] sm:max-w-[400px]">
      {/* Continuous 3-zone status bar with dynamic marker */}
      <div className="relative h-2 bg-[#0B2342] rounded-full w-full overflow-visible">
        {/* Low zone */}
        <div
          className="absolute left-0 top-0 h-2 rounded-l-full bg-[#5f7896]"
          style={{ width: '22%' }}
          title="Low zone"
        />
        {/* In-range zone */}
        <div
          className="absolute top-0 h-2 bg-[#3ba06a]"
          style={{ left: '22%', width: '46%' }}
          title="In range target zone"
        />
        {/* High zone */}
        <div
          className="absolute top-0 h-2 rounded-r-full bg-[#B52B3A]"
          style={{ left: '68%', width: '32%' }}
          title="High zone"
        />

        {/* Dynamic Current Value Marker Pin */}
        {pinPercent !== null && (
          <motion.div
            initial={{ left: prefersReducedMotion ? `${pinPercent}%` : '50%' }}
            animate={{ left: `${pinPercent}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -top-[5px] w-[2px] h-[18px] bg-white shadow-[0_0_6px_rgba(255,255,255,0.85)] z-10 pointer-events-none -translate-x-1/2"
            style={{ left: `${pinPercent}%` }}
            title={`Current: ${currentGlucose} mg/dL`}
          />
        )}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between w-full text-[10px] text-[#708198] mt-1.5 font-normal select-none">
        <span>Low</span>
        <span>In range</span>
        <span>High</span>
      </div>
    </div>
  );
}
