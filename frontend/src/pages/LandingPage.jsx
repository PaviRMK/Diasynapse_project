import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  TrendingUp,
  Pill,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/PageTransition';

export function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Camera,
      title: 'Meal Photo Recognition',
      desc: 'Point your camera at meals to estimate carbohydrate grams cross-checked against real nutrition databases.',
      color: 'bg-terracotta-100 text-terracotta-700',
    },
    {
      icon: TrendingUp,
      title: '30-Min Glucose Forecast',
      desc: 'Machine learning forecasts your postprandial glucose curve before meals produce unexpected spikes.',
      color: 'bg-plum-100 text-plum-700',
    },
    {
      icon: Pill,
      title: 'Active Insulin Timing',
      desc: 'Situational awareness calculating biological insulin decay so you stay safe between scheduled doses.',
      color: 'bg-sage-100 text-sage-800',
    },
    {
      icon: Activity,
      title: 'Telemetry & Progress',
      desc: 'Track long-term period averages and honest glycemic trends based strictly on your own logged history.',
      color: 'bg-coral-100 text-coral-800',
    },
  ];

  return (
    <PageTransition className="min-h-screen bg-cream-100 relative overflow-hidden flex flex-col justify-between">
      {/* Ambient background glow shapes */}
      <div className="ambient-glow w-96 h-96 bg-terracotta-300/25 top-10 left-1/4 -translate-x-1/2" />
      <div className="ambient-glow w-80 h-80 bg-plum-400/20 top-40 right-10" />
      <div className="ambient-glow w-96 h-96 bg-sage-300/20 bottom-20 left-1/3" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-500 to-terracotta-600 flex items-center justify-center text-white font-bold text-lg shadow-warm">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-charcoal-900 leading-tight">
              Dia<span className="text-terracotta-600">Synapse</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-400 -mt-0.5">
              Supportive Diabetes Care
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-terracotta-500 hover:bg-terracotta-600 shadow-warm transition-all hover:scale-[1.02]"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-xs font-semibold text-charcoal-700 hover:text-charcoal-900 px-3.5 py-2 rounded-xl hover:bg-white/60 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-terracotta-500 hover:bg-terracotta-600 shadow-warm hover:shadow-warm-md transition-all hover:scale-[1.02]"
              >
                <span>Get Started</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto">
          {/* Subtle status tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 border border-cream-300 text-terracotta-700 shadow-warm-sm mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
            <span>AI Clinical Decision Intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
            <span className="text-charcoal-500 font-normal">FastAPI + XGBoost</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-charcoal-900 leading-[1.12]"
          >
            Clinical clarity for your daily{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta-600 via-terracotta-500 to-plum-600">
              diabetes management.
            </span>
          </motion.h1>

          {/* Value statement */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-sm sm:text-base text-charcoal-600 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Analyze meal photos with computer vision, forecast post-meal glucose 30 minutes in advance, and maintain calm medication situational awareness.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white bg-terracotta-500 hover:bg-terracotta-600 shadow-warm-md hover:shadow-warm-lg transition-all hover:scale-[1.02]"
              >
                <span>Enter Your Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white bg-terracotta-500 hover:bg-terracotta-600 shadow-warm-md hover:shadow-warm-lg transition-all hover:scale-[1.02]"
                >
                  <span>Get Started with DiaSynapse</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/auth"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-charcoal-800 bg-white/90 hover:bg-white border border-cream-300 shadow-warm-sm transition-all hover:border-cream-400"
                >
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Hero Visual Collage & Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 max-w-4xl mx-auto w-full bg-white/80 backdrop-blur-md rounded-2xl border border-cream-300 p-4 sm:p-6 shadow-warm-lg relative"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Visual 1: Real Food Photo Card */}
            <div className="bg-white rounded-xl border border-cream-200 overflow-hidden shadow-warm-sm">
              <div className="relative h-36 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                  alt="Healthy Vegetable Khichdi Meal"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-charcoal-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                  Meal Analysis
                </span>
                <span className="absolute bottom-2 right-2 bg-terracotta-500 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                  32.5g carbs
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-charcoal-900">Quinoa Veggie Bowl</p>
                <p className="text-[11px] text-sage-700 font-medium mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-sage-600" />
                  RAG Database Verified
                </p>
              </div>
            </div>

            {/* Visual 2: Forecast Curve Card */}
            <div className="bg-gradient-to-br from-cream-50 to-terracotta-50/50 rounded-xl border border-cream-300 p-3.5 flex flex-col justify-between shadow-warm-sm">
              <div>
                <span className="text-[10px] uppercase font-bold text-terracotta-700 tracking-wider">
                  Postprandial Forecast
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-charcoal-900 metric-number">
                    164
                  </span>
                  <span className="text-xs font-semibold text-charcoal-500">mg/dL in 30m</span>
                </div>
                <span className="inline-block text-[10px] font-semibold text-terracotta-700 bg-terracotta-100/80 px-2 py-0.5 rounded mt-1">
                  AI-Estimated (XGBoost)
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-cream-200 text-[11px] text-charcoal-600 flex items-center justify-between">
                <span>Curve trend:</span>
                <span className="font-semibold text-sage-700">Stable within target</span>
              </div>
            </div>

            {/* Visual 3: Medication Ring Card */}
            <div className="bg-white rounded-xl border border-cream-200 p-3.5 flex flex-col justify-between shadow-warm-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-plum-700 tracking-wider">
                  Insulin Status
                </span>
                <span className="text-[10px] font-semibold text-plum-600 bg-plum-50 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
              <div className="my-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-plum-500 border-t-cream-300 flex items-center justify-center font-bold text-xs text-plum-800">
                  69%
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-900">Active Insulin</p>
                  <p className="text-[10px] text-charcoal-500">Decay in progress</p>
                </div>
              </div>
              <p className="text-[10px] text-charcoal-500 italic border-t border-cream-100 pt-2">
                "Caution advised before heavy carbs"
              </p>
            </div>
          </div>
        </motion.div>

        {/* 4 Feature Highlights Grid */}
        <section className="mt-16 pt-8 border-t border-cream-300/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/80 rounded-2xl border border-cream-300 p-5 shadow-warm-sm hover:shadow-warm transition-all"
                >
                  <div className={`w-9 h-9 rounded-xl ${feat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-charcoal-900 mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-charcoal-600 font-normal leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Simple, warm footer */}
      <footer className="relative z-10 border-t border-cream-300 bg-white/70 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-terracotta-600" />
            <span>DiaSynapse Medical Intelligence · Situational Awareness Platform</span>
          </div>
          <p className="text-center sm:text-right text-[11px] text-charcoal-400 max-w-md">
            For personal management support only. Does not replace prescribed medical advice from your endocrinologist.
          </p>
        </div>
      </footer>
    </PageTransition>
  );
}
