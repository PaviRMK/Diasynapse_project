import React from 'react';

export function TodaysInsight({ insight, activeInsulin }) {
  const insightText =
    activeInsulin?.riskNote ||
    insight?.description ||
    insight?.title ||
    'High insulin still active — extra caution if eating a carb-heavy meal.';

  return (
    <div className="w-full px-5 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-b border-[#E7ECF2] text-xs sm:text-[13px] text-[#071A33] bg-white leading-normal">
      <span className="text-[#B52B3A] font-medium">Today's insight · </span>
      <span className="text-[#071A33]">{insightText}</span>
    </div>
  );
}
