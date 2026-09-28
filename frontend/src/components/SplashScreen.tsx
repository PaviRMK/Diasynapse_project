import React, { useEffect, useState } from 'react';
import diasynapseLogo from '@/assets/diasynapse-logo.png';
import { FloatingParticles } from '@/components/FloatingParticles';
import { ArrowRight, Sparkles, Activity } from 'lucide-react';
import { clinicalAudio } from '@/lib/clinical-sound';

interface SplashScreenProps {
  onComplete?: () => void;
  showContinueButton?: boolean;
  minDurationMs?: number;
}

export function SplashScreen({
  onComplete,
  showContinueButton = true,
  minDurationMs = 2400,
}: SplashScreenProps) {
  const [phase, setPhase] = useState<'entering' | 'pulsing' | 'exiting'>('entering');
  const [statusText, setStatusText] = useState('Initializing DiaSynapse Neural Engine...');
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Play a gentle subtle audio cue on mount
    try {
      clinicalAudio.playClick();
    } catch {}

    const timer1 = setTimeout(() => {
      setPhase('pulsing');
      setStatusText('Calibrating Glycemic & Meal Models...');
      setProgress(55);
    }, 800);

    const timer2 = setTimeout(() => {
      setStatusText('Clinical Companion Ready');
      setProgress(100);
    }, 1800);

    const timer3 = setTimeout(() => {
      setPhase('exiting');
      if (onComplete) {
        setTimeout(onComplete, 450);
      }
    }, minDurationMs);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [minDurationMs, onComplete]);

  const handleManualContinue = () => {
    setPhase('exiting');
    try {
      clinicalAudio.playConfirm();
    } catch {}
    if (onComplete) {
      setTimeout(onComplete, 300);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#13091f] text-foreground select-none overflow-hidden transition-all duration-500 ${
        phase === 'exiting' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Purple Biological Cell Particles */}
      <FloatingParticles />

      {/* Radial Biological Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-primary/25 via-[#8f1d7a]/20 to-transparent rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-primary/20 rounded-full blur-[60px] pointer-events-none" />

      {/* Main Center Stage */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
        {/* Glowing Logo Chamber */}
        <div className="relative mb-6">
          {/* Animated concentric pulse rings */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/30 to-[#e03375]/30 blur-md animate-ping opacity-30" />
          <div className="absolute -inset-2 rounded-2xl bg-primary/20 blur-sm" />

          <div
            className={`relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl bg-[#0e0717] border border-primary/50 shadow-[0_0_40px_rgba(224,51,117,0.35)] p-2 transition-all duration-700 ${
              phase === 'entering'
                ? 'scale-90 opacity-0'
                : 'scale-100 opacity-100'
            }`}
          >
            <img
              src={diasynapseLogo}
              alt="DiaSynapse Logo"
              className="h-full w-full object-contain filter drop-shadow-[0_0_16px_rgba(224,51,117,0.5)] transition-transform duration-700 hover:scale-105"
              draggable={false}
            />
          </div>
        </div>

        {/* Brand Title with smooth transition */}
        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-[11px] font-bold uppercase tracking-widest text-primary mb-2">
            <Sparkles className="h-3 w-3" />
            <span>AI Clinical Decision Companion</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Dia<span className="text-primary font-black drop-shadow-[0_0_12px_rgba(224,51,117,0.5)]">Synapse</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground/90 max-w-xs mx-auto">
            Metabolic Situational Awareness & Glycemic Forecasting
          </p>
        </div>

        {/* Dynamic Progress / Synapse Wave */}
        <div className="w-full max-w-[260px] space-y-2 mb-6">
          <div className="h-1.5 w-full bg-secondary/60 rounded-full overflow-hidden border border-border/40 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-primary via-[#e03375] to-[#f472b6] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(224,51,117,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-primary animate-pulse" />
              {statusText}
            </span>
            <span className="font-mono text-primary font-semibold">{progress}%</span>
          </div>
        </div>

        {/* Optional Skip / Proceed Button */}
        {showContinueButton && (
          <button
            type="button"
            onClick={handleManualContinue}
            className="group flex items-center gap-2 px-5 py-2 rounded-xl bg-secondary/80 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 text-xs font-semibold text-foreground transition-all duration-200 shadow-md hover:shadow-primary/20"
          >
            <span>Enter Clinical Suite</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Medically Focused Footer Signature */}
      <div className="absolute bottom-6 text-center text-[11px] text-muted-foreground/60 tracking-wider">
        <span>STRICT MEDICAL COMPLIANCE &middot; PATIENT-CENTERED TELEMETRY</span>
      </div>
    </div>
  );
}
