import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { Navbar } from './components/Navbar';
import { MobileNav } from './components/Sidebar';
import { PageTransition } from './components/PageTransition';

import { SplashScreen } from './pages/SplashScreen';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { LogMealPage } from './pages/LogMealPage';
import { GlucosePredictionPage } from './pages/GlucosePredictionPage';
import { MedicationPage } from './pages/MedicationPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { RecipesPage } from './pages/RecipesPage';
import { ExercisePage } from './pages/ExercisePage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B52B3A] animate-pulse"></span>
          <span className="w-2 h-2 rounded-full bg-[#D95C68] animate-pulse delay-150"></span>
          <span className="w-2 h-2 rounded-full bg-[#B52B3A]/40 animate-pulse delay-300"></span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#F5F7FA] flex flex-col pb-16 md:pb-6">
      <Navbar />
      <main className="flex-1 w-full min-w-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PageTransition><SplashScreen /></PageTransition>} />
        <Route path="/landing" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><OnboardingPage /></PageTransition>} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedLayout>
          }
        />

        <Route
          path="/log-meal"
          element={
            <ProtectedLayout>
              <PageTransition><LogMealPage /></PageTransition>
            </ProtectedLayout>
          }
        />

        <Route
          path="/predict-glucose"
          element={
            <ProtectedLayout>
              <PageTransition><GlucosePredictionPage /></PageTransition>
            </ProtectedLayout>
          }
        />

        <Route
          path="/medication"
          element={
            <ProtectedLayout>
              <PageTransition><MedicationPage /></PageTransition>
            </ProtectedLayout>
          }
        />

        <Route
          path="/progress"
          element={
            <ProtectedLayout>
              <PageTransition><ProgressPage /></PageTransition>
            </ProtectedLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedLayout>
              <PageTransition><ProfilePage /></PageTransition>
            </ProtectedLayout>
          }
        />

        <Route
          path="/recipes"
          element={
            <ProtectedLayout>
              <PageTransition><RecipesPage /></PageTransition>
            </ProtectedLayout>
          }
        />

        <Route
          path="/exercise"
          element={
            <ProtectedLayout>
              <PageTransition><ExercisePage /></PageTransition>
            </ProtectedLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedLayout>
              <PageTransition><SettingsPage /></PageTransition>
            </ProtectedLayout>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
