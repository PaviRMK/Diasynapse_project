import React, { useEffect, useState } from 'react';

export function CountUp({
  value,
  duration = 0.9,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericTarget = typeof value === 'number' ? value : parseFloat(value) || 0;
    if (numericTarget === 0) {
      setDisplayValue(0);
      return;
    }

    let startTimestamp = null;
    let animId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = (timestamp - startTimestamp) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = easeProgress * numericTarget;
      setDisplayValue(current);

      if (progress < 1) {
        animId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(numericTarget);
      }
    };

    animId = window.requestAnimationFrame(step);
    return () => {
      if (animId) window.cancelAnimationFrame(animId);
    };
  }, [value, duration]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={`metric-number inline-block ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
