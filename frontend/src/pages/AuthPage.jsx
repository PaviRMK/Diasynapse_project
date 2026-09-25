import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, loading, user } = useAuth();

  const [isLogin, setIsLogin] = useState(
    location?.state?.mode === 'signup' ? false : true
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('diasynapse_remember') === 'true';
  });

  const [formData, setFormData] = useState({
    name: '',
    email: localStorage.getItem('diasynapse_saved_email') || '',
    password: '',
    diabetesType: 'Type 1',
    dob: '',
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [forgotNotice, setForgotNotice] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name.trim()) errs.name = 'Full name is required';
      if (!formData.dob) errs.dob = 'Date of birth is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (rememberMe) {
      localStorage.setItem('diasynapse_remember', 'true');
      localStorage.setItem('diasynapse_saved_email', formData.email.trim());
    } else {
      localStorage.removeItem('diasynapse_remember');
      localStorage.removeItem('diasynapse_saved_email');
    }

    try {
      if (isLogin) {
        await login(formData.email.trim(), formData.password);
      } else {
        await signup({ ...formData, email: formData.email.trim() });
      }
      navigate('/dashboard');
    } catch (err) {
      setErrors({ form: err.message || 'Authentication failed. Please verify your credentials.' });
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FFFFFF] font-sans antialiased text-[#071A33] selection:bg-[#B52B3A]/15 selection:text-[#8F1D2C]">
      
      {/* ── LEFT SIDE: Brand & Medical Blood-Cell Visual (48-52%) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full lg:w-[50%] min-h-[220px] sm:min-h-[280px] lg:min-h-screen bg-[#071A33] relative flex flex-col justify-between overflow-hidden p-6 sm:p-10 lg:p-14 select-none"
      >
        {/* Deep ambient crimson & navy gradients */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 40% 45%, rgba(181, 43, 58, 0.16) 0%, rgba(11, 35, 66, 0.4) 45%, rgba(7, 26, 51, 0.98) 100%)',
          }}
        />

        {/* High-definition blood cell imagery with subtle floating motion */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.015, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        >
          <img
            src="/blood-cells.jpg"
            alt="Microscopic Erythrocyte Blood Glucose Monitoring Visualization"
            className="w-full h-full object-cover object-center opacity-80 mix-blend-screen scale-105 filter brightness-95 contrast-110"
          />

          {/* Vignette gradients to seamlessly ground the visual in Deep Navy */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A33] via-transparent to-[#071A33]/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071A33]/80 via-transparent to-[#071A33]/90 lg:to-[#071A33]/70" />
        </motion.div>

        {/* Subtle decorative medical blood-flow and glucose wave overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-35">
          {/* Microscopic glucose particles */}
          <div className="absolute top-[28%] left-[22%] w-1.5 h-1.5 rounded-full bg-[#D95C68] blur-[0.5px] animate-pulse" />
          <div className="absolute top-[48%] left-[65%] w-2 h-2 rounded-full bg-[#B52B3A] blur-[1px] opacity-75" />
          <div className="absolute top-[72%] left-[30%] w-1.5 h-1.5 rounded-full bg-[#FFFFFF] blur-[0.5px] opacity-60" />
          <div className="absolute top-[60%] left-[80%] w-1 h-1 rounded-full bg-[#D95C68] opacity-80" />

          {/* Subtle glucose wave line */}
          <svg
            className="absolute bottom-16 right-6 w-64 h-16 opacity-30 hidden lg:block"
            viewBox="0 0 240 60"
            fill="none"
          >
            <path
              d="M0 30 Q 30 30, 45 30 L 55 12 L 65 48 L 75 22 L 85 36 L 95 30 Q 140 30, 240 30"
              stroke="#D95C68"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <circle cx="65" cy="48" r="2.5" fill="#B52B3A" />
            <circle cx="75" cy="22" r="2" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Top Header: DiaSynapse Wordmark */}
        <div className="relative z-20">
          <div className="inline-flex items-center gap-3">
            {/* Precision medical glyph: Blood droplet & glucose node */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B52B3A] to-[#8F1D2C] p-[1.5px] shadow-[0_2px_12px_rgba(181,43,58,0.4)] flex items-center justify-center">
              <div className="w-full h-full bg-[#071A33] rounded-[10px] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#D95C68]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="rgba(181,43,58,0.3)" />
                  <circle cx="12" cy="14" r="2.5" fill="#FFFFFF" stroke="none" />
                </svg>
              </div>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center">
                Dia<span className="text-white font-semibold">Synapse</span>
              </span>
            </div>
          </div>

          <p className="mt-2 text-xs sm:text-[13px] text-[#A3B4CA] font-normal tracking-wide max-w-xs">
            Smarter insight for everyday glucose care.
          </p>
        </div>

        {/* Mid-panel visual focal text (Desktop only, minimal and elegant) */}
        <div className="hidden lg:block relative z-20 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase bg-[#B52B3A]/15 text-[#F7F9FC] border border-[#B52B3A]/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D95C68] animate-ping" />
            Active Clinical Monitoring
          </div>

          <h2 className="text-2xl sm:text-[28px] font-semibold text-white tracking-tight leading-snug max-w-sm">
            Precision analytics aligned with your metabolic rhythm.
          </h2>

          <div className="mt-6 flex items-center gap-3 text-xs text-[#708198]">
            <div className="h-[1px] w-8 bg-[#B52B3A]/40" />
            <span>Cellular-level glucose trajectory forecasting</span>
          </div>
        </div>

        {/* Bottom Trust Statement */}
        <div className="relative z-20 pt-4 sm:pt-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs text-[#708198] tracking-wide font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D95C68]/80 inline-block" />
              AI-assisted. Patient-focused.
            </p>
            <span className="text-[10px] text-[#708198]/60 font-mono tracking-wider">
              ISO-27001 COMPLIANT
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── RIGHT SIDE: Clean Medical Login Form (48-52%) ── */}
      <div className="w-full lg:w-[50%] min-h-[calc(100vh-220px)] lg:min-h-screen bg-[#FFFFFF] flex flex-col justify-center items-center px-6 py-10 sm:px-12 lg:px-16 xl:px-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="w-full max-w-[420px] mx-auto"
        >
          {/* Top Medical Accent Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-[3px] bg-[#B52B3A] rounded-full" />
            <div className="w-2 h-[3px] bg-[#D95C68]/60 rounded-full" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#708198]">
              {isLogin ? 'Secure Patient Portal' : 'Patient Enrollment'}
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-[34px] font-bold text-[#071A33] tracking-tight leading-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="mt-2 text-[14px] sm:text-[15px] text-[#708198] leading-relaxed">
              {isLogin
                ? 'Sign in to continue managing your glucose journey.'
                : 'Join DiaSynapse to start tracking your glucose and metabolic insights.'}
            </p>
          </div>

          {/* Global Alert Notification */}
          <AnimatePresence>
            {errors.form && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-6 p-3.5 rounded-[12px] bg-[#FDF2F2] border border-[#B52B3A]/30 flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 text-[#B52B3A] shrink-0 mt-0.5" />
                <div className="text-xs text-[#8F1D2C] leading-relaxed font-medium">
                  {errors.form}
                </div>
              </motion.div>
            )}

            {forgotNotice && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-6 p-3.5 rounded-[12px] bg-[#F7F9FC] border border-[#E8EDF3] flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-[#B52B3A] shrink-0 mt-1.5" />
                <div className="text-xs text-[#0B2342] leading-relaxed">
                  To reset your password, please contact your care team or administrator, or verify your email.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
            {/* Full Name (Sign Up only) */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="field-name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label
                    htmlFor="name-input"
                    className="block text-[13px] font-medium text-[#0B2342] mb-1.5"
                  >
                    Full name
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className={`w-full h-[52px] px-4 rounded-[12px] text-[15px] bg-white border text-[#071A33] placeholder:text-[#94A3B8] transition-all outline-none ${
                      errors.name
                        ? 'border-[#B52B3A] ring-3 ring-[#B52B3A]/10'
                        : focusedField === 'name'
                        ? 'border-[#B52B3A] ring-3 ring-[#B52B3A]/15 shadow-sm'
                        : 'border-[#E8EDF3] hover:border-[#CBD5E1]'
                    }`}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-[#B52B3A] font-medium flex items-center gap-1">
                      {errors.name}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email-input"
                className="block text-[13px] font-medium text-[#0B2342] mb-1.5"
              >
                Email address
              </label>
              <input
                id="email-input"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="Enter your email"
                className={`w-full h-[52px] px-4 rounded-[12px] text-[15px] bg-white border text-[#071A33] placeholder:text-[#94A3B8] transition-all outline-none ${
                  errors.email
                    ? 'border-[#B52B3A] ring-3 ring-[#B52B3A]/10'
                    : focusedField === 'email'
                    ? 'border-[#B52B3A] ring-3 ring-[#B52B3A]/15 shadow-sm'
                    : 'border-[#E8EDF3] hover:border-[#CBD5E1]'
                }`}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#B52B3A] font-medium flex items-center gap-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password-input"
                className="block text-[13px] font-medium text-[#0B2342] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder="Enter your password"
                  className={`w-full h-[52px] pl-4 pr-12 rounded-[12px] text-[15px] bg-white border text-[#071A33] placeholder:text-[#94A3B8] transition-all outline-none ${
                    errors.password
                      ? 'border-[#B52B3A] ring-3 ring-[#B52B3A]/10'
                      : focusedField === 'password'
                      ? 'border-[#B52B3A] ring-3 ring-[#B52B3A]/15 shadow-sm'
                      : 'border-[#E8EDF3] hover:border-[#CBD5E1]'
                  }`}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#708198] hover:text-[#071A33] hover:bg-[#F7F9FC] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-[#B52B3A] font-medium flex items-center gap-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Additional Fields for Signup (Diabetes Diagnosis & DOB) */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="signup-extra-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 pt-1"
                >
                  <div>
                    <label
                      htmlFor="diabetes-type"
                      className="block text-[13px] font-medium text-[#0B2342] mb-1.5"
                    >
                      Diabetes Diagnosis
                    </label>
                    <select
                      id="diabetes-type"
                      value={formData.diabetesType}
                      onChange={handleInputChange('diabetesType')}
                      className="w-full h-[52px] px-4 rounded-[12px] text-[15px] bg-white border border-[#E8EDF3] text-[#071A33] transition-all outline-none focus:border-[#B52B3A] focus:ring-3 focus:ring-[#B52B3A]/15"
                    >
                      <option value="Type 1">Type 1 Diabetes</option>
                      <option value="Type 2">Type 2 Diabetes</option>
                      <option value="Gestational">Gestational Diabetes</option>
                      <option value="Pre-Diabetes">Pre-Diabetes</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="dob-input"
                      className="block text-[13px] font-medium text-[#0B2342] mb-1.5"
                    >
                      Date of Birth
                    </label>
                    <input
                      id="dob-input"
                      type="date"
                      value={formData.dob}
                      onChange={handleInputChange('dob')}
                      className={`w-full h-[52px] px-4 rounded-[12px] text-[15px] bg-white border text-[#071A33] transition-all outline-none ${
                        errors.dob
                          ? 'border-[#B52B3A] ring-3 ring-[#B52B3A]/10'
                          : 'border-[#E8EDF3] hover:border-[#CBD5E1] focus:border-[#B52B3A] focus:ring-3 focus:ring-[#B52B3A]/15'
                      }`}
                    />
                    {errors.dob && (
                      <p className="mt-1.5 text-xs text-[#B52B3A] font-medium flex items-center gap-1">
                        {errors.dob}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember Me / Forgot Password Row */}
            {isLogin && (
              <div className="flex items-center justify-between pt-1 pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
                      rememberMe
                        ? 'bg-[#B52B3A] border-[#B52B3A]'
                        : 'border-[#CBD5E1] bg-white group-hover:border-[#708198]'
                    }`}
                  >
                    {rememberMe && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <span className="text-[13px] text-[#708198] group-hover:text-[#0B2342] transition-colors">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setForgotNotice(!forgotNotice)}
                  className="text-[13px] text-[#708198] hover:text-[#B52B3A] transition-colors font-medium focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Login / Submit CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] sm:h-[54px] rounded-[12px] bg-[#B52B3A] hover:bg-[#8F1D2C] active:scale-[0.99] text-white text-[15px] sm:text-[16px] font-semibold shadow-[0_4px_14px_rgba(181,43,58,0.25)] hover:shadow-[0_6px_20px_rgba(181,43,58,0.35)] transition-all duration-200 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isLogin ? 'Authenticating...' : 'Creating profile...'}</span>
                  </span>
                ) : (
                  <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                )}
              </button>
            </div>
          </form>

          {/* Signup / Switch Section */}
          <div className="mt-8 text-center">
            <p className="text-[14px] text-[#708198]">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setErrors({});
                      setForgotNotice(false);
                    }}
                    className="font-semibold text-[#B52B3A] hover:text-[#8F1D2C] transition-colors inline-flex items-center ml-0.5 focus:outline-none"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setErrors({});
                      setForgotNotice(false);
                    }}
                    className="font-semibold text-[#B52B3A] hover:text-[#8F1D2C] transition-colors inline-flex items-center ml-0.5 focus:outline-none"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Minimal Clinical Footnote */}
          <div className="mt-10 pt-6 border-t border-[#E8EDF3]/80 text-center">
            <p className="text-[11px] text-[#708198]/75 leading-relaxed">
              DiaSynapse is an analytical platform designed to support diabetes self-management. Always consult licensed medical professionals for clinical diagnoses and treatment decisions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
