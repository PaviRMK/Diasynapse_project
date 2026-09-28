import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import diasynapseLogo from '@/assets/diasynapse-logo.png';
import { FloatingParticles } from '@/components/FloatingParticles';
import { Button } from '@/components/ui/button';
import { loginUser, registerUser } from '@/services/api.js';
import { clinicalAudio } from '@/lib/clinical-sound';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
}

const write = (key: string, value: string) => {
  try {
    localStorage.setItem('diasynapse-' + key, value);
    sessionStorage.setItem('diasynapse-' + key, value);
  } catch {}
};

export function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!form.name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (form.password !== form.confirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const res = await registerUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          diabetesType: 'Type 1',
          dob: '2001-01-01',
        });

        if (res?.token) {
          write('token', res.token);
          write(
            'profile',
            JSON.stringify(res.user || { name: form.name.trim(), diabetesType: 'Type 1' })
          );
          try {
            clinicalAudio.playConfirm();
          } catch {}
          // As requested: Signup -> step-by-step onboarding
          navigate({ to: '/onboarding' });
        } else {
          throw new Error('Registration failed. Please check details.');
        }
      } else {
        const res = await loginUser({
          email: form.email.trim(),
          password: form.password,
        });

        if (res?.token) {
          write('token', res.token);
          write('profile', JSON.stringify(res.user || { name: 'Patient' }));
          try {
            clinicalAudio.playConfirm();
          } catch {}
          navigate({ to: '/dashboard' });
        } else {
          throw new Error('Invalid email or password.');
        }
      }
    } catch (err: any) {
      setError(
        err?.message ||
          (mode === 'login'
            ? 'Invalid credentials. Please verify your email and password.'
            : 'Registration request failed. Account may already exist.')
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = async () => {
    setBusy(true);
    setError('');
    try {
      // First try authenticating with demo account
      const demoEmail = 'pavi@diasynapse.med';
      const demoPw = 'clinical2026';
      let token = '';
      let userObj = { name: 'Pavi RMK', diabetesType: 'Type 1', medicationType: 'Insulin' };

      try {
        const res = await loginUser({ email: demoEmail, password: demoPw });
        if (res?.token) {
          token = res.token;
          if (res.user) userObj = res.user;
        }
      } catch {
        // If demo user not yet registered, register it automatically
        try {
          const regRes = await registerUser({
            name: 'Pavi RMK',
            email: demoEmail,
            password: demoPw,
            diabetesType: 'Type 1',
            dob: '2000-01-01',
          });
          if (regRes?.token) {
            token = regRes.token;
            if (regRes.user) userObj = regRes.user;
          }
        } catch {
          // Fallback offline mock token for graceful demo resilience
          token = 'demo_clinical_jwt_session_token_' + Date.now();
        }
      }

      write('token', token || 'demo_clinical_jwt_session_token');
      write('profile', JSON.stringify(userObj));
      try {
        clinicalAudio.playConfirm();
      } catch {}
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      setError('Could not initialize demo login. Please try standard sign-in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-x-hidden">
      {/* Background biological cell particles */}
      <FloatingParticles />

      {/* Atmospheric Radial Gradient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Centered Clinical Authentication Card */}
      <div className="relative z-10 w-full max-w-[460px] rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-primary/10 transition-all duration-300">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0e0717] border border-primary/40 shadow-lg p-2 group-hover:border-primary transition-all duration-300">
              <img
                src={diasynapseLogo}
                alt="DiaSynapse Logo"
                className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(224,51,117,0.4)]"
              />
            </div>
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              Dia<span className="text-primary font-black">Synapse</span>
            </span>
          </Link>

          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary/80 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <span>Encrypted Clinical Gateway</span>
          </div>

          <h2 className="mt-3 text-xl font-bold text-foreground">
            {mode === 'login' ? 'Patient & Clinician Portal' : 'Create Your Clinical Profile'}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            {mode === 'login'
              ? 'Access real-time glucose trajectories, meal AI, and medication telemetry.'
              : 'Join DiaSynapse for personalized XGBoost glycemic situational awareness.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-secondary/60 border border-border/60">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/15 p-3 text-xs text-destructive flex items-start gap-2.5 animate-in fade-in">
            <HeartPulse className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Pavi RMK"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="field pl-[38px] text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                placeholder="name@diasynapse.med"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="field pl-[38px] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="field pl-[38px] pr-10 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="field pl-[38px] text-xs"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={busy}
            className="w-full h-11 font-bold shadow-lg shadow-primary/25 mt-2"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Processing Medical Auth...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            ) : (
              <>
                <span>Continue to Onboarding</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Quick Demo Access for Reviewers & Clinicians */}
        <div className="mt-5 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-xs font-semibold text-foreground transition-all duration-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Instant Demo Access &middot; Pavi RMK (T1D)</span>
          </button>
        </div>

        {/* Footer Medical Disclaimer & Switch Link */}
        <div className="mt-5 text-center text-xs text-muted-foreground">
          {mode === 'login' ? (
            <p>
              New patient or care team?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="font-bold text-primary hover:underline"
              >
                Create an account &rarr;
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="font-bold text-primary hover:underline"
              >
                Log in to portal &rarr;
              </button>
            </p>
          )}

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground/70">
            <Link to="/" className="hover:text-foreground transition-colors">
              &larr; Back to Home
            </Link>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <Stethoscope className="h-3 w-3 text-primary" /> HIPAA & Clinical Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
