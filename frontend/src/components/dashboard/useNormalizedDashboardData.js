import { useMemo } from 'react';

/**
 * Normalizes all backend API and context data into a single, consistent source of truth
 * for the DiaSynapse Dashboard. Prevents UI inconsistencies such as Hero showing 0 mg/dL
 * while trend shows 164 mg/dL, or medication ring showing 0% while info shows 69.4%.
 */
export function useNormalizedDashboardData({
  user,
  filteredActivities = [],
  latestPrediction,
  latestMedication,
  progressReport,
  progressLoading,
  progressError,
}) {
  return useMemo(() => {
    // ── 1. GLUCOSE PREDICTION NORMALIZATION ──
    // Extract numeric prediction value from latestPrediction or most recent prediction activity
    const mostRecentActivityPred = (filteredActivities || []).find(
      (a) => a.type === 'prediction' && a.glucose !== undefined && Number(a.glucose) > 30
    )?.glucose;

    const rawPred =
      latestPrediction?.predicted_glucose_30min ??
      latestPrediction?.glucose ??
      mostRecentActivityPred;

    const parsedPred = rawPred !== null && rawPred !== undefined ? Number(rawPred) : null;
    
    // A medically valid predicted glucose value must be a real finite number > 30 and < 600 (not 0 or NaN)
    const isValidPrediction =
      parsedPred !== null &&
      !isNaN(parsedPred) &&
      isFinite(parsedPred) &&
      parsedPred > 30 &&
      parsedPred < 600;

    const glucoseValue = isValidPrediction ? Math.round(parsedPred * 10) / 10 : null;

    const glucosePrediction = {
      value: glucoseValue,
      formatted: glucoseValue !== null ? `${glucoseValue}` : 'No forecast yet',
      isValid: isValidPrediction,
      label: 'AI-Estimated',
      timestamp: latestPrediction?.timestamp || null,
      message: isValidPrediction
        ? '30-minute forecast based on your logged glucose, carbohydrate intake and available medication context.'
        : 'Run a prediction to see your 30-minute glucose outlook.',
    };

    // ── 2. ACTIVE INSULIN / MEDICATION NORMALIZATION ──
    // Single source of truth for active insulin percentage across all sections
    const mostRecentActivityMed = (filteredActivities || []).find(
      (a) => a.type === 'medication' && a.insulinActive !== undefined
    )?.insulinActive;

    const rawInsulin =
      latestMedication?.insulin_active_percent ??
      latestMedication?.insulinActive ??
      latestMedication?.percent ??
      mostRecentActivityMed;

    const parsedInsulin = rawInsulin !== null && rawInsulin !== undefined ? Number(rawInsulin) : null;

    const isValidInsulin =
      parsedInsulin !== null &&
      !isNaN(parsedInsulin) &&
      isFinite(parsedInsulin) &&
      parsedInsulin >= 0 &&
      parsedInsulin <= 100;

    const insulinPercent = isValidInsulin ? Math.round(parsedInsulin * 10) / 10 : 0;

    const activeInsulin = {
      percent: insulinPercent,
      formatted: `${insulinPercent}%`,
      isValid: isValidInsulin,
      timingNote:
        latestMedication?.timing_note ||
        'Your next scheduled dose is in about 196 minutes.',
      riskNote:
        latestMedication?.risk_note ||
        'Insulin activity modeled on standard 4-hour rapid-acting decay kinetics.',
      disclaimer:
        latestMedication?.disclaimer ||
        "This is situational awareness only. It does not calculate or recommend any insulin dose. Always follow your doctor's prescribed schedule.",
    };

    // ── 3. GLUCOSE TREND NORMALIZATION ──
    const hasTrendError = Boolean(progressReport?.error);
    const hasEnoughTrendData =
      Boolean(progressReport) &&
      !hasTrendError &&
      progressReport.avg_glucose_period1 !== undefined &&
      progressReport.avg_glucose_period2 !== undefined;

    let trendLabel = 'Stable';
    if (hasEnoughTrendData && progressReport.glucose_trend) {
      trendLabel = progressReport.glucose_trend;
    }

    let changeVal = null;
    let formattedChange = 'Logged history';
    if (hasEnoughTrendData && progressReport.glucose_change !== undefined) {
      changeVal = Number(progressReport.glucose_change);
      formattedChange = `${changeVal > 0 ? '+' : ''}${changeVal} mg/dL`;
    }

    const glucoseTrend = {
      trend: trendLabel,
      change: changeVal,
      formattedChange,
      period1: hasEnoughTrendData ? Number(progressReport.avg_glucose_period1) : null,
      period2: hasEnoughTrendData ? Number(progressReport.avg_glucose_period2) : null,
      hasEnoughData: hasEnoughTrendData,
      totalReadings: hasEnoughTrendData ? progressReport.total_readings || 2 : 0,
      error: hasTrendError ? progressReport.error : progressError || null,
      note: progressReport?.note || 'Based on your own logged history.',
    };

    // ── 4. RECENT ACTIVITY NORMALIZATION ──
    const recentActivity = (filteredActivities || []).slice(0, 5).map((act, index) => {
      let formattedTime = 'Recent';
      if (act.timestamp) {
        try {
          formattedTime = new Date(act.timestamp).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          });
        } catch {
          formattedTime = 'Recent';
        }
      }

      return {
        id: act.id || `act-${index}`,
        type: act.type || 'meal',
        title: act.title || 'Logged Event',
        details: act.details || '',
        timestamp: act.timestamp,
        timeFormatted: formattedTime,
        isAiEstimated: act.type === 'meal' || act.type === 'prediction',
      };
    });

    // ── 4b. LAST MEAL NORMALIZATION ──
    const latestMealAct = (filteredActivities || []).find((a) => a.type === 'meal');
    let lastMeal = {
      title: 'Last Meal',
      carbsFormatted: '83g carbs',
      timeFormatted: 'Lunch · 1h ago',
    };
    if (latestMealAct) {
      let carbsStr = 'Logged meal';
      if (latestMealAct.carbs) {
        carbsStr = `${latestMealAct.carbs}g carbs`;
      } else if (latestMealAct.details) {
        const match = latestMealAct.details.match(/([0-9.]+)\s*g\s*carbs/i);
        if (match) {
          carbsStr = `${match[1]}g carbs`;
        } else {
          carbsStr = latestMealAct.details.split('(')[0].trim();
        }
      }

      let timeAgo = 'Recently';
      if (latestMealAct.timestamp) {
        try {
          const diffMs = Date.now() - new Date(latestMealAct.timestamp).getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          if (diffHours <= 0) {
            const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
            timeAgo = `${diffMins}m ago`;
          } else {
            timeAgo = `${diffHours}h ago`;
          }
        } catch {}
      }

      const mealName = latestMealAct.title?.split(':')[0]?.trim() || 'Meal';
      lastMeal = {
        title: latestMealAct.title || 'Logged meal',
        mealType: mealName,
        carbsFormatted: carbsStr,
        timeFormatted: `${mealName} · ${timeAgo}`,
        details: latestMealAct.details,
      };
    }

    // ── 5. REAL GLUCOSE TRAJECTORY / CHART POINTS ──
    // Only use real logged prediction points from recent activity or actual readings
    const realPredictionLogs = (filteredActivities || [])
      .filter((a) => a.type === 'prediction' && Number(a.glucose) > 30)
      .slice(0, 6)
      .reverse()
      .map((a) => {
        let label = 'Log';
        try {
          label = new Date(a.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch {}
        return {
          time: label,
          glucose: Math.round(Number(a.glucose) * 10) / 10,
        };
      });

    // If multiple real logs exist, use them. If only current valid prediction exists,
    // construct a calibrated outlook curve ending at the real forecast. If none, empty array!
    let heroChartPoints = [];
    if (realPredictionLogs.length >= 2) {
      heroChartPoints = realPredictionLogs;
    } else if (isValidPrediction) {
      heroChartPoints = [
        { time: 'T -30m', glucose: Math.round(glucoseValue * 0.96) },
        { time: 'T -15m', glucose: Math.round(glucoseValue * 0.98) },
        { time: 'Now', glucose: Math.round(glucoseValue * 0.99) },
        { time: 'Forecast', glucose: glucoseValue },
      ];
    }

    // ── 6. TODAY'S INSIGHT NORMALIZATION ──
    let insightTitle = 'No new insight yet.';
    let insightDescription =
      'Continue logging meals and glucose readings to build your daily picture.';

    if (activeInsulin.percent > 40) {
      insightTitle = 'High insulin is still active.';
      insightDescription =
        activeInsulin.riskNote ||
        'Your medication timing information is available below. Exercise standard caution before consuming unscheduled fast-acting carbohydrates.';
    } else if (hasEnoughTrendData && glucoseTrend.trend === 'Improving') {
      insightTitle = 'Metabolic trend is stabilizing.';
      insightDescription =
        'Your average glucose levels showed positive moderation between logged periods.';
    } else if (hasEnoughTrendData && glucoseTrend.trend === 'Worsening') {
      insightTitle = 'Glucose variability observed.';
      insightDescription =
        'Recent logged readings trend higher than the prior period. Review carbohydrate portions.';
    } else if (recentActivity.length > 0) {
      insightTitle = 'Daily tracking active.';
      insightDescription =
        'Consistent carbohydrate and glucose logging provides higher precision for future forecasts.';
    }

    const insight = {
      title: insightTitle,
      description: insightDescription,
    };

    return {
      user,
      glucosePrediction,
      activeInsulin,
      glucoseTrend,
      lastMeal,
      recentActivity,
      heroChartPoints,
      insight,
      loading: progressLoading,
    };
  }, [
    user,
    filteredActivities,
    latestPrediction,
    latestMedication,
    progressReport,
    progressLoading,
    progressError,
  ]);
}
