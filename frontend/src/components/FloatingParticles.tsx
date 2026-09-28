import React from 'react';

/**
 * Slowly floating background medical-cell and particle shapes.
 * Subtle, non-intrusive, and purely decorative for ambient healthcare depth.
 */
export function FloatingParticles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none opacity-45"
    >
      {/* Soft medical cell 1 (Magenta/Pink glow, top right) */}
      <div
        className="floating-cell-1 absolute -top-24 right-[-5%] h-[480px] w-[480px] rounded-full blur-[80px]"
        style={{
          background: 'radial-gradient(circle, oklch(0.66 0.235 358 / 22%) 0%, oklch(0.42 0.12 335 / 8%) 65%, transparent 80%)',
        }}
      />

      {/* Soft medical cell 2 (Deep Purple/Indigo glow, bottom left) */}
      <div
        className="floating-cell-2 absolute top-[40%] -left-32 h-[520px] w-[520px] rounded-full blur-[90px]"
        style={{
          background: 'radial-gradient(circle, oklch(0.55 0.18 315 / 18%) 0%, oklch(0.35 0.08 300 / 6%) 65%, transparent 80%)',
        }}
      />

      {/* Soft medical cell 3 (Soft Rose-Magenta orb, center right) */}
      <div
        className="floating-cell-3 absolute top-[65%] right-[10%] h-[360px] w-[360px] rounded-full blur-[70px]"
        style={{
          background: 'radial-gradient(circle, oklch(0.70 0.16 350 / 15%) 0%, oklch(0.40 0.10 330 / 5%) 60%, transparent 80%)',
        }}
      />

      {/* Delicate floating cellular micro-particles */}
      <div
        className="floating-cell-2 absolute top-[18%] left-[22%] h-3.5 w-3.5 rounded-full border border-primary/25 bg-primary/10 blur-[0.5px]"
      />
      <div
        className="floating-cell-1 absolute top-[35%] right-[25%] h-5 w-5 rounded-full border border-accent/30 bg-accent/15 blur-[0.5px]"
      />
      <div
        className="floating-cell-3 absolute top-[75%] left-[30%] h-4 w-4 rounded-full border border-primary/30 bg-primary/15 blur-[0.5px]"
      />
      <div
        className="floating-cell-2 absolute top-[55%] right-[38%] h-2.5 w-2.5 rounded-full bg-soft/20 blur-[0.5px]"
      />
      <div
        className="floating-cell-1 absolute top-[85%] right-[18%] h-6 w-6 rounded-full border border-primary/20 bg-secondary/30 blur-[1px]"
      />
    </div>
  );
}
