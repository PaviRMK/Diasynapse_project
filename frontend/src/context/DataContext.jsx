import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const DataContext = createContext(null);

const ACTIVITY_STORAGE_KEY = 'diasynapse_recent_activity';
const LATEST_PRED_KEY = 'diasynapse_latest_prediction';
const LATEST_MED_KEY = 'diasynapse_latest_medication';

export function DataProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Recent activity logs (meals, predictions, checks)
  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse activity storage', e);
    }
    // Default initial entries if brand new
    return [
      {
        id: 'init-1',
        type: 'meal',
        title: 'Lunch: Idli & Sambar',
        timestamp: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
        details: '83.4g carbs (AI-Estimated)',
        items: ['Idli', 'Sambar', 'Coconut Chutney'],
      },
      {
        id: 'init-2',
        type: 'prediction',
        title: 'Glucose Forecast',
        timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
        details: '164 mg/dL in 30m (AI-Estimated)',
        glucose: 164,
      },
      {
        id: 'init-3',
        type: 'medication',
        title: 'Medication Check',
        timestamp: new Date(Date.now() - 3600 * 1000 * 1.5).toISOString(),
        details: 'High insulin active — extra caution advised',
        insulinActive: 69.4,
      },
    ];
  });

  // Latest glucose prediction
  const [latestPrediction, setLatestPrediction] = useState(() => {
    try {
      const saved = localStorage.getItem(LATEST_PRED_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      predicted_glucose_30min: 164.0,
      label: 'AI-Estimated',
      timestamp: new Date().toISOString(),
    };
  });

  // Latest medication check
  const [latestMedication, setLatestMedication] = useState(() => {
    try {
      const saved = localStorage.getItem(LATEST_MED_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      insulin_active_percent: 69.4,
      risk_note: 'High insulin still active — extra caution advised if eating a carb-heavy meal.',
      timing_note: 'Your next scheduled dose is in about 196 minutes.',
      disclaimer: 'This is situational awareness only. It does not calculate or recommend any insulin dose. Always follow your doctor\'s prescribed schedule.',
    };
  });

  // Progress report data from backend
  const [progressReport, setProgressReport] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState(null);

  const fetchProgressReport = async () => {
    setProgressLoading(true);
    setProgressError(null);
    try {
      const report = await api.getProgressReport();
      setProgressReport(report);
    } catch (err) {
      setProgressError(err.message || 'Failed to fetch progress report');
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressReport();
  }, []);

  const addActivity = (item) => {
    setActivities((prev) => {
      const updated = [
        {
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date().toISOString(),
          ...item,
        },
        ...prev,
      ].slice(0, 50); // keep last 50
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const recordPrediction = (predData, inputData) => {
    const record = {
      ...predData,
      inputData,
      timestamp: new Date().toISOString(),
    };
    setLatestPrediction(record);
    localStorage.setItem(LATEST_PRED_KEY, JSON.stringify(record));
    addActivity({
      type: 'prediction',
      title: 'Glucose Prediction',
      details: `${predData.predicted_glucose_30min} mg/dL in 30m (${predData.label || 'AI-Estimated'})`,
      glucose: predData.predicted_glucose_30min,
    });
    // refresh progress report since Firestore log was added
    fetchProgressReport();
  };

  const recordMeal = (mealData, fileUrl = null) => {
    const itemNames = (mealData.items || []).map((i) => i.food_name).join(', ');
    addActivity({
      type: 'meal',
      title: itemNames ? `Meal: ${itemNames}` : 'Logged Meal',
      details: `${mealData.total_estimated_carbs_g}g carbs (${mealData.label || 'AI-Estimated'})`,
      items: (mealData.items || []).map((i) => i.food_name),
      fileUrl,
      raw: mealData,
    });
  };

  const recordMedication = (medData) => {
    setLatestMedication(medData);
    localStorage.setItem(LATEST_MED_KEY, JSON.stringify(medData));
    addActivity({
      type: 'medication',
      title: 'Medication Situational Awareness',
      details: `${medData.insulin_active_percent}% active · ${medData.risk_note}`,
      insulinActive: medData.insulin_active_percent,
    });
  };

  const recordCareCheck = (careData) => {
    if (careData.meal_analysis) {
      recordMeal(careData.meal_analysis);
    }
    if (careData.medication_status) {
      recordMedication(careData.medication_status);
    }
    addActivity({
      type: 'care_check',
      title: 'Combined Care Check',
      details: careData.combined_summary,
      summary: careData.combined_summary,
    });
  };

  // Filter activities based on search bar
  const filteredActivities = activities.filter((act) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (act.title && act.title.toLowerCase().includes(q)) ||
      (act.details && act.details.toLowerCase().includes(q)) ||
      (act.items && act.items.some((item) => item.toLowerCase().includes(q))) ||
      (act.summary && act.summary.toLowerCase().includes(q))
    );
  });

  return (
    <DataContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        activities,
        filteredActivities,
        latestPrediction,
        latestMedication,
        progressReport,
        progressLoading,
        progressError,
        fetchProgressReport,
        addActivity,
        recordPrediction,
        recordMeal,
        recordMedication,
        recordCareCheck,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
