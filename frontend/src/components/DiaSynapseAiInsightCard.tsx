import React from 'react';
import { Sparkles, TrendingUp, Clock, Utensils, ShieldCheck, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

interface InsightProps {
  currentGlucose: number | null;
  latestForecast: number | null;
  lastMealCarbs: string | null;
  activeInsulin: number | null;
  nextDoseText: string | null;
  trendStatus: string | null;
  timeInRange: number | null;
  medicationType: string;
}

export function DiaSynapseAiInsightCard({
  currentGlucose,
  latestForecast,
  lastMealCarbs,
  activeInsulin,
  nextDoseText,
  trendStatus,
  timeInRange,
  medicationType = 'Insulin',
}: InsightProps) {
  // Check if we have at least one piece of real telemetry
  const hasTelemetry =
    latestForecast !== null ||
    currentGlucose !== null ||
    lastMealCarbs !== null ||
    activeInsulin !== null ||
    trendStatus !== null;

  // Determine trajectory state
  let trajectorySummary = 'a logged reading awaiting a forecast';
  let trajectoryColor = 'text-primary';
  if (latestForecast !== null && currentGlucose !== null) {
    const diff = latestForecast - currentGlucose;
    if (diff > 15) {
      trajectorySummary = 'an estimated upward glycemic movement over the next 30 minutes';
      trajectoryColor = 'text-amber-400';
    } else if (diff < -15) {
      trajectorySummary = 'an estimated declining glycemic slope over the next 30 minutes';
      trajectoryColor = 'text-blue-400';
    } else {
      trajectorySummary = 'a relatively steady estimated trajectory over the next 30 minutes';
      trajectoryColor = 'text-emerald-400';
    }
  } else if (latestForecast !== null) {
    if (latestForecast > 140) {
      trajectorySummary = 'an estimated outlook above standard target (>140 mg/dL)';
      trajectoryColor = 'text-amber-400';
    } else if (latestForecast < 70) {
      trajectorySummary = 'an estimated outlook approaching lower threshold (<70 mg/dL)';
      trajectoryColor = 'text-destructive';
    } else {
      trajectorySummary = 'an estimated trajectory within normative glycemic bounds (70–140 mg/dL)';
      trajectoryColor = 'text-emerald-400';
    }
  }

  return (
    <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-card via-card to-primary/10 p-6 sm:p-7 shadow-lg shadow-black/20 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="eyebrow block">Multimodal Clinical Synthesis</span>
            <h2 className="text-lg font-bold text-foreground">DiaSynapse AI Insight</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            AI-Estimated
          </span>
          <span className="text-[11px] text-muted-foreground">Real-time Model Synthesis</span>
        </div>
      </div>

      {hasTelemetry ? (
        <div className="mt-5 space-y-4">
          {/* Main takeaway */}
          <p className="text-sm sm:text-[15px] font-medium leading-relaxed text-foreground">
            Algorithmic models evaluate <span className={`font-bold ${trajectoryColor}`}>{trajectorySummary}</span>,
            synthesizing physical glucometer inputs, meal analysis, and medication situational awareness.
          </p>

          {/* Structured observation metrics */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-1">
            {/* 1. Glucose outlook */}
            <div className="rounded-lg border border-border/70 bg-secondary/30 p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">30-Min Forecast</span>
              </div>
              <p className="mt-1.5 text-base font-bold text-foreground">
                {latestForecast !== null ? `${latestForecast} mg/dL` : 'Pending input'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {currentGlucose !== null ? `Reference baseline: ${currentGlucose} mg/dL` : 'AI-estimated projection'}
              </p>
            </div>

            {/* 2. Meal carbs */}
            <div className="rounded-lg border border-border/70 bg-secondary/30 p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Utensils className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Nutritional Impact</span>
              </div>
              <p className="mt-1.5 text-base font-bold text-foreground">
                {lastMealCarbs !== null ? `${lastMealCarbs}g carbs` : 'No meal logged'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {lastMealCarbs !== null ? 'Associated with postprandial demand' : 'Use Meal Analysis to track'}
              </p>
            </div>

            {/* 3. Medication / Insulin timing */}
            <div className="rounded-lg border border-border/70 bg-secondary/30 p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Medication Awareness</span>
              </div>
              <p className="mt-1.5 text-base font-bold text-foreground">
                {medicationType.toLowerCase().includes('tablet') && !medicationType.toLowerCase().includes('insulin')
                  ? 'Tablet Schedule'
                  : activeInsulin !== null
                  ? `${activeInsulin}% active`
                  : 'No medication data'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {nextDoseText ?? 'No dose timing recorded'}
              </p>
            </div>

            {/* 4. Longitudinal trend */}
            <div className="rounded-lg border border-border/70 bg-secondary/30 p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Longitudinal Trend</span>
              </div>
              <p className="mt-1.5 text-base font-bold text-foreground capitalize">
                {trendStatus ?? 'No trend data'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {timeInRange !== null ? `${timeInRange}% in target range` : 'Log glucose readings to establish a trend'}
              </p>
            </div>
          </div>

          {/* Clinical Boundary disclaimer */}
          <div className="rounded-lg border border-border bg-secondary/20 p-3 text-[11px] text-soft leading-relaxed flex items-start gap-2">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
            <span>
              DiaSynapse AI insight generates algorithmic situational awareness based on recorded data. It does not diagnose medical conditions, replace certified glucometers, or autonomously prescribe insulin or medication adjustments.
            </span>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center space-y-3">
          <p className="text-sm text-soft">
            To generate your customized DiaSynapse AI Insight, log a meal or run your first 30-minute glucose forecast.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild size="sm">
              <Link to="/glucose">Predict Glucose</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/meal">Analyze Meal</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
