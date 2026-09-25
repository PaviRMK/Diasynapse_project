import React from 'react';

export function HealthMetric({ glucosePrediction, activeInsulin, glucoseTrend }) {
  return (
    <div className="relative z-10 border-t border-white/10 bg-[#0B2342]/90 backdrop-blur-md px-6 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:divide-x sm:divide-white/10">
        
        {/* Metric 1: Glucose Status */}
        <div className="flex flex-col sm:pr-4">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[#708198]">
            GLUCOSE STATUS
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-white font-mono">
              {glucosePrediction?.isValid
                ? `${glucosePrediction.value} mg/dL`
                : 'No forecast yet'}
            </span>
            <span className="text-[11px] text-[#D95C68] font-medium">
              {glucosePrediction?.isValid ? glucosePrediction.label : 'Pending'}
            </span>
          </div>
        </div>

        {/* Metric 2: Active Insulin */}
        <div className="flex flex-col sm:px-4">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[#708198]">
            ACTIVE INSULIN
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-white font-mono">
              {activeInsulin?.formatted || '0.0%'}
            </span>
            <span className="text-[11px] text-[#A3B4CA] font-medium">
              Situational Awareness
            </span>
          </div>
        </div>

        {/* Metric 3: Glucose Trend */}
        <div className="flex flex-col sm:pl-4">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[#708198]">
            GLUCOSE TREND
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-white">
              {glucoseTrend?.trend || 'Stable'}
            </span>
            <span className="text-[11px] text-[#D95C68] font-medium">
              {glucoseTrend?.formattedChange || 'Logged history'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
