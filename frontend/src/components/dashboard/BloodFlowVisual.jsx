import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function BloodFlowVisual() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="relative w-[110px] h-[110px] sm:w-[124px] sm:h-[124px] rounded-full overflow-hidden shrink-0 select-none shadow-[0_0_24px_rgba(181,43,58,0.35)] border border-[#D95C68]/30"
      style={{
        background: '#071A33',
      }}
      aria-label="Microscopic erythrocyte flux and glycemic monitoring visualization"
    >
      {/* Background biological erythrocytes with calm, subtle breathing motion */}
      <motion.div
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: [1, 1.05, 1],
                rotate: [0, 2, 0],
              }
        }
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-full h-full"
      >
        <img
          src="/blood-cells.jpg"
          alt="Microscopic erythrocytes visualization"
          className="w-full h-full object-cover object-center filter brightness-95 contrast-110"
          loading="lazy"
        />
      </motion.div>

      {/* Organic radial gradient vignette matching reference design palette */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-color"
        style={{
          background:
            'radial-gradient(circle at 40% 35%, rgba(217, 92, 104, 0.45) 0%, rgba(143, 29, 44, 0.75) 65%, #071A33 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 40% 35%, rgba(217, 92, 104, 0.25) 0%, rgba(143, 29, 44, 0.45) 60%, rgba(7, 26, 51, 0.95) 100%)',
        }}
      />

      {/* Subtle micro floating light accent */}
      <div className="absolute top-[28%] left-[32%] w-1.5 h-1.5 rounded-full bg-white/70 blur-[0.6px] pointer-events-none" />
    </div>
  );
}
