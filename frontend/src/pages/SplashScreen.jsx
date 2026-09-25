import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function SplashScreen() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ background: 'linear-gradient(160deg, #FAF8F5 0%, #F4EFE6 50%, #F9EAE1 100%)' }}>
      
      {/* Ambient blobs */}
      <div className="ambient-glow w-64 h-64 bg-terracotta-300/30" style={{ top: '10%', left: '15%' }} />
      <div className="ambient-glow w-48 h-48 bg-plum-400/20" style={{ top: '20%', right: '10%' }} />
      <div className="ambient-glow w-56 h-56 bg-sage-300/25" style={{ bottom: '15%', left: '30%' }} />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo mark with pulse ring */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 18 }}
          className="relative mb-6"
        >
          {/* Outer pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-3xl"
            style={{ background: 'rgba(200, 90, 50, 0.25)' }}
          />
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-warm-lg relative"
            style={{ background: 'linear-gradient(135deg, #C85A32 0%, #9B3E1F 100%)' }}
          >
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}>D</span>
          </div>
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-center"
        >
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}
            className="text-3xl font-extrabold text-charcoal-900">
            Dia<span className="text-terracotta-600">Synapse</span>
          </h1>
          <p className="text-xs font-semibold tracking-widest uppercase text-charcoal-400 mt-1.5">
            Supportive Diabetes Management
          </p>
        </motion.div>

        {/* Animated loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="flex gap-2 mt-10"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
              className="w-2 h-2 rounded-full bg-terracotta-400"
            />
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-xs text-charcoal-400 mt-5 font-medium"
        >
          Powered by XGBoost · Gemini Vision · CrewAI
        </motion.p>
      </div>
    </div>
  );
}
