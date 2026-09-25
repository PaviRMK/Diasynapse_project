import React from 'react';
import { Info } from 'lucide-react';

export function Disclaimer({ 
  text = "This is situational awareness only. It does not calculate or recommend any insulin dose. Always follow your doctor's prescribed schedule.",
  className = '' 
}) {
  return (
    <div className={`flex items-start gap-2.5 p-3.5 rounded-lg bg-cream-50 border border-cream-300/80 text-charcoal-600 text-xs leading-relaxed ${className}`}>
      <Info className="w-4 h-4 text-terracotta-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-charcoal-700 mb-0.5">Clinical Situational Notice</p>
        <p>{text}</p>
      </div>
    </div>
  );
}
