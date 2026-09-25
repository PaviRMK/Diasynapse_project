import React from 'react';

export function HealthTelemetry({
  glucosePrediction,
  activeInsulin,
  glucoseTrend,
  lastMeal,
}) {
  const trendColor =
    glucoseTrend?.trend === 'Worsening'
      ? 'text-[#B52B3A]'
      : glucoseTrend?.trend === 'Improving'
      ? 'text-[#3ba06a]'
      : 'text-[#071A33]';

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 border-b border-[#E7ECF2] divide-y sm:divide-y-0 divide-[#E7ECF2] bg-white">
      {/* 1. GLUCOSE (25% width on desktop) */}
      <div className="p-4 sm:p-5 lg:px-8 lg:py-5 md:border-r border-[#E7ECF2]">
        <div className="text-[11px] text-[#718096] uppercase tracking-wider font-medium">
          GLUCOSE
        </div>
        <div className="text-xl sm:text-[22px] font-medium text-[#071A33] mt-0.5 tracking-tight font-sans">
          {glucosePrediction?.isValid ? `${glucosePrediction.value} mg/dL` : 'No forecast'}
        </div>
        <div className="text-[11px] text-[#718096] mt-0.5">
          {glucosePrediction?.label || 'AI-Estimated'}
        </div>
      </div>

      {/* 2. ACTIVE INSULIN (25% width on desktop) */}
      <div className="p-4 sm:p-5 lg:px-8 lg:py-5 md:border-r border-[#E7ECF2]">
        <div className="text-[11px] text-[#718096] uppercase tracking-wider font-medium">
          ACTIVE INSULIN
        </div>
        <div className="text-xl sm:text-[22px] font-medium text-[#071A33] mt-0.5 tracking-tight font-sans">
          {activeInsulin?.formatted || '0.0%'}
        </div>
        <div className="text-[11px] text-[#718096] mt-0.5 truncate">
          {activeInsulin?.timingNote ? 'Next dose in ~3h' : 'Situational Awareness'}
        </div>
      </div>

      {/* 3. GLUCOSE TREND (25% width on desktop) */}
      <div className="p-4 sm:p-5 lg:px-8 lg:py-5 md:border-r border-[#E7ECF2]">
        <div className="text-[11px] text-[#718096] uppercase tracking-wider font-medium">
          TREND
        </div>
        <div className={`text-xl sm:text-[22px] font-medium ${trendColor} mt-0.5 tracking-tight`}>
          {glucoseTrend?.trend || 'Stable'}
        </div>
        <div className="text-[11px] text-[#718096] mt-0.5">
          {glucoseTrend?.formattedChange || 'Logged history'}
        </div>
      </div>

      {/* 4. LAST MEAL (25% width on desktop) */}
      <div className="p-4 sm:p-5 lg:px-8 lg:py-5">
        <div className="text-[11px] text-[#718096] uppercase tracking-wider font-medium">
          LAST MEAL
        </div>
        <div className="text-xl sm:text-[22px] font-medium text-[#071A33] mt-0.5 tracking-tight font-sans">
          {lastMeal?.carbsFormatted || '83g carbs'}
        </div>
        <div className="text-[11px] text-[#718096] mt-0.5 truncate">
          {lastMeal?.timeFormatted || 'Lunch · 1h ago'}
        </div>
      </div>
    </div>
  );
}
