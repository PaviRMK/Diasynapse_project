import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, Utensils, CheckCircle2, AlertCircle,
  Loader2, Sparkles, Clock, Pill, Image, X
} from 'lucide-react';
import { api } from '../services/api';
import { useData } from '../context/DataContext';
import { SourceBadge, AiEstimatedBadge } from '../components/Badge';
import { Disclaimer } from '../components/Disclaimer';
import { CarbBreakdownChart } from '../components/CarbBreakdownChart';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function LogMealPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [careCheckResult, setCareCheckResult] = useState(null);
  const [showCareCheckInputs, setShowCareCheckInputs] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [lastDoseTime, setLastDoseTime] = useState(() => {
    const d = new Date(Date.now() - 90 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [nextDoseTime, setNextDoseTime] = useState(() => {
    const d = new Date(Date.now() + 150 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });

  const fileInputRef = useRef(null);
  const { recordMeal, recordCareCheck } = useData();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setError(null); setResult(null); setCareCheckResult(null); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setError(null); setResult(null); setCareCheckResult(null); }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null); setPreviewUrl(null); setResult(null); setCareCheckResult(null); setError(null);
  };

  const handleAnalyzeMeal = async () => {
    if (!selectedFile) { setError('Please select a meal photo first.'); return; }
    setLoading(true); setLoadingMode('meal'); setError(null);
    try {
      const data = await api.analyzeMeal(selectedFile);
      setResult(data);
      recordMeal(data, previewUrl);
    } catch (err) {
      setError(err.message || 'Failed to analyze meal.');
    } finally {
      setLoading(false); setLoadingMode(null);
    }
  };

  const handleRunCareCheck = async () => {
    if (!selectedFile) { setError('Please select a meal photo first.'); return; }
    setLoading(true); setLoadingMode('care_check'); setError(null);
    try {
      const fmt = (dt) => dt?.length === 16 ? `${dt}:00` : dt;
      const data = await api.runCareCheck(fmt(lastDoseTime), fmt(nextDoseTime), selectedFile);
      setCareCheckResult(data);
      if (data.meal_analysis) setResult(data.meal_analysis);
      recordCareCheck(data);
    } catch (err) {
      setError(err.message || 'Care check failed.');
    } finally {
      setLoading(false); setLoadingMode(null);
    }
  };

  // Build pie data for CarbBreakdownChart
  const carbChartData = result?.items?.map((item) => ({
    name: item.food_name,
    value: item.estimated_carbs_g,
  })) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div variants={container} initial="hidden" animate="show" className="mb-8">
        <motion.div variants={item} className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-terracotta-50 flex items-center justify-center">
            <Camera className="w-4 h-4 text-terracotta-600" />
          </div>
          <span className="section-label">Gemini Vision · Nutrition RAG Agent</span>
        </motion.div>
        <motion.h1 variants={item} className="text-3xl font-extrabold text-charcoal-900 tracking-tight mb-2">
          Log a Meal
        </motion.h1>
        <motion.p variants={item} className="text-sm text-charcoal-500 max-w-xl">
          Upload a meal photo. Our AI identifies dishes and cross-checks carbohydrate content with the verified nutrition database.
        </motion.p>
      </motion.div>

      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* ─ Left: Upload + Actions ─────────────────── */}
        <motion.div variants={item} className="space-y-5">

          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden ${
              isDragging
                ? 'border-terracotta-400 bg-terracotta-50/60'
                : selectedFile
                ? 'border-terracotta-300 bg-cream-50'
                : 'border-cream-300 hover:border-terracotta-300 hover:bg-cream-50/40 bg-white'
            }`}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <AnimatePresence mode="wait">
              {previewUrl ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative">
                  <img src={previewUrl} alt="Meal preview"
                    className="w-full h-56 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-semibold truncate max-w-[160px]">{selectedFile.name}</span>
                    </div>
                    <button onClick={clearFile}
                      className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-[11px] text-charcoal-500">Click or drop to replace photo</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-terracotta-50 border border-terracotta-100 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-7 h-7 text-terracotta-500" />
                  </div>
                  <p className="text-sm font-bold text-charcoal-800 mb-1">Drop your meal photo here</p>
                  <p className="text-xs text-charcoal-400">or click to browse</p>
                  <p className="text-[11px] text-charcoal-300 mt-2">JPG, PNG, WEBP up to 10MB</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleAnalyzeMeal}
            disabled={loading || !selectedFile}
            className="btn-primary w-full py-3 text-sm">
            {loading && loadingMode === 'meal' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with Gemini Vision...
              </>
            ) : (
              <>
                <Utensils className="w-4 h-4" />
                Analyze Meal Carbs
              </>
            )}
          </button>

          {/* Care Check Toggle */}
          <div className="card-elevated rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCareCheckInputs(!showCareCheckInputs)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-cream-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-plum-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-plum-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-900">Medication Awareness (Care Check)</p>
                  <p className="text-[11px] text-charcoal-500 mt-0.5">Combine meal analysis with active insulin status</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-charcoal-400">{showCareCheckInputs ? 'Hide ↑' : 'Set up →'}</span>
            </button>

            <AnimatePresence>
              {showCareCheckInputs && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-4 border-t border-cream-200 pt-4">
                    <p className="text-xs text-charcoal-500 leading-relaxed">
                      Enter your insulin dose times to model active insulin alongside this meal.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-charcoal-400" />
                          Last Dose Time
                        </label>
                        <input type="datetime-local" value={lastDoseTime}
                          onChange={(e) => setLastDoseTime(e.target.value)}
                          className="input-premium text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-charcoal-400" />
                          Next Scheduled Dose
                        </label>
                        <input type="datetime-local" value={nextDoseTime}
                          onChange={(e) => setNextDoseTime(e.target.value)}
                          className="input-premium text-xs" />
                      </div>
                    </div>
                    <button
                      onClick={handleRunCareCheck}
                      disabled={loading || !selectedFile}
                      className="btn-secondary w-full py-2.5 text-xs">
                      {loading && loadingMode === 'care_check' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Running Care Crew (CrewAI)...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-plum-500" />
                          Run Full Care Check
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-xl flex items-start gap-2.5 text-xs"
                style={{ background: '#FBEBEA', border: '1px solid #F6D5D2', color: '#90312A' }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─ Right: Results ─────────────────────────── */}
        <div className="space-y-5">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="card-elevated rounded-2xl p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-terracotta-50 flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 animate-spin text-terracotta-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal-900 mb-1">
                    {loadingMode === 'care_check' ? 'Running Care Crew...' : 'Analyzing with AI...'}
                  </h3>
                  <p className="text-xs text-charcoal-500 max-w-xs mx-auto leading-relaxed">
                    {loadingMode === 'care_check'
                      ? 'CrewAI is orchestrating Gemini Vision, Nutrition RAG, and Medication agents.'
                      : 'Gemini Vision identifies dishes while Nutrition RAG cross-references verified carbohydrate values.'}
                  </p>
                </div>
              </motion.div>
            )}

            {!loading && !result && !careCheckResult && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card-elevated rounded-2xl p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto">
                  <Image className="w-8 h-8 text-charcoal-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-charcoal-700 mb-1">No meal analyzed yet</h3>
                  <p className="text-xs text-charcoal-400 max-w-xs mx-auto leading-relaxed">
                    Upload a photo of your meal to see itemized carbohydrate estimates.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Meal Analysis */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-cream-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-charcoal-900">Food Items Identified</h3>
                  <p className="text-[11px] text-charcoal-400 mt-0.5">
                    Confidence: <span className="capitalize font-semibold text-charcoal-600">{result.gemini_confidence || 'Standard'}</span>
                  </p>
                </div>
                <AiEstimatedBadge />
              </div>

              {/* Items */}
              <div className="divide-y divide-cream-100 px-5">
                {result.items?.map((foodItem, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-charcoal-900">{foodItem.food_name}</h4>
                      {foodItem.matched_database_dish && (
                        <p className="text-[10px] text-charcoal-400 mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-sage-600" />
                          {foodItem.matched_database_dish}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <SourceBadge source={foodItem.source} />
                      <span className="metric-number text-xs font-black text-charcoal-900 min-w-[48px] text-right">
                        {foodItem.estimated_carbs_g}g
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carb Breakdown Chart */}
              {carbChartData.length > 0 && (
                <div className="px-5 py-4 border-t border-cream-100">
                  <p className="section-label mb-3">Carb Breakdown</p>
                  <CarbBreakdownChart data={carbChartData} />
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-cream-50 to-terracotta-50/50 border-t border-cream-200">
                <div>
                  <p className="text-xs font-bold text-charcoal-700">Total Estimated Carbs</p>
                  <p className="text-[10px] text-charcoal-400 mt-0.5">Subject to portion variance</p>
                </div>
                <div className="text-right">
                  <span className="metric-number text-3xl font-black text-terracotta-700">
                    {result.total_estimated_carbs_g}
                  </span>
                  <span className="text-sm font-bold text-charcoal-500 ml-1">g</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Care Check Result */}
          {careCheckResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated rounded-2xl overflow-hidden"
              style={{ borderColor: '#F2D3C1' }}>
              <div className="px-5 pt-5 pb-4 border-b flex items-center justify-between"
                style={{ borderColor: '#F2D3C1', background: 'linear-gradient(135deg, #FDF6F2, #FAF8F5)' }}>
                <h3 className="text-sm font-bold text-terracotta-800">Care Coordinator Assessment</h3>
                <span className="text-[10px] text-charcoal-400 font-semibold">CrewAI Orchestration</span>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div className="p-4 rounded-xl text-xs text-charcoal-800 leading-relaxed"
                  style={{ background: '#FAF8F5', border: '1px solid #EAE2D5' }}>
                  {careCheckResult.combined_summary}
                </div>

                {careCheckResult.medication_status && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl" style={{ background: '#F5EBF0', border: '1px solid #ECD7E2' }}>
                      <p className="text-[10px] font-bold text-plum-700 uppercase tracking-wider mb-1">Active Insulin</p>
                      <p className="text-xl font-black text-plum-900 metric-number">
                        {careCheckResult.medication_status.insulin_active_percent}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: '#F4F8F5', border: '1px solid #C8DEC0' }}>
                      <p className="text-[10px] font-bold text-sage-700 uppercase tracking-wider mb-1">Timing</p>
                      <p className="text-xs text-sage-800 font-semibold leading-snug">
                        {careCheckResult.medication_status.timing_note?.slice(0, 60)}...
                      </p>
                    </div>
                  </div>
                )}

                <Disclaimer text={careCheckResult.medication_status?.disclaimer} />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
