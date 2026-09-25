import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="space-y-7 animate-pulse" aria-busy="true" aria-label="Loading clinical dashboard data">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-2">
          <div className="w-36 h-4 bg-[#E8EDF3] rounded-full" />
          <div className="w-64 h-8 bg-[#E8EDF3] rounded-xl" />
          <div className="w-72 h-3.5 bg-[#E8EDF3] rounded-full" />
        </div>
        <div className="flex gap-3">
          <div className="w-32 h-[52px] bg-[#E8EDF3] rounded-[12px]" />
          <div className="w-36 h-[52px] bg-[#E8EDF3] rounded-[12px]" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="rounded-[24px] bg-[#071A33] border border-[#0B2342] p-8 min-h-[380px] flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="w-32 h-5 bg-white/10 rounded-full" />
            <div className="w-48 h-14 bg-white/10 rounded-xl" />
            <div className="w-80 h-4 bg-white/10 rounded-full" />
            <div className="w-full h-28 bg-white/5 rounded-xl mt-6" />
          </div>
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="w-64 h-64 rounded-[28px] bg-white/5" />
          </div>
        </div>
        <div className="w-full h-12 bg-white/5 rounded-xl mt-6" />
      </div>

      {/* Middle row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        <div className="lg:col-span-7 h-72 bg-white rounded-[20px] border border-[#E8EDF3] p-6 space-y-4">
          <div className="w-48 h-6 bg-[#E8EDF3] rounded-lg" />
          <div className="w-full h-40 bg-[#F7F9FC] rounded-xl" />
        </div>
        <div className="lg:col-span-5 h-72 bg-white rounded-[20px] border border-[#E8EDF3] p-6 space-y-4">
          <div className="w-40 h-6 bg-[#E8EDF3] rounded-lg" />
          <div className="w-full h-40 bg-[#F7F9FC] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
