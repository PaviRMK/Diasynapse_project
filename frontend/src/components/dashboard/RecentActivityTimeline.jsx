import React from 'react';
import { Link } from 'react-router-dom';

export function RecentActivity({ recentActivity = [] }) {
  return (
    <div className="w-full px-5 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-[#E7ECF2] bg-white">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs sm:text-[13px] font-medium text-[#071A33]">
          Recent activity
        </h2>
        {recentActivity.length > 0 && (
          <span className="text-[11px] text-[#718096]">
            {recentActivity.length} logged events
          </span>
        )}
      </div>

      {recentActivity.length > 0 ? (
        <div className="divide-y divide-[#F5F7FA]">
          {recentActivity.slice(0, 4).map((act) => {
            let summaryText = act.title;
            if (act.details) {
              summaryText = `${act.title} · ${act.details}`;
            }

            return (
              <div
                key={act.id}
                className="text-xs sm:text-[13px] text-[#071A33] flex items-center justify-between py-2.5 gap-4"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      act.type === 'meal'
                        ? 'bg-[#B52B3A]'
                        : act.type === 'prediction'
                        ? 'bg-[#071A33]'
                        : 'bg-[#D95C68]'
                    }`}
                  />
                  <span className="truncate">{summaryText}</span>
                </div>
                <span className="text-[#718096] shrink-0 font-normal text-[11px] sm:text-xs">
                  {act.timeFormatted || 'Recent'}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-2 text-xs text-[#718096] flex items-center justify-between">
          <span>No activity logged yet today.</span>
          <Link to="/log-meal" className="text-[#B52B3A] hover:underline font-medium">
            Log meal →
          </Link>
        </div>
      )}
    </div>
  );
}

export { RecentActivity as RecentActivityTimeline };
