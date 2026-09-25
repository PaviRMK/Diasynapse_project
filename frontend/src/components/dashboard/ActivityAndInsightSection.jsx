import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, TrendingUp, Pill, Activity, Sparkles, ShieldCheck } from 'lucide-react';
import { AiEstimatedBadge } from '../Badge';

export function ActivityAndInsightSection({ recentActivity = [], insight }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
      className="bg-white rounded-[24px] border border-[#E7ECF2] shadow-[0_4px_20px_rgba(7,26,51,0.03)] overflow-hidden"
      aria-label="Activity Logging and Daily Clinical Insight"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E7ECF2]">
        
        {/* ── LEFT PANE: RECENT ACTIVITY TIMELINE (8 cols ≈ 67%) ── */}
        <div className="lg:col-span-8 p-6 sm:p-7">
          <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[#E7ECF2]">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#B52B3A]" />
              <h2 className="text-base font-bold text-[#071A33]">
                Recent Activity
              </h2>
            </div>
            <span className="text-xs text-[#718096] font-medium">
              {recentActivity.length} logged events
            </span>
          </div>

          {recentActivity.length > 0 ? (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[#E7ECF2]">
              {recentActivity.map((act) => {
                const isMeal = act.type === 'meal';
                const isPrediction = act.type === 'prediction';

                const nodeBg = isMeal
                  ? 'bg-[#B52B3A]'
                  : isPrediction
                  ? 'bg-[#071A33]'
                  : 'bg-[#D95C68]';

                const Icon = isMeal ? Utensils : isPrediction ? TrendingUp : Pill;

                return (
                  <div key={act.id} className="relative flex items-start justify-between gap-4">
                    {/* Timeline node marker */}
                    <span
                      className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${nodeBg} shadow-sm`}
                      aria-hidden="true"
                    />

                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-[#F5F7FA] border border-[#E7ECF2] flex items-center justify-center shrink-0 mt-0.5 text-[#071A33]">
                        <Icon className="w-3 h-3 text-[#718096]" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-bold text-[#071A33] truncate">
                            {act.title}
                          </h3>
                          {act.isAiEstimated && <AiEstimatedBadge />}
                        </div>
                        {act.details && (
                          <p className="text-xs text-[#718096] line-clamp-1">
                            {act.details}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-[#718096] shrink-0 font-medium pt-0.5">
                      {act.timeFormatted}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-7 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-[#F5F7FA] border border-[#E7ECF2] flex items-center justify-center mx-auto text-[#718096]">
                <Activity className="w-4 h-4" />
              </div>
              <p className="text-xs text-[#718096]">No activity logged yet.</p>
              <Link
                to="/log-meal"
                className="inline-flex text-xs font-semibold text-[#B52B3A] hover:underline"
              >
                Log your first meal →
              </Link>
            </div>
          )}
        </div>

        {/* ── RIGHT PANE: TODAY'S INSIGHT (4 cols ≈ 33%) ── */}
        <div className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between bg-[#FAFBFD]">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <Sparkles className="w-4 h-4 text-[#B52B3A]" />
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#718096]">
                TODAY'S INSIGHT
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E7ECF2] shadow-sm space-y-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#071A33] leading-snug">
                {insight?.title || 'No new insight yet.'}
              </h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                {insight?.description ||
                  'Continue logging meals and glucose readings to build your daily picture.'}
              </p>
            </div>
          </div>

          <div className="pt-3.5 mt-4 border-t border-[#E7ECF2] flex items-center justify-between text-[10px] text-[#718096]">
            <span>Active clinical telemetry</span>
            <div className="flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#718096]" />
              <span>CONFIDENTIAL</span>
            </div>
          </div>
        </div>

      </div>
    </motion.section>
  );
}
