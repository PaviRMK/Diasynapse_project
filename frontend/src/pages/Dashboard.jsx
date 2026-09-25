import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

import { useNormalizedDashboardData } from '../components/dashboard/useNormalizedDashboardData';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { GlucoseOutlookHero } from '../components/dashboard/GlucoseOutlookHero';
import { HealthTelemetry } from '../components/dashboard/HealthTelemetry';
import { TodaysInsight } from '../components/dashboard/TodaysInsight';
import { RecentActivity } from '../components/dashboard/RecentActivityTimeline';
import { QuickActions } from '../components/dashboard/QuickActions';

export function Dashboard() {
  const { user } = useAuth();
  const {
    filteredActivities,
    latestPrediction,
    latestMedication,
    progressReport,
    progressLoading,
    progressError,
    fetchProgressReport,
  } = useData();

  // Central normalized data object guaranteeing single source of truth across all sections
  const {
    glucosePrediction,
    activeInsulin,
    glucoseTrend,
    lastMeal,
    recentActivity,
    heroChartPoints,
    insight,
  } = useNormalizedDashboardData({
    user,
    filteredActivities,
    latestPrediction,
    latestMedication,
    progressReport,
    progressLoading,
    progressError,
  });

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#F5F7FA] text-[#071A33] font-sans antialiased py-4 sm:py-6 px-4 sm:px-6 lg:px-8 selection:bg-[#B52B3A]/15 selection:text-[#8F1D2C]">
      <main className="w-full min-w-0">
        {/* Error notification banner if a critical network or data issue occurred */}
        {glucoseTrend?.error && (
          <div className="mb-4 p-3 rounded-lg bg-white border border-[#E7ECF2] shadow-sm flex items-center justify-between gap-3 text-xs text-[#071A33]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B52B3A] shrink-0" />
              <span>{glucoseTrend.error}</span>
            </div>
            {fetchProgressReport && (
              <button
                type="button"
                onClick={fetchProgressReport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F5F7FA] hover:bg-[#E7ECF2] font-medium text-[#071A33] transition-colors shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ONE CONTINUOUS CLINICAL MONITORING WORKSPACE — FULL WIDTH      */}
        {/* ============================================================== */}
        <div className="w-full min-w-0 relative rounded-[14px] overflow-hidden border border-[#E7ECF2] bg-white shadow-[0_2px_12px_rgba(7,26,51,0.03)]">
          {/* 1. COMPACT HEADER */}
          <DashboardHeader user={user} />

          {/* 2. GLUCOSE OUTLOOK HERO (Full width navy surface) */}
          <GlucoseOutlookHero
            glucosePrediction={glucosePrediction}
            heroChartPoints={heroChartPoints}
          />

          {/* 3. HEALTH TELEMETRY STRIP (Full width 4-column connected strip) */}
          <HealthTelemetry
            glucosePrediction={glucosePrediction}
            activeInsulin={activeInsulin}
            glucoseTrend={glucoseTrend}
            lastMeal={lastMeal}
          />

          {/* 4. TODAY'S INSIGHT (Full width compact strip) */}
          <TodaysInsight insight={insight} activeInsulin={activeInsulin} />

          {/* 5. RECENT ACTIVITY (Full width integrated compact list) */}
          <RecentActivity recentActivity={recentActivity} />

          {/* 6. QUICK ACTIONS (Full width horizontal utility strip) */}
          <QuickActions />

          {/* 7. OPTIONAL CONTEXTUAL LOWER LINKS */}
          <div className="w-full px-5 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs sm:text-[13px] bg-white">
            <Link
              to="/recipes"
              className="text-[#B52B3A] hover:underline font-normal transition-colors"
            >
              Explore sugar-friendly meal plans →
            </Link>
            <Link
              to="/exercise"
              className="text-[#B52B3A] hover:underline font-normal transition-colors"
            >
              Exercises that help lower glucose →
            </Link>
          </div>

          {/* Assistant FAB Button */}
          <Link
            to="/predict-glucose"
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#B52B3A] hover:bg-[#8F1D2C] active:scale-95 text-white flex items-center justify-center shadow-[0_2px_8px_rgba(181,43,58,0.3)] transition-all z-20"
            title="Ask DiaSynapse AI Assistant"
            aria-label="DiaSynapse Assistant"
          >
            <MessageSquare className="w-5 h-5 text-white" />
          </Link>
        </div>

        {/* Clinical Disclaimer */}
        <p className="mt-4 px-1 text-center text-[11px] text-[#718096] leading-relaxed">
          DiaSynapse is an AI clinical companion for situational awareness. It does not provide medical diagnoses or calculate insulin doses. Always consult your healthcare provider.
        </p>
      </main>
    </div>
  );
}
export default Dashboard;
