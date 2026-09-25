import React from 'react';
import { Link } from 'react-router-dom';

export function DashboardHeader({ user }) {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const firstName = user?.name ? user.name.split(' ')[0] : 'Pavi';
  const diabetesType = user?.diabetesType || 'Type 1';

  return (
    <div className="w-full px-5 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7ECF2]">
      <div>
        <div className="text-[11px] text-[#718096] font-medium tracking-wide">
          {todayFormatted} · {diabetesType}
        </div>
        <h1 className="text-lg sm:text-[20px] font-medium text-[#071A33] mt-0.5 tracking-tight">
          Good day, {firstName}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Link
          to="/predict-glucose"
          className="text-xs font-medium text-[#071A33] bg-white border border-[#E7ECF2] hover:bg-[#F5F7FA] hover:border-[#CBD5E1] rounded-lg px-4 py-2 transition-colors inline-flex items-center justify-center shadow-none"
        >
          Predict glucose
        </Link>
        <Link
          to="/log-meal"
          className="text-xs font-semibold text-white bg-[#B52B3A] hover:bg-[#8F1D2C] active:bg-[#781724] rounded-lg px-4 py-2 transition-colors inline-flex items-center justify-center shadow-none"
        >
          + Log a meal
        </Link>
      </div>
    </div>
  );
}
