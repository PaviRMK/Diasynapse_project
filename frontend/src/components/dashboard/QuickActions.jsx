import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, TrendingUp, Pill, BarChart3 } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { title: 'Log meal', to: '/log-meal', icon: Utensils },
    { title: 'Predict glucose', to: '/predict-glucose', icon: TrendingUp },
    { title: 'Check insulin', to: '/medication', icon: Pill },
    { title: 'View progress', to: '/progress', icon: BarChart3 },
  ];

  return (
    <div className="w-full px-5 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-b border-[#E7ECF2] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-[13px] text-[#071A33]">
        {actions.map((act, index) => {
          const Icon = act.icon;
          return (
            <React.Fragment key={act.title}>
              <Link
                to={act.to}
                className="inline-flex items-center gap-2 font-normal text-[#071A33] hover:text-[#B52B3A] transition-colors py-1 group"
              >
                <Icon className="w-3.5 h-3.5 text-[#718096] group-hover:text-[#B52B3A] transition-colors" />
                <span>{act.title}</span>
              </Link>
              {index < actions.length - 1 && (
                <span className="hidden sm:inline text-[#E7ECF2] select-none">|</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
