import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  User,
  LogOut,
  Activity,
  Utensils,
  TrendingUp,
  Clock,
  Pill,
  Settings,
  ChevronDown,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/auth');
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  // Primary visible navbar items (Recipes & Exercise removed from visible primary navbar as instructed)
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Log Meal', path: '/log-meal', icon: Utensils },
    { name: 'Predict', path: '/predict-glucose', icon: TrendingUp },
    { name: 'Medication', path: '/medication', icon: Pill },
    { name: 'Progress', path: '/progress', icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E7ECF2] shadow-[0_1px_3px_rgba(7,26,51,0.02)]">
      <div className="w-full px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px] sm:h-[72px] gap-3">
          
          {/* Brand Wordmark & Glyph */}
          <div className="flex items-center gap-6 lg:gap-8 shrink-0">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#B52B3A] to-[#8F1D2C] p-[1.5px] shadow-[0_2px_8px_rgba(181,43,58,0.25)] flex items-center justify-center transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-[#071A33] rounded-[10px] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-[#D95C68]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="rgba(181,43,58,0.3)" />
                    <circle cx="12" cy="14" r="2.2" fill="#FFFFFF" stroke="none" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-tight">
                  <span className="text-[#071A33]">Dia</span>
                  <span className="text-[#B52B3A]">Synapse</span>
                </span>
                <span className="text-[9px] uppercase font-semibold tracking-wider text-[#708198] -mt-0.5">
                  CLINICAL COMPANION
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'text-[#B52B3A] font-semibold bg-[#B52B3A]/[0.08]'
                        : 'text-[#071A33]/80 hover:text-[#071A33] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#B52B3A]' : 'text-[#708198]'}`} />
                    <span>{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-[#B52B3A] rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search Bar & User Actions */}
          <div className="flex items-center gap-3 flex-1 max-w-sm justify-end">
            {/* Functional Search Bar */}
            <div className="relative w-full max-w-[210px] sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#708198]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meals, forecasts..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F7F9FC] border border-[#E8EDF3] rounded-lg text-[#071A33] placeholder-[#708198] focus:outline-none focus:ring-2 focus:ring-[#B52B3A]/15 focus:border-[#B52B3A] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#708198] hover:text-[#071A33] w-4 h-4 flex items-center justify-center rounded-full hover:bg-[#E8EDF3]"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Profile Dropdown Chip */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-[#F7F9FC] transition-all border border-transparent hover:border-[#E8EDF3] focus:outline-none"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-[#071A33] text-white border border-[#B52B3A]/30 flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-[#071A33] leading-none">
                      {user.name?.split(' ')[0] || 'Patient'}
                    </p>
                    <p className="text-[10px] text-[#708198] mt-0.5">
                      {user.diabetesType || 'Type 1'}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#708198] transition-transform duration-200 hidden sm:block ${
                      dropdownOpen ? 'rotate-180 text-[#B52B3A]' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_24px_rgba(7,26,51,0.08)] border border-[#E8EDF3] py-2 z-50 overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-2.5 border-b border-[#E8EDF3] bg-[#F7F9FC]">
                        <p className="text-xs font-bold text-[#071A33] truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-[#708198] truncate mt-0.5">
                          {user.email}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#B52B3A]/10 text-[#8F1D2C] border border-[#B52B3A]/20">
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#B52B3A]" />
                          {user.diabetesType || 'Type 1 Diabetes'}
                        </span>
                      </div>

                      {/* Menu Links */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#0B2342] hover:bg-[#F7F9FC] hover:text-[#B52B3A] transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-[#B52B3A]" />
                          <span>Patient Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#0B2342] hover:bg-[#F7F9FC] hover:text-[#B52B3A] transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-[#708198]" />
                          <span>Settings & Units</span>
                        </Link>
                        <Link
                          to="/onboarding"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#0B2342] hover:bg-[#F7F9FC] hover:text-[#B52B3A] transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#D95C68]" />
                          <span>Onboarding Wizard</span>
                        </Link>
                      </div>

                      {/* Sign Out Action */}
                      <div className="pt-1 border-t border-[#E8EDF3]">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#B52B3A] hover:bg-[#FDF2F2] transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5 text-[#B52B3A]" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="text-xs font-semibold text-[#071A33] hover:text-[#B52B3A] px-3 py-1.5 rounded-lg hover:bg-[#F7F9FC] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="text-xs font-semibold text-white bg-[#B52B3A] hover:bg-[#8F1D2C] px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
